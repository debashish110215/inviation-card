# Aarav & Ananya — Wedding Invitation

A responsive Next.js 15 wedding invitation demo with:
- Animated envelope opening interaction
- Scroll reveal animations
- Live countdown to 12 December 2026, 6:00 PM Bangladesh time
- Wedding event cards and Google Calendar links
- Event schedule timeline
- Google Maps embed and directions link
- Responsive photo gallery with lightbox
- Background music controls
- Interactive RSVP demo

## Requirements
- Node.js 20.9+ (Node 24 is supported)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production build

```bash
npm run build
npm start
```

## Customize the invitation

Edit `src/app/page.tsx`:
- `WEDDING_DATE`: countdown target
- `events`: event names, dates, times and venues
- `gallery`: image URLs and alt text
- `MAP_QUERY`: venue search query
- Replace Aarav and Ananya throughout the page.

Edit `src/app/globals.css` to change colors, fonts, spacing and animation styles.

## Add background music

Add a licensed MP3 you have permission to use at:

`public/music/wedding.mp3`

The music player will then play/pause that file. Browsers require a user click before audio playback.

## Important demo notes
- RSVP is client-side only; it does not submit to a server. Connect the form to your API/database before production.
- The Google Maps embed uses a text search for "The Royal Garden, Dhaka". Replace it with the exact venue/map place URL or coordinates before publishing.
- Gallery photos are remote Unsplash images used as placeholders. Replace them with the couple's authorized photographs.
- Google Fonts and remote gallery images require internet access.
- Calendar links use sample dates/times; adjust event times and timezone before publishing.
- The sample date is 12 December 2026 and the sample venue is The Royal Garden, Dhaka.
