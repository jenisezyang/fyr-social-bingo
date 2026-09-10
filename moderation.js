// Name filter for player names and the names written into squares.
//
// Two lists, on purpose. SUBSTRING terms are ones that essentially never occur
// inside a real name, so they're matched anywhere. TOKEN terms are matched only
// as whole words, because they DO appear inside legitimate names — blocking
// "ass" anywhere would reject Cassandra, and "cock" anywhere would reject
// Hancock. Getting this wrong locks a real person out of the game, so the
// default is to let a borderline name through; an exec can delete anything
// that slips past from the admin page.

// Leetspeak folding, so "f4ck" and "sh1t" don't walk straight through.
const LEET = { "4": "a", "@": "a", "3": "e", "1": "i", "!": "i", "0": "o", "5": "s", "$": "s", "7": "t" };

function normalize(input) {
  return String(input)
    .toLowerCase()
    .split("")
    .map((c) => LEET[c] || c)
    .join("")
    .replace(/[^a-z]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SUBSTRING = [
  "fuck", "cunt", "asshole", "pussy", "dildo", "blowjob", "handjob",
  "nigger", "nigga", "faggot", "rapist", "molest", "pedophile",
  "bitch", "cocksucker", "motherfuck", "fck", "phuck", "fux",
];

const TOKEN = [
  "ass", "arse", "cock", "cum", "dick", "shit", "slut", "whore", "tits",
  "titties", "wank", "jizz", "sex", "horny", "hoe", "bastard", "retard",
  "retarded", "twat", "prick", "douche", "piss", "anal", "orgasm", "porn",
  // "fuk" is whole-word only: as a substring it would reject Fukuda, Fukushima.
  "fuk", "fack",
  "penis", "vagina", "boobs", "hitler", "nazi",
];

// Collapsed form catches "f u c k" and "f-u-c-k" written to dodge the filter.
function isBlocked(rawName) {
  const normalized = normalize(rawName);
  const collapsed = normalized.replace(/ /g, "");
  if (!normalized) return false;

  for (const term of SUBSTRING) {
    if (normalized.includes(term) || collapsed.includes(term)) return true;
  }

  const words = normalized.split(" ");
  for (const term of TOKEN) {
    if (words.includes(term) || collapsed === term) return true;
  }

  return false;
}

module.exports = { isBlocked, normalize };
