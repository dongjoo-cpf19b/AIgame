"use client";

import { useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { CHAR_INFO, STORY, type Position } from "../story";
import {
  advanceState,
  chooseOption,
  createInitialState,
  getScoreSummary,
  getStageLabel,
  type GameState,
} from "../lib/game";

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

interface SubmissionFormState {
  name: string;
  affiliation: string;
  consent: boolean;
}

interface SubmissionResult {
  id: string;
  submittedAt: string;
  finalScore: number;
}

function getBackgroundStyle(name: string | null): CSSProperties {
  const palette: Record<string, string> = {
    office_evening: "linear-gradient(135deg, #1a2746 0%, #203559 42%, #0d1220 100%)",
    office_storage: "linear-gradient(135deg, #383642 0%, #5a4d47 45%, #211e2b 100%)",
    audit_office: "linear-gradient(135deg, #30465b 0%, #4b6c7f 45%, #17212d 100%)",
    office_night: "linear-gradient(135deg, #1b2034 0%, #32253e 40%, #0d1018 100%)",
    parking_lot: "linear-gradient(135deg, #253042 0%, #4a566e 45%, #131822 100%)",
    civil_counter: "linear-gradient(135deg, #1f2b3a 0%, #4b5f78 45%, #152130 100%)",
    office_hallway: "linear-gradient(135deg, #2f3646 0%, #5b667e 42%, #1a1f2b 100%)",
    team_room: "linear-gradient(135deg, #253143 0%, #4f637c 46%, #162130 100%)",
    city_street: "linear-gradient(135deg, #243044 0%, #5f6b7f 50%, #151a23 100%)",
    restaurant_private: "linear-gradient(135deg, #3b2620 0%, #6c4536 48%, #231614 100%)",
    meeting_room: "linear-gradient(135deg, #273449 0%, #576c8b 45%, #111724 100%)",
    restaurant_exit: "linear-gradient(135deg, #31201f 0%, #59433e 48%, #1d1212 100%)",
    night_crosswalk: "linear-gradient(135deg, #1a2334 0%, #46556f 45%, #0d111a 100%)",
    lecture_hall: "linear-gradient(135deg, #2d3148 0%, #586280 45%, #161a28 100%)",
    office_day: "linear-gradient(135deg, #264566 0%, #5f86b5 45%, #15263b 100%)",
    inspection_room: "linear-gradient(135deg, #2a2e38 0%, #575c69 44%, #12151c 100%)",
    home_table: "linear-gradient(135deg, #402e26 0%, #6c5648 48%, #1f1713 100%)",
    executive_office: "linear-gradient(135deg, #2f2846 0%, #5d4f7e 46%, #171326 100%)",
    records_room: "linear-gradient(135deg, #2f3743 0%, #59687a 45%, #171b23 100%)",
    team_room_night: "linear-gradient(135deg, #192133 0%, #364259 45%, #0c1018 100%)",
    dark_monitor: "linear-gradient(135deg, #101624 0%, #22314b 42%, #06090f 100%)",
    award_hall: "linear-gradient(135deg, #3c2f14 0%, #87703b 45%, #1b1507 100%)",
    office_sunset: "linear-gradient(135deg, #4d3347 0%, #8a6485 42%, #231626 100%)",
    discipline_room: "linear-gradient(135deg, #33191d 0%, #6c323b 44%, #180b0e 100%)",
  };

  return {
    background:
      palette[name ?? ""] ??
      "linear-gradient(135deg, #1d2940 0%, #425878 45%, #0e1522 100%)",
  };
}

function getCharacterStyle(position: Position): CSSProperties {
  if (position === "left") return { left: "4%" };
  if (position === "center") return { left: "50%", transform: "translateX(-50%)" };
  if (position === "right") return { right: "4%" };
  return { right: "4%", top: "6%", bottom: "auto" };
}

function formatSubmittedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [formState, setFormState] = useState<SubmissionFormState>({
    name: "",
    affiliation: "",
    consent: false,
  });
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  const currentBeat = STORY[gameState.scene]?.beats[gameState.beatIdx];
  const stageLabel = useMemo(() => getStageLabel(gameState.scene), [gameState.scene]);
  const scoreSummary = useMemo(
    () => getScoreSummary(gameState.vars, gameState.scene, gameState.endingText),
    [gameState.endingText, gameState.scene, gameState.vars]
  );

  function advance() {
    setGameState((prev) => advanceState(prev));
  }

  function choose(index: number) {
    setGameState((prev) => chooseOption(prev, index));
  }

  function restart() {
    setStarted(false);
    setGameState(createInitialState());
    setFormState({ name: "", affiliation: "", consent: false });
    setSubmissionStatus("idle");
    setSubmissionMessage("");
    setSubmissionResult(null);
  }

  async function submitResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!gameState.ended) {
      return;
    }

    setSubmissionStatus("submitting");
    setSubmissionMessage("");

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantName: formState.name.trim(),
          affiliation: formState.affiliation.trim(),
          consent: formState.consent,
          history: gameState.history,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        submission?: SubmissionResult;
      };

      if (!response.ok || !payload.submission) {
        throw new Error(payload.error ?? "제출 처리 중 오류가 발생했습니다.");
      }

      setSubmissionResult(payload.submission);
      setSubmissionStatus("success");
      setSubmissionMessage(payload.message ?? "결과가 정상적으로 접수되었습니다.");
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionMessage(
        error instanceof Error ? error.message : "제출 처리 중 오류가 발생했습니다."
      );
    }
  }

  return (
    <main className="page-shell">
      <div className="novel-frame">
        <div className="bg-layer" style={getBackgroundStyle(gameState.bg)} />
        <div className="bg-overlay" />

        {!started && (
          <div className="start-screen">
            <div className="start-card">
              <div className="start-eyebrow">WEB EVENT VISUAL NOVEL</div>
              <div className="start-title">공직 청렴 비주얼노벨</div>
              <div className="start-copy">
                선택을 따라가며 청렴도와 위험도를 확인하는 웹게임입니다.
                <br />
                엔딩에서 이름과 소속을 제출하면 서버에서 결과를 다시 검증해 관리자에게
                전달합니다.
              </div>
              <button className="action-btn primary" onClick={() => setStarted(true)}>
                시작하기
              </button>
            </div>
          </div>
        )}

        {started && (
          <>
            <div className="top-bar">
              <div className="badge-row">
                <div className="badge stage-badge">
                  <strong>{stageLabel}</strong>
                </div>
                <div className="badge">
                  Scene <strong>{gameState.scene}</strong>
                </div>
                <div className="badge">
                  Final Score <strong>{scoreSummary.finalScore}</strong>
                </div>
              </div>

              <div className="badge-row">
                <button className="action-btn" onClick={restart}>
                  처음부터
                </button>
              </div>
            </div>

            <div className="char-layer">
              {gameState.chars.map((char) => (
                <div
                  key={`${char.id}-${char.pos}`}
                  className={`char-card ${char.pos}`}
                  style={getCharacterStyle(char.pos)}
                >
                  <div className="char-role">등장 인물</div>
                  <div className="char-name" style={{ color: CHAR_INFO[char.id].color }}>
                    {CHAR_INFO[char.id].name}
                  </div>
                </div>
              ))}
            </div>

            {gameState.ended ? (
              <div className="ending-shell">
                <div className="ending-card">
                  <div className="ending-label">ENDING</div>
                  <div className="ending-title">{gameState.endingText}</div>
                  <div className="ending-copy">
                    서버 제출 시 선택 기록을 기반으로 점수를 다시 계산합니다.
                    <br />
                    점수와 응모 정보는 추첨 및 결과 집계 용도로만 사용됩니다.
                  </div>

                  <div className="score-grid">
                    <div className="score-tile">
                      <span>종합 점수</span>
                      <strong>{scoreSummary.finalScore}</strong>
                    </div>
                    <div className="score-tile">
                      <span>청렴</span>
                      <strong>{scoreSummary.integrity}</strong>
                    </div>
                    <div className="score-tile">
                      <span>위험</span>
                      <strong>{scoreSummary.risk}</strong>
                    </div>
                    <div className="score-tile">
                      <span>신뢰</span>
                      <strong>{scoreSummary.trust}</strong>
                    </div>
                  </div>

                  <form className="result-form" onSubmit={submitResult}>
                    <label className="field">
                      <span>이름</span>
                      <input
                        type="text"
                        value={formState.name}
                        maxLength={40}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, name: event.target.value }))
                        }
                        placeholder="홍길동"
                        disabled={submissionStatus === "submitting" || submissionStatus === "success"}
                      />
                    </label>

                    <label className="field">
                      <span>소속</span>
                      <input
                        type="text"
                        value={formState.affiliation}
                        maxLength={80}
                        onChange={(event) =>
                          setFormState((prev) => ({
                            ...prev,
                            affiliation: event.target.value,
                          }))
                        }
                        placeholder="OO의료원 총무팀"
                        disabled={submissionStatus === "submitting" || submissionStatus === "success"}
                      />
                    </label>

                    <label className="consent-row">
                      <input
                        type="checkbox"
                        checked={formState.consent}
                        onChange={(event) =>
                          setFormState((prev) => ({ ...prev, consent: event.target.checked }))
                        }
                        disabled={submissionStatus === "submitting" || submissionStatus === "success"}
                      />
                      <span>
                        이벤트 운영, 결과 집계, 당첨자 추첨을 위해 이름과 소속을 수집하는 데
                        동의합니다.
                      </span>
                    </label>

                    <div className="result-actions">
                      <button
                        className="action-btn primary"
                        type="submit"
                        disabled={submissionStatus === "submitting" || submissionStatus === "success"}
                      >
                        {submissionStatus === "submitting" ? "제출 중..." : "결과 제출"}
                      </button>
                      <button className="action-btn" type="button" onClick={restart}>
                        다시 시작
                      </button>
                    </div>
                  </form>

                  {submissionMessage && (
                    <div className={`submission-banner ${submissionStatus}`}>
                      {submissionMessage}
                    </div>
                  )}

                  {submissionResult && (
                    <div className="receipt-card">
                      <div className="receipt-title">접수 완료</div>
                      <div className="receipt-copy">
                        접수번호 <strong>{submissionResult.id}</strong>
                      </div>
                      <div className="receipt-copy">
                        제출 시각 {formatSubmittedAt(submissionResult.submittedAt)}
                      </div>
                      <div className="receipt-copy">
                        검증 점수 {submissionResult.finalScore}점
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {currentBeat?.kind === "choice" && (
                  <div className="choice-wrap">
                    <div className="choice-list">
                      {currentBeat.options.map((option, index) => (
                        <button
                          key={`${gameState.scene}-${index}`}
                          className="choice-btn"
                          onClick={() => choose(index)}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className="bottom-panel"
                  onClick={currentBeat?.kind === "choice" ? undefined : advance}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (currentBeat?.kind !== "choice") {
                        advance();
                      }
                    }
                  }}
                >
                  {currentBeat?.kind === "dialogue" && (
                    <div className="speaker" style={{ color: CHAR_INFO[currentBeat.who].color }}>
                      {CHAR_INFO[currentBeat.who].name}
                    </div>
                  )}

                  <div className="text-block">
                    {currentBeat?.kind === "narration" || currentBeat?.kind === "dialogue"
                      ? currentBeat.text
                      : "선택지를 고르세요."}
                  </div>

                  {currentBeat?.kind !== "choice" && (
                    <div className="subhint">클릭 또는 Enter로 다음</div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
