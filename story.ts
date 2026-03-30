export type CharId =
  | "player"
  | "manager"
  | "auditor"
  | "petitioner"
  | "friend"
  | "coworker1"
  | "coworker2"
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
  friend: { name: "대학동문", color: "#d8ffd8" },
  coworker1: { name: "동료1", color: "#ffecc8" },
  coworker2: { name: "동료2", color: "#f6ddff" },
  host: { name: "지역 영향력 있는 인사", color: "#f0d8ff" },
  junior: { name: "후배 직원", color: "#d8fff0" },
};

export const BG_URL = (name: string) => `/bg/${name}.jpg`;
export const CHAR_URL = (id: CharId) => `/chars/${id}.png`;

export const STORY: Record<string, Scene> = {
  start: {
    beats: [
      { kind: "bg", name: "office_evening" },
      {
        kind: "narration",
        text: "처음엔 다들 비슷해 보였다. 퇴근 직전 서류 더미, 울리는 전화, 눈치 빠른 민원인,\n그리고 이상할 정도로 자주 시험받는 양심.",
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
        kind: "narration",
        text: "조용한 사무실 안에서 유독 그 박스만 낯설게 보였다. 퇴근 직전이라는 점이 더 마음에 걸렸다.",
      },
      {
        kind: "narration",
        text: "메모 한 장, 전달 기록 한 줄도 없다. 그냥 지나치기에는 이상하리만큼 눈에 밟혔다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "과 사람들과 같이 나눠 먹는다.",
            effects: { integrity: 10, risk: 1, trust: -1 },
            jump: "stage1_result_share",
          },
          {
            text: "상하기 전에 내가 처리하자. 집에 가져간다.",
            effects: { integrity: 0, risk: 3, trust: -2 },
            jump: "stage1_result_take",
          },
          {
            text: "법대로 하자. 절차에 따라 신고 후 반납한다.",
            effects: { integrity: 20, risk: -1, trust: 1 },
            jump: "stage1_result_clean",
          },
        ],
      },
    ],
  },

  stage1_result_passive: {
    beats: [
      { kind: "bg", name: "office_evening" },
      {
        kind: "narration",
        text: "당신은 박스를 한참 바라보다가 결국 손대지 않았다. 신고도, 확인도, 정리도 모두 다음으로 미뤘다.",
      },
      {
        kind: "narration",
        text: "다음 날 박스는 누가 치웠는지 흔적도 없이 사라졌지만, 찜찜함만 자리에 남아 있었다.",
      },
      {
        kind: "narration",
        text: "아무 선택도 하지 않은 채 넘긴 첫 장면은 생각보다 오래 마음에 걸렸다.",
      },
    ],
    next: "stage2_intro",
  },

  stage1_result_clean: {
    beats: [
      { kind: "bg", name: "audit_office" },
      { kind: "show", chars: [{ id: "player", pos: "left" }, { id: "auditor", pos: "right" }] },
      {
        kind: "narration",
        text: "당신은 박스를 들고 한참을 서 있었다. 괜히 예민하게 구는 건 아닐까 하는 생각이 잠깐 스쳤다.",
      },
      {
        kind: "narration",
        text: "그래도 그대로 둘수록 더 곤란해질 것 같았다. 결국 내부 절차대로 신고하고 물품 인계 기록부터 남겼다.",
      },
      {
        kind: "dialogue",
        who: "player",
        text: "사소해 보여도 그냥 넘기면 안 될 것 같아서요. 기록으로 남겨 두는 게 맞겠죠?",
      },
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
        kind: "dialogue",
        who: "auditor",
        text: "받지 않은 것보다, 받지 않았다는 사실을 남기는 게 더 중요할 때가 많습니다.",
      },
      {
        kind: "narration",
        text: "서류에 서명을 마치고 나오자, 괜한 부담이 조금 가라앉았다. 적어도 이 일은 찜찜하게 남지 않겠다는 확신이 들었다.",
      },
      {
        kind: "show",
        chars: [{ id: "manager", pos: "right" }],
      },
      {
        kind: "narration",
        text: "과장도 아무 말 없이 당신 쪽을 한 번 봤다. 그 시선엔 묘한 신뢰가 담겨 있었다.",
      },
      {
        kind: "dialogue",
        who: "manager",
        text: "번거로워도 그렇게 가는 게 맞아. 이런 건 남들이 귀찮아할 때 먼저 바로잡는 사람이 필요하지.",
      },
    ],
    next: "stage2_intro",
  },

  stage1_result_share: {
    beats: [
      { kind: "bg", name: "office_night" },
      { kind: "show", chars: [{ id: "manager", pos: "right" }] },
      {
        kind: "narration",
        text: "박스를 회의 테이블 위에 올려두자, 하나둘 사람들이 몰려왔다.\n야근 끝의 허기 앞에서는 분위기는 금세 풀어졌다.",
      },
      {
        kind: "dialogue",
        who: "coworker1",
        text: "우린 이제 공범이다! 먹어서 해치우자!",
      },
      {
        kind: "dialogue",
        who: "coworker2",
        text: "와, 오늘 야근값은 과일이네. 진짜 별일 없는 거 맞죠?",
      },
      {
        kind: "dialogue",
        who: "manager",
        text: "라떼는 과일뿐이었겠어? 식당에서도 많이 먹었어. 이 정도는 괜찮아.",
      },
      {
        kind: "narration",
        text: "몇몇은 피식 웃었고, 누군가는 말없이 박스 뚜껑을 열었다. 망설임은 생각보다 짧았다.",
      },
      {
        kind: "narration",
        text: "부서장까지 웃어 넘기자, 박스는 금방 비어 갔다. 잠깐은 정말 별일 아닌 일처럼 느껴졌다.",
      },
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
        text: "그날 웃으며 과일을 집어 들던 손들이, 며칠 뒤엔 서로 눈치를 보는 시선으로 바뀌어 있었다.",
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
      { kind: "hideAll" },
      {
        kind: "narration",
        text: "당신은 박스를 조용히 차에 실었다. 상하기 전에 처리한다는 말로 스스로를 설득했지만,\n핸들을 잡는 손끝은 괜히 무거웠다.",
      },
      {
        kind: "narration",
        text: "집 식탁에 올려둔 과일은 생각보다 멀쩡했고, 그래서 더 찜찜했다.\n한 번 받아 버린 사실만 또렷하게 남았다.",
      },
      {
        kind: "narration",
        text: "며칠 뒤, 박스를 두고 간 것처럼 보이는 사람이 다시 찾아왔다.\n그는 웃으며 과일은 잘 드셨냐고 물었다.",
      },
      {
        kind: "dialogue",
        who: "player",
        text: "무슨 말씀인지 잘 모르겠습니다.",
      },
      {
        kind: "narration",
        text: "상대는 잠깐 웃음을 거두더니, 당신 반응을 떠보듯 한 걸음 더 가까이 다가왔다.",
      },
      {
        kind: "dialogue",
        who: "petitioner",
        text: "CCTV 정보공개청구 한번 하면 나올 텐데요. 아시면서.",
      },
      {
        kind: "dialogue",
        who: "petitioner",
        text: "서로 피곤하게 하지 말고, 이번 건만 좀 좋게 정리해 주시면 됩니다.",
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
      {
        kind: "narration",
        text: "민원 상담을 마치고 자리로 돌아오는데, 민원인이 놓고 간 박카스 상자가 눈에 띄었다.",
      },
      {
        kind: "dialogue",
        who: "player",
        text: "이건 또 뭐지? 아까 그분이 두고 가신 건가.",
      },
      {
        kind: "narration",
        text: "무심코 들어 올리자, 병 사이에 얇은 봉투 하나가 끼워져 있었다.",
      },
      {
        kind: "dialogue",
        who: "coworker1",
        text: "왜요? 뭐라도 들어 있었어요?",
      },
      {
        kind: "narration",
        text: "봉투는 생각보다 묵직했다. 박카스 상자보다 그 안쪽이 먼저 눈에 들어왔다.",
      },
      {
        kind: "dialogue",
        who: "player",
        text: "아니, 그냥... 내가 처리할게요.",
      },
      {
        kind: "narration",
        text: "주변을 둘러보니 아무도 못 본 듯 각자 민원 서류만 넘기고 있었다. 그래서 더 빨리 판단해야 할 것 같았다.",
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
            text: "개인이 쓰는 건 아니니까, 팀 공용 간식비로 돌려 놓는다.",
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

  stage2_result_passive: {
    beats: [
      { kind: "bg", name: "civil_counter" },
      {
        kind: "narration",
        text: "당신은 봉투를 다시 상자 안쪽에 밀어 넣고 모른 척 서랍부터 정리했다.",
      },
      {
        kind: "narration",
        text: "누가 다시 가져갔는지, 나중에 어떻게 처리됐는지 끝내 확인하지 않았다. 문제는 지나간 게 아니라 미뤄졌을 뿐이었다.",
      },
      {
        kind: "narration",
        text: "그날의 침묵은 안전한 판단이 아니라, 결정을 보류한 흔적처럼 남았다.",
      },
    ],
    next: "stage3_intro",
  },

  stage2_result_return: {
    beats: [
      { kind: "bg", name: "office_hallway" },
      {
        kind: "narration",
        text: "당신은 바로 상자를 들고 복도로 뛰어나갔다. 엘리베이터 앞에서 막 돌아보는 민원인을 가까스로 불러 세웠다.",
      },
      {
        kind: "dialogue",
        who: "player",
        text: "이건 받을 수 없습니다. 상자와 봉투 모두 다시 가져가 주세요.",
      },
      {
        kind: "dialogue",
        who: "petitioner",
        text: "아니, 그냥 음료 좀 드시라고 둔 건데 너무 그러시네.",
      },
      {
        kind: "narration",
        text: "민원인은 처음엔 민망한 표정을 지었지만, 끝내 박카스 상자를 받아 들었다.",
      },
      {
        kind: "narration",
        text: "봉투를 확인한 순간 그의 표정이 잠깐 굳었지만,\n당신이 한 발도 물러서지 않자 더는 말을 잇지 못했다.",
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
        text: "당신은 봉투 속 돈을 팀 공용 간식비 함에 슬쩍 넣었다. 누군가는 센스 있다며 웃었고, 누군가는 애써 못 본 척했다.",
      },
      {
        kind: "dialogue",
        who: "coworker2",
        text: "어차피 개인이 쓴 것도 아닌데요 뭐. 그냥 같이 쓰면 되는 거 아닌가요?",
      },
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
        text: "간식비 함 앞에 둘러섰던 사람들은 순식간에 흩어졌다. 남은 건 봉투보다 더 무거운 침묵이었다.",
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
        text: "당신은 복도 모퉁이에서 봉투를 지갑에 밀어 넣었다. '이번 한 번쯤이야'라는 생각이 생각보다 쉽게 손을 움직였다.",
      },
      {
        kind: "dialogue",
        who: "player",
        text: "커피값 정도야... 아무도 모를 거야.",
      },
      {
        kind: "narration",
        text: "이상하게 지켜보던 민원인 한 명이 그 상황을 영상으로 고스란히 담았다.",
      },
      {
        kind: "narration",
        text: "영상 속엔 박카스 상자도, 봉투도, 당신 손도 너무 선명하게 남아 있었다. 퍼지는 속도가 더 빨랐다.",
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
        text: "퇴근 무렵, 대학동문에게서 오랜만에 얼굴이나 보자는 연락이 왔다.",
      },
      {
        kind: "dialogue",
        who: "friend",
        text: "이야~ 시청 나으리님~ 이게 얼마만이야!\n요즘 많이 바쁘다며? 오늘은 내가 살게.",
      },
      {
        kind: "narration",
        text: "자리에 도착해 보니 이미 룸 식당 코스가 예약돼 있었다.",
      },
      {
        kind: "narration",
        text: "테이블엔 메뉴보다 술잔이 먼저 세팅돼 있었다. 단순한 안부 자리치고는 준비가 너무 정성스러웠다.",
      },
      {
        kind: "narration",
        text: "술이 좀 들어가고 취기가 오르자,\n대학동문은 자신이 준비 중인 업체가 시 관련 사업에도 참여하고 싶다고 말했다.",
      },
      {
        kind: "dialogue",
        who: "friend",
        text: "대놓고 부탁하겠다는 건 아니고, 그냥 방향만 좀 잘 잡고 싶어서 그래. 네가 감이 있잖아.",
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

  stage3_result_passive: {
    beats: [
      { kind: "bg", name: "restaurant_exit" },
      {
        kind: "narration",
        text: "당신은 웃으며 화제를 돌렸고, 계산도 부탁도 애매하게 흘려보냈다.",
      },
      {
        kind: "narration",
        text: "분명히 선을 긋지도, 편하게 받지도 못한 채 자리는 끝났다. 관계와 업무 사이의 경계만 더 흐려졌다.",
      },
      {
        kind: "narration",
        text: "결정을 미룬 자리에 남는 건 대개 편안함보다 더 긴 불편함이었다.",
      },
    ],
    next: "stage4_intro",
  },

  stage3_result_free: {
    beats: [
      { kind: "bg", name: "meeting_room" },
      {
        kind: "narration",
        text: "그날 식사는 끝까지 부드러웠다. 잔이 몇 번 오가고, 대학동문은 '역시 친구가 최고'라며 분위기를 한껏 띄웠다.",
      },
      {
        kind: "dialogue",
        who: "friend",
        text: "나중에 진짜 필요할 때 연락할게. 그땐 모른 척만 하지 마라.",
      },
      {
        kind: "narration",
        text: "몇 달 뒤 그 대학동문이 준비하던 업체가 실제로 시 사업 관련 문의를 넣기 시작했다.",
      },
      {
        kind: "narration",
        text: "주변에서는 그날의 식사 자리 이야기가 함께 돌았고,\n이해관계자와의 사적 접촉이 있었다는 말이 따라붙었다.",
      },
      {
        kind: "narration",
        text: "당장 부탁을 받은 것은 아니었지만,\n선을 흐린 한 번의 만남이 결국 스스로를 설명해야 하는 상황으로 돌아왔다.",
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
        kind: "dialogue",
        who: "friend",
        text: "야, 이 정도도 못 사주냐? 너무 선 긋는 거 아니냐.",
      },
      {
        kind: "narration",
        text: "대학동문은 잠시 머쓱해했지만, 당신이 업무와 사적 관계를 구분하려 한다는 뜻은 분명히 전달됐다.",
      },
      {
        kind: "narration",
        text: "돌아오는 길엔 이 만남이 기피신청까지 검토해야 할 사안일 수 있다는 생각이 떠올랐고,\n정식 창구로도 업무 이야기를 이어가자고 일말의 여지도 주지 않았다.",
      },
      {
        kind: "narration",
        text: "이후 연락은 이어졌지만 사업 이야기나 편의 요청은 더 나오지 않았고, 선도 유지됐다.",
      },
    ],
    next: "stage4_intro",
  },

  stage3_result_nexttime: {
    beats: [
      { kind: "bg", name: "night_crosswalk" },
      {
        kind: "dialogue",
        who: "player",
        text: "오늘은 여기까지만 하자. 업무 얘기는 공식 자리에서 듣는 게 맞아.",
      },
      {
        kind: "narration",
        text: "분위기는 잠시 어색해졌지만, 업무와 연결될 자리는 길게 가지 않겠다고 선을 그었다.",
      },
      {
        kind: "narration",
        text: "대학동문은 서운한 웃음을 지었지만 더는 화제를 밀어붙이지 못했다.",
      },
      {
        kind: "narration",
        text: "대신 사업 관련 문의는 정식 창구와 절차를 통해야 한다고만 말했다.",
      },
      {
        kind: "narration",
        text: "관계는 조금 서먹해졌지만, 기피신청까지 염두에 둔 대응으로 바로 이어지지는 못했다.",
      },
      {
        kind: "narration",
        text: "선을 그은 건 맞았지만, 절차까지 챙긴 2번 선택보다 한 박자 늦은 대응이었다.",
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
        text: "주제는 기술직 공무원인 당신의 전공 분야와 맞닿아 있었고, 기관 평판도 나쁘지 않았다.",
      },
      {
        kind: "narration",
        text: "오랜만에 전문성을 인정받는 기분이 들어 마음이 조금 들떴다.\n근무일이 아니니 신고하지 않아도 되며, 강제하는 규정은 없었던 것 같았다.",
      },
      {
        kind: "narration",
        text: "기관 담당자는 절차는 복잡하지 않다며 편하게 오시라고 말했다.\n그 한마디가 오히려 더 판단을 흐리게 만들었다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "기관 안내대로 절차를 먼저 확인하고, 기준에 맞춰 진행한다.",
            effects: { integrity: 20, risk: -1, trust: 1 },
            jump: "stage4_result_reported",
          },
          {
            text: "근무일이 아니니 개인 일정으로 보고, 다녀온다.",
            effects: { integrity: 0, risk: 3, trust: -1 },
            jump: "stage4_result_unreported",
          },
          {
            text: "휴가일이니 신고하지 않고 정해진 사례금만 받는다.",
            effects: { integrity: 0, risk: 4, trust: -2 },
            jump: "stage4_result_gift",
          },
        ],
      },
    ],
  },

  stage4_result_passive: {
    beats: [
      { kind: "bg", name: "office_day" },
      {
        kind: "narration",
        text: "당신은 강의 요청 메일을 열었다 닫았다만 반복했다. 답은 끝내 애매하게 남겨 두었다.",
      },
      {
        kind: "narration",
        text: "시간이 지나자 기관 쪽도 내부 일정도 꼬이기 시작했다. 명확한 답을 미룬 대가를 결국 여러 사람이 나눠 떠안았다.",
      },
      {
        kind: "narration",
        text: "무엇도 결정하지 않은 하루가, 가장 무책임한 답처럼 느껴졌다.",
      },
    ],
    next: "stage5_intro",
  },

  stage4_result_reported: {
    beats: [
      { kind: "bg", name: "office_day" },
      { kind: "show", chars: [{ id: "manager", pos: "right" }] },
      {
        kind: "narration",
        text: "당신은 강의 전에 겸직 여부와 사례 기준부터 하나씩 확인했다. 서류는 번거로웠지만 기준은 예상보다 명확했다.",
      },
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
        text: "기관 쪽도 오히려 안심한 듯 필요한 문서를 먼저 챙겨 줬다. 준비가 깔끔하니 강의 자체에도 더 집중할 수 있었다.",
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
        text: "당일엔 별일 없었다. 휴가 중 잠깐 다녀온 일이라며 스스로를 쉽게 설득할 수 있었다.",
      },
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
        text: "행사 담당자는 사례금 대신 감사의 뜻이라며 상자를 건넸다. 순간 망설였지만, 돈이 아니라는 이유로 손이 먼저 나갔다.",
      },
      {
        kind: "narration",
        text: "돈이 아니니까 괜찮다고 생각했던 선물 상자는 생각보다 훨씬 무거웠다.",
      },
      {
        kind: "narration",
        text: "포장을 풀수록 마음은 더 가벼워지지 않았다. 오히려 '이걸 왜 받았지'라는 질문만 선명해졌다.",
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
        kind: "narration",
        text: "접견실엔 차가 먼저 준비돼 있었고, 상대는 이미 편한 웃음을 띤 채 당신을 기다리고 있었다.",
      },
      {
        kind: "dialogue",
        who: "host",
        text: "우리 애가 이번 채용에 넣었는데, 공정하게만 봐주면 돼. 알지?",
      },
      {
        kind: "narration",
        text: "말끝은 부드러웠지만, 공정이라는 단어를 꺼내는 방식부터 이미 공정하지 않았다.",
      },
      {
        kind: "narration",
        text: "말은 공정하게였지만, 눈빛은 전혀 다른 부탁을 하고 있었다.",
      },
      {
        kind: "choice",
        options: [
          {
            text: "절차대로 진행된다고만 답하고, 면담 내용은 따로 기록해 둔다.",
            effects: { integrity: 20, risk: -1, trust: 2 },
            jump: "stage5_result_record",
          },
          {
            text: "담당자에게 이력만 좀 봐보라고 전한다.",
            effects: { integrity: 0, risk: 4, trust: -3 },
            jump: "stage5_result_pressure",
          },
          {
            text: "직접 개입은 안 하고, 참고하라며 면접위원 명단을 흘린다.",
            effects: { integrity: 0, risk: 5, trust: -3 },
            jump: "stage5_result_leak",
          },
        ],
      },
    ],
  },

  stage5_result_passive: {
    beats: [
      { kind: "bg", name: "team_room_night" },
      {
        kind: "narration",
        text: "당신은 면담 내용을 어디에도 남기지 않았다. 거절도, 보고도, 기록도 없이 시간이 지나가길 기다렸다.",
      },
      {
        kind: "narration",
        text: "하지만 청탁은 기록하지 않는다고 사라지지 않았다. 누군가 먼저 입을 열면, 그때부터는 당신 설명만 늦어진다.",
      },
      {
        kind: "narration",
        text: "마지막까지 결정을 미룬 끝에 남은 건, 스스로 선택하지 않았다는 사실뿐이었다.",
      },
    ],
    next: "ending_branch",
  },

  stage5_result_record: {
    beats: [
      { kind: "bg", name: "records_room" },
      {
        kind: "narration",
        text: "당신은 면담실을 나오자마자 기억이 흐려지기 전에 대화 내용을 정리했다. 표현 하나, 시간 하나까지 최대한 객관적으로 적어 내려갔다.",
      },
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
        text: "당신은 직접 지시라는 말은 피한 채, '한번 다시 보자'는 식으로 은근히 방향을 흘렸다. 하지만 후배는 그 말의 의미를 정확히 알아들었다.",
      },
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
        text: "당신은 직접 점수에 손대지 않는 대신, 누가 면접에 들어가는지만 슬쩍 흘려주면 된다고 생각했다. 그 정도는 흔적도 없을 거라 믿었다.",
      },
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

  ending_passive: {
    beats: [
      { kind: "bg", name: "office_sunset" },
      {
        kind: "narration",
        text: "결정해야 할 순간마다 당신은 한발 물러섰다. 틀린 선택은 피했을지 몰라도, 필요한 선택도 하지 못했다.",
      },
      {
        kind: "narration",
        text: "문제는 늘 누군가 대신 정리했고, 책임은 조용히 주변으로 흩어졌다. 그렇게 남은 평판은 무해함이 아니라 무기력이었다.",
      },
      {
        kind: "narration",
        text: "아무것도 깨뜨리지 않았지만, 아무것도 지켜내지도 못했다.",
      },
      { kind: "ending", text: "수동형 인간 히든 엔딩" },
    ],
  },
};
