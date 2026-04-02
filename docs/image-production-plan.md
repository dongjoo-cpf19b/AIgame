# Image Production Plan

이 문서는 AIgame의 이미지 작업을 먼저 진행하기 위한 기준 문서다.
세부 연출과 미세 조정은 나중에 하고, 우선 게임이 돌아가도록 핵심 배경과 캐릭터를 빠르게 확보하는 데 목적이 있다.

## 목표

- 먼저 비주얼 공백을 없앤다.
- 파일명과 저장 위치를 고정한다.
- 한 번에 많이 만들기보다 우선순위 높은 자산부터 채운다.
- 이후 디테일 수정이 들어오더라도 경로와 구조는 유지한다.

## 저장 규칙

- 배경 원본: `assets-source/bg/<background-name>.<ext>`
- 배경 최종본: `public/bg/<background-name>.jpg`
- 캐릭터 최종본: `public/chars/<character-id>.png`

배경은 원본을 `assets-source/bg`에 넣고 아래 스크립트로 최종본을 만든다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\optimize-bg.ps1
```

최종 배경 규격:

- `1600x900`
- `jpg`
- 중앙 크롭 허용

캐릭터 규격:

- 투명 배경
- 허리 위 중심
- PNG

## 현재 자산 범위

배경 ID:

- `office_evening`
- `office_storage`
- `audit_office`
- `office_night`
- `parking_lot`
- `civil_counter`
- `office_hallway`
- `team_room`
- `city_street`
- `restaurant_private`
- `meeting_room`
- `restaurant_exit`
- `night_crosswalk`
- `lecture_hall`
- `office_day`
- `inspection_room`
- `home_table`
- `executive_office`
- `records_room`
- `team_room_night`
- `dark_monitor`
- `award_hall`
- `office_sunset`
- `discipline_room`

캐릭터 ID:

- `player`
- `manager`
- `auditor`
- `petitioner`
- `friend`
- `host`
- `junior`

## 제작 순서

1차는 게임 인상이 바로 살아나는 핵심 배경부터 만든다.

1. `office_storage`
2. `civil_counter`
3. `restaurant_private`
4. `lecture_hall`
5. `executive_office`

2차는 전환용과 엔딩용 배경을 채운다.

1. `audit_office`
2. `parking_lot`
3. `meeting_room`
4. `inspection_room`
5. `records_room`
6. `award_hall`
7. `discipline_room`

3차는 같은 공간의 변주 컷을 채운다.

1. `office_evening`
2. `office_night`
3. `office_day`
4. `office_sunset`
5. `team_room`
6. `team_room_night`
7. `restaurant_exit`
8. `night_crosswalk`
9. `city_street`
10. `home_table`
11. `dark_monitor`
12. `office_hallway`

캐릭터는 배경 1차 완료 뒤 바로 들어간다.

## 공통 배경 프롬프트

```text
Use case: illustration-story
Asset type: visual novel background
Primary request: Korean public-integrity training visual novel background
Scene/backdrop: realistic Korean public office or city environment
Style/medium: Korean webtoon style background illustration, clean line art, subtle painterly shading
Composition/framing: wide 16:9 composition, readable mid-depth layout, enough empty space for dialogue UI
Lighting/mood: calm cinematic lighting, grounded realism
Constraints: no people, no readable text, no watermark, no logo
Avoid: sci-fi elements, fantasy props, exaggerated comic distortion, cluttered focal center
```

## 1차 배경 개별 프롬프트

### `office_storage`

```text
Use case: illustration-story
Asset type: visual novel background
Primary request: small storage area inside a Korean public office
Scene/backdrop: file boxes, stacked documents, office supplies, narrow back-room layout
Style/medium: Korean webtoon style background illustration, clean line art, subtle painterly shading
Composition/framing: wide 16:9, eye-level view, readable center space for UI
Lighting/mood: dim practical fluorescent lighting, quiet and slightly tense
Constraints: no people, no readable text, no watermark, no logo
Avoid: luxury styling, fantasy props, messy fisheye perspective
```

### `civil_counter`

```text
Use case: illustration-story
Asset type: visual novel background
Primary request: civil service counter in a Korean municipal office
Scene/backdrop: service desks, waiting area, guidance fixtures without readable text, realistic public-service interior
Style/medium: Korean webtoon style background illustration, clean line art, subtle painterly shading
Composition/framing: wide 16:9, front-facing interior shot, clean sightlines for UI
Lighting/mood: bright daytime institutional lighting
Constraints: no people, no readable text, no watermark, no logo
Avoid: hospital drama look, futuristic kiosk styling, cluttered signage
```

### `restaurant_private`

```text
Use case: illustration-story
Asset type: visual novel background
Primary request: private room in a Korean restaurant used for a tense business dinner
Scene/backdrop: warm wood interior, table setting for conversation, discreet upscale atmosphere
Style/medium: Korean webtoon style background illustration, clean line art, subtle painterly shading
Composition/framing: wide 16:9, seated-eye-level composition, strong depth but uncluttered center
Lighting/mood: warm indoor light with slight tension
Constraints: no people, no readable text, no watermark, no logo
Avoid: luxury hotel banquet hall, flashy neon, comedy tone
```

### `lecture_hall`

```text
Use case: illustration-story
Asset type: visual novel background
Primary request: lecture hall for public-sector training
Scene/backdrop: podium, projector screen, rows of seats, formal seminar-room atmosphere
Style/medium: Korean webtoon style background illustration, clean line art, subtle painterly shading
Composition/framing: wide 16:9, slightly angled from audience area, clear stage view
Lighting/mood: neutral training-room lighting, official and composed
Constraints: no people, no readable text, no watermark, no logo
Avoid: university festival mood, concert stage lighting, oversized banners
```

### `executive_office`

```text
Use case: illustration-story
Asset type: visual novel background
Primary request: executive office used for quiet pressure and closed-door conversation
Scene/backdrop: heavy desk, framed interior, controlled prestige, influential local power atmosphere
Style/medium: Korean webtoon style background illustration, clean line art, subtle painterly shading
Composition/framing: wide 16:9, eye-level office composition, balanced foreground and background
Lighting/mood: subdued formal lighting, restrained tension
Constraints: no people, no readable text, no watermark, no logo
Avoid: palace-like decor, obvious villain styling, extreme dramatic shadows
```

## 캐릭터 공통 프롬프트

```text
Use case: illustration-story
Asset type: visual novel character sprite
Primary request: Korean webtoon style character portrait for a public-integrity training visual novel
Subject: waist-up character, transparent background
Style/medium: Korean webtoon character illustration, clean line art, subtle shading, production-ready sprite
Composition/framing: centered waist-up, facing slightly toward viewer
Lighting/mood: neutral readable lighting
Constraints: transparent background, no text, no watermark
Avoid: chibi proportions, fantasy costume, exaggerated gag expression
```

캐릭터 방향:

- `player`: young public employee, neat and trustworthy, neutral professional outfit
- `manager`: mid-career team manager, practical and controlled
- `auditor`: strict, calm, precise
- `petitioner`: civilian visitor, slightly pushy
- `friend`: socially smooth, approachable
- `host`: polished and influential, quiet pressure
- `junior`: sincere and conflicted

## 작업 원칙

- 같은 공간 변주 컷은 먼저 기준 컷 하나를 고정한 뒤 만든다.
- 배경은 UI가 올라갈 중앙 하단이 너무 복잡하지 않게 유지한다.
- 캐릭터는 얼굴보다 상반신 실루엣과 표정 가독성을 우선한다.
- 세부 소품보다 분위기 일관성을 먼저 맞춘다.

## 바로 다음 작업

이미지 작업을 시작할 때는 아래 순서로 진행한다.

1. `office_storage` 생성
2. `civil_counter` 생성
3. `restaurant_private` 생성
4. `lecture_hall` 생성
5. `executive_office` 생성
6. 선별본을 `assets-source/bg`에 반입
7. `scripts/optimize-bg.ps1`로 `public/bg` 생성
