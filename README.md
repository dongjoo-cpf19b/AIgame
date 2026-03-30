# AIgame

선택을 따라가며 청렴도와 위험도를 확인하는 웹게임입니다.
엔딩에서 이름과 소속을 제출하면 결과가 저장됩니다.

## Links

- Local: `http://localhost:3000`
- Deployed: `https://a-igame-sigma.vercel.app`

## Run

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

## Stack

- `Next.js`
- `React`
- `TypeScript`
- `Supabase`

## Current Flow

- `story.ts` 에서 스토리와 선택지 분기 관리
- `lib/game.ts` 에서 진행 상태와 점수 계산 관리
- `app/page.tsx` 에서 게임 UI와 제출 폼 처리
- `app/api/submit/route.ts` 에서 서버 검증 후 결과 저장

## Current Gameplay

- `Stage 1` 부터 `Stage 5` 까지 선택형 스토리 진행
- 분기 결과마다 법령 요약 카드와 점수 반영
- 일부 스테이지에는 제한시간과 히든 선택지 연출 적용
- 엔딩에서 최종 점수와 제출 폼 표시

## Recent UI / Story Work

- 스토리 본문과 대사를 장면 단위로 확장해 전개 속도 보강
- 한국어 장소명 표시와 상단 진행 정보 정리
- 대화창 이름표를 패널 상단에 걸치도록 조정
- 결과 카드 본문 줄바꿈과 가독성 개선
- 로컬 확인용 장면 이동 패널 추가
- 캐릭터 스프라이트와 배경 이미지 연결 구조 반영

## Saved Fields

`game_submissions` 테이블에는 아래 값이 저장됩니다.

- `participant_name`
- `affiliation`
- `submitted_at`
- `ending_label`
- `final_score`
- `integrity`
- `risk`
- `trust`

## Supabase Table

```sql
create table public.game_submissions (
  id text primary key,
  participant_name text not null,
  affiliation text not null,
  submitted_at timestamptz not null,
  ending_label text,
  final_score integer not null,
  integrity integer not null,
  risk integer not null,
  trust integer not null
);
```

이미 테이블이 있다면 아래 SQL만 추가로 실행하면 됩니다.

```sql
alter table public.game_submissions
add column if not exists ending_label text;
```

## Supabase Security

`game_submissions` is intended to be written by the server only.

- Server route: `app/api/submit/route.ts`
- Required secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Security SQL: `docs/supabase-server-only-security.sql`
- Notes: `docs/supabase-server-only-security.md`

Apply the RLS policy SQL in the Supabase `SQL Editor` after creating the table.
This blocks `anon` and `authenticated` Data API access while still allowing the server to write with the service role key.

## Score

```text
finalScore = clamp(integrity - risk * 4 + trust * 3, 0, 100)
```

## Image Pipeline

원본 배경 이미지는 `assets-source/bg` 에 넣고 아래 스크립트를 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\optimize-bg.ps1
```

최종 배경은 `1600x900` JPG로 `public/bg` 에 생성됩니다.

캐릭터 이미지는 `public/chars` 에 `player.png`, `manager.png` 처럼 바로 넣어 사용합니다.
