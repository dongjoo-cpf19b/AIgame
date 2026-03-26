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
  consented: boolean;
  submitted_at: string;
  ending_scene: string;
  ending_text: string;
  ending_label: string;
  final_score: number;
  integrity: number;
  risk: number;
  trust: number;
  choice_history: number[];
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

async function saveToSupabase(record: SubmissionRecord): Promise<boolean> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_SUBMISSIONS_TABLE ?? "game_submissions";

  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Supabase save failed:", body);
    return false;
  }

  return true;
}

async function sendAdminEmail(record: SubmissionRecord): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  const to = process.env.ADMIN_EMAILS
    ?.split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (!apiKey || !from || !to?.length) {
    return false;
  }

  const text = [
    "[웹게임 결과 접수]",
    `접수번호: ${record.id}`,
    `제출시각: ${record.submitted_at}`,
    `이름: ${record.participant_name}`,
    `소속: ${record.affiliation}`,
    `엔딩: ${record.ending_label}`,
    `종합점수: ${record.final_score}`,
    `청렴: ${record.integrity}`,
    `위험: ${record.risk}`,
    `신뢰: ${record.trust}`,
    `선택기록: ${record.choice_history.join(", ")}`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: `[웹게임] ${record.participant_name} / ${record.affiliation} / ${record.final_score}점`,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Email send failed:", body);
    return false;
  }

  return true;
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
        { error: "게임이 아직 종료되지 않았습니다. 엔딩까지 진행해 주세요." },
        { status: 400 }
      );
    }

    const score = getScoreSummary(finalState.vars, finalState.scene, finalState.endingText);
    const submittedAt = new Date().toISOString();

    const record: SubmissionRecord = {
      id: crypto.randomUUID(),
      participant_name: body.participantName,
      affiliation: body.affiliation,
      consented: body.consent,
      submitted_at: submittedAt,
      ending_scene: finalState.scene,
      ending_text: finalState.endingText,
      ending_label: score.endingLabel,
      final_score: score.finalScore,
      integrity: score.integrity,
      risk: score.risk,
      trust: score.trust,
      choice_history: body.history,
    };

    const saved = await saveToSupabase(record);
    const emailed = await sendAdminEmail(record);

    if (!saved && !emailed) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            error:
              "제출 저장 설정이 완료되지 않았습니다. 관리자에게 배포 환경변수를 확인해 달라고 요청해 주세요.",
          },
          { status: 500 }
        );
      }

      console.info("Submission received without external persistence:", record);
    }

    return NextResponse.json({
      message:
        saved || emailed
          ? "결과가 정상적으로 접수되었습니다."
          : "개발 모드에서 결과를 임시로 수신했습니다.",
      submission: {
        id: record.id,
        submittedAt: record.submitted_at,
        finalScore: record.final_score,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "제출 처리 중 예기치 않은 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
