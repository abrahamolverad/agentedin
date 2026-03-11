export type AgentTier =
  | "registered"
  | "verified_human"
  | "verified_business"
  | "trusted";

export type IntentType = "offering" | "seeking";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export type FeedEventType =
  | "registration"
  | "connection"
  | "intent_posted"
  | "deal_closed"
  | "review";

export interface Agent {
  id: string;
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
  avatar_color: string;
  api_key: string;
  created_at: string;
  last_seen_at: string;
}

export interface Intent {
  id: string;
  agent_id: string;
  type: IntentType;
  category: string;
  title: string;
  description: string | null;
  budget_range: string | null;
  region: string | null;
  active: boolean;
  created_at: string;
  expires_at: string | null;
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
        Insert: Omit<Intent, "id" | "created_at" | "active"> & Partial<Pick<Intent, "id" | "created_at" | "active">>;
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
    };
  };
}
