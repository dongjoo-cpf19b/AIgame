# Gameplay visual update

The intro remains the existing cover. The gameplay scene uses a cinematic office background, a Windows desktop, and readable HTML documents. Messenger and telephone hints use native modal dialogs and retain the current document/scroll position.

## Assets

- `public/art/office-cinematic-v2.png`: office illustration, built-in image_gen.
- `public/art/seongnam-cinematic-v2.png`: Seongnam City Hall exterior illustration, built-in image_gen, used at the completion scene.
- `public/art/windows-desktop.jpg`: copied from this machine's `C:/Windows/Web/Wallpaper/Windows/img0.jpg` at the user's request. Microsoft Windows supplied wallpaper; not an original game illustration.
- Existing `public/art/handover-cover.jpg`: retained for the intro and the player's dialogue portrait.

The new backgrounds are delivered through Next.js image optimization. Originals remain unchanged.

Architectural reference: [Seongnam City Hall exterior in a news report](https://gg.newdaily.co.kr/site/data/html/2024/05/13/2024051300094.html). The generated exterior preserves the horizontal glazed building and sloping central frontage; interior art is illustrative, not an exact interior survey.

## Report reference

User-provided `[기안] 2023년 하반기 중원구청 합동소방훈련·교육 계획.pdf` (7 pages) was read locally. Its approval/registration layout, teal body title panel, serif paragraphs, numbered section headings and schedule tables informed the HTML report. Source files, signatures, names and personnel rosters were not copied into the repository.

The displayed content is reconstructed for the game's Seongnam City Hall scenario: approved plan `회계과-18421`, 2025-09-22; drill 2025-10-22 14:00–15:30; result `회계과-21347`, 2025-10-27; partner 야탑119안전센터. Added schedule breakdown and assignment descriptions are fictional gameplay material, not historical records. Existing clues and answer keys are retained. The evacuation diagram is a labeled training concept, not an actual floor-specific evacuation map.

## Final image prompts (built-in image_gen)

### Office

Use case: stylized-concept. Asset type: production background illustration for a portrait mobile Korean office visual novel game, no UI. Create a stunning cinematic anime background in Makoto Shinkai style to match a cover with luminous blue skies and emotional warm sunlight. Scene: inside a modern Seongnam Korean city hall office, viewed from the new civil servant's seated position at their desk. Huge windows across the upper and left parts reveal deep clear cerulean skies, billowing sunlit cumulus clouds, green distant hills and modern Korean city buildings. Rich amber afternoon sunlight, delicate lens bloom, glistening glass reflections, intricately painted office details, blue shadows and floating dust. Composition: tall portrait 9:16, upper 38 percent dominated by beautiful windows, sky and sunbeams. Lower center is a tidy warm wood desk surface with keyboard, office files at the far right, small plant at left. Keep center lower 60 percent calm and low contrast, open for an HTML game panel; DO NOT draw a monitor, screen, interface or fake buttons. No characters, no readable lettering, no logos, no official emblems, no mugs. Beautiful premium hand-painted anime movie background, believable consistent architecture, clean professional office with poetic light. Single full-bleed scene, no collage, no borders.

### Seongnam exterior

Use case: stylized-concept. Create a premium anime visual novel background of the REAL Seongnam City Hall in South Korea, using the supplied photo solely as an architectural reference. Faithfully preserve its long horizontal stepped glass office block, distinctive sloping blue glass central facade/canopy, plaza and pine trees; do not replace with a generic tower. Makoto Shinkai style: brilliant cerulean sky, towering radiant white clouds, breathtaking warm sunlight from left, subtle flare, richly detailed glass reflections, lush trees, poetic cinematic atmosphere. Tall 9:16 composition with the recognizable city hall in upper-middle, sky in upper third, spacious calm foreground plaza for game overlay. No UI, no people in foreground, no logos, no watermarks, no readable text; leave stone marker blank because the location label is rendered in HTML. Original painterly rendering rather than photographic filter. This is a game wallpaper/environment establishing image, NOT a poster.

## Interaction verification

- 360×640 and 390×844 browser viewports; no horizontal overflow observed.
- 10 clues collected via document, folder and evacuation screens; automatic call triggered.
- Mixed report answers: four correct, one incorrect; grade A; both reaction styles verified.
- Messenger opened twice: two conversation entries, two hints in result.
- Telephone declined once, answered once: connected timer advanced, one hint in result.
- Modal close restored the document and its scroll position.
- Registry quick searches return 5 results for 합동소방, 7 for 훈련, and 8 for 소방. All 10 registered documents opened.
- All 18 previous-version/supporting files opened; no unrelated file awarded a clue.
- Test game-session requests were mocked in the browser; no real raffle entry submitted.

Real handset testing and production deployment remain separate.
