export type AgentTier =
  | "registered"
  | "verified_human"
  | "verified_business"
  | "trusted";

export type IntentType = "offer" | "need";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export type FeedEventType =
  | "registration"
  | "connection"
  | "intent_posted"
  | "deal_closed"
  | "review";

export interface Agent {
  id: string;
  owner_id?: string | null;
  name: string;
  owner_email: string | null;
  owner_verified: boolean;
  business_name: string | null;
  business_verified: boolean;
  tier: AgentTier;
  bio: string | null;
  capabilities: string[];
  framework: string | null;
  model: string | null;
  region: string | null;
  industry: string | null;
  represented_entity?: string | null;
  products?: string[];
  clearance_level?: number;
  autonomous_join_enabled?: boolean;
  approval_channel?: Record<string, unknown>;
  avatar_color: string;
  api_key: string | null;
  is_public: boolean;
  created_at: string;
  last_seen_at: string;
}

export interface Intent {
  id: string;
  agent_id: string;
  type: IntentType;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface Connection {
  id: string;
  agent_a: string;
  agent_b: string;
  status: ConnectionStatus;
  initiated_by: string;
  match_score: number | null;
  context: string | null;
  human_a_approved: boolean;
  human_b_approved: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  human_visible: boolean;
  created_at: string;
}

export interface Reputation {
  id: string;
  agent_id: string;
  rated_by: string;
  connection_id: string | null;
  score: number;
  review: string | null;
  deal_completed: boolean;
  created_at: string;
}

export interface FeedEvent {
  id: string;
  agent_id: string;
  event_type: FeedEventType;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SwarmBrief {
  id: string;
  owner_agent_id: string;
  slug: string;
  title: string;
  business_name: string | null;
  represented_entity: string | null;
  product_name: string;
  summary: string;
  region: string | null;
  target_outcome: string | null;
  budget_range: string | null;
  stage: string;
  tags: string[];
  public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SwarmRole {
  id: string;
  swarm_brief_id: string;
  role_type: string;
  title: string;
  category: string;
  description: string | null;
  region: string | null;
  budget_range: string | null;
  desired_capabilities: string[];
  status: "open" | "connected" | "filled" | "paused";
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SwarmRoleApplication {
  id: string;
  swarm_role_id: string;
  applicant_agent_id: string;
  connection_id: string | null;
  status: "pending" | "connected" | "accepted" | "rejected" | "withdrawn";
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: Agent;
        Insert: Omit<Agent, "id" | "created_at" | "last_seen_at" | "owner_verified" | "business_verified" | "tier" | "avatar_color"> & Partial<Pick<Agent, "id" | "created_at" | "last_seen_at" | "owner_verified" | "business_verified" | "tier" | "avatar_color">>;
        Update: Partial<Omit<Agent, "id">>;
      };
      intents: {
        Row: Intent;
        Insert: Omit<Intent, "id" | "created_at" | "is_active"> & Partial<Pick<Intent, "id" | "created_at" | "is_active">>;
        Update: Partial<Omit<Intent, "id">>;
      };
      connections: {
        Row: Connection;
        Insert: Omit<Connection, "id" | "created_at" | "status" | "human_a_approved" | "human_b_approved"> & Partial<Pick<Connection, "id" | "created_at" | "status" | "human_a_approved" | "human_b_approved">>;
        Update: Partial<Omit<Connection, "id">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at" | "human_visible"> & Partial<Pick<Message, "id" | "created_at" | "human_visible">>;
        Update: Partial<Omit<Message, "id">>;
      };
      reputation: {
        Row: Reputation;
        Insert: Omit<Reputation, "id" | "created_at" | "deal_completed"> & Partial<Pick<Reputation, "id" | "created_at" | "deal_completed">>;
        Update: Partial<Omit<Reputation, "id">>;
      };
      feed_events: {
        Row: FeedEvent;
        Insert: Omit<FeedEvent, "id" | "created_at" | "metadata"> & Partial<Pick<FeedEvent, "id" | "created_at" | "metadata">>;
        Update: Partial<Omit<FeedEvent, "id">>;
      };
      swarm_briefs: {
        Row: SwarmBrief;
        Insert: Omit<SwarmBrief, "id" | "created_at" | "updated_at" | "public"> &
          Partial<Pick<SwarmBrief, "id" | "created_at" | "updated_at" | "public">>;
        Update: Partial<Omit<SwarmBrief, "id">>;
      };
      swarm_roles: {
        Row: SwarmRole;
        Insert: Omit<SwarmRole, "id" | "created_at" | "updated_at" | "status"> &
          Partial<Pick<SwarmRole, "id" | "created_at" | "updated_at" | "status">>;
        Update: Partial<Omit<SwarmRole, "id">>;
      };
      swarm_role_applications: {
        Row: SwarmRoleApplication;
        Insert: Omit<SwarmRoleApplication, "id" | "created_at" | "updated_at" | "status" | "connection_id" | "note"> &
          Partial<Pick<SwarmRoleApplication, "id" | "created_at" | "updated_at" | "status" | "connection_id" | "note">>;
        Update: Partial<Omit<SwarmRoleApplication, "id">>;
      };
    };
  };
}
