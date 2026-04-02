# 공직 청렴 스토리 게임

선택형 스토리를 따라가며 청렴, 위험, 신뢰 점수를 누적하고 엔딩에서 결과를 제출하는 웹 이벤트 게임입니다.

## 링크

- Local: `http://localhost:3000`
- Deployed: `https://a-igame-sigma.vercel.app`

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 스택

- `Next.js`
- `React`
- `TypeScript`
- `Supabase`

## 주요 구조

- `story.ts`
  스토리 비트, 분기, 배경 전환, 엔딩 흐름 정의
- `lib/game.ts`
  진행 상태, 선택 처리, 점수 계산
- `app/page.tsx`
  게임 UI, 화면 전환, 결과 제출 처리
- `app/api/submit/route.ts`
  서버 측 결과 저장

## 현재 진행 상황

- `Stage 1` 과일 수수 케이스 배경/문구 흐름 정리 완료
- 배경 컷 전환 흐름 보강
  야근 사무실 -> 바구니 클로즈업 -> 열린 바구니 -> 익명 제보/소명서
- 시작 화면 제목을 `공직 청렴 스토리 게임`으로 정리
- Scene 배지는 특수 컷에서도 `사무실`로 자연스럽게 보이도록 처리
- 장면 이동 패널은 `localhost`, `127.0.0.1`에서만 보이도록 제한

## 현재 게임 플레이

- `Stage 1`부터 `Stage 5`까지 선택형 스토리 진행
- 분기 결과마다 법령 요약 카드와 점수 반영
- 일부 스테이지에는 제한 시간과 숨은 선택지 연출 적용
- 엔딩에서 최종 점수와 제출 결과 표시

## 점수

```text
finalScore = clamp(integrity - risk * 4 + trust * 3, 0, 100)
```

## 자산 관리

원본과 게임용 최종본을 분리해서 관리합니다.

- 원본 배경: `assets-source/bg`
- 게임용 최종 배경: `public/bg`
- 캐릭터: `public/chars`

배경 원본은 PNG 등 원본 그대로 보관하고, 게임에서는 최적화된 JPG만 사용합니다.

## 배경 최적화 파이프라인

원본 배경 이미지를 `assets-source/bg`에 넣은 뒤 아래 스크립트를 실행합니다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\optimize-bg.ps1
```

결과:

- 출력 폴더: `public/bg`
- 출력 형식: `1600x900` JPG

## 현재 반영된 Stage 1 배경 자산

- `office_day`
- `office_evening`
- `office_night`
- `office_night_basket`
- `fruit_basket_closeup`
- `fruit_basket_closeup_v2`
- `fruit_basket_opened`
- `anonymous_report_desk`

## Gemini 배경 작업 문서

- 프롬프트 팩: `docs/gemini-background-prompts.md`
- 제작 계획: `docs/image-production-plan.md`

## 제출 저장 필드

`game_submissions` 테이블에 아래 값이 저장됩니다.

- `participant_name`
- `affiliation`
- `submitted_at`
- `ending_label`
- `final_score`
- `integrity`
- `risk`
- `trust`

## Supabase 테이블

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

이미 테이블이 있다면 아래 SQL만 추가로 실행합니다.

```sql
alter table public.game_submissions
add column if not exists ending_label text;
```

## Supabase 보안

`game_submissions`는 서버만 쓰도록 설계되어 있습니다.

- Server route: `app/api/submit/route.ts`
- Required secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Security SQL: `docs/supabase-server-only-security.sql`
- Notes: `docs/supabase-server-only-security.md`

RLS 정책 SQL은 Supabase `SQL Editor`에서 적용합니다.
이 설정으로 `anon`, `authenticated`의 Data API 직접 쓰기를 막고, 서버의 service role만 저장 가능하게 합니다.
