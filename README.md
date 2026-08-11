# FYR social bingo

Node/Express app with SQLite. Players sign up, fill in their bingo card,
and appear on a live leaderboard. Admin can drill into any player's answers.

## Pages
- `/` — sign up with a name
- `/bingo.html` — the player's card
- `/leaderboard.html` — live leaderboard (auto-refreshes every 4s)
- `/admin.html` — password-gated admin view (default password: bucs2026,
  override with the ADMIN_PASSWORD environment variable)

## Deploy on Railway
1. Push this folder to a new GitHub repo.
2. On railway.app, create a new project, choose "Deploy from GitHub repo",
   and select the repo.
3. Railway auto-detects Node and runs `npm install` then `npm start`.
4. In the Railway project settings, add a variable `ADMIN_PASSWORD` set to
   whatever you want the admin password to be.
5. Railway gives you a live URL once deployed. Generate a QR code for it
   and you're set. The SQLite file persists on Railway's container as long
   as you don't redeploy with a fresh volume.

## Run locally first (recommended)
```
npm install
npm start
```
Then open http://localhost:3000
