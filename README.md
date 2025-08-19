# Cosmic Catcher

Arcade-style Vue 3 mini game: catch falling stars in an ever-accelerating shower. Built with Vite + UnoCSS.

## ✨ Features
- Fast single-page Vue 3 game
- Progressive difficulty (dynamic fall speed & spawn rate per level)
- Multiple star types: normal (⭐), bonus (🌟), penalty (☄️)
- Combo & multiplier system (x increases every 5 successful catches)
- Sound effects (catch / bonus / penalty / miss / level up) via Web Audio API
- Pause / resume with Esc
- Local high score persistence (localStorage)
- Optional login (username / password) + global leaderboard (Upstash Redis)
- Touch / drag controls for mobile / pointer devices
- Game start, pause and game over overlays
- Responsive utility-first styling via UnoCSS
- GitHub link + lightweight serverless API routes

## 🎮 Controls
| Input | Action |
|-------|--------|
| A / ← | Move left |
| D / → | Move right |
| Esc | Pause / Resume |
| Touch / Drag | Move basket |
| Play Again Button | Restart after game over |

## 🧱 Tech Stack
- [Vue 3](https://vuejs.org/) (script setup API)
- [Vite](https://vitejs.dev/) for dev + build
- [UnoCSS](https://github.com/unocss/unocss) utility-first styling + reset

## 🚀 Quick Start
```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Production build (outputs to dist/)
npm run build

# Preview built assets (after build)
npm run preview
```
The dev server URL is typically: http://localhost:5173 (Vite will print the exact URL).

## 📁 Project Structure
```
cosmic-catcher/
  index.html          # Entry HTML (mount point + favicon links)
  package.json        # Scripts & dependencies
  vite.config.js      # Vite + UnoCSS configuration
  public/
    favicon.ico
    favicon.svg       # Custom cosmic favicon
  src/
    main.js           # Vue mount + UnoCSS imports
    App.vue           # Game logic & UI
```

## 🛠 Customize
| What | Where | Notes |
|------|-------|-------|
| Game area size | `App.vue` constants `GAME_WIDTH`, `GAME_HEIGHT` | Adjust collision math if you change dimensions heavily |
| Star spawn rate logic | `spawnStars()` + difficulty in `gameLoop()` | Tweak thresholds / increments |
| Styling | Utility classes in template | UnoCSS presetUno active |
| GitHub link | Header `<a>` in `App.vue` | Replace with your own profile |

## 🧪 Ideas / Next Steps
- Particles / visual flair for catches
- Power-ups (slow time, shield, magnet)
- Accessibility: reduced motion toggle & ARIA live updates
- PWA installability / offline assets
- Server-side validation / stronger password hashing (bcrypt / argon2 via edge runtime or server functions)

## 🌐 Leaderboard & Auth (Upstash Redis + Vercel)

The project includes simple serverless API routes (Node style) under `api/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/signup` | POST | Create user (stores SHA-256 hash) |
| `/api/login` | POST | Authenticate & returns a naive session token |
| `/api/submit-score` | POST | Submit new score (stores only if higher) |
| `/api/highscores` | GET | Fetch top 10 global scores |

NOTE: Password hashing here is for demo only. For production, replace with a stronger hashing strategy (bcrypt, argon2) in a secure environment.

### 1. Provision Upstash Redis
1. Create an account at https://upstash.com
2. Create a new Redis database (select Region close to Vercel deployment)
3. Copy the REST URL and REST Token.

### 2. Deploy to Vercel
1. Push this repo to GitHub.
2. Import the project in Vercel ("Add New... > Project").
3. Framework Preset: Vite.
4. Add Environment Variables:
   - `UPSTASH_REDIS_REST_URL` = (your Upstash REST URL)
   - `UPSTASH_REDIS_REST_TOKEN` = (your Upstash REST token)
5. (Optional) Add `NODE_OPTIONS=--experimental-global-webcrypto` if using an older Node runtime without global crypto (Node 18+ already has it).
6. Deploy.

### 3. Test Endpoints (locally)
When running `npm run dev`, the API route support depends on adapter (Vite dev alone won't run Node serverless endpoints). For local testing you can:
1. Use Vercel CLI: `npm i -g vercel` then `vercel dev` (will serve `/api/*`).
2. Or deploy & test against the deployed URLs directly.

### 4. Example cURL Calls
```
# Signup
curl -X POST https://your-app.vercel.app/api/signup -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}'

# Login
curl -X POST https://your-app.vercel.app/api/login -H 'Content-Type: application/json' \
  -d '{"username":"alice","password":"secret"}'

# Submit Score (replace TOKEN)
curl -X POST https://your-app.vercel.app/api/submit-score -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' -d '{"score":420}'

# High Scores
curl https://your-app.vercel.app/api/highscores
```

### 5. Security Considerations
- Demo token format is reversible & not signed; replace with JWT or opaque random ID referencing a session.
- Rate-limit signup & login endpoints (Upstash has rate limit options or add logic via tokens/IP).
- Use stronger password hashing.
- Add input validation & length constraints.

## 🔊 Sound System
Simple oscillators (Web Audio API) generate short tones for events:
| Event | Tone(s) |
|-------|---------|
| Normal catch | 520Hz triangle |
| Bonus catch | 700Hz + 900Hz square sequence |
| Penalty catch | 120Hz square |
| Miss | 180Hz sawtooth |
| Level up | 600/800/1000Hz ascending |

Feel free to swap with samples for richer audio.

## 🤝 Contributing
Small project—feel free to open issues or PRs for enhancements. Keep changes focused & documented.

---
Enjoy catching those stars! ⭐
