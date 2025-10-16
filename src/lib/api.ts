import {
  CreateSessionResponse,
  Session,
  StartSessionResponse,
  isPartIOrder,
} from "@/types/session.type";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4500"
).replace(/\/+$/, "");

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Try to surface server error body if present
    let body = "";
    try {
      body = await res.text();
    } catch {}
    throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function createAndAssignAtomic(): Promise<StartSessionResponse> {
  assert(API_BASE, "Missing NEXT_PUBLIC_API_BASE");
  const res = await fetch(`${API_BASE}/sessions/start`, { method: "POST" });
  const data = await json<StartSessionResponse>(res);

  // Minimal structural checks
  assert(typeof data.code === "string", "Invalid sessionCode");
  assert(typeof data.partIOrder === "string", "Invalid createdAt");
  assert(typeof data.partIIPattern === "string", "Invalid createdAt");

  return data;
}

export async function createSession(): Promise<CreateSessionResponse> {
  assert(API_BASE, "Missing NEXT_PUBLIC_API_BASE");
  const res = await fetch(`${API_BASE}/sessions`, { method: "POST" });
  const data = await json<CreateSessionResponse>(res);

  // Minimal structural checks
  assert(typeof data.sessionCode === "string", "Invalid sessionCode");
  assert(typeof data.createdAt === "string", "Invalid createdAt");

  return data;
}

export async function assignOrders(code: string): Promise<Session> {
  assert(API_BASE, "Missing NEXT_PUBLIC_API_BASE");
  const res = await fetch(
    `${API_BASE}/sessions/${encodeURIComponent(code)}/assign-orders`,
    {
      method: "POST",
    }
  );
  const data = await json<Session>(res);

  // Guard the fields we use on mobile
  assert(typeof data.sessionCode === "string", "Invalid sessionCode");
  assert(
    data.partIOrder === null || isPartIOrder(data.partIOrder),
    "Invalid partIOrder"
  );
  return data;
}

export async function heartbeat(code: string): Promise<void> {
  assert(API_BASE, "Missing NEXT_PUBLIC_API_BASE");
  const res = await fetch(
    `${API_BASE}/sessions/${encodeURIComponent(code)}/heartbeat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    }
  );
  await json(res);
}
