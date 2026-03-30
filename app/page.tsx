"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { BG_URL, CHAR_INFO, CHAR_URL, STORY } from "../story";
import {
  advanceState,
  chooseOption,
  createInitialState,
  getScoreSummary,
  getStageLabel,
  processToInteractive,
  skipChoice,
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

interface StageTransitionCard {
  id: string;
  eyebrow: string;
  title: string;
  copy: string;
}

interface StageLawSummaryItem {
  id: string;
  topic: string;
  law: string;
  copy: string;
}

interface DevSceneOption {
  value: string;
  label: string;
}

const STAGE_LAW_SUMMARY: Record<string, StageLawSummaryItem> = {
  stage1_result_clean: {
    id: "stage1_result_clean",
    topic: "선물 수수와 신고",
    law: "청탁금지법 제8조",
    copy:
      "같은 사람에게 1회 100만원, 연 300만원을 초과하면 직무 관련성 여부와 무관하게 금지됩니다. 직무 관련 선물은 그 이하라도 받을 수 없어 신고와 반환이 우선입니다.",
  },
  stage1_result_share: {
    id: "stage1_result_share",
    topic: "선물 수수와 공동 소비",
    law: "청탁금지법 제8조",
    copy:
      "함께 나누어 썼다는 사정만으로 책임이 사라지지는 않습니다. 직무 관련자가 준 선물은 금액이 작아도 받을 수 없고, 공동 소비로 바꿔도 허용되지 않습니다.",
  },
  stage1_result_take: {
    id: "stage1_result_take",
    topic: "선물의 사적 수수",
    law: "청탁금지법 제8조",
    copy:
      "직무 관련자가 준 물품을 개인적으로 가져가면 수수 사실 자체가 먼저 문제 됩니다. 직무 관련 금품은 소액이어도 금지되므로 모호할수록 신고와 반환이 우선입니다.",
  },
  stage2_result_return: {
    id: "stage2_result_return",
    topic: "민원 응대와 금품 분리",
    law: "청탁금지법 제8조",
    copy:
      "민원 응대 중 전달된 현금성 물품은 즉시 돌려주거나 분리해 처리해야 합니다. 직무 관련 금품은 소액이어도 받을 수 없고, 현금성 물품은 특히 더 엄격하게 봅니다.",
  },
  stage2_result_teamfund: {
    id: "stage2_result_teamfund",
    topic: "공용 명목의 사용",
    law: "청탁금지법 제8조",
    copy:
      "팀을 위한 비용처럼 보여도 출처가 직무 관련자라면 판단이 달라집니다. 공용 사용이라는 명분만으로 허용되지 않으므로 최초 처리부터 분명해야 합니다.",
  },
  stage2_result_pocket: {
    id: "stage2_result_pocket",
    topic: "현금성 수수",
    law: "청탁금지법 제8조",
    copy:
      "현금이나 현금성 물품은 금액과 관계없이 더 엄격하게 봅니다. 민원 응대와 연결된 금전 수수는 1회 100만원, 연 300만원 기준과 별개로 직무 관련성이 있으면 금지됩니다.",
  },
  stage3_result_free: {
    id: "stage3_result_free",
    topic: "사적 관계와 이해충돌",
    law: "이해충돌방지법 제5조",
    copy:
      "직무관련자가 사적이해관계자임을 알게 되면 안 날부터 14일 이내에 서면으로 신고하고 회피를 신청해야 합니다. 친분이 있더라도 업무와 연결되면 바로 절차를 검토해야 합니다.",
  },
  stage3_result_dutch: {
    id: "stage3_result_dutch",
    topic: "사적 만남의 경계 유지",
    law: "이해충돌방지법 제5조",
    copy:
      "사적인 자리라도 직무 연관성을 알게 되면 안 날부터 14일 이내 신고와 기피신청 또는 회피 절차를 검토해야 합니다. 비용 부담을 나누는 것은 경계를 세우는 출발점일 뿐, 절차 자체를 대신하지는 않습니다.",
  },
  stage3_result_nexttime: {
    id: "stage3_result_nexttime",
    topic: "유보된 약속과 관계 관리",
    law: "이해충돌방지법 제5조",
    copy:
      "관계를 정리하는 말만으로는 충분하지 않을 수 있습니다. 직무 연관성을 인식했다면 안 날부터 14일 이내 신고와 기피신청 또는 회피 절차를 검토해야 하며, 그 점에서 2번 선택이 더 완결된 대응에 가깝습니다.",
  },
  stage4_result_reported: {
    id: "stage4_result_reported",
    topic: "외부강의와 사전 신고",
    law: "공무원 행동강령 제15조",
    copy:
      "사례금을 받은 외부강의는 마친 날부터 10일 이내에 요청 명세 등을 신고해야 합니다. 사례금도 소속기관장이 정한 상한을 넘길 수 없습니다.",
  },
  stage4_result_unreported: {
    id: "stage4_result_unreported",
    topic: "무신고 외부활동",
    law: "공무원 행동강령 제15조",
    copy:
      "강의 자체가 공익적이어도 신고를 누락하면 별도 문제가 됩니다. 사례금을 받은 외부강의는 종료 후 10일 이내 신고가 원칙이고, 일부 예외를 제외하면 절차를 지켜야 합니다.",
  },
  stage4_result_gift: {
    id: "stage4_result_gift",
    topic: "강의 이후 받은 선물",
    law: "청탁금지법 제8조 / 공무원 행동강령 제15조",
    copy:
      "외부강의 신고와 사례금 기준을 지켰더라도, 행사 뒤 받은 추가 선물은 별도로 판단해야 합니다. 직무 관련 선물은 다시 청탁금지법 제8조 문제로 이어질 수 있습니다.",
  },
  stage5_result_record: {
    id: "stage5_result_record",
    topic: "채용 공정성과 기록",
    law: "청탁금지법 제5조·제6조",
    copy:
      "채용 관련 부정청탁은 대가 여부와 무관하게 금지됩니다. 청탁을 받은 공직자도 그에 따라 직무를 수행해서는 안 되므로, 기록을 남겨 공정성과 본인 보호를 함께 확보해야 합니다.",
  },
  stage5_result_pressure: {
    id: "stage5_result_pressure",
    topic: "평가 개입 압력",
    law: "청탁금지법 제5조·제6조",
    copy:
      "직접 지시가 아니어도, 점수나 평가 방향을 건드리는 요구는 부정청탁으로 이어질 수 있습니다. 받은 공직자도 그에 따라 평가나 직무를 처리해서는 안 됩니다.",
  },
  stage5_result_leak: {
    id: "stage5_result_leak",
    topic: "심사 정보와 보안",
    law: "개인정보 보호법 제18조",
    copy:
      "면접위원 정보나 평가 자료는 수집 목적 범위를 벗어나, 임의로 이용하거나 제3자에게 제공할 수 없습니다. 별도 동의나 법률상 근거가 없으면 조회와 전달만으로도 문제됩니다.",
  },
};

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
    backgroundImage: `${palette[name ?? ""] ?? "linear-gradient(135deg, #1d2940 0%, #425878 45%, #0e1522 100%)"}, url(${BG_URL(name ?? "office_evening")})`,
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };
}

function getCharacterStyle(id: keyof typeof CHAR_INFO): CSSProperties {
  return {
    backgroundImage: `url(${CHAR_URL(id)})`,
  };
}

const SCENE_LABELS: Record<string, string> = {
  office_evening: "사무실",
  office_storage: "사무실",
  audit_office: "감사실",
  office_night: "사무실",
  parking_lot: "주차장",
  civil_counter: "민원 창구",
  office_hallway: "사무실 복도",
  team_room: "팀 사무실",
  city_street: "도시 거리",
  restaurant_private: "고급 식당 룸",
  meeting_room: "회의실",
  restaurant_exit: "식당 출구",
  night_crosswalk: "밤거리 횡단보도",
  lecture_hall: "강의실",
  office_day: "사무실",
  inspection_room: "조사실",
  home_table: "집 식탁",
  executive_office: "간부실",
  records_room: "기록 보관실",
  team_room_night: "팀 사무실",
  dark_monitor: "어두운 모니터",
  award_hall: "온누리실",
  office_sunset: "사무실",
  discipline_room: "징계위원회실",
};

function toDisplayLabel(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSceneLabel(bg: string | null, scene: string): string {
  if (bg) {
    return SCENE_LABELS[bg] ?? toDisplayLabel(bg);
  }

  return toDisplayLabel(scene);
}

function getSceneBackgroundName(scene: string): string | null {
  const beats = STORY[scene]?.beats ?? [];
  const bgBeat = beats.find((beat) => beat.kind === "bg");

  return bgBeat?.kind === "bg" ? bgBeat.name : null;
}

function createSceneOption(scene: string): DevSceneOption {
  return {
    value: scene,
    label: `${getKoreanStageLabel(scene)} · ${getSceneLabel(getSceneBackgroundName(scene), scene)}`,
  };
}

function getKoreanStageLabel(scene: string): string {
  if (scene.startsWith("stage1")) return "1단계";
  if (scene.startsWith("stage2")) return "2단계";
  if (scene.startsWith("stage3")) return "3단계";
  if (scene.startsWith("stage4")) return "4단계";
  if (scene.startsWith("stage5")) return "5단계";
  if (scene.startsWith("ending")) return "엔딩";
  return "인트로";
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

function getStageKey(scene: string): string {
  if (scene.startsWith("stage1")) return "stage1";
  if (scene.startsWith("stage2")) return "stage2";
  if (scene.startsWith("stage3")) return "stage3";
  if (scene.startsWith("stage4")) return "stage4";
  if (scene.startsWith("stage5")) return "stage5";
  if (scene.startsWith("ending")) return "ending";
  return "intro";
}

function getStageTransitionCard(scene: string): StageTransitionCard | null {
  const stageKey = getStageKey(scene);

  switch (stageKey) {
    case "stage1":
      return { id: "stage1", eyebrow: "", title: "1년차", copy: "첫 단추가 중요하다." };
    case "stage2":
      return { id: "stage2", eyebrow: "", title: "3년차", copy: "익숙함이 기준을 흐린다." };
    case "stage3":
      return { id: "stage3", eyebrow: "", title: "9년차", copy: "관계가 판단을 흔든다." };
    case "stage4":
      return { id: "stage4", eyebrow: "", title: "15년차", copy: "보이지 않는 시선이 늘어난다." };
    case "stage5":
      return {
        id: "stage5",
        eyebrow: "",
        title: "25년차",
        copy: "책임이 무거워질수록 판단의 무게도 커진다.",
      };
    default:
      return null;
  }
}

function getTransitionForChange(
  previousScene: string,
  nextScene: string
): StageTransitionCard | null {
  const previousKey = getStageKey(previousScene);
  const nextKey = getStageKey(nextScene);

  if (previousKey === nextKey) {
    return null;
  }

  return getStageTransitionCard(nextScene);
}

function getStageLawSummary(scene: string): StageLawSummaryItem | null {
  return STAGE_LAW_SUMMARY[scene] ?? null;
}

function formatLegalCopy(copy: string): string {
  return copy
    .replaceAll(
      "직접 지시가 아니어도, 점수나 평가 방향을 건드리는 요구는 부정청탁으로 이어질 수 있습니다.",
      "직접 지시가 아니어도__KEEP_COMMA__ 점수나 평가 방향을\n건드리는 요구는 부정청탁으로 이어질 수 있습니다."
    )
    .replaceAll(
      "안 날부터 14일 이내 신고와 회피 절차를 검토해야 합니다.",
      "안 날부터 14일 이내\n신고와 회피 절차를 검토해야 합니다."
    )
    .replaceAll(
      "면접위원 정보나 평가 자료는 수집 목적 범위를 벗어나, 임의로 이용하거나 제3자에게 제공할 수 없습니다.",
      "면접위원 정보나 평가 자료는 수집 목적 범위를 벗어나,\n임의로 이용하거나 제3자에게 제공할 수 없습니다."
    )
    .replaceAll(
      "10일 이내 신고가 원칙이고, 일부 예외를 제외하면 절차를 지켜야 합니다.",
      "10일 이내 신고가 원칙이고,\n일부 예외를 제외하면 절차를 지켜야 합니다."
    )
    .replaceAll(
      "외부강의 신고와 사례금 기준을 지켰더라도, 행사 뒤 받은 추가 선물은 별도로 판단해야 합니다.",
      "외부강의 신고와 사례금 기준을 지켰더라도,\n행사 뒤 받은 추가 선물은 별도로 판단해야 합니다."
    )
    .replaceAll(
      "직무 관련자가 준 선물은 금액이 작아도 받을 수 없고, 공동 소비로 바꿔도 허용되지 않습니다.",
      "직무 관련자가 준 선물은 금액이 작아도 받을 수 없고,\n공동 소비로 바꿔도 허용되지 않습니다."
    )
    .replaceAll(
      "같은 사람에게 1회 100만원, 연 300만원을 초과하면 직무 관련성 여부와 무관하게 금지됩니다.",
      "같은 사람에게 1회 100만원, 연 300만원을 초과하면\n직무 관련성 여부와 무관하게 금지됩니다."
    )
    .replaceAll(
      "민원 응대와 연결된 금전 수수는 1회 100만원, 연 300만원 기준과 별개로 직무 관련성이 있으면 금지됩니다.",
      "민원 응대와 연결된 금전 수수는 1회 100만원, 연 300만원 기준과 별개로\n직무 관련성이 있으면 금지됩니다."
    )
    .replaceAll(
      "그 점에서 2번 선택이 더 완결된 대응에 가깝습니다.",
      "그 점에서\n2번 선택이 더 완결된 대응에 가깝습니다."
    )
    .replaceAll(
      "청탁을 받은 공직자도 그에 따라 직무를 수행해서는 안 되므로, 기록을 남겨 공정성과 본인 보호를 함께 확보해야 합니다.",
      "청탁을 받은 공직자도 그에 따라 직무를 수행해서는 안 되므로,\n기록을 남겨 공정성과 본인 보호를 함께 확보해야 합니다."
    )
    .replaceAll(". ", ".\n")
    .replaceAll("안 날부터 14일 이내에 ", "안 날부터 14일 이내에\n")
    .replaceAll("안 날부터 14일 이내 ", "안 날부터 14일 이내\n")
    .replaceAll("14일 이내 신고와 회피신청이 필요한지 ", "14일 이내 신고와 회피신청이 필요한지\n")
    .replaceAll("신고하고 회피를", "신고하고 회피를")
    .replaceAll("__KEEP_COMMA__", ",");
}

function formatStoryCopy(copy: string): string {
  return copy.replace(/([.])\s+/g, "$1\n");
}

const TIMED_CHOICE_SCENES = new Set([
  "stage1_intro",
  "stage2_intro",
  "stage3_intro",
  "stage4_intro",
  "stage5_intro",
]);

const HIDDEN_CHOICE_BY_SCENE: Record<string, number> = {
  stage1_intro: 2,
  stage3_intro: 2,
  stage4_intro: 0,
};
const HIDDEN_CHOICE_REVEAL_MS = 3000;
const HIDDEN_CHOICE_TOTAL_MS = 7000;

export default function HomePage() {
  const initialState = useMemo(() => createInitialState(), []);
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [stageTransition, setStageTransition] = useState<StageTransitionCard | null>(null);
  const [queuedStageTransition, setQueuedStageTransition] = useState<StageTransitionCard | null>(null);
  const [stageLawSummary, setStageLawSummary] = useState<StageLawSummaryItem | null>(null);
  const [formState, setFormState] = useState<SubmissionFormState>({
    name: "",
    affiliation: "",
    consent: false,
  });
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [isSubmissionPopupOpen, setIsSubmissionPopupOpen] = useState(false);
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [selectedScene, setSelectedScene] = useState("stage1_intro");
  const [isDelayedChoiceVisible, setIsDelayedChoiceVisible] = useState(true);
  const [delayedChoiceProgress, setDelayedChoiceProgress] = useState(100);
  const latestGameStateRef = useRef(gameState);

  const devSceneOptions = useMemo(
    () =>
      Object.keys(STORY)
        .filter((scene) => scene !== "start" && scene !== "ending_branch")
        .map(createSceneOption),
    []
  );

  const currentBeat = STORY[gameState.scene]?.beats[gameState.beatIdx];
  const stageLabel = useMemo(() => getStageLabel(gameState.scene), [gameState.scene]);
  const sceneLabel = useMemo(
    () => getSceneLabel(gameState.bg, gameState.scene),
    [gameState.bg, gameState.scene]
  );
  const beatMotionKey = `${gameState.scene}-${gameState.beatIdx}-${currentBeat?.kind ?? "ended"}`;
  const scoreSummary = useMemo(
    () => getScoreSummary(gameState.vars, gameState.scene, gameState.endingText),
    [gameState.endingText, gameState.scene, gameState.vars]
  );

  const shouldUseChoiceTimer =
    currentBeat?.kind === "choice" && TIMED_CHOICE_SCENES.has(gameState.scene);
  const hiddenChoiceIndex =
    currentBeat?.kind === "choice" ? HIDDEN_CHOICE_BY_SCENE[gameState.scene] : undefined;
  const shouldDelayHiddenChoice = hiddenChoiceIndex !== undefined;
  const visibleOptions =
    currentBeat?.kind === "choice"
      ? currentBeat.options.filter(
          (_, index) =>
            !(shouldDelayHiddenChoice && index === hiddenChoiceIndex && !isDelayedChoiceVisible)
        )
      : [];

  useEffect(() => {
    latestGameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const { hostname, search } = window.location;
    const localHosts = new Set(["localhost", "127.0.0.1"]);
    const enabled = localHosts.has(hostname);
    setIsLocalDev(enabled);

    if (!enabled) {
      return;
    }

    const params = new URLSearchParams(search);
    const requestedScene = params.get("scene");

    if (requestedScene && STORY[requestedScene]) {
      jumpToScene(requestedScene);
      setSelectedScene(requestedScene);
    }
  }, []);

  useEffect(() => {
    if (!shouldUseChoiceTimer) {
      setIsDelayedChoiceVisible(true);
      setDelayedChoiceProgress(100);
      return;
    }

    setIsDelayedChoiceVisible(!shouldDelayHiddenChoice);
    setDelayedChoiceProgress(100);

    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 100 - (elapsed / HIDDEN_CHOICE_TOTAL_MS) * 100);
      setDelayedChoiceProgress(remaining);

      if (elapsed >= HIDDEN_CHOICE_TOTAL_MS) {
        window.clearInterval(progressTimer);
        setIsDelayedChoiceVisible(false);
        setDelayedChoiceProgress(0);
      }
    }, 80);

    const revealTimer =
      shouldDelayHiddenChoice
        ? window.setTimeout(() => {
            setIsDelayedChoiceVisible(true);
          }, HIDDEN_CHOICE_REVEAL_MS)
        : null;

    const hideTimer = window.setTimeout(() => {
      setIsDelayedChoiceVisible(false);
      setDelayedChoiceProgress(0);
      window.clearInterval(progressTimer);

      const latestState = latestGameStateRef.current;
      const latestBeat = STORY[latestState.scene]?.beats[latestState.beatIdx];

      if (latestBeat?.kind === "choice" && TIMED_CHOICE_SCENES.has(latestState.scene)) {
        applySkippedChoice(latestState);
      }
    }, HIDDEN_CHOICE_TOTAL_MS);

    return () => {
      if (revealTimer) {
        window.clearTimeout(revealTimer);
      }
      window.clearTimeout(hideTimer);
      window.clearInterval(progressTimer);
    };
  }, [shouldDelayHiddenChoice, shouldUseChoiceTimer, gameState.scene, gameState.beatIdx]);

  function resetUiState() {
    setStageTransition(null);
    setQueuedStageTransition(null);
    setStageLawSummary(null);
    setSubmissionStatus("idle");
    setSubmissionMessage("");
    setSubmissionResult(null);
    setIsSubmissionPopupOpen(false);
    setFormState({
      name: "",
      affiliation: "",
      consent: false,
    });
  }

  function jumpToScene(scene: string) {
    const nextState = processToInteractive(scene, 0, initialState.vars, [], null, []);
    setStarted(true);
    setGameState(nextState);
    resetUiState();
  }

  function advance() {
    const next = advanceState(gameState);
    const lawSummary = getStageLawSummary(gameState.scene);
    const nextTransition = getTransitionForChange(gameState.scene, next.scene);
    const shouldShowStageLawSummary = Boolean(lawSummary) && next.scene !== gameState.scene;

    setGameState(next);

    if (lawSummary && shouldShowStageLawSummary) {
      setStageLawSummary(lawSummary);
      setQueuedStageTransition(nextTransition);
      setStageTransition(null);
    } else if (nextTransition) {
      setStageTransition(nextTransition);
    }
  }

  function choose(index: number) {
    const next = chooseOption(gameState, index);
    applySceneState(gameState.scene, next);
  }

  function applySkippedChoice(fromState: GameState) {
    const next = skipChoice(fromState);
    applySceneState(fromState.scene, next);
  }

  function applySceneState(previousScene: string, next: GameState) {
    const lawSummary = getStageLawSummary(previousScene);
    const nextTransition = getTransitionForChange(previousScene, next.scene);
    const shouldShowStageLawSummary = Boolean(lawSummary) && next.scene !== previousScene;

    setGameState(next);

    if (lawSummary && shouldShowStageLawSummary) {
      setStageLawSummary(lawSummary);
      setQueuedStageTransition(nextTransition);
      setStageTransition(null);
    } else if (nextTransition) {
      setStageTransition(nextTransition);
    }
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
      setIsSubmissionPopupOpen(true);
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionMessage(
        error instanceof Error ? error.message : "제출 처리 중 오류가 발생했습니다."
      );
    }
  }

  function startGame() {
    setStarted(true);
    setStageTransition(null);
  }

  function restartGame() {
    setStarted(false);
    setGameState(initialState);
    resetUiState();
    setSelectedScene("stage1_intro");
  }

  function closeStageLawSummary() {
    setStageLawSummary(null);

    if (queuedStageTransition) {
      setStageTransition(queuedStageTransition);
      setQueuedStageTransition(null);
    }
  }

  function closeSubmissionPopup() {
    setIsSubmissionPopupOpen(false);
  }

  return (
    <main className="page-shell">
      <div className="novel-frame">
        <div className="bg-layer" style={getBackgroundStyle(gameState.bg)} />
        <div className="bg-overlay" />

        {started && !gameState.ended && gameState.chars.length > 0 && (
          <div className="char-layer" aria-hidden="true">
            {gameState.chars.map((char) =>
              char.pos === "caller" ? (
                <div key={char.id} className="caller-card soft-fade-enter">
                  <div className="caller-portrait" style={getCharacterStyle(char.id)} />
                  <div className="caller-meta">
                    <div className="caller-label">CALL</div>
                    <div className="caller-name">{CHAR_INFO[char.id].name}</div>
                  </div>
                </div>
              ) : (
                <div
                  key={char.id}
                  className={`char-sprite ${char.pos} soft-fade-enter`}
                  style={getCharacterStyle(char.id)}
                />
              )
            )}
          </div>
        )}

        {!started && (
          <div className="start-screen">
            <div className="start-card">
              <div className="start-eyebrow">WEB EVENT VISUAL NOVEL</div>
              <div className="start-title">공직 청렴 비주얼노벨</div>
              <div className="start-copy">
                선택을 따라가며 청렴도와 위험도를 확인하는 웹게임입니다.
                <br />
                엔딩에서 이름과 소속을 제출하면 결과가 관리자에게 전송됩니다.
              </div>
              <button className="action-btn primary" onClick={startGame}>
                시작하기
              </button>
            </div>
          </div>
        )}

        {started && (
          <>
            <div className="top-bar soft-fade-enter">
              <div className="badge-row">
                <div className="badge stage-badge stage-pill">
                  <strong>{stageLabel}</strong>
                </div>
                <div className="badge scene-pill">
                  <span>Scene:</span>
                  <strong>{sceneLabel}</strong>
                </div>
              </div>
            </div>

            {stageTransition && !gameState.ended && (
              <div className="transition-shell">
                <div className="transition-card soft-card-enter">
                  {stageTransition.eyebrow && (
                    <div className="transition-eyebrow">{stageTransition.eyebrow}</div>
                  )}
                  <div className="transition-title">{stageTransition.title}</div>
                  <div className="transition-copy">{stageTransition.copy}</div>
                  <button
                    className="action-btn primary"
                    type="button"
                    onClick={() => setStageTransition(null)}
                  >
                    다음으로
                  </button>
                </div>
              </div>
            )}

            {stageLawSummary && !gameState.ended && (
              <div className="legal-shell">
                <div className="legal-card soft-card-enter">
                  <div className="legal-title">{stageLawSummary.topic}</div>
                  <div className="legal-law">{stageLawSummary.law}</div>
                  <div className="legal-copy">{formatLegalCopy(stageLawSummary.copy)}</div>
                  <button className="action-btn primary" type="button" onClick={closeStageLawSummary}>
                    다음으로
                  </button>
                </div>
              </div>
            )}

            {gameState.ended ? (
              <div className="ending-shell">
                <div className="ending-card soft-card-enter">
                  <div className="ending-label">ENDING</div>
                  <div className="ending-title">{gameState.endingText}</div>
                  <div className="ending-copy">
                    선택 기록을 기준으로 최종 점수를 다시 계산합니다.
                    <br />
                    결과 제출 정보는 접수 확인과 추첨 운영에만 사용됩니다.
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
                        placeholder="성남시청 OO과 / 분당구청 OO과 / 중원구 OO동 / OO사업소"
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
                        이벤트 운영, 결과 집계, 추첨 관리를 위해 이름과 소속을 수집하는 데 동의합니다.
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
                    </div>
                  </form>

                  {submissionMessage && submissionStatus === "error" && (
                    <div className={`submission-banner ${submissionStatus}`}>
                      {submissionMessage}
                    </div>
                  )}
                </div>
                {submissionResult && isSubmissionPopupOpen && (
                  <div className="submission-popup-shell">
                    <div className="submission-popup soft-card-enter">
                      <div className="receipt-title">
                        접수 완료 ({scoreSummary.endingLabel})
                      </div>
                      <div className="receipt-copy">
                        {submissionMessage || "결과가 정상적으로 접수되었습니다."}
                      </div>
                      <div className="receipt-copy">
                        접수번호 <strong>{submissionResult.id}</strong>
                      </div>
                      <div className="receipt-copy">
                        제출 시각 {formatSubmittedAt(submissionResult.submittedAt)}
                      </div>
                      <div className="receipt-copy">
                        검증 점수 {submissionResult.finalScore}점
                      </div>
                      <div className="submission-popup-actions">
                        <button className="action-btn" type="button" onClick={restartGame}>
                          처음 화면으로
                        </button>
                        <button className="action-btn primary" type="button" onClick={closeSubmissionPopup}>
                          확인
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {currentBeat?.kind === "choice" && (
                  <div className="choice-wrap">
                    <div key={beatMotionKey} className="choice-list choice-list-animate">
                      {shouldUseChoiceTimer && (
                        <div className="choice-timer-shell" aria-hidden="true">
                          <div className="choice-alarm">
                            <span className="choice-alarm-bell choice-alarm-bell-left" />
                            <span className="choice-alarm-bell choice-alarm-bell-right" />
                            <span className="choice-alarm-face">
                              <span className="choice-alarm-hand choice-alarm-hand-hour" />
                              <span className="choice-alarm-hand choice-alarm-hand-minute" />
                            </span>
                          </div>
                          <div className="choice-timebar">
                            <span
                              className="choice-timebar-fill"
                              style={{ width: `${delayedChoiceProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {visibleOptions.map((option, displayIndex) => {
                        const index = currentBeat.options.indexOf(option);

                        return (
                          <button
                            key={`${gameState.scene}-${index}`}
                            className={`choice-btn ${
                              shouldDelayHiddenChoice && index === hiddenChoiceIndex
                                ? "choice-btn-hidden"
                                : ""
                            } ${
                              shouldDelayHiddenChoice && index === hiddenChoiceIndex
                                ? "choice-btn-reveal"
                                : ""
                            }`}
                            onClick={() => choose(index)}
                          >
                            {shouldDelayHiddenChoice && index === hiddenChoiceIndex && (
                              <span className="choice-hidden-ribbon" aria-hidden="true">
                                Hidden
                              </span>
                            )}
                            <span className="choice-index">{displayIndex + 1}</span>
                            <span className="choice-text">{option.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div
                  key={beatMotionKey}
                  className={`bottom-panel ${currentBeat?.kind === "dialogue" ? "has-speaker" : ""}`}
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
                      ? formatStoryCopy(currentBeat.text)
                      : "선택지를 골라주세요."}
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

      {isLocalDev && (
        <div className="dev-panel">
          <div className="dev-panel-title">장면 이동</div>
          <div className="dev-panel-copy">
            현재: {getKoreanStageLabel(gameState.scene)} · {sceneLabel}
          </div>
          <select
            className="dev-select"
            value={selectedScene}
            onChange={(event) => setSelectedScene(event.target.value)}
          >
            {devSceneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="dev-actions">
            <button className="action-btn" type="button" onClick={() => jumpToScene(selectedScene)}>
              이동
            </button>
            <button className="action-btn" type="button" onClick={restartGame}>
              처음으로
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
