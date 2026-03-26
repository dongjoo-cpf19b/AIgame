# Webtoon Asset Guide

이 프로젝트는 웹툰풍 배경과 인물 일러스트를 붙일 수 있도록 준비되어 있습니다.

## 파일 규칙

- 배경 이미지: `public/bg/<background-name>.jpg`
- 인물 이미지: `public/chars/<character-id>.png`

현재 배경 이름 목록:

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

현재 인물 ID 목록:

- `player`
- `manager`
- `auditor`
- `petitioner`
- `friend`
- `host`
- `junior`

## 공통 스타일 방향

- 한국 웹툰풍
- 공공기관 청렴 교육용이지만 너무 건조하지 않게
- 현실적인 사무공간과 도시 공간
- 선이 깔끔하고 표정이 잘 읽히는 스타일
- 과한 판타지, SF, 코믹 과장은 제외
- 폭력적이거나 자극적인 묘사는 제외

## 배경 공통 프롬프트 템플릿

```text
Korean webtoon style background, clean line art, subtle painterly shading, realistic public office atmosphere, readable composition, calm cinematic lighting, no text, no watermark, no logo, 16:9
```

## 배경 개별 프롬프트

### office_evening

```text
Korean webtoon style background, government office at evening, paperwork stacked on desks, fluorescent office lighting mixed with sunset blue light from windows, slightly tense mood, realistic civic office environment, no people, no text, 16:9
```

### office_storage

```text
Korean webtoon style background, small office storage area with files, cardboard boxes and supplies, dim practical lighting, realistic local public office back room, no people, no text, 16:9
```

### audit_office

```text
Korean webtoon style background, audit department office, neat desks, document trays, formal and strict atmosphere, realistic Korean public institution office, no people, no text, 16:9
```

### office_night

```text
Korean webtoon style background, office at late night, most lights off, a few desk lamps and monitor glow, lonely and tense mood, realistic Korean office interior, no people, no text, 16:9
```

### parking_lot

```text
Korean webtoon style background, outdoor parking lot at night near public office building, cold streetlights, quiet but uneasy atmosphere, realistic urban scene, no people, no text, 16:9
```

### civil_counter

```text
Korean webtoon style background, civil service counter inside municipal or medical public office, queue desk, guidance signs without readable text, daytime lighting, realistic Korean public service interior, no people, no text, 16:9
```

### office_hallway

```text
Korean webtoon style background, institutional office hallway, polished floor, doors and notice boards, clean but slightly tense atmosphere, no people, no text, 16:9
```

### team_room

```text
Korean webtoon style background, team office room in a public institution, shared desks, meeting table, practical office supplies, daytime, no people, no text, 16:9
```

### city_street

```text
Korean webtoon style background, ordinary Korean city street near office district, evening traffic glow, realistic buildings and sidewalks, no people, no text, 16:9
```

### restaurant_private

```text
Korean webtoon style background, private room in a Korean restaurant, warm lighting, business dinner mood, realistic and slightly tense atmosphere, no people, no text, 16:9
```

### meeting_room

```text
Korean webtoon style background, modern meeting room in a public institution, long table, projector or monitor, formal atmosphere, no people, no text, 16:9
```

### restaurant_exit

```text
Korean webtoon style background, restaurant exit area at night, warm indoor light meeting cooler outside light, after-dinner tension, no people, no text, 16:9
```

### night_crosswalk

```text
Korean webtoon style background, night crosswalk in Korean city, traffic lights and reflections on asphalt, reflective solitary mood, no people, no text, 16:9
```

### lecture_hall

```text
Korean webtoon style background, lecture hall or seminar room for public training, podium, screen, rows of seats, institutional atmosphere, no people, no text, 16:9
```

### office_day

```text
Korean webtoon style background, bright daytime office in a public institution, clean sunlight through windows, steady and professional atmosphere, no people, no text, 16:9
```

### inspection_room

```text
Korean webtoon style background, inspection or inquiry room, simple table and chairs, slightly cold lighting, serious atmosphere, no people, no text, 16:9
```

### home_table

```text
Korean webtoon style background, home dining table at night, ordinary apartment interior, subtle domestic lighting, quiet but uncomfortable mood, no people, no text, 16:9
```

### executive_office

```text
Korean webtoon style background, executive office with subtle prestige, heavy desk, framed interior, controlled and influential atmosphere, no people, no text, 16:9
```

### records_room

```text
Korean webtoon style background, records room with archive shelves and organized documents, secure administrative atmosphere, no people, no text, 16:9
```

### team_room_night

```text
Korean webtoon style background, team office room late at night, low lighting, remaining paperwork and monitor glow, exhausted atmosphere, no people, no text, 16:9
```

### dark_monitor

```text
Korean webtoon style background, dark office monitor glow in a dim room, cybersecurity or data leak tension, realistic administrative office setup, no people, no text, 16:9
```

### award_hall

```text
Korean webtoon style background, formal award hall or recognition ceremony venue, warm spotlight mood, dignified and hopeful atmosphere, no people, no text, 16:9
```

### office_sunset

```text
Korean webtoon style background, office interior during sunset, purple-orange sky through windows, reflective and bittersweet tone, no people, no text, 16:9
```

### discipline_room

```text
Korean webtoon style background, disciplinary hearing room, sparse formal setting, cold and severe mood, no people, no text, 16:9
```

## 인물 공통 프롬프트 템플릿

```text
Korean webtoon style character portrait, waist-up, clean line art, subtle shading, expressive face, transparent background, facing slightly toward viewer, consistent character design sheet quality
```

## 인물별 보정 키워드

- `player`: young public employee, neutral professional outfit, trustworthy expression
- `manager`: mid-career team manager, controlled and practical look
- `auditor`: strict but calm, precise expression
- `petitioner`: civilian visitor, slightly pushy or calculating expression
- `friend`: familiar and socially smooth, approachable expression
- `host`: influential local figure, polished appearance, quiet pressure
- `junior`: younger colleague, sincere and conflicted expression

## 권장 작업 순서

1. 배경 5장 우선 제작
   - `office_storage`
   - `civil_counter`
   - `restaurant_private`
   - `lecture_hall`
   - `executive_office`
2. 그 다음 엔딩용 배경 3장
3. 마지막으로 인물 7종 제작
