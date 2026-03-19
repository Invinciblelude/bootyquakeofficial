# BootyQuake Official

**Luxury Booty-Shaking Trap for Dancers & Clubs**

Official website for BootyQuakeOfficial.com – Sacramento's premier trap label.

## Quick Start

```bash
cd /Users/invinciblelude/Bootyquakeofficial && python3 -m http.server 8080 --bind 0.0.0.0
```

- **Desktop:** [http://localhost:8080](http://localhost:8080)
- **Mobile (same WiFi):** `http://YOUR_IP:8080` — run `ipconfig getifaddr en0` (Mac) or `hostname -I` (Linux) to get your IP

## Customize

1. **Spotify** – Replace the playlist embed URL in `index.html` with your Bootyquake Radio playlist
2. **Social links** – Update Instagram, TikTok, YouTube, Spotify URLs in header/footer
3. **Hero image** – `hero-album-art.png` in project root (album art for hero, track cards, favicon)
4. **YouTube videos** – Swap placeholder embeds with your actual shorts/clips
5. **Forms** – Connect contact & newsletter forms to Formspree, Netlify Forms, or your backend

## Structure

- `index.html` – Single-page layout
- `styles.css` – Neon/trap aesthetic (reds, blacks, golds)
- `script.js` – Smooth scroll, mobile menu, form handlers
- `audio/` – MP3s and `.lrc` lyric files (per-track karaoke)
- `assets/` – Images, artwork, EPK assets

## Lyrics (per-song)

Each track has its own `.lrc` file for karaoke-style synced lyrics. Two ways to generate them:

**1. AI from audio (Whisper)** – transcribes each song and outputs timed LRC:

```bash
pip install -U openai-whisper
brew install ffmpeg   # or: apt install ffmpeg

python scripts/audio-to-lrc.py                    # all MP3s in audio/
python scripts/audio-to-lrc.py --model medium     # better accuracy
```

**2. Manual calibration** – on the site, use **Calibrate** to click when you hear each line, then **Export LRC** to download.

## Deploy

Works with any static host: Netlify, Vercel, GitHub Pages, etc. No build step required.
