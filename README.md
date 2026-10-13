# SnapVault

A multi-platform video and photo downloader with a simple web interface.
Paste a link, preview it, pick video, photo or music, choose a quality up to 1080p, and track progress in your Library.

Designed by SYED HASAN SHAH

## Features

- Paste a link and see a preview with thumbnail, title and duration
- Download as video, photo, or music (audio only, MP3)
- Quality picker up to 1080p, based on what the source offers
- Library with live progress and percentage for every download
- Sign in with your email to keep your library on your device
- Supported platforms include YouTube, TikTok, Instagram, Facebook, X, Pinterest, Reddit, Vimeo, SoundCloud, Dailymotion, Twitch and Snapchat
- English and Urdu, each in its own language file

## Project structure

- `index.html` - main page
- `css/style.css` - styles
- `js/app.js` - app logic
- `js/platforms.js` - platform list and logos
- `js/lang/en.js`, `js/lang/ur.js` - language files
- `server/server.js` - backend that uses yt-dlp and ffmpeg
- `Dockerfile` - for cloud deployment

## Run on your computer

Requirements: Node.js 18+, yt-dlp, ffmpeg.

```
cd server
npm install
node server.js
```

Then open# ULTIMATE-DOWNLOADER
