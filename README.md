# FYR social bingo

Node/Express app with SQLite. Players sign up, fill in their bingo card,
and appear on a live leaderboard. Admin can drill into any player's answers,
delete a single player, or clear the whole board.

## Pages
- `/` — sign up with a name
- `/bingo.html` — the player's card
- `/leaderboard.html` — live leaderboard (auto-refreshes every 4s)
- `/admin.html` — password-gated admin view (auto-refreshes every 5s)

## Required configuration

`ADMIN_PASSWORD` **must** be set or the server refuses to start. There is no
default: this repo is public, so a fallback password here would be a published
password. If a deploy crashes on boot, check the logs — a missing
`ADMIN_PASSWORD` says so explicitly.

`PORT` is optional and defaults to 3000. Railway sets it automatically.

## Deploy on Railway
1. On railway.app: **New Project** → **Deploy from GitHub repo** → select this repo.
   If the repo isn't listed, use **Configure GitHub App** to grant Railway access.
2. Railway auto-detects Node and runs `npm install` then `npm start`.
3. Open the service → **Variables** → add `ADMIN_PASSWORD`. Do this before
   sharing any links; without it the service will not boot.
4. **Settings** → **Networking** → **Generate Domain** for a public URL.
5. Generate the QR code from that URL — and only after this step, since each
   deployment gets its own domain.

Before the event, open `/admin.html` and use **Delete all players** to clear
test data.

## Data persistence

The SQLite file lives inside the container, so **a redeploy wipes every player
and answer**. That's fine between events, but don't push changes mid-event.
Attach a Railway volume if the data needs to survive redeploys.

## Run locally
```
npm install
ADMIN_PASSWORD=whatever npm start
```
Then open http://localhost:3000
