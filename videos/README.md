# BootyQuake Videos

Videos are **embedded from YouTube, TikTok, and Instagram** — no local hosting, no bogging down the site.

- **YouTube** embeds play **muted** by default (TikTok/IG: mute manually or use our soundtrack)
- Press **Play Bootyquake Radio with Videos** for our soundtrack
- Credits link to the original source

## How to add videos

Edit `videos.json` in the project root. Each entry needs:

| Field      | Required | Description                                      |
|------------|----------|--------------------------------------------------|
| `platform` | Yes      | `youtube`, `tiktok`, or `instagram`              |
| `url`      | Yes      | Full share URL (watch link, not embed)          |
| `title`    | Yes      | Display title                                    |
| `credit`   | No       | Creator handle (e.g. `@dancername`)              |
| `creditUrl`| No       | Link to original (defaults to `url`)             |

## Example entries

```json
{
  "platform": "youtube",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Dance Clip",
  "credit": "@creator",
  "creditUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
},
{
  "platform": "tiktok",
  "url": "https://www.tiktok.com/@user/video/7123456789",
  "title": "Twerk Visual",
  "credit": "@dancername",
  "creditUrl": "https://www.tiktok.com/@user/video/7123456789"
},
{
  "platform": "instagram",
  "url": "https://www.instagram.com/reel/ABC123/",
  "title": "IG Dancer",
  "credit": "@creator",
  "creditUrl": "https://www.instagram.com/reel/ABC123/"
}
```

## URL formats

- **YouTube**: `https://www.youtube.com/watch?v=VIDEO_ID` or `https://youtu.be/VIDEO_ID`
- **TikTok**: `https://www.tiktok.com/@username/video/VIDEO_ID`
- **Instagram**: `https://www.instagram.com/reel/SHORTCODE/` or `https://www.instagram.com/p/SHORTCODE/`

## Performance

- Embeds load **lazy** (only when scrolled into view)
- No video files hosted on your server
- Credits and links point to original creators
