# Rush: a virtual health assistant for Ghana

Rush is an Expo (React Native) app that helps people understand how they feel,
keep their medical information to hand, and get help fast in an emergency.
Everything is stored on the phone; there are no accounts. The only feature that
uses the internet is the AI chat, which goes through the small server in
[`server/`](server/) so the Claude API key never ships inside the app.

## What's in the app

| Area | What it does |
| --- | --- |
| Onboarding | Intro → consent (medical disclaimer, 16+) → medical information → done |
| Home | Search, SOS button, cards for every feature (Figma design) |
| Chat | AI health guidance (Claude). An on-phone scanner shows 112 / 193 first for emergency or self-harm messages. Optional "use my health info" sharing, off by default |
| Symptoms Checker | Rule-based triage (WHO IMCI danger signs, malaria testing for every fever) → emergency / today / soon / pharmacy / home care |
| Medical History | Health log (blood pressure, sugar, weight, temperature, mood, symptoms) with charts and plain-language bands, plus the medical ID |
| Medicines | Daily schedules, local reminder notifications, mark doses taken / skipped, 7-day adherence |
| Health Library / Recipes | Bundled offline articles and lighter Ghanaian recipes |
| SOS | One-tap 112, 193, 191, 192, emergency contact, medical ID, danger signs |
| Settings | Profile, medical ID, privacy, languages, export a health summary, delete all data |

## Run it

```bash
npm install
npm run web          # or: npm run ios / npm run android (needs a dev build for notifications)
```

To use the chat locally, run the server too (see below) and create `.env.local`
from `.env.example`.

## Checks

```bash
npm run check
```

Runs the app typecheck, the app unit tests (`tests/`), Expo's dependency check,
the server typecheck and the server tests. Everything runs offline.

## Chat server

```bash
cd server
npm install
ANTHROPIC_API_KEY=... npm run dev     # http://localhost:8787
```

- `POST /chat` with `{ installId, messages, context }` → `{ reply }`; `GET /health`.
- Model: `claude-opus-5-5` (override with `RUSH_MODEL`), medium effort, short
  replies. Server-side refusal fallback is on (`fallbacks: "default"`).
- Rate limits per install and per IP (`RUSH_PER_HOUR`, `RUSH_PER_DAY`,
  `RUSH_IP_PER_HOUR`, `RUSH_IP_PER_DAY`).
- It never stores or logs conversation content.

Deploy anywhere that runs Node 22 (for example Railway: root directory
`server`, build `npm run build`, start `npm start`, variable
`ANTHROPIC_API_KEY`). Then build the app with
`EXPO_PUBLIC_RUSH_API_URL=https://your-server`.

## Before the stores

- Replace the placeholder logo, illustrations and app icon with the Figma
  exports in `assets/design/`.
- Set `ios.bundleIdentifier` and `android.package` in `app.json`.
- Publish a privacy policy page (the in-app text is under Settings → Privacy).
- Have a Ghanaian health professional review the triage rules, articles and
  chat prompt.
