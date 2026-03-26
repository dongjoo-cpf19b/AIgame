# integrity-novel

텍스트 기반 공직 청렴 웹게임입니다. 플레이가 끝나면 이름과 소속을 입력해 결과를 제출할 수 있고, 서버에서 선택 기록을 다시 계산해 점수를 검증합니다.

## 현재 구성

- `story.ts` 기반 장면/선택지/엔딩 분기
- `lib/game.ts` 에서 클라이언트와 서버가 같은 규칙으로 진행/점수 계산
- `app/api/submit/route.ts` 에서 결과 검증, 저장, 관리자 메일 발송
- 이미지 없이도 실행 가능
- 배경은 CSS 그라디언트, 인물은 이름 카드로 대체 렌더링

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

## 프로토타입 링크

- 공개 테스트 주소: `https://a-igame-sigma.vercel.app`

## 환경변수

`.env.example` 을 참고해 `.env.local` 을 만듭니다.

- `ADMIN_EMAILS`: 결과 메일을 받을 관리자 이메일. 여러 개면 쉼표로 구분
- `MAIL_FROM`: Resend에서 승인된 발신자 주소
- `RESEND_API_KEY`: 관리자 메일 발송용 Resend API 키
- `SUPABASE_URL`: 결과 저장용 Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용 Supabase 키
- `SUPABASE_SUBMISSIONS_TABLE`: 저장 테이블명, 기본값은 `game_submissions`

운영 배포에서는 `Resend` 또는 `Supabase` 중 하나만 있어도 제출은 가능하지만, 추첨/집계를 위해 둘 다 연결하는 구성을 권장합니다.

## Supabase 테이블 예시

```sql
create table public.game_submissions (
  id text primary key,
  participant_name text not null,
  affiliation text not null,
  consented boolean not null default true,
  submitted_at timestamptz not null,
  ending_scene text not null,
  ending_text text not null,
  ending_label text not null,
  final_score integer not null,
  integrity integer not null,
  risk integer not null,
  trust integer not null,
  choice_history jsonb not null
);
```

## 점수 계산

서버 검증 기준 종합 점수는 다음 식을 사용합니다.

```text
finalScore = clamp(integrity - risk * 4 + trust * 3, 0, 100)
```

클라이언트에 보이는 값도 같은 로직으로 표시되지만, 최종 제출 시에는 서버가 `choice_history` 를 다시 재생해서 점수를 재계산합니다.

## 주요 파일

- `story.ts`: 스토리 데이터
- `lib/game.ts`: 공용 게임 로직과 점수 계산
- `app/page.tsx`: 웹게임 UI와 결과 제출 폼
- `app/api/submit/route.ts`: 결과 검증, 저장, 메일 발송
- `app/globals.css`: 화면 스타일
