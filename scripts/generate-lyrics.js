#!/usr/bin/env node
/**
 * Extract lyrics from script.js and write .lrc files to audio/ folder.
 * Run: node scripts/generate-lyrics.js
 */

const fs = require('fs');
const path = require('path');

try {
const scriptPath = path.join(__dirname, '..', 'script.js');
const audioDir = path.join(__dirname, '..', 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
const script = fs.readFileSync(scriptPath, 'utf8');

// Map lyrics var names to track ids (from lyricsByTrack)
const idMap = {
  blockPartyLyrics: 'block-party-bootyquake',
  neonThongLyrics: 'neon-thong-vision',
  queenOfTheQuakeLyrics: 'queens-of-the-shakes',
  bigBootyHustleLyrics: 'big-booty-hustle',
  bounceBackBootyLyrics: 'bounce-back-booty',
  scamAndShakeLyrics: 'scam-and-shake',
  stripToTheTopLyrics: 'strip-to-the-top',
  rachetEarthquakeLyrics: 'rachet-earthquake',
  preciousThingsLyrics: 'precious-things',
  bossThatBootyLyrics: 'boss-that-booty',
  royalLifeLyrics: 'royal-life',
  loyalLoveRighteousLifeLyrics: 'loyal-love-righteous-life',
  lifeIsAmazingLyrics: 'life-is-amazing',
  billionDollarBitchTalkLyrics: 'billion-dollar-bitch-talk',
  billionaireDaydreamsLyrics: 'billionaire-daydreams',
  courtsideAssLyrics: 'courtside-ass',
  astroBootyLyrics: 'astro-booty',
  bootyBagLyrics: 'booty-bag',
  fetchThatMonetLyrics: 'fetch-that-monet',
  shakeThatBootyPleaseLyrics: 'shake-that-booty-please',
  assBoostPartyAnthemLyrics: 'ass-boost-party-anthem',
};

function secToLrc(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function extractLyricsArray(varName) {
  const startMarker = `const ${varName} = [`;
  const startIdx = script.indexOf(startMarker);
  if (startIdx === -1) return null;

  const contentStart = startIdx + startMarker.length;
  const endMatch = script.slice(contentStart).match(/\n  \];/);
  const endIdx = endMatch ? contentStart + endMatch.index : script.indexOf('];', contentStart);
  const block = script.slice(contentStart, endIdx);

  const lineRegex = /\{\s*time:\s*(\d+),\s*text:\s*"((?:[^"\\]|\\.)*)"\s*\}/g;
  const lyrics = [];
  let m;
  while ((m = lineRegex.exec(block)) !== null) {
    lyrics.push({ time: parseInt(m[1], 10), text: m[2].replace(/\\"/g, '"') });
  }
  return lyrics;
}

function writeLrc(trackId, lyrics) {
  const lrc = lyrics
    .map(({ time, text }) => `[${secToLrc(time)}] ${text}`)
    .join('\n');
  const outPath = path.join(audioDir, `${trackId}.lrc`);
  fs.writeFileSync(outPath, lrc, 'utf8');
  console.log(`Wrote ${trackId}.lrc`);
}

const log = [];
for (const [varName, trackId] of Object.entries(idMap)) {
  const lyrics = extractLyricsArray(varName);
  if (lyrics && lyrics.length > 0) {
    writeLrc(trackId, lyrics);
    log.push(`${trackId}: ${lyrics.length} lines`);
  } else {
    log.push(`${varName}: FAILED (${lyrics ? lyrics.length : 'null'})`);
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'lyrics-gen-log.txt'), log.join('\n'));
} catch (err) {
  const logPath = path.join(process.cwd(), 'lyrics-gen-log.txt');
  fs.writeFileSync(logPath, 'ERROR: ' + err.message + '\n' + err.stack);
}
