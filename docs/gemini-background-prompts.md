# Gemini Background Prompts

This file is the clean prompt pack for generating AIgame background images with Gemini.

## Workflow

1. Generate one background at a time.
2. Save the selected original image into `assets-source/bg/<background-name>.<ext>`.
3. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\optimize-bg.ps1
```

4. Confirm the final file exists at `public/bg/<background-name>.jpg`.

## Shared Direction

Use these constraints for every background:

- Korean webtoon style background illustration
- clean line art
- subtle painterly shading
- grounded realism
- suitable for a visual novel
- 16:9 wide composition
- enough clean space for dialogue UI
- no people
- no readable text
- no logo
- no watermark

Negative direction for every background:

- no fantasy
- no sci-fi
- no exaggerated comic distortion
- no extreme fisheye perspective
- no cluttered center focal area

## Recommended Order

Start with these 5:

1. `office_storage`
2. `civil_counter`
3. `restaurant_private`
4. `lecture_hall`
5. `executive_office`

Then continue with the remaining set.

## Master Style Prompt

Use this style prefix when needed:

```text
Korean webtoon style background illustration, clean line art, subtle painterly shading, grounded realistic atmosphere, visual novel background, 16:9 wide composition, readable layout with clean lower-center space for dialogue UI, no people, no readable text, no logo, no watermark
```

## Priority Batch

### office_storage

```text
Korean webtoon style background illustration, small storage area inside a Korean public office, file boxes, stacked documents, office supplies, narrow back-room layout, dim practical fluorescent lighting, quiet and slightly tense mood, grounded realism, visual novel background, 16:9 wide composition, readable layout with clean lower-center space for dialogue UI, no people, no readable text, no logo, no watermark
```

### civil_counter

```text
Korean webtoon style background illustration, civil service counter inside a Korean municipal office, service desks, waiting area, guidance fixtures without readable text, realistic public-service interior, bright daytime institutional lighting, grounded realism, visual novel background, 16:9 wide composition, clean sightlines and clean lower-center space for dialogue UI, no people, no readable text, no logo, no watermark
```

### restaurant_private

```text
Korean webtoon style background illustration, private room in a Korean restaurant used for a tense business dinner, warm wood interior, table setting for conversation, discreet upscale atmosphere, warm indoor lighting with slight tension, grounded realism, visual novel background, 16:9 wide composition, uncluttered center area for dialogue UI, no people, no readable text, no logo, no watermark
```

### lecture_hall

```text
Korean webtoon style background illustration, lecture hall for Korean public-sector training, podium, projector screen, rows of seats, formal seminar-room atmosphere, neutral institutional lighting, grounded realism, visual novel background, 16:9 wide composition, clear stage view and clean lower-center space for dialogue UI, no people, no readable text, no logo, no watermark
```

### executive_office

```text
Korean webtoon style background illustration, executive office used for quiet pressure and closed-door conversation, heavy desk, framed interior, restrained prestige, influential local power atmosphere, subdued formal lighting, grounded realism, visual novel background, 16:9 wide composition, balanced foreground and background with clean UI space, no people, no readable text, no logo, no watermark
```

## Full Background Set

### office_evening

```text
Korean webtoon style background illustration, government office at evening, paperwork stacked on desks, fluorescent office lighting mixed with cool sunset blue light from windows, slightly tense mood, grounded realistic civic office interior, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### office_storage

```text
Korean webtoon style background illustration, small storage area inside a Korean public office, file boxes, stacked documents, office supplies, narrow back-room layout, dim practical fluorescent lighting, quiet and slightly tense mood, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### audit_office

```text
Korean webtoon style background illustration, audit department office in a Korean public institution, neat desks, document trays, formal and strict atmosphere, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### office_night

```text
Korean webtoon style background illustration, office late at night, most lights off, a few desk lamps and monitor glow, lonely and tense mood, realistic Korean office interior, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### parking_lot

```text
Korean webtoon style background illustration, outdoor parking lot at night near a public office building, cold streetlights, quiet but uneasy atmosphere, realistic urban scene, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### civil_counter

```text
Korean webtoon style background illustration, civil service counter inside a Korean municipal office, service desks, waiting area, guidance fixtures without readable text, realistic public-service interior, bright daytime institutional lighting, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### office_hallway

```text
Korean webtoon style background illustration, institutional office hallway, polished floor, doors and notice boards without readable text, clean but slightly tense atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### team_room

```text
Korean webtoon style background illustration, team office room in a public institution, shared desks, meeting table, practical office supplies, daytime administrative atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### city_street

```text
Korean webtoon style background illustration, ordinary Korean city street near an office district, evening traffic glow, realistic buildings and sidewalks, grounded urban atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### restaurant_private

```text
Korean webtoon style background illustration, private room in a Korean restaurant used for a tense business dinner, warm wood interior, table setting for conversation, discreet upscale atmosphere, warm indoor lighting with slight tension, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### meeting_room

```text
Korean webtoon style background illustration, modern meeting room in a Korean public institution, long table, projector or monitor, formal administrative atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### restaurant_exit

```text
Korean webtoon style background illustration, restaurant exit area at night, warm indoor light meeting cooler outside light, after-dinner tension, grounded realistic atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### night_crosswalk

```text
Korean webtoon style background illustration, night crosswalk in a Korean city, traffic lights and reflections on asphalt, reflective solitary mood, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### lecture_hall

```text
Korean webtoon style background illustration, lecture hall for Korean public-sector training, podium, projector screen, rows of seats, formal seminar-room atmosphere, neutral institutional lighting, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### office_day

```text
Korean webtoon style background illustration, bright daytime office in a public institution, clean sunlight through windows, steady and professional atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### inspection_room

```text
Korean webtoon style background illustration, inspection or inquiry room, simple table and chairs, slightly cold lighting, serious atmosphere, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### home_table

```text
Korean webtoon style background illustration, home dining table at night in an ordinary apartment interior, subtle domestic lighting, quiet but uncomfortable mood, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### executive_office

```text
Korean webtoon style background illustration, executive office used for quiet pressure and closed-door conversation, heavy desk, framed interior, restrained prestige, influential local power atmosphere, subdued formal lighting, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### records_room

```text
Korean webtoon style background illustration, records room with archive shelves and organized documents, secure administrative atmosphere, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### team_room_night

```text
Korean webtoon style background illustration, team office room late at night, low lighting, remaining paperwork and monitor glow, exhausted atmosphere, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### dark_monitor

```text
Korean webtoon style background illustration, dark office monitor glow in a dim room, cybersecurity or data leak tension, realistic administrative office setup, cold and uneasy mood, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### award_hall

```text
Korean webtoon style background illustration, formal award hall or recognition ceremony venue, warm spotlight mood, dignified and hopeful atmosphere, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### office_sunset

```text
Korean webtoon style background illustration, office interior during sunset, purple-orange sky through windows, reflective and bittersweet tone, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

### discipline_room

```text
Korean webtoon style background illustration, disciplinary hearing room, sparse formal setting, cold and severe mood, grounded realism, visual novel background, 16:9, no people, no readable text, no logo, no watermark
```

## Consistency Tips For Gemini

- Keep the style wording identical across generations.
- After one strong image is selected, upload it as a reference when generating nearby variants such as:
  - `office_evening`, `office_night`, `office_day`, `office_sunset`
  - `team_room`, `team_room_night`
  - `restaurant_private`, `restaurant_exit`
- If Gemini adds signage text, regenerate with stronger wording:

```text
remove all readable text, remove signage lettering, use abstract or blurred signage only
```

- If Gemini makes the image too realistic or photo-like, add:

```text
illustrated Korean webtoon background, not a photograph
```
