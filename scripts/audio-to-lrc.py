#!/usr/bin/env python3
"""
Generate LRC (karaoke-style) lyrics from audio using Whisper.
Each song gets its own timed lyrics from its actual audio.

Setup:
  pip install -U openai-whisper
  brew install ffmpeg   # or: apt install ffmpeg

Usage:
  python scripts/audio-to-lrc.py                    # process all MP3s in audio/
  python scripts/audio-to-lrc.py audio/song.mp3     # process one file
  python scripts/audio-to-lrc.py --model medium     # use medium model (more accurate)
"""

import argparse
import os
import re
import sys
from pathlib import Path

# Map MP3 filenames to track IDs (used for LRC output names)
TRACK_IDS = {
    "block-party-bootyquake.mp3": "block-party-bootyquake",
    "Neon-Thong-Vision.mp3": "neon-thong-vision",
    "neon-thong-vision.mp3": "neon-thong-vision",
    "queens-of-the-shakes.mp3": "queens-of-the-shakes",
    "bounce-back-booty.mp3": "bounce-back-booty",
    "scam-and-shake.mp3": "scam-and-shake",
    "strip-to-the-top.mp3": "strip-to-the-top",
    "rachet-earthquake.mp3": "rachet-earthquake",
    "precious-things.mp3": "precious-things",
    "boss-that-booty.mp3": "boss-that-booty",
    "royal-life.mp3": "royal-life",
    "loyal-love-righteous-life.mp3": "loyal-love-righteous-life",
    "life-is-amazing.mp3": "life-is-amazing",
    "billion-dollar-bitch-talk.mp3": "billion-dollar-bitch-talk",
    "billionaire-daydreams.mp3": "billionaire-daydreams",
    "courtside-ass.mp3": "courtside-ass",
    "astro-booty.mp3": "astro-booty",
    "booty-bag.mp3": "booty-bag",
    "fetch-that-monet.mp3": "fetch-that-monet",
    "shake-that-booty-please.mp3": "shake-that-booty-please",
    "ass-boost-party-anthem.mp3": "ass-boost-party-anthem",
}


def format_lrc_time(sec: float) -> str:
    """Format seconds as [MM:SS.xx] for LRC."""
    mins = int(sec // 60)
    s = sec % 60
    return f"{mins:02d}:{s:05.2f}"


def mp3_to_track_id(path: Path) -> str:
    """Get track ID from MP3 path. Falls back to stem if not in map."""
    name = path.name
    return TRACK_IDS.get(name, path.stem.lower().replace(" ", "-"))


def transcribe_to_lrc(audio_path: Path, out_path: Path, model_name: str = "base") -> bool:
    """Transcribe audio with Whisper and write LRC file."""
    try:
        import whisper
    except ImportError:
        print("Install Whisper: pip install -U openai-whisper", file=sys.stderr)
        return False

    print(f"Loading Whisper model '{model_name}'...")
    model = whisper.load_model(model_name)

    print(f"Transcribing {audio_path.name}...")
    result = model.transcribe(str(audio_path), language="en", fp16=False)

    lines = []
    for seg in result.get("segments", []):
        start = seg["start"]
        text = (seg.get("text") or "").strip()
        if not text:
            continue
        lines.append(f"[{format_lrc_time(start)}] {text}")

    if not lines:
        print(f"  No segments for {audio_path.name}", file=sys.stderr)
        return False

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  Wrote {out_path} ({len(lines)} lines)")
    return True


def main():
    parser = argparse.ArgumentParser(description="Generate LRC from audio using Whisper")
    parser.add_argument(
        "paths",
        nargs="*",
        help="Audio files or directory. Default: audio/",
    )
    parser.add_argument(
        "--model",
        default="base",
        choices=["tiny", "base", "small", "medium", "large"],
        help="Whisper model (base=fast, medium=better accuracy)",
    )
    parser.add_argument(
        "--audio-dir",
        default="audio",
        help="Directory with MP3s when no paths given",
    )
    parser.add_argument(
        "--out-dir",
        default=None,
        help="Output directory for LRC files (default: same as audio)",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    audio_dir = root / args.audio_dir
    out_dir = Path(args.out_dir) if args.out_dir else audio_dir
    if not out_dir.is_absolute():
        out_dir = root / out_dir

    if args.paths:
        files = []
        for p in args.paths:
            path = Path(p)
            if not path.is_absolute():
                path = root / path
            if path.is_dir():
                files.extend(path.glob("*.mp3"))
            elif path.suffix.lower() in (".mp3", ".wav", ".m4a"):
                files.append(path)
    else:
        files = list(audio_dir.glob("*.mp3"))
        if not files:
            print(f"No MP3s in {audio_dir}", file=sys.stderr)
            sys.exit(1)

    ok = 0
    for f in sorted(files):
        track_id = mp3_to_track_id(f)
        out_path = out_dir / f"{track_id}.lrc"
        if transcribe_to_lrc(f, out_path, args.model):
            ok += 1

    print(f"\nDone: {ok}/{len(files)} LRC files written.")
    if ok < len(files):
        sys.exit(1)


if __name__ == "__main__":
    main()
