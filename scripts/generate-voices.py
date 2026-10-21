#!/usr/bin/env python3
"""Generate the game's fixed Korean dialogue clips using edge-tts.

Install edge-tts (7.3.1 was used for ko-v1) and ffmpeg/ffprobe, then run:
    python scripts/generate-voices.py

Only public, fixed game dialogue is sent to the speech service. No runtime
visitor text, personal information, voice samples, or credentials are used.
Existing valid clips are reused. A failed service request stops the build;
the script never disables TLS verification or changes the service endpoint.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

import edge_tts
import edge_tts.communicate

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "audio" / "ko-v1"
STRING = r'"(?:\\.|[^"\\])*"'
VOICES = {
    "hero": {"voice": "ko-KR-InJoonNeural", "gender": "male", "rate": "-3%", "pitch": "+0Hz"},
    "boss": {"voice": "ko-KR-SunHiNeural", "gender": "female", "rate": "-3%", "pitch": "+0Hz"},
    "senior": {"voice": "ko-KR-InJoonNeural", "gender": "male", "rate": "-3%", "pitch": "-4Hz"},
    "firefighter": {"voice": "ko-KR-InJoonNeural", "gender": "male", "rate": "-3%", "pitch": "-8Hz"},
}


def literals(source: str) -> list[str]:
    return [json.loads(s) for s in re.findall(STRING, source)]


def collect_dialogue() -> list[dict]:
    page = (ROOT / "app" / "page.tsx").read_text()
    immersive = (ROOT / "app" / "immersive-ui.tsx").read_text()
    data = (ROOT / "app" / "game-data.ts").read_text()
    entries: dict[tuple[str, str], dict] = {}

    def add(role: str, text: str, source: str) -> None:
        text = re.sub(r"\s+", " ", text.strip())
        if not text:
            return
        key = (role, text)
        if key in entries:
            if source not in entries[key]["sources"]:
                entries[key]["sources"].append(source)
            return
        settings = VOICES[role]
        digest = hashlib.sha256(json.dumps([role, text, settings], ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]
        entries[key] = {
            "role": role, "text": text, **settings,
            "file": f"/audio/ko-v1/{role}-{digest}.mp3",
            "sources": [source],
        }

    prologue = re.search(r"const scenes=\[(.*?)\];const current=", page, re.S)
    if not prologue:
        raise ValueError("Could not locate prologue dialogue; review source extraction before generating.")
    lines = re.findall(r"\{who:(" + STRING + r"),text:(" + STRING + r")", prologue.group(1))
    if len(lines) != 3:
        raise ValueError("Expected exactly three prologue lines.")
    for who, text in lines:
        add("hero" if json.loads(who) == "나" else "boss", json.loads(text), "prologue")

    questions = data.split("export const questions =", 1)[1].split("export const decoys", 1)[0]
    for field in ("q", "ok"):
        lines = re.findall(r"\b" + field + r":(" + STRING + r")", questions)
        if len(lines) != 5:
            raise ValueError(f"Expected five report {field} lines.")
        for line in lines:
            add("boss", json.loads(line), f"questions.{field}")
    for array in re.findall(r"\bbad:\[(.*?)\]", questions, re.S):
        for text in literals(array):
            add("boss", text, "questions.bad")

    hint = re.search(r"const nextHint=(.*?);\n", page, re.S)
    if not hint:
        raise ValueError("Could not locate nextHint dialogue.")
    hints = [s for s in literals(hint.group(1)) if re.search(r"[가-힣]", s)]
    if len(hints) != 7:
        raise ValueError("Expected seven phone hint lines.")
    for text in hints:
        add("senior", text, "nextHint")

    phone = re.search(r"const lines=ending\?\[(.*?)\]:\[(.*?)\];", immersive, re.S)
    if not phone:
        raise ValueError("Could not locate PhoneCall dialogue.")
    for role, block, expected in (("firefighter", phone.group(1), 3), ("senior", phone.group(2), 2)):
        fixed = literals(block)
        if len(fixed) != expected:
            raise ValueError(f"Unexpected number of fixed {role} phone lines.")
        for text in fixed:
            add(role, text, "PhoneCall")
    return sorted(entries.values(), key=lambda item: (item["role"], item["text"]))


def verify(path: Path) -> dict:
    if not path.exists() or path.stat().st_size < 1024:
        raise ValueError("Missing or empty audio output")
    result = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
        "stream=codec_name,sample_rate,channels:format=duration", "-of", "json", str(path),
    ], check=True, capture_output=True, text=True)
    info = json.loads(result.stdout)
    stream = info["streams"][0]
    duration = float(info["format"]["duration"])
    if stream["codec_name"] != "mp3" or duration <= 0.2 or int(stream["sample_rate"]) < 16000:
        raise ValueError("Generated audio failed MP3 validation")
    return {
        "duration_seconds": round(duration, 3), "bytes": path.stat().st_size,
        "codec": stream["codec_name"], "sample_rate": int(stream["sample_rate"]), "channels": stream["channels"],
    }


async def generate(concurrency: int) -> None:
    # The managed runtime supplies its trusted CA through SSL_CERT_FILE. Add
    # that existing trust anchor to edge-tts' certifi context; keep validation on.
    runtime_ca = os.environ.get("SSL_CERT_FILE")
    if runtime_ca and Path(runtime_ca).is_file():
        edge_tts.communicate._SSL_CTX.load_verify_locations(cafile=runtime_ca)
    clips = collect_dialogue()
    OUTPUT.mkdir(parents=True, exist_ok=True)
    gate = asyncio.Semaphore(concurrency)
    print(f"Preparing {len(clips)} fixed dialogue clips", flush=True)

    async def one(clip: dict) -> None:
        async with gate:
            path = OUTPUT / Path(clip["file"]).name
            if path.exists():
                try:
                    clip.update(verify(path))
                    print("reused", path.name, flush=True)
                    return
                except (ValueError, subprocess.CalledProcessError, KeyError, IndexError):
                    pass
            temporary = path.with_suffix(".part.mp3")
            try:
                request = edge_tts.Communicate(clip["text"], clip["voice"], rate=clip["rate"], pitch=clip["pitch"])
                await asyncio.wait_for(request.save(str(temporary)), timeout=45)
                details = verify(temporary)
                temporary.replace(path)
                clip.update(details)
                print("generated", path.name, clip["bytes"], flush=True)
            finally:
                temporary.unlink(missing_ok=True)

    await asyncio.gather(*(one(clip) for clip in clips))
    manifest = {
        "version": "ko-v1", "provider": "Microsoft Edge online speech via edge-tts",
        "generator_version": edge_tts.__version__,
        "generation_only": "Generated from fixed fictional game dialogue. No runtime speech API requests or celebrity voice cloning.",
        "voice_roles": VOICES, "clips": clips,
    }
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"clips": len(clips), "bytes": sum(c["bytes"] for c in clips), "manifest": str(OUTPUT / "manifest.json")}))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--concurrency", type=int, choices=range(1, 5), default=3)
    args = parser.parse_args()
    try:
        asyncio.run(generate(args.concurrency))
    except Exception as error:
        # Avoid echoing service URLs or generated request headers in errors.
        raise SystemExit(f"Voice generation failed: {type(error).__name__}; status={getattr(error, 'status', None)}") from None
