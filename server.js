const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");
const { nanoid } = require("nanoid");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bucs2026";
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, "data.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS answers (
    player_id TEXT NOT NULL,
    square_index INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    matched_name TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (player_id, square_index)
  );
`);

const PROMPTS = [
  "Picked UBC over another specific school",
  "Attempted the 110 Challenge Exam",
  "Has 500+ hours on a Steam game",
  "Has been to 5+ countries",
  "Already has an opinion on the best 1st year dining hall",
  "Already found a favorite food spot on campus",
  "Had to take 2 flights to come to Vancouver",
  "Has a part-time job or side hustle",
  "Is a morning person",
  "Has more than 5000 photos on their phone",
  "Walked into the wrong lecture hall or building this week",
  "Already been to Wreck Beach",
  "Has 500+ LinkedIn connections",
  "Signed up for the Spark",
  "Did Jumpstart",
  "Commutes more than 30 minutes to campus",
  "Speaks 3+ languages",
  "Shares a class with you",
  "Has a niche hobby most people wouldn't guess",
  "Transferred to BUCS",
  "Interested in learning about the same career field as you",
  "Has a Duolingo streak over 30 days",
  "Has watched an entire TV series in one weekend",
  "Has met a BUCS exec before today",
];
const CARD = [...PROMPTS.slice(0, 12), "FREE", ...PROMPTS.slice(12, 24)];

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/signup", (req, res) => {
  const name = (req.body.name || "").trim();
  if (!name) return res.status(400).json({ error: "Name is required" });
  const id = nanoid(10);
  db.prepare("INSERT INTO players (id, name, created_at) VALUES (?, ?, ?)").run(
    id,
    name,
    Date.now()
  );
  res.json({ id, name });
});

app.get("/api/card/:playerId", (req, res) => {
  const player = db
    .prepare("SELECT * FROM players WHERE id = ?")
    .get(req.params.playerId);
  if (!player) return res.status(404).json({ error: "Player not found" });
  const rows = db
    .prepare("SELECT square_index, matched_name FROM answers WHERE player_id = ?")
    .all(req.params.playerId);
  const answers = Array(25).fill("");
  rows.forEach((r) => (answers[r.square_index] = r.matched_name));
  res.json({ player, card: CARD, answers });
});

app.post("/api/card/:playerId", (req, res) => {
  const { squareIndex, matchedName } = req.body;
  if (typeof squareIndex !== "number" || squareIndex < 0 || squareIndex > 24) {
    return res.status(400).json({ error: "Invalid square" });
  }
  const player = db
    .prepare("SELECT * FROM players WHERE id = ?")
    .get(req.params.playerId);
  if (!player) return res.status(404).json({ error: "Player not found" });

  const trimmed = (matchedName || "").trim();
  if (trimmed) {
    db.prepare(
      `INSERT INTO answers (player_id, square_index, prompt, matched_name, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(player_id, square_index) DO UPDATE SET matched_name = excluded.matched_name, updated_at = excluded.updated_at`
    ).run(req.params.playerId, squareIndex, CARD[squareIndex], trimmed, Date.now());
  } else {
    db.prepare(
      "DELETE FROM answers WHERE player_id = ? AND square_index = ?"
    ).run(req.params.playerId, squareIndex);
  }
  res.json({ ok: true });
});

app.get("/api/leaderboard", (req, res) => {
  const players = db.prepare("SELECT id, name FROM players").all();
  const counts = db
    .prepare(
      "SELECT player_id, COUNT(*) as filled FROM answers GROUP BY player_id"
    )
    .all();
  const countMap = {};
  counts.forEach((c) => (countMap[c.player_id] = c.filled));
  const board = players
    .map((p) => ({
      id: p.id,
      name: p.name,
      filled: (countMap[p.id] || 0) + 1, // +1 for free space
    }))
    .sort((a, b) => b.filled - a.filled);
  res.json(board);
});

function checkAdmin(req, res, next) {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/admin/player/:id", checkAdmin, (req, res) => {
  const player = db
    .prepare("SELECT * FROM players WHERE id = ?")
    .get(req.params.id);
  if (!player) return res.status(404).json({ error: "Player not found" });
  const rows = db
    .prepare("SELECT square_index, matched_name FROM answers WHERE player_id = ?")
    .all(req.params.id);
  const answers = Array(25).fill("");
  rows.forEach((r) => (answers[r.square_index] = r.matched_name));
  res.json({ player, card: CARD, answers });
});

app.listen(PORT, () => {
  console.log(`FYR social bingo running on port ${PORT}`);
});
