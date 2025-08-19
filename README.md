# Cosmic Catcher

Arcade-style Vue 3 mini game: catch falling stars in an ever-accelerating shower. Built with Vite + UnoCSS.

## Repository Description (use for GitHub)
```
Arcade-style Vue 3 mini game: catch falling stars as difficulty scales. Built with Vite + UnoCSS.
```
Copy/paste (or tweak) that as the repo description.

## ✨ Features
- Fast, zero back-end, single-page game
- Progressive difficulty (spawn rate + fall speed increase every 50 points)
- Keyboard controls (A / D or ← / →)
- Simple basket + star collision logic
- Game start + game over modals
- Responsive utility-first styling via UnoCSS
- Custom SVG favicon & GitHub profile link in header

## 🎮 Controls
| Key | Action |
|-----|--------|
| A / ← | Move left |
| D / → | Move right |
| (After Game Over) Click "Play Again" | Restart |

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
- Add sound effects (catch / miss / level up)
- Add pause state (Esc)
- High score persistence using localStorage
- Different star types (bonus / penalty)
- Touch / mobile drag controls
- Add a score multiplier combo system

## 🤝 Contributing
Small project—feel free to open issues or PRs for enhancements. Keep changes focused & documented.

---
Enjoy catching those stars! ⭐
