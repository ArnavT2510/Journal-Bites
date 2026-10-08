// Vercel serverless function: POST /api/suggest
// Powering Bite.ai recommendations via the Gemini / Groq API.

const PROVIDER = (process.env.LLM_PROVIDER || "gemini").trim().toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const CTRL = new RegExp("[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + "]+", "g");
function clean(s, n) { return String(s == null ? "" : s).replace(CTRL, " ").slice(0, n); }

// ---------------------------------------------------------------- Bite.ai (Gemini Core) ---
const GEMINI_DEFAULTS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite"];
const GEMINI_MODELS = [...new Set([process.env.GEMINI_MODEL, ...GEMINI_DEFAULTS].filter(Boolean).map((m) => m.trim()))];
const GEMINI_SEARCH_ON = process.env.ENABLE_SEARCH !== "false";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

function parseGemini(data) {
  const steps = Array.isArray(data.steps) ? data.steps : [];
  let text = "", sources = [], suggestionsHtml = "", searched = false;
  for (const st of steps) {
    if (st.type === "google_search_call") searched = true;
    if (st.type === "google_search_result") {
      for (const r of st.result || []) if (r.search_suggestions) suggestionsHtml = r.search_suggestions;
    }
    if (st.type === "model_output") {
      for (const c of st.content || []) {
        if (c.type !== "text") continue;
        text += (text ? "\n" : "") + (c.text || "");
        for (const a of c.annotations || []) {
          if (a.type === "url_citation" && a.url && !sources.some((s) => s.url === a.url)) {
            sources.push({ url: a.url, title: a.title || a.url });
          }
        }
      }
    }
  }
  if (!text && typeof data.output_text === "string") text = data.output_text;
  return { text: text.trim(), sources: sources.slice(0, 6), suggestionsHtml, searched };
}

async function callGemini(key, model, prompt, useSearch) {
  const body = { model, input: prompt };
  if (useSearch) body.tools = [{ type: "google_search" }];
  const r = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify(body)
  });
  const data = await r.json().catch(() => ({}));
  const out = parseGemini(data);
  const detail = (data.error && data.error.message) ? String(data.error.message).slice(0, 300) : (r.ok && !out.text ? "empty response" : "");
  return { ok: r.ok && !!out.text, status: r.status, detail, ...out };
}

async function geminiWithFallback(key, prompt, useSearch) {
  let last = { ok: false, status: 0, detail: "no models" };
  for (const m of GEMINI_MODELS) {
    last = await callGemini(key, m, prompt, useSearch);
    if (last.ok) return last;
    if (last.status === 503 || last.status === 500) {
      await sleep(1000);
      last = await callGemini(key, m, prompt, useSearch);
      if (last.ok) return last;
    }
    if (useSearch && (last.status === 429 || /quota|billing/i.test(last.detail || ""))) break;
  }
  return last;
}

// ----------------------------------------------------------------- Handler ---
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  let b = req.body;
  try { if (typeof b === "string") b = JSON.parse(b); } catch (e) { b = null; }
  if (!b || !b.restaurant || !Array.isArray(b.dishes) || !b.dishes.length) {
    return res.status(400).json({ error: "Restaurant and at least one dish are required" });
  }

  const restaurant = clean(b.restaurant, 100);
  const city = clean(b.city, 80);
  const history = b.dishes.slice(0, 60).map((d) =>
    `- ${clean(d.dish, 100)} | ${Number(d.rating) || 0}/5 | ${clean(d.notes, 300)}`).join("\n");

  const where = city ? `${restaurant} in ${city}` : restaurant;
  const prompt = (useSearch) => `You are Bite.ai, an expert culinary assistant analyzing user taste profiles and menus.

Restaurant: ${where}

Dishes already eaten (dish | rating /5 | user notes):
${history}

${useSearch
  ? `First search the web for the current menu of ${where}. Recommend ONLY dishes that appear on that menu.`
  : `Suggest dishes you are confident exist at this restaurant, noting menu verification status.`}

Reply in plain text, under 220 words, formatted as:
TRY NEXT: 3 dishes NOT eaten yet, with single-line reasons tied to their taste profile.
SKIP: 1-2 menu items likely to disappoint based on past low ratings.
End with a brief allergen and menu verification note.`;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: "Server missing API key" });
    const first = GEMINI_SEARCH_ON ? await geminiWithFallback(key, prompt(true), true) : { ok: false };
    let out = first;
    if (!out.ok) out = await geminiWithFallback(key, prompt(false), false);

    if (!out.ok) {
      return res.status(502).json({ error: "Bite.ai service error " + out.status });
    }
    return res.status(200).json({
      text: out.text, sources: out.sources, suggestionsHtml: out.suggestionsHtml, searched: !!out.searched
    });
  } catch (e) {
    return res.status(500).json({ error: "Unexpected server error" });
  }
};
  }
};
