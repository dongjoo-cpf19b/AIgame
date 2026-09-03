# Codex handoff — 인수인계의 전설

## Current state
- Production app: Next.js mobile-first game deployed through Vercel.
- Repository: `dongjoo-cpf19b/AIgame`, branch `main`.
- Supabase project is connected and currently has `public.game_sessions` and `public.raffle_entries` with RLS enabled.
- Raffle writes go through `/api/raffle`; game session writes go through `/api/game-session`.
- Mobile target width: roughly 360–430 px, portrait-first, one main action per screen.

## Core game flow
1. Intro: predecessor is gone; no handover document exists.
2. Team leader asks the player to reconstruct the previous year's joint fire drill.
3. Player investigates `업무폴더`, `문등대`, `단서함`, and may `보고하러 가기` at any time.
4. 10 clues can be collected, but reporting early is allowed with no score penalty.
5. At 10/10 clues, the team leader automatically calls the player.
6. Five report questions determine S/A/B/C grade.
7. Ending call from 야탑119안전센터.
8. Finishers can enter a raffle with name, affiliation, full phone number, and consent. Phone number must be unique.

## Important gameplay / tone decisions
- Main joke: shared-folder files have absurd `최종 / 최최종 / 진짜최종 / 과장님수정` naming.
- The true approved plan is found in `문등대`, not by trusting the shared folder filename.
- Wrong or irrelevant clicks should trigger the 담당자's short internal monologue, e.g. `합동소방훈련과 직접적인 관련은 없어 보여…`, not generic system errors.
- Messenger and phone hints are framed as actual exchanges with the predecessor.
- Team leader reactions differ by question and by correct/wrong answer; do not use one repeated generic response.
- Keep play time around 4–5 minutes.

## Visual direction
- Desired direction: cinematic anime city/office backgrounds with very clear blue skies, luminous clouds, strong sunlight, glass reflections, warm sunset transitions, and a polished visual-novel feel.
- Do not bake interactive text/buttons into background images. Background art is image-only; menus, document titles, clue counts, dialogue, and official marks should be HTML/CSS or separate image layers.
- Home screen monitor should be large and act as the main stage, not a tiny prop.
- Home monitor contains real clickable UI for:
  - 업무폴더
  - 문등대
  - 단서함
  - 보고하러 가기
- Keep monitor bezels thin so the screen area stays large on phones.
- Document / registry / floor-plan screens prioritize readability over decorative framing.
- Office structure should stay consistent across daytime and sunset scenes; only lighting/time should change.
- City hall exterior should also remain structurally consistent from morning intro to dusk ending. Avoid regenerating a completely different building for the ending.
- Generated city marks are unreliable. Use the exact official Seongnam City CI as a separate layer if/when an official asset is supplied.
- Desk prop direction: no handover document on the desk. A realistic prop like `2026년 합본예산서` is acceptable. Remove unnecessary monitor brand marks and mugs.

## Art assets
Current app already uses lightweight assets under `public/art/`:
- `city-morning.webp`
- `office-day.webp`

Latest higher-fidelity candidate set should be stored / used as:
- `public/art/city-morning-final.webp`
- `public/art/office-day-final.webp`
- `public/art/office-sunset-final.webp`
- `public/art/city-dusk-final.webp`
- `docs/art-direction/ui-concept-board.webp`

Recommended use:
- Intro: `city-morning-final.webp`
- Main / investigation: `office-day-final.webp`
- Team leader report / late-game: `office-sunset-final.webp`
- Ending: `city-dusk-final.webp`

## Current story facts used in the game
- Public-folder draft date: 2025. 10. 15.
- Approved plan date: 2025. 9. 22., `회계과-18421`.
- Final/actual drill date: 2025. 10. 22. 14:00–15:30.
- Result report: 2025. 10. 27., `회계과-21347`.
- Fictional partner in the game: 분당소방서 야탑119안전센터.
- Legal-basis clue currently uses `「공공기관의 소방안전관리에 관한 규정」 제14조`; verify exact current wording before final public release if legal precision is required.

## 10 clues
1. 공용폴더 계획자료 — 10.15
2. 최종 결재 훈련일 — 10.22
3. 실제 실시일 — result report confirms 10.22
4. 추진근거
5. 협조기관
6. 훈련 진행순서
7. 예산·준비사항
8. 피난계획
9. 피난동선
10. 실제 훈련내용

## UX / performance decisions
- `업무 시작하기` should transition immediately; session creation happens in the background.
- Raffle submission must wait for DB success, but must show a clear `응모 처리 중…` loading state.
- After success, move to a dedicated raffle-complete screen instead of leaving the player on the form.
- Duplicate phone numbers should be reported as a clear duplicate-entry message.

## Next recommended tasks in Codex
1. Wire the final art assets into screen-specific backgrounds without reducing document readability.
2. Make the desktop/home monitor larger on portrait phones and refine the 2×2 menu to match the concept board.
3. Introduce explicit day/sunset/dusk phase classes instead of relying only on generic CSS filters.
4. Replace generated Seongnam CI with exact official CI asset when supplied.
5. Add `/admin` page for started/completed/raffle counts, entrant list, and drawing 3 winners without replacement.
6. Re-test raffle end-to-end after any Supabase schema/table-name change. Code expects `raffle_entries`.
7. Run a full phone playthrough and keep total completion time near 4–5 minutes.
