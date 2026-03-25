# integrity-novel

텍스트 기반 공직 청렴 비주얼노벨 프로토타입입니다.

## 현재 상태

- `story.ts` 기반 장면/선택지/엔딩 분기 구현
- 이미지 없이도 실행 가능
- 배경은 CSS 그라디언트, 인물은 이름 카드로 대체 렌더링

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 으로 접속합니다.

## 주요 파일

- `story.ts`: 스토리 데이터
- `app/page.tsx`: 런타임/선택지 처리
- `app/globals.css`: 화면 스타일
