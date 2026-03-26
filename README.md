# integrity-novel

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

## Saved Fields

`game_submissions` 테이블에는 아래 값이 저장됩니다.

- `participant_name`
- `affiliation`
- `submitted_at`
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
  final_score integer not null,
  integrity integer not null,
  risk integer not null,
  trust integer not null
);
```

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
