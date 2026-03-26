export type CharId =
  | "player"
  | "manager"
  | "auditor"
  | "petitioner"
  | "friend"
  | "host"
  | "junior";

export type Position = "left" | "center" | "right" | "caller";

export interface CharDisplay {
  id: CharId;
  pos: Position;
}

export type Vars = {
  integrity: number;
  risk: number;
  trust: number;
};

export type Beat =
  | { kind: "bg"; name: string }
  | { kind: "narration"; text: string }
  | { kind: "dialogue"; who: CharId; text: string }
  | { kind: "show"; chars: CharDisplay[] }
  | { kind: "hide"; ids: CharId[] }
  | { kind: "hideAll" }
  | { kind: "effects"; integrity?: number; risk?: number; trust?: number }
  | {
      kind: "choice";
      options: {
        text: string;
        effects?: { integrity?: number; risk?: number; trust?: number };
        jump: string;
      }[];
    }
  | { kind: "ending"; text: string };

export interface Scene {
  beats: Beat[];
  next?: string;
}

export const CHAR_INFO: Record<CharId, { name: string; color: string }> = {
  player: { name: "나", color: "#d8ecff" },
  manager: { name: "과장", color: "#ffd8d8" },
  auditor: { name: "감사 담당", color: "#ffe7b8" },
  petitioner: { name: "민원인", color: "#ffd0c8" },
  friend: { name: "동창", color: "#d8ffd8" },
  host: { name: "지역 유지", color: "#f0d8ff" },
  junior: { name: "후배 직원", color: "#d8fff0" },
};

export const BG_URL = (name: string) => `/integrity-novel/bg/${name}.jpg`;
export const CHAR_URL = (id: CharId) => `/integrity-novel/chars/${id}.png`;

export const STORY: Record<string, Scene> = {
  start: {
    beats: [
      { kind: "bg", name: "office_evening" },
      {
        kind: "narration",
        text: "처음엔 다들 비슷해 보였다. 퇴근 직전 서류 더미, 울리는 전화, 눈치 빠른 민원인, 그리고 이상할 정도로 자주 시험받는 양심.",
      },
      {
        kind: "narration",
        text: "공직생활은 선택의 연속이다. 점수는 보이지 않지만, 결과는 반드시 남는다.",
      },
    ],
    next: "stage1_intro",
  },

  stage1_intro: {
    beats: [
      { kind: "bg", name: "office_storage" },
      { kind: "show", chars: [{ id: "player", pos: "left" }] },
      {
        kind: "narration",
        text: "야근을 마치고 자리에서 일어나려는 순간, 책상 밑에서 과일 박스 하나가 발견됐다.",
      },
      {
        kind: "narration",
        text: "보낸 사람 이름도, 부서명도 적혀 있지 않았다. 과일은 아직 싱싱했다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "법대로 하자. 절차에 따라 신고 후 반납한다.",
            effects: { integrity: 20, risk: -1, trust: 1 },
            jump: "stage1_result_clean",
          },
          {
            text: "다 같이 고생하는데 과 사람들과 나눠 먹는다.",
            effects: { integrity: 10, risk: 1, trust: -1 },
            jump: "stage1_result_share",
          },
          {
            text: "상하기 전에 내가 처리하자. 집에 가져간다.",
            effects: { integrity: 0, risk: 3, trust: -2 },
            jump: "stage1_result_take",
          },
        ],
      },
    ],
  },

  stage1_result_clean: {
    beats: [
      { kind: "bg", name: "audit_office" },
      { kind: "show", chars: [{ id: "auditor", pos: "right" }] },
      {
        kind: "narration",
        text: "감사 담당은 정석대로 잘 처리했다며 짧게 고개를 끄덕였다.",
      },
      {
        kind: "dialogue",
        who: "auditor",
        text: "이런 건 처음이 중요합니다. 기록 남겨두면 나중에 본인을 지켜줍니다.",
      },
      {
        kind: "narration",
        text: "과장도 아무 말 없이 당신 쪽을 한 번 봤다. 그 시선엔 묘한 신뢰가 담겨 있었다.",
      },
    ],
    next: "stage2_intro",
  },

  stage1_result_share: {
    beats: [
      { kind: "bg", name: "office_night" },
      {
        kind: "narration",
        text: "며칠 뒤 익명 제보가 들어왔다. 과 사람들 전원이 소명서를 쓰느라 사무실 분위기가 싸해졌다.",
      },
      {
        kind: "narration",
        text: "\"누가 처음 가져온 거냐\"는 말이 조용히 떠돌았고, 아무도 먼저 입을 열지 않았다.",
      },
      {
        kind: "narration",
        text: "함께 나눠 먹었지만, 책임은 누구도 나눠 갖지 않았다.",
      },
    ],
    next: "stage2_intro",
  },

  stage1_result_take: {
    beats: [
      { kind: "bg", name: "parking_lot" },
      { kind: "show", chars: [{ id: "petitioner", pos: "caller" }] },
      {
        kind: "narration",
        text: "며칠 뒤 그 민원인이 다시 찾아왔다. 웃으며 과일은 잘 드셨냐고 물었다.",
      },
      {
        kind: "dialogue",
        who: "petitioner",
        text: "그 정도 받으셨으면, 이번 건은 조금 편하게 봐주셔야죠.",
      },
      {
        kind: "narration",
        text: "거절하려는 순간 상대는 CCTV를 언급했다. 갑자기 박스는 과일이 아니라 목줄이 되었다.",
      },
    ],
    next: "stage2_intro",
  },

  stage2_intro: {
    beats: [
      { kind: "bg", name: "civil_counter" },
      { kind: "show", chars: [{ id: "petitioner", pos: "caller" }] },
      {
        kind: "narration",
        text: "민원 상담을 마치고 자리로 돌아오는데, 민원인이 놓고 간 박카스 상자가 눈에 띄었다.",
      },
      {
        kind: "narration",
        text: "무심코 들어 올리자, 병 사이에 얇은 봉투 하나가 끼워져 있었다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "즉시 뒤쫓아가 정중히 돌려드린다.",
            effects: { integrity: 20, risk: -1, trust: 1 },
            jump: "stage2_result_return",
          },
          {
            text: "과 회식비에 보태자. 팀 공용 간식비 함에 넣는다.",
            effects: { integrity: 10, risk: 1, trust: 0 },
            jump: "stage2_result_teamfund",
          },
          {
            text: "커피값 정도는 괜찮겠지. 내 지갑에 챙긴다.",
            effects: { integrity: 0, risk: 4, trust: -2 },
            jump: "stage2_result_pocket",
          },
        ],
      },
    ],
  },

  stage2_result_return: {
    beats: [
      { kind: "bg", name: "office_hallway" },
      {
        kind: "narration",
        text: "민원인은 처음엔 민망한 표정을 지었지만, 끝내 박카스 상자를 받아 들었다.",
      },
      {
        kind: "narration",
        text: "며칠 뒤 국민신문고에 정식 칭찬 민원이 올라왔다. '거절하는 태도가 오히려 믿음을 줬다'는 내용이었다.",
      },
    ],
    next: "stage3_intro",
  },

  stage2_result_teamfund: {
    beats: [
      { kind: "bg", name: "team_room" },
      { kind: "show", chars: [{ id: "manager", pos: "right" }] },
      {
        kind: "narration",
        text: "좋은 뜻이라고 생각했지만, 돈의 출처가 불분명하다는 문제는 사라지지 않았다.",
      },
      {
        kind: "dialogue",
        who: "manager",
        text: "회식비든 간식비든, 이런 돈은 건드리면 안 돼. 결국 더 번거로워져.",
      },
      {
        kind: "narration",
        text: "돈은 기부 처리됐고, 남은 건 괜한 경고와 찝찝함뿐이었다.",
      },
    ],
    next: "stage3_intro",
  },

  stage2_result_pocket: {
    beats: [
      { kind: "bg", name: "city_street" },
      {
        kind: "narration",
        text: "하필 그 장면을 지나가던 다른 민원인이 휴대폰으로 찍어 올렸다.",
      },
      {
        kind: "narration",
        text: "커뮤니티엔 '현장에서 뇌물 받는 공무원'이라는 제목이 붙었고, 사진은 순식간에 퍼졌다.",
      },
      {
        kind: "narration",
        text: "작은 봉투 하나가 당신 이름 전체를 끌어내렸다.",
      },
    ],
    next: "stage3_intro",
  },

  stage3_intro: {
    beats: [
      { kind: "bg", name: "restaurant_private" },
      { kind: "show", chars: [{ id: "friend", pos: "right" }] },
      {
        kind: "narration",
        text: "퇴근 무렵, 대학 동창에게서 오랜만에 얼굴이나 보자는 연락이 왔다.",
      },
      {
        kind: "dialogue",
        who: "friend",
        text: "야, 너 요즘 시청 일 때문에 바쁘다며? 오늘은 내가 한턱낼게.",
      },
      {
        kind: "narration",
        text: "자리에 도착해 보니 이미 룸 식당 코스가 예약돼 있었다.",
      },
      {
        kind: "narration",
        text: "식사가 시작되자 동창은 자신이 준비 중인 업체가 곧 시 관련 사업에도 참여해 보고 싶다고 말을 꺼냈다.",
      },
      {
        kind: "narration",
        text: "아직 직접적인 부탁은 없었지만, 이 자리가 단순한 안부 모임만은 아니라는 느낌이 들었다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "오랜만에 만난 친구니까, 우선은 편하게 대접받는다.",
            effects: { integrity: 0, risk: 3, trust: -1 },
            jump: "stage3_result_free",
          },
          {
            text: "식사는 함께하되, 비용은 각자 내고 업무 얘기엔 선을 긋는다.",
            effects: { integrity: 20, risk: -1, trust: 1 },
            jump: "stage3_result_dutch",
          },
          {
            text: "식사 자리는 줄이고, 업무 관련 이야기는 공식 절차로 하자고 말한다.",
            effects: { integrity: 10, risk: 1, trust: 0 },
            jump: "stage3_result_nexttime",
          },
        ],
      },
    ],
  },

  stage3_result_free: {
    beats: [
      { kind: "bg", name: "meeting_room" },
      {
        kind: "narration",
        text: "몇 달 뒤 그 동창이 준비하던 업체가 실제로 시 사업 관련 문의를 넣기 시작했다.",
      },
      {
        kind: "narration",
        text: "주변에서는 그날의 식사 자리 이야기가 함께 돌았고, 이해관계자와의 사적 접촉이 있었다는 말이 따라붙었다.",
      },
      {
        kind: "narration",
        text: "당장 부탁을 받은 것은 아니었지만, 선을 흐린 한 번의 만남이 결국 스스로를 설명해야 하는 상황으로 돌아왔다.",
      },
    ],
    next: "stage4_intro",
  },

  stage3_result_dutch: {
    beats: [
      { kind: "bg", name: "restaurant_exit" },
      {
        kind: "narration",
        text: "계산대 앞에서 당신은 분명하게 자신의 몫을 따로 결제했다.",
      },
      {
        kind: "narration",
        text: "동창은 잠시 머쓱해했지만, 당신이 업무와 사적 관계를 구분하려 한다는 뜻은 분명히 전달됐다.",
      },
      {
        kind: "narration",
        text: "이후 연락은 이어졌지만 사업 이야기나 편의 요청은 더 나오지 않았고, 관계와 직무 사이의 간격도 유지됐다.",
      },
    ],
    next: "stage4_intro",
  },

  stage3_result_nexttime: {
    beats: [
      { kind: "bg", name: "night_crosswalk" },
      {
        kind: "narration",
        text: "분위기는 잠시 어색해졌지만, 당신은 업무와 연결될 수 있는 자리는 길게 가지 않겠다고 선을 그었다.",
      },
      {
        kind: "narration",
        text: "대신 사업 관련 문의가 있으면 개인 연락이 아니라 공식 창구와 절차를 통해야 한다고 분명히 말했다.",
      },
      {
        kind: "narration",
        text: "관계는 조금 서먹해졌지만, 나중에 설명해야 할 상황 자체를 만들지 않는 쪽이 더 안전했다.",
      },
    ],
    next: "stage4_intro",
  },

  stage4_intro: {
    beats: [
      { kind: "bg", name: "lecture_hall" },
      {
        kind: "narration",
        text: "휴가 중, 외부 기관에서 실무 강의를 요청해 왔다. 사례도 정식으로 준다고 했다.",
      },
      {
        kind: "narration",
        text: "주제는 당신 업무 경험과 직접 연결돼 있었고, 기관 평판도 나쁘지 않았다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "규정에 따라 사전 신고하고 정해진 사례금만 받는다.",
            effects: { integrity: 20, risk: -1, trust: 1 },
            jump: "stage4_result_reported",
          },
          {
            text: "휴가인데 뭐 어때. 신고 없이 다녀온다.",
            effects: { integrity: 0, risk: 3, trust: -1 },
            jump: "stage4_result_unreported",
          },
          {
            text: "사례금 대신 비싼 선물을 받는다.",
            effects: { integrity: 0, risk: 4, trust: -2 },
            jump: "stage4_result_gift",
          },
        ],
      },
    ],
  },

  stage4_result_reported: {
    beats: [
      { kind: "bg", name: "office_day" },
      { kind: "show", chars: [{ id: "manager", pos: "right" }] },
      {
        kind: "narration",
        text: "사전 신고, 승인, 사례 기준 모두 맞춰서 처리했다.",
      },
      {
        kind: "dialogue",
        who: "manager",
        text: "이렇게 하면 문제 될 게 없어. 일도 인정받고 너도 안전하지.",
      },
      {
        kind: "narration",
        text: "강의는 경력으로 남았고, 보고 라인은 오히려 당신을 좋게 평가했다.",
      },
    ],
    next: "stage5_intro",
  },

  stage4_result_unreported: {
    beats: [
      { kind: "bg", name: "inspection_room" },
      {
        kind: "narration",
        text: "연말 외부 강의 전수 점검에서 미신고 내역이 적발됐다.",
      },
      {
        kind: "narration",
        text: "휴가였다는 해명은 규정을 지우지 못했다. 받은 사례금은 전액 환수됐다.",
      },
      {
        kind: "narration",
        text: "편의로 넘긴 하루가 기록으로 남았다.",
      },
    ],
    next: "stage5_intro",
  },

  stage4_result_gift: {
    beats: [
      { kind: "bg", name: "home_table" },
      {
        kind: "narration",
        text: "돈이 아니니까 괜찮다고 생각했던 선물 상자는 생각보다 훨씬 무거웠다.",
      },
      {
        kind: "narration",
        text: "규정상 금품 수수로 해석됐고, 과태료와 징계 검토가 동시에 따라붙었다.",
      },
      {
        kind: "narration",
        text: "포장은 고급스러웠지만, 결론은 초라했다.",
      },
    ],
    next: "stage5_intro",
  },

  stage5_intro: {
    beats: [
      { kind: "bg", name: "executive_office" },
      { kind: "show", chars: [{ id: "host", pos: "right" }] },
      {
        kind: "narration",
        text: "지역에서 영향력 있는 인사가 조용히 면담을 요청했다.",
      },
      {
        kind: "dialogue",
        who: "host",
        text: "우리 애가 이번 채용에 넣었는데, 공정하게만 봐주면 돼. 알지?",
      },
      {
        kind: "narration",
        text: "말은 공정하게였지만, 눈빛은 전혀 다른 부탁을 하고 있었다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "법대로 공정하게 진행하겠습니다. 거절하고 기록한다.",
            effects: { integrity: 20, risk: -1, trust: 2 },
            jump: "stage5_result_record",
          },
          {
            text: "면접 점수 조금만 보자고 부하 직원에게 넌지시 말한다.",
            effects: { integrity: 0, risk: 4, trust: -3 },
            jump: "stage5_result_pressure",
          },
          {
            text: "직접 개입은 안 하고, 면접 위원 명단만 흘린다.",
            effects: { integrity: 0, risk: 5, trust: -3 },
            jump: "stage5_result_leak",
          },
        ],
      },
    ],
  },

  stage5_result_record: {
    beats: [
      { kind: "bg", name: "records_room" },
      {
        kind: "narration",
        text: "당신은 면담 내용을 간단히 정리해 내부 기록으로 남겼다.",
      },
      {
        kind: "narration",
        text: "당장은 불편했지만, 나중에 채용 비리 수사가 시작됐을 때 그 기록이 당신을 완벽하게 보호했다.",
      },
      {
        kind: "narration",
        text: "원칙은 늘 번거롭지만, 결정적인 순간엔 가장 단단한 증거가 된다.",
      },
    ],
    next: "ending_branch",
  },

  stage5_result_pressure: {
    beats: [
      { kind: "bg", name: "team_room_night" },
      { kind: "show", chars: [{ id: "junior", pos: "left" }] },
      {
        kind: "narration",
        text: "후배는 대답하지 않았지만, 며칠 뒤 국민신문고에 상급자의 부당 지시 신고가 접수됐다.",
      },
      {
        kind: "dialogue",
        who: "junior",
        text: "선배님이 아니라 공무원으로 남고 싶었습니다.",
      },
      {
        kind: "narration",
        text: "잃은 건 사건 하나가 아니라, 같이 일하던 사람들의 신뢰였다.",
      },
    ],
    next: "ending_branch",
  },

  stage5_result_leak: {
    beats: [
      { kind: "bg", name: "dark_monitor" },
      {
        kind: "narration",
        text: "당신은 직접 개입하지 않았다고 생각했다. 로그는 다르게 말했다.",
      },
      {
        kind: "narration",
        text: "위원 명단 조회와 유출 경로가 당신 계정으로 정리돼 있었다.",
      },
      {
        kind: "narration",
        text: "손을 더럽히지 않으려던 선택이 오히려 가장 선명한 지문을 남겼다.",
      },
    ],
    next: "ending_branch",
  },

  ending_branch: {
    beats: [],
  },

  ending_clean: {
    beats: [
      { kind: "bg", name: "award_hall" },
      {
        kind: "narration",
        text: "한 해가 끝날 무렵, 당신 이름은 청렴 우수 공직자 표창 대상자 명단에 올랐다.",
      },
      {
        kind: "narration",
        text: "거창한 영웅담은 없었다. 다만 작은 장면마다 스스로를 지켜낸 기록이 남아 있었다.",
      },
      { kind: "ending", text: "시장 청렴왕 표창 엔딩" },
    ],
  },

  ending_normal: {
    beats: [
      { kind: "bg", name: "office_sunset" },
      {
        kind: "narration",
        text: "크게 무너지지도, 특별히 빛나지도 않은 채 한 해가 지나갔다.",
      },
      {
        kind: "narration",
        text: "몇 번은 아슬아슬했고, 몇 번은 운이 좋았다. 그래도 조직은 아직 당신을 받아들이고 있다.",
      },
      { kind: "ending", text: "무사안일 평범 엔딩" },
    ],
  },

  ending_fired: {
    beats: [
      { kind: "bg", name: "discipline_room" },
      {
        kind: "narration",
        text: "징계위원회 통보는 생각보다 짧았다. 파면, 환수, 그리고 남겨진 기록.",
      },
      {
        kind: "narration",
        text: "처음엔 사소해 보였던 선택들이 결국 같은 방향을 가리키고 있었다.",
      },
      { kind: "ending", text: "철컹철컹 파면 엔딩" },
    ],
  },
};
