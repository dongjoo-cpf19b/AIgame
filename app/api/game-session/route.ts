import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://jkbselbyyfvupojlnbqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnNlbGJ5eWZ2dXBvamxuYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTMxMzQsImV4cCI6MjEwMzk4OTEzNH0.8e0v38YoUhd8n40bvlRvosyh9hc5rfyn6d8s8I6-KQo";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function supabase(path: string, method: string, body: unknown) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

async function ensureSession(id: string) {
  const response = await supabase("game_sessions", "POST", { id });
  if (response.ok || response.status === 409) return null;
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const action = payload?.action;
    const id = String(payload?.id ?? "");

    if (!uuidPattern.test(id)) {
      return NextResponse.json({ error: "invalid_session_id" }, { status: 400 });
    }

    if (action === "start") {
      const errorResponse = await ensureSession(id);
      if (errorResponse) {
        return NextResponse.json({ error: await errorResponse.text() }, { status: errorResponse.status });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "finish") {
      const errorResponse = await ensureSession(id);
      if (errorResponse) {
        return NextResponse.json({ error: await errorResponse.text() }, { status: errorResponse.status });
      }

      const allowed = {
        completed_at: payload.completed_at,
        clues_collected: payload.clues_collected,
        report_clues: payload.report_clues,
        correct_answers: payload.correct_answers,
        grade: payload.grade,
        messenger_hints: payload.messenger_hints,
        phone_hints: payload.phone_hints,
      };

      const response = await supabase(`game_sessions?id=eq.${id}`, "PATCH", allowed);
      if (!response.ok) {
        return NextResponse.json({ error: await response.text() }, { status: response.status });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  } catch (error) {
    console.error("game-session api error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
