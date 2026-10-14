// Shared config + data layer for the live survey.
// Answers travel through ntfy.sh (free pub/sub relay, no account): phones POST one message,
// every open page subscribes and recounts. ntfy.sh keeps messages for ~12 hours.

// Change the topic (or open the pages with ?t=another-name) to start with an empty room.
const DEFAULT_TOPIC = "cum-basic-wise26-who-is-here";
const TOPIC = new URLSearchParams(location.search).get("t") || DEFAULT_TOPIC;
const RELAY = "https://ntfy.sh/" + encodeURIComponent(TOPIC);

const QUESTIONS = [
  { id: "country", type: "country", q: "Where are you from?" },
  { id: "study", type: "choice", q: "What do you study?",
    options: ["Architecture", "Urbanism / urban planning", "Media Architecture", "Something else"] },
  { id: "gh", type: "choice", q: "Grasshopper and you?",
    options: ["Never heard of it", "Opened it once", "Built a few things", "I dream in wires"] },
  { id: "chat", type: "choice", q: "AI chatbots (ChatGPT, Claude …)?",
    options: ["Never", "Now and then", "Every day", "It writes my emails"] },
  { id: "agent", type: "choice", q: "AI coding agents (Claude Code, Cursor …)?",
    options: ["What's that?", "Tried once", "I use them for real"] },
  { id: "city", type: "word", q: "Your dream city in one word" },
];

const ATLAS = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";

function clientId() {
  try {
    let id = localStorage.getItem("cum-cid");
    if (!id) { id = Math.random().toString(36).slice(2, 10); localStorage.setItem("cum-cid", id); }
    return id;
  } catch { return Math.random().toString(36).slice(2, 10); }
}

async function sendAnswers(answers) {
  const body = JSON.stringify({ cid: clientId(), a: answers });
  const r = await fetch(RELAY, { method: "POST", body });
  if (!r.ok) throw new Error("relay " + r.status);
}

// Calls onChange(latestAnswersPerPerson[]) whenever anything arrives. Returns a close() function.
function subscribe(onChange, onStatus = () => {}) {
  const byPerson = new Map(), seen = new Set();
  const take = ev => {
    if (ev.event !== "message" || seen.has(ev.id)) return;
    seen.add(ev.id);
    try {
      const m = JSON.parse(ev.message);
      if (!m || !m.cid || typeof m.a !== "object") return;
      const prev = byPerson.get(m.cid);
      if (!prev || prev.time <= ev.time) byPerson.set(m.cid, { time: ev.time, a: m.a });
    } catch { /* ignore foreign messages */ }
  };
  const emit = () => onChange([...byPerson.values()].map(v => v.a));
  let es, closed = false;
  const open = () => {
    es = new EventSource(RELAY + "/sse?since=all");
    es.onopen = () => onStatus("live");
    es.onmessage = e => { try { take(JSON.parse(e.data)); emit(); } catch {} };
    es.onerror = () => { onStatus("reconnecting"); };
  };
  open();
  return () => { closed = true; es && es.close(); };
}

function tally(list, id) {
  const c = new Map();
  for (const a of list) { const v = a[id]; if (v) c.set(v, (c.get(v) || 0) + 1); }
  return c;
}

function cleanWord(s) {
  return String(s || "").trim().toLowerCase().replace(/[^\p{L}\p{N}\- ]/gu, "").slice(0, 20);
}
