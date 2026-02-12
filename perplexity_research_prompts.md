# Perplexity Research Brief – WordCraft Hub

**GitHub repo:** https://github.com/IamYordan94/gamehub

**Your task:** Read this entire file, then complete all 4 research items below. Add your findings directly to the `research/` folder in the repo. Create or update each file with your answer. The Cursor AI agent will read these files when building the app.

---

## Project context

WordCraft Hub is a React/TypeScript word game app with two games:
- **LetterMix:** Find words in a scrambled letter string (non-consecutive letters, left-to-right order)
- **WordPool:** Name words that fit category constraints across 6 difficulty levels

We have a word database (2–9 letter words) and need research to implement validation, puzzle generation, daily seeding, and category word lists.

---

## Research item 1 → `research/01-subsequence-validation.md`

**Topic:** Check if a word can be formed from a string by selecting letters in order (non-consecutive). Example: can "TABLE" be formed from "BLETAFORKNOSOP"? Letters must appear left-to-right but don't need to be adjacent.

**Deliver:** Research the algorithm, then write your answer (including copy-paste-ready `canFormWord(sourceString, word) => boolean` in JavaScript/TypeScript) into `research/01-subsequence-validation.md`.

---

## Research item 2 → `research/02-puzzle-solvability.md`

**Topic:** Word puzzle where players find words in a scrambled letter string. Letters are mixed from multiple words (e.g. TABLE + FORK + SPOON → BLETAFORKNOSOP). Need to programmatically ensure every puzzle has at least one valid solution.

**Deliver:** Research the best approach (generate-then-verify vs build-from-words-then-scramble). Provide a JavaScript/TypeScript algorithm to verify solvability or generate solvable puzzles. Write your answer into `research/02-puzzle-solvability.md`.

---

## Research item 3 → `research/03-daily-seeding.md`

**Topic:** Deterministic "random" selection in JavaScript for a daily puzzle game. Every user on the same date must get the same puzzle; each day must be different.

**Deliver:** Research seeded random with date string input (e.g. "2025-02-12") and a helper `getDailyPuzzleIndex(date, totalCount) => number`. Provide copy-paste-ready JavaScript/TypeScript. Write your answer into `research/03-daily-seeding.md`.

---

## Research item 4 → `research/04-word-lists.md`

**Topic:** Curated English word lists for educational word game. Categories: Animals, Food & Cooking, Transportation, Nature & Plants, Occupations, Sports & Activities. Each has 6 difficulty levels (broad → narrow, e.g. Animals → Wild Animals → African Animals → Large African Carnivores). Each level needs 15–100 words.

**Deliver:** Research sources (JSON/CSV/API) or a recommended JSON structure with 1–2 example category hierarchies and real word lists. Write your answer into `research/04-word-lists.md`.

---

## Output locations

| Item | File to create/update |
|------|------------------------|
| 1 | `research/01-subsequence-validation.md` |
| 2 | `research/02-puzzle-solvability.md` |
| 3 | `research/03-daily-seeding.md` |
| 4 | `research/04-word-lists.md` |
