# 인수인계의 전설

성남시청 청사관리 업무를 소재로 한 모바일 세로형 업무 인수인계 체험 게임입니다.

## 현재 구현

- 모바일 세로형 UI
- 업무PC 모니터형 메인 화면
- 업무폴더 / 문등대 / 단서함 / 팀장 보고
- 합동소방훈련 자료 탐색 및 단서 10개
- 전임자 메신저·전화 힌트
- 중간 보고 또는 단서 10/10 자동 호출
- 팀장 5문항 및 문항별 반응
- S/A/B/C 결과
- 경품 응모
- Supabase 기반 게임 세션 및 응모 저장
- 동일 휴대전화 번호 중복 응모 방지

## 데이터 저장 구조

브라우저에서 Supabase REST API를 직접 호출하지 않고 Vercel의 Next.js API를 경유합니다.

- `POST /api/game-session` : 게임 시작 세션 및 완료 결과 저장
- `POST /api/raffle` : 경품 응모 저장

게임 시작 시 세션 저장은 백그라운드로 처리하여 첫 화면 전환을 지연시키지 않습니다. 경품 응모는 실제 DB 저장 성공을 확인하는 동안 로딩 화면을 표시하고, 성공하면 별도 응모 완료 화면으로 전환합니다.

Supabase 테이블:

- `game_sessions`
- `raffle_entries`

`raffle_entries.phone_digits`에는 UNIQUE 제약이 있어 동일 휴대전화 번호는 한 번만 응모할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

## 배포

GitHub `main` 브랜치가 Vercel Production에 연결되어 있습니다.

운영 주소: `https://a-igame-sigma.vercel.app`

## 향후 제작

- 장면별 오리지널 애니메이션풍 배경 이미지 적용
- 모니터 및 내부 행정시스템 UI 고도화
- HWP 문서 재현도 향상
- 관리자용 응모현황 및 당첨자 추첨 화면
- 실제 행사 현장 모바일 테스트 및 QR 배포
