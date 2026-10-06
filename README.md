# Bite Log

A simple restaurant food journal. Log dishes with a 1-5 star rating, a photo and notes. Search a restaurant to see what you loved, found okay, or disliked. Gemini reads your notes and suggests what to order next.

## Features
- Log dishes per restaurant (rating, photo, notes, date)
- Dishes auto-sorted into Loved (4-5★), Okay (3★), Didn't like (1-2★)
- "What should I order?" powered by Google Gemini, using your history and an optional pasted menu
- Works without AI too: if Gemini is unavailable, it shows your top-rated and lowest-rated dishes
- Private: data stays in your browser (localStorage), no accounts

## Tech
HTML, CSS, JavaScript, localStorage, Canvas API, Vercel serverless function (Node.js), Google Gemini API.

## Run / deploy
1. Get a Gemini API key at https://aistudio.google.com/app/apikey
2. Push this folder to GitHub, then import the repo in Vercel (no build settings needed).
3. In Vercel: Settings → Environment Variables → add `GEMINI_API_KEY` (optionally `GEMINI_MODEL`, default `gemini-2.5-flash`). Redeploy.
4. Local testing: `npx vercel dev` (with `GEMINI_API_KEY` set in a `.env` file). Never commit your key.

## Notes
- The key lives only on the server (`api/suggest.js`), never in the browser.
- AI suggestions can be wrong. Always check the real menu and allergens.
