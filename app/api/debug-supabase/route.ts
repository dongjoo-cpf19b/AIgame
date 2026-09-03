import { NextResponse } from "next/server";

const SUPABASE_URL = "https://jkbselbyyfvupojlnbqk.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprYnNlbGJ5eWZ2dXBvamxuYnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MTMxMzQsImV4cCI6MjEwMzk4OTEzNH0.8e0v38YoUhd8n40bvlRvosyh9hc5rfyn6d8s8I6-KQo";
const SESSION = "33333333-3333-4333-8333-333333333333";
const ENTRY = "44444444-4444-4444-8444-444444444444";

async function post(path: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return { status: res.status, ok: res.ok, body: await res.text() };
}

export async function GET() {
  const session = await post("game_sessions", { id: SESSION });
  const raffle = await post("raffle_entries", {
    id: ENTRY,
    session_id: SESSION,
    participant_name: "TEST",
    affiliation: "TEST",
    phone_digits: "01099999999",
  });
  return NextResponse.json({ session, raffle });
}
