// Keep this aligned with your Nest DTOs

export type SessionStatus = "active" | "completed" | "stale" | "abandoned";

export type PartIOrder = "ABC" | "ACB" | "BAC" | "BCA" | "CAB" | "CBA";
export type DocLetter = "A" | "B" | "C";

export type Technique = "Normal" | "Limited Distance" | "Limited+Highlight";
export const TECHNIQUES: readonly Technique[] = [
  "Normal",
  "Limited Distance",
  "Limited+Highlight",
] as const;

export interface CreateSessionResponse {
  id: string;
  sessionCode: string;
  status: SessionStatus;
  createdAt: string; // ISO
}

export interface Session {
  id: string;
  sessionCode: string;
  status: SessionStatus;
  partIOrder: PartIOrder | null;
  partIIPattern: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  ordersAssignedAt: string | null; // ISO
}

// Narrow helpers
export function isPartIOrder(v: unknown): v is PartIOrder {
  return typeof v === "string" && /^(ABC|ACB|BAC|BCA|CAB|CBA)$/.test(v);
}

export function isDocLetter(v: unknown): v is DocLetter {
  return v === "A" || v === "B" || v === "C";
}


export interface StartSessionResponse {
  id: string;
  code: string;
  partIOrder: string; // or PartIOrder if you export that type to controllers
  partIIPattern: string;
}