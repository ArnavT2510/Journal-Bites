# Bite Log

A simple restaurant food journal. Log dishes with a 1-5 star rating, a photo and notes. Search a restaurant to see what you loved, found okay, or disliked. Gemini reads your notes and suggests what to order next.

## Features
- Log dishes per restaurant (rating, photo, notes, date)
- Dishes auto-sorted into Loved (4-5★), Okay (3★), Didn't like (1-2★)
- "What should I try next?" powered by Google Gemini: it searches the web for the restaurant's current menu (optionally using your city) and suggests dishes you haven't tried yet, with source links
- Works without AI too: if Gemini is unavailable, it shows your top-rated and lowest-rated dishes
- Private: data stays in your browser (localStorage), no accounts

## Tech
HTML, CSS, JavaScript, localStorage, Canvas API, Vercel serverless function (Node.js), Google Gemini API (Interactions API with Grounding with Google Search).

## Run / deploy
1. Get a Gemini API key at https://aistudio.google.com/app/apikey
2. Push this folder to GitHub, then import the repo in Vercel (no build settings needed).
3. In Vercel: Settings → Environment Variables → add `GEMINI_API_KEY` (optional: `GEMINI_MODEL`, default `gemini-3.7-flash`; `ENABLE_SEARCH=false` to turn off web search). Redeploy.
4. Local testing: `npx vercel dev` (with `GEMINI_API_KEY` set in a `.env` file). Never commit your key.

## Notes
- The key lives only on the server (`api/suggest.js`), never in the browser.
- AI suggestions can be wrong. Always check the real menu and allergens.

## Cost note
Grounding with Google Search is not available on the Gemini API free tier (as of Oct 2026). With a free key the app still works, but falls back to a no-search answer and labels the menu as unverified. With a paid key, search is billed per search query after a monthly free allowance. Check https://ai.google.dev/gemini-api/docs/pricing before enabling billing, and set a budget alert.
