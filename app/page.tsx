"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { CHAR_INFO, STORY, type CharDisplay, type Position, type Vars } from "../story";

interface GameState {
  scene: string;
  beatIdx: number;
  vars: Vars;
  chars: CharDisplay[];
  bg: string | null;
  ended: boolean;
  endingText: string;
}

function applyEffects(vars: Vars, effects: Partial<Vars>): Vars {
  return {
    integrity: vars.integrity + (effects.integrity ?? 0),
    risk: vars.risk + (effects.risk ?? 0),
    trust: vars.trust + (effects.trust ?? 0),
  };
}

function updateChars(current: CharDisplay[], incoming: CharDisplay[]): CharDisplay[] {
  const next = [...current];

  for (const entry of incoming) {
    const index = next.findIndex((item) => item.id === entry.id);
    if (index >= 0) {
      next[index] = entry;
    } else {
      next.push(entry);
    }
  }

  return next;
}

function processToInteractive(
  scene: string,
  beatIdx: number,
  vars: Vars,
  chars: CharDisplay[],
  bg: string | null
): GameState {
  let currentScene = scene;
  let currentBeatIdx = beatIdx;
  let currentVars = vars;
  let currentChars = chars;
  let currentBg = bg;

  while (true) {
    const sceneData = STORY[currentScene];

    if (!sceneData) {
      return {
        scene: currentScene,
        beatIdx: currentBeatIdx,
        vars: currentVars,
        chars: currentChars,
        bg: currentBg,
        ended: true,
        endingText: "장면 데이터를 찾지 못했습니다.",
      };
    }

    if (currentBeatIdx >= sceneData.beats.length) {
      if (!sceneData.next) {
        return {
          scene: currentScene,
          beatIdx: currentBeatIdx,
          vars: currentVars,
          chars: currentChars,
          bg: currentBg,
          ended: true,
          endingText: "",
        };
      }

      if (sceneData.next === "ending_branch") {
        const { integrity, risk, trust } = currentVars;

        if (integrity >= 80 && risk <= 2 && trust >= 2) {
          currentScene = "ending_clean";
        } else if (integrity >= 40 && risk <= 6) {
          currentScene = "ending_normal";
        } else {
          currentScene = "ending_fired";
        }

        currentBeatIdx = 0;
        continue;
      }

      currentScene = sceneData.next;
      currentBeatIdx = 0;
      continue;
    }

    const beat = sceneData.beats[currentBeatIdx];

    if (beat.kind === "bg") {
      currentBg = beat.name;
      currentBeatIdx += 1;
      continue;
    }

    if (beat.kind === "show") {
      currentChars = updateChars(currentChars, beat.chars);
      currentBeatIdx += 1;
      continue;
    }

    if (beat.kind === "hide") {
      currentChars = currentChars.filter((item) => !beat.ids.includes(item.id));
      currentBeatIdx += 1;
      continue;
    }

    if (beat.kind === "hideAll") {
      currentChars = [];
      currentBeatIdx += 1;
      continue;
    }

    if (beat.kind === "effects") {
      currentVars = applyEffects(currentVars, beat);
      currentBeatIdx += 1;
      continue;
    }

    if (beat.kind === "ending") {
      return {
        scene: currentScene,
        beatIdx: currentBeatIdx,
        vars: currentVars,
        chars: currentChars,
        bg: currentBg,
        ended: true,
        endingText: beat.text,
      };
    }

    return {
      scene: currentScene,
      beatIdx: currentBeatIdx,
      vars: currentVars,
      chars: currentChars,
      bg: currentBg,
      ended: false,
      endingText: "",
    };
  }
}

function getStageLabel(scene: string): string {
  if (scene.startsWith("stage1")) return "Stage 1";
  if (scene.startsWith("stage2")) return "Stage 2";
  if (scene.startsWith("stage3")) return "Stage 3";
  if (scene.startsWith("stage4")) return "Stage 4";
  if (scene.startsWith("stage5")) return "Stage 5";
  if (scene.startsWith("ending")) return "Ending";
  return "Intro";
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

const INITIAL_STATE = processToInteractive(
  "start",
  0,
  { integrity: 0, risk: 0, trust: 0 },
  [],
  null
);

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState(INITIAL_STATE);

  const currentBeat = STORY[gameState.scene]?.beats[gameState.beatIdx];
  const stageLabel = useMemo(() => getStageLabel(gameState.scene), [gameState.scene]);

  function advance() {
    setGameState((prev) => {
      if (prev.ended) {
        return prev;
      }

      const beat = STORY[prev.scene]?.beats[prev.beatIdx];
      if (!beat || beat.kind === "choice") {
        return prev;
      }

      return processToInteractive(prev.scene, prev.beatIdx + 1, prev.vars, prev.chars, prev.bg);
    });
  }

  function choose(index: number) {
    setGameState((prev) => {
      const beat = STORY[prev.scene]?.beats[prev.beatIdx];
      if (!beat || beat.kind !== "choice") {
        return prev;
      }

      const option = beat.options[index];
      const nextVars = option.effects ? applyEffects(prev.vars, option.effects) : prev.vars;
      return processToInteractive(option.jump, 0, nextVars, prev.chars, prev.bg);
    });
  }

  function restart() {
    setStarted(false);
    setGameState(INITIAL_STATE);
  }

  return (
    <main className="page-shell">
      <div className="novel-frame">
        <div className="bg-layer" style={getBackgroundStyle(gameState.bg)} />
        <div className="bg-overlay" />

        {!started && (
          <div className="start-screen">
            <div className="start-card">
              <div className="start-eyebrow">TEXT VISUAL NOVEL PROTOTYPE</div>
              <div className="start-title">공직 청렴 비주얼노벨</div>
              <div className="start-copy">
                이미지 없이도 지금 바로 플레이 가능한 프로토타입입니다.
                <br />
                장면, 선택지, 후폭풍, 엔딩 분기만 먼저 검증합니다.
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
                  BG <strong>{gameState.bg ?? "none"}</strong>
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
                    숨겨진 점수와 누적 위험도를 바탕으로 엔딩이 결정되었습니다.
                    <br />
                    실제 수치는 화면에 드러나지 않지만 모든 선택은 기록됩니다.
                  </div>
                  <div className="ending-actions">
                    <button className="action-btn primary" onClick={restart}>
                      다시 시작
                    </button>
                  </div>
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
                    <div
                      className="speaker"
                      style={{ color: CHAR_INFO[currentBeat.who].color }}
                    >
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
