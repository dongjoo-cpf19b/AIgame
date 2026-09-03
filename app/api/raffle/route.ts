import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://jkbselbyyfvupojlnbqk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnNlbGJ5eWZ2dXBvamxuYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTMxMzQsImV4cCI6MjEwMzk4OTEzNH0.8e0v38YoUhd8n40bvlRvosyh9hc5rfyn6d8s8I6-KQo";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const phonePattern = /^010\d{8}$/;

async function supabase(path: string, method: string, body: unknown, prefer = "return=minimal") {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const id = String(payload?.id ?? "");
    const sessionId = String(payload?.session_id ?? "");
    const participantName = String(payload?.participant_name ?? "").trim();
    const affiliation = String(payload?.affiliation ?? "").trim();
    const phoneDigits = String(payload?.phone_digits ?? "").replace(/\D/g, "");

    if (!uuidPattern.test(id) || !uuidPattern.test(sessionId)) {
      return NextResponse.json({ error: "invalid_id" }, { status: 400 });
    }
    if (!participantName || participantName.length > 50 || !affiliation || affiliation.length > 100) {
      return NextResponse.json({ error: "invalid_participant" }, { status: 400 });
    }
    if (!phonePattern.test(phoneDigits)) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }

    // 첫 화면의 백그라운드 세션 저장이 늦어져도 응모 단계에서 세션을 보장한다.
    const ensure = await supabase(
      "game_sessions?on_conflict=id",
      "POST",
      { id: sessionId },
      "resolution=ignore-duplicates,return=minimal",
    );
    if (!ensure.ok) {
      return NextResponse.json({ error: await ensure.text() }, { status: ensure.status });
    }

    const response = await supabase("raffle_entries", "POST", {
      id,
      session_id: sessionId,
      participant_name: participantName,
      affiliation,
      phone_digits: phoneDigits,
    });

    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 409 || detail.includes("23505") || detail.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ error: "duplicate_phone" }, { status: 409 });
      }
      return NextResponse.json({ error: detail }, { status: response.status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("raffle api error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
