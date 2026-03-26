import { NextResponse } from "next/server";
import { getScoreSummary, replayHistory } from "../../../lib/game";

export const runtime = "nodejs";

interface SubmissionRequestBody {
  participantName: string;
  affiliation: string;
  consent: boolean;
  history: number[];
}

interface SubmissionRecord {
  id: string;
  participant_name: string;
  affiliation: string;
  submitted_at: string;
  final_score: number;
  integrity: number;
  risk: number;
  trust: number;
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function parseRequestBody(value: unknown): SubmissionRequestBody | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<SubmissionRequestBody>;

  if (
    !isNonEmptyString(candidate.participantName, 40) ||
    !isNonEmptyString(candidate.affiliation, 80) ||
    candidate.consent !== true ||
    !Array.isArray(candidate.history) ||
    candidate.history.length < 1 ||
    candidate.history.length > 20 ||
    candidate.history.some((item) => !Number.isInteger(item))
  ) {
    return null;
  }

  return {
    participantName: candidate.participantName.trim(),
    affiliation: candidate.affiliation.trim(),
    consent: true,
    history: candidate.history,
  };
}

async function saveToSupabase(record: SubmissionRecord): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_SUBMISSIONS_TABLE ?? "game_submissions";

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Supabase save failed:", response.status, body);
    throw new Error(`Supabase 저장 실패 (${response.status}): ${body || "응답 본문 없음"}`);
  }
}

export async function POST(request: Request) {
  try {
    const body = parseRequestBody(await request.json());

    if (!body) {
      return NextResponse.json(
        { error: "이름, 소속, 동의 여부 또는 선택 기록이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const finalState = replayHistory(body.history);

    if (!finalState.ended) {
      return NextResponse.json(
        { error: "게임이 아직 끝나지 않았습니다. 엔딩까지 진행한 뒤 제출해 주세요." },
        { status: 400 }
      );
    }

    const score = getScoreSummary(finalState.vars, finalState.scene, finalState.endingText);
    const submittedAt = new Date().toISOString();

    const record: SubmissionRecord = {
      id: crypto.randomUUID(),
      participant_name: body.participantName,
      affiliation: body.affiliation,
      submitted_at: submittedAt,
      final_score: score.finalScore,
      integrity: score.integrity,
      risk: score.risk,
      trust: score.trust,
    };

    await saveToSupabase(record);

    return NextResponse.json({
      message: "결과가 정상적으로 접수되었습니다.",
      submission: {
        id: record.id,
        submittedAt: record.submitted_at,
        finalScore: record.final_score,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `제출 처리 중 오류: ${error.message}`
            : "제출 처리 중 예기치 않은 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
