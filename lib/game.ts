import { STORY, type CharDisplay, type Vars } from "../story";

export interface GameState {
  scene: string;
  beatIdx: number;
  vars: Vars;
  chars: CharDisplay[];
  bg: string | null;
  ended: boolean;
  endingText: string;
  history: number[];
}

export interface ScoreSummary {
  finalScore: number;
  integrity: number;
  risk: number;
  trust: number;
  endingTier: "clean" | "normal" | "fired" | "hidden";
  endingLabel: string;
}

const INITIAL_VARS: Vars = {
  integrity: 0,
  risk: 0,
  trust: 0,
};

const PASSIVE_CHOICE_VALUE = -1;

const PASSIVE_SCENE_MAP: Record<string, string> = {
  stage1_intro: "stage1_result_passive",
  stage2_intro: "stage2_result_passive",
  stage3_intro: "stage3_result_passive",
  stage4_intro: "stage4_result_passive",
  stage5_intro: "stage5_result_passive",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyEffects(vars: Vars, effects: Partial<Vars>): Vars {
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

function hydrateState(state: Omit<GameState, "history">, history: number[]): GameState {
  return {
    ...state,
    history,
  };
}

export function resolveEndingScene(
  vars: Vars,
  history: number[]
): "ending_clean" | "ending_normal" | "ending_fired" | "ending_passive" {
  if (history.length === 5 && history.every((entry) => entry === PASSIVE_CHOICE_VALUE)) {
    return "ending_passive";
  }

  if (vars.integrity >= 80 && vars.risk <= 2 && vars.trust >= 2) {
    return "ending_clean";
  }

  if (vars.integrity >= 40 && vars.risk <= 6) {
    return "ending_normal";
  }

  return "ending_fired";
}

export function processToInteractive(
  scene: string,
  beatIdx: number,
  vars: Vars,
  chars: CharDisplay[],
  bg: string | null,
  history: number[] = []
): GameState {
  let currentScene = scene;
  let currentBeatIdx = beatIdx;
  let currentVars = vars;
  let currentChars = chars;
  let currentBg = bg;

  while (true) {
    const sceneData = STORY[currentScene];

    if (!sceneData) {
      return hydrateState(
        {
          scene: currentScene,
          beatIdx: currentBeatIdx,
          vars: currentVars,
          chars: currentChars,
          bg: currentBg,
          ended: true,
          endingText: "장면 데이터를 찾지 못했습니다.",
        },
        history
      );
    }

    if (currentBeatIdx >= sceneData.beats.length) {
      if (!sceneData.next) {
        return hydrateState(
          {
            scene: currentScene,
            beatIdx: currentBeatIdx,
            vars: currentVars,
            chars: currentChars,
            bg: currentBg,
            ended: true,
            endingText: "",
          },
          history
        );
      }

      if (sceneData.next === "ending_branch") {
        currentScene = resolveEndingScene(currentVars, history);
        currentBeatIdx = 0;
        currentChars = [];
        continue;
      }

      currentScene = sceneData.next;
      currentBeatIdx = 0;
      currentChars = [];
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
      return hydrateState(
        {
          scene: currentScene,
          beatIdx: currentBeatIdx,
          vars: currentVars,
          chars: currentChars,
          bg: currentBg,
          ended: true,
          endingText: beat.text,
        },
        history
      );
    }

    return hydrateState(
      {
        scene: currentScene,
        beatIdx: currentBeatIdx,
        vars: currentVars,
        chars: currentChars,
        bg: currentBg,
        ended: false,
        endingText: "",
      },
      history
    );
  }
}

export function createInitialState(): GameState {
  return processToInteractive("start", 0, INITIAL_VARS, [], null, []);
}

export function advanceState(state: GameState): GameState {
  if (state.ended) {
    return state;
  }

  const beat = STORY[state.scene]?.beats[state.beatIdx];

  if (!beat || beat.kind === "choice") {
    return state;
  }

  return processToInteractive(
    state.scene,
    state.beatIdx + 1,
    state.vars,
    state.chars,
    state.bg,
    state.history
  );
}

export function chooseOption(state: GameState, index: number): GameState {
  const beat = STORY[state.scene]?.beats[state.beatIdx];

  if (!beat || beat.kind !== "choice") {
    return state;
  }

  const option = beat.options[index];

  if (!option) {
    return state;
  }

  const nextVars = option.effects ? applyEffects(state.vars, option.effects) : state.vars;
  const nextHistory = [...state.history, index];

  return processToInteractive(option.jump, 0, nextVars, state.chars, state.bg, nextHistory);
}

export function skipChoice(state: GameState): GameState {
  const beat = STORY[state.scene]?.beats[state.beatIdx];

  if (!beat || beat.kind !== "choice") {
    return state;
  }

  const nextScene = PASSIVE_SCENE_MAP[state.scene];

  if (!nextScene) {
    return state;
  }

  const nextHistory = [...state.history, PASSIVE_CHOICE_VALUE];
  return processToInteractive(nextScene, 0, state.vars, state.chars, state.bg, nextHistory);
}

export function replayHistory(history: number[]): GameState {
  let state = createInitialState();

  for (const choiceIndex of history) {
    while (!state.ended) {
      const currentBeat = STORY[state.scene]?.beats[state.beatIdx];

      if (currentBeat?.kind === "choice") {
        break;
      }

      state = advanceState(state);
    }

    const beat = STORY[state.scene]?.beats[state.beatIdx];

    if (!beat || beat.kind !== "choice") {
      throw new Error("선택 기록이 현재 스토리 구조와 맞지 않습니다.");
    }

    if (!Number.isInteger(choiceIndex)) {
      throw new Error("유효하지 않은 선택 기록이 포함되어 있습니다.");
    }

    if (choiceIndex === PASSIVE_CHOICE_VALUE) {
      state = skipChoice(state);
      continue;
    }

    if (choiceIndex < 0 || choiceIndex >= beat.options.length) {
      throw new Error("유효하지 않은 선택 기록이 포함되어 있습니다.");
    }

    state = chooseOption(state, choiceIndex);
  }

  while (!state.ended) {
    state = advanceState(state);
  }

  return state;
}

export function getStageLabel(scene: string): string {
  if (scene.startsWith("stage1")) return "Stage 1";
  if (scene.startsWith("stage2")) return "Stage 2";
  if (scene.startsWith("stage3")) return "Stage 3";
  if (scene.startsWith("stage4")) return "Stage 4";
  if (scene.startsWith("stage5")) return "Stage 5";
  if (scene.startsWith("ending")) return "Ending";
  return "Intro";
}

export function getScoreSummary(vars: Vars, endingScene: string, endingText: string): ScoreSummary {
  const finalScore = clamp(vars.integrity - vars.risk * 4 + vars.trust * 3, 0, 100);
  const endingTier =
    endingScene === "ending_clean"
      ? "clean"
      : endingScene === "ending_normal"
        ? "normal"
        : endingScene === "ending_passive"
          ? "hidden"
          : "fired";

  return {
    finalScore,
    integrity: vars.integrity,
    risk: vars.risk,
    trust: vars.trust,
    endingTier,
    endingLabel:
      endingText ||
      (endingTier === "clean"
        ? "청렴 우수 엔딩"
        : endingTier === "normal"
          ? "무난한 생존 엔딩"
          : endingTier === "hidden"
            ? "수동형 인간 히든 엔딩"
            : "징계 엔딩"),
  };
}
