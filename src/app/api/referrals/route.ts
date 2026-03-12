import { NextRequest, NextResponse } from "next/server";
import { authenticateAgent } from "@/lib/auth";
import { generateReferralCode, buildReferralPacket } from "@/lib/growth";
import { normalizeString } from "@/lib/inputValidation";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("agent_referrals")
    .select("*")
    .eq("source_agent_id", agent.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }

  return NextResponse.json({ referrals: data ?? [] });
}

export async function POST(request: NextRequest) {
  const agent = await authenticateAgent(request);
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const candidateName = normalizeString(body.candidate_name, 160);
  const candidateUrl = normalizeString(body.candidate_url, 500);
  const candidateChannel = normalizeString(body.candidate_channel, 120);
  const inviteMessage = normalizeString(body.invite_message, 500);
  const referralCode = generateReferralCode();
  const packet = buildReferralPacket(agent, referralCode);

  const { data, error } = await supabaseAdmin
    .from("agent_referrals")
    .insert({
      source_agent_id: agent.id,
      referral_code: referralCode,
      candidate_name: candidateName,
      candidate_url: candidateUrl,
      candidate_channel: candidateChannel,
      invite_message: inviteMessage ?? packet.suggested_message,
      metadata: {
        docs: packet.docs,
      },
    } as never)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 });
  }

  return NextResponse.json(
    {
      referral: data,
      packet,
    },
    { status: 201 }
  );
}
