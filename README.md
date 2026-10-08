# Bite.ai

A premium, smart dining journal and food recommendation app. Log dishes with a 1-5 star rating, photo, and personal tasting notes. Search restaurants to view your taste profile or discover personalized menu recommendations powered by Bite.ai.

## Features
- Log dishes per restaurant (rating, photo, notes, date)
- Automatic sorting into Loved (4-5★), Okay (3★), and Didn't like (1-2★)
- **Bite.ai Recommendations**: Powered by Bite.ai (Google Gemini API with Grounding Search), Bite.ai scans live restaurant menus online and cross-references them with your taste profile to suggest ideal dishes to try next.
- Fallback intelligence: Works offline or without AI by generating dish breakdowns based on your saved history.
- Private & Fast: Data stays local in your browser (`localStorage`).

## Tech
HTML5, Modern CSS (Glassmorphism, View Transitions), JavaScript, Canvas API, Vercel Serverless Functions, Bite.ai Engine (Google Gemini API with Search Grounding).

## Setup & Deployment
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Deploy this repository to Vercel.
3. Configure the `GEMINI_API_KEY` environment variable in Vercel settings.
4. Run locally with `npx vercel dev`.
