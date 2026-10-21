# Korean character voices

These are pre-rendered MP3 clips for fixed fictional game dialogue. The game
plays same-origin files and makes no speech-synthesis API requests while a
visitor plays. Personal details and free-text visitor input are not included.
No celebrity voice sample or voice clone was used.

| Role | Voice | Assignment |
| --- | --- | --- |
| hero | ko-KR-InJoonNeural | Male protagonist |
| boss | ko-KR-SunHiNeural | Female team leader |
| senior | ko-KR-InJoonNeural | Male predecessor, slightly lower pitch |
| firefighter | ko-KR-InJoonNeural | Male 119 contact, slightly lower pitch |

`manifest.json` records every exact source line, role, configured voice, rate,
pitch, duration, codec and file size. Duplicate lines within one role share a
clip. The initial set has 31 clips: 18 boss, 1 hero, 9 senior and 3 firefighter.

Regeneration requires Python, `edge-tts==7.3.1`, and `ffprobe`:

```sh
python scripts/generate-voices.py
```

The generator extracts only prologue, team-leader report and phone dialogue.
It validates each MP3 before writing the manifest, reuses valid generated
files and stops on service errors. Where the runtime supplies `SSL_CERT_FILE`,
that existing trusted CA is added to the library context; certificate
verification remains enabled.

`app/voice.ts` maps exact text and role to a local file. It never falls back to
an unspecified device TTS voice. Missing files and autoplay rejection return
`unavailable: true`; `retry()` starts playback directly in the caller's click
handler. Disabled hook instances clean up only their own playback.

Generator documentation: https://github.com/rany2/edge-tts
