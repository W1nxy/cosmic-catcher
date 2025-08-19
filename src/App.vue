<template>
  <div class="relative font-sans bg-gray-900 text-white w-screen h-screen overflow-hidden flex flex-col items-center justify-center">
    <div class="absolute top-0 left-0 p-4 z-10 flex items-center space-x-4">
      <h1 class="text-3xl font-bold tracking-wider">Cosmic Catcher</h1>
      <a
        href="https://github.com/W1nxy/cosmic-catcher"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub Profile"
        class="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring focus:ring-yellow-300 rounded"
        title="Open GitHub profile"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.18.08 1.8 1.22 1.8 1.22 1.04 1.78 2.72 1.27 3.38.97.11-.75.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.2-3.09-.12-.29-.52-1.46.11-3.04 0 0 .98-.31 3.2 1.18a11.1 11.1 0 0 1 2.91-.39c.99 0 1.99.13 2.91.39 2.22-1.5 3.2-1.18 3.2-1.18.63 1.58.23 2.75.11 3.04.75.8 1.2 1.83 1.2 3.09 0 4.42-2.71 5.39-5.29 5.67.42.36.8 1.07.8 2.16 0 1.56-.02 2.82-.02 3.2 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
        </svg>
      </a>
    </div>
    <div class="absolute top-0 right-0 p-4 z-10 flex flex-col items-end space-y-1 text-sm sm:text-base">
      <div class="flex space-x-4 text-xl">
        <div>Score: <span class="font-bold text-yellow-300">{{ score }}</span></div>
        <div>Multiplier: <span class="font-bold text-green-400">x{{ multiplier }}</span></div>
        <div>Lives: <span class="font-bold text-red-400">{{ lives }} ❤️</span></div>
      </div>
      <div class="flex space-x-4 text-xs opacity-80">
        <div>Combo: {{ combo }}</div>
        <div>Level: {{ level }}</div>
        <div v-if="highScoreLocal">Local HS: <span class="text-yellow-300 font-semibold">{{ highScoreLocal }}</span></div>
        <div v-if="user">User: <span class="font-semibold text-cyan-300">{{ user.username }}</span></div>
      </div>
      <div v-if="leaderboard.length" class="mt-1 bg-white/5 rounded p-2 max-h-40 overflow-auto w-64 text-xs">
        <div class="font-semibold text-center mb-1">Leaderboard (Top 10)</div>
        <div v-for="(entry,i) in leaderboard" :key="entry.username" class="flex justify-between">
          <span>{{ i+1 }}. {{ entry.username }}</span>
          <span class="text-yellow-300">{{ entry.score }}</span>
        </div>
      </div>
    </div>
    <div ref="gameArea" class="relative w-[800px] h-[600px] bg-black border-2 border-purple-500 rounded-lg shadow-lg shadow-purple-500/50 overflow-hidden">
      <div 
        class="absolute w-24 h-8 bg-blue-500 rounded-t-lg bottom-0 transition-transform duration-75 ease-out"
        :style="{ left: `${player.x}px` }">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">🧺</div>
      </div>
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="absolute text-2xl select-none"
        :style="{ left: `${star.x}px`, top: `${star.y}px`, filter: star.type==='penalty' ? 'hue-rotate(200deg)' : 'none' }">
        <span v-if="star.type==='normal'">⭐</span>
        <span v-else-if="star.type==='bonus'">🌟</span>
        <span v-else>☄️</span>
      </div>
      <div v-if="paused && !isGameOver" class="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
        <div class="text-center">
          <h2 class="text-4xl font-bold mb-4 text-cyan-300">Paused</h2>
          <p class="mb-4 text-sm opacity-80">Press Esc to resume</p>
          <button @click="togglePause" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">Resume</button>
        </div>
      </div>
    </div>
    <div v-if="isGameOver" class="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div class="bg-gray-800 p-10 rounded-xl border border-purple-500 text-center shadow-2xl">
        <h2 class="text-5xl font-bold text-red-500 mb-4">Game Over</h2>
        <p class="text-2xl mb-2">Final Score: <span class="text-yellow-300">{{ score }}</span></p>
        <p v-if="newHighScore" class="text-green-400 font-semibold mb-2">New High Score!</p>
        <button @click="startGame" class="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-xl font-bold transition-all duration-200 transform hover:scale-110">
          Play Again
        </button>
      </div>
    </div>
    <div v-if="!gameStarted" class="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div class="bg-gray-800 p-10 rounded-xl border border-purple-500 text-center shadow-2xl">
        <h2 class="text-5xl font-bold text-cyan-400 mb-4">Cosmic Catcher</h2>
        <p class="text-xl mb-2">Use 'A'/'D' or Arrow Keys to move.</p>
        <p class="text-sm mb-6 opacity-80">Touch / drag on mobile. Esc to pause.</p>
        <div v-if="!user" class="mb-6 space-y-2">
          <div class="flex space-x-2">
            <input v-model="auth.username" placeholder="Username" class="px-2 py-1 rounded bg-gray-700 focus:outline-none w-40" />
            <input v-model="auth.password" type="password" placeholder="Password" class="px-2 py-1 rounded bg-gray-700 focus:outline-none w-40" />
          </div>
          <div class="flex space-x-2 justify-center">
            <button @click="signup" class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm">Sign Up</button>
            <button @click="login" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">Login</button>
          </div>
          <p v-if="authMessage" class="text-xs text-red-400">{{ authMessage }}</p>
        </div>
        <div v-else class="mb-4 text-sm text-green-300">Logged in as {{ user.username }} <button @click="logout" class="ml-2 text-red-400 underline">Logout</button></div>
        <button @click="startGame" class="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-2xl font-bold transition-all duration-200 transform hover:scale-110">
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue';
// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const NORMAL_POINTS = 10;
const BONUS_POINTS = 25;
const PENALTY_POINTS = -15;

// State
const score = ref(0);
const lives = ref(3);
const level = ref(1);
const combo = ref(0);
const multiplier = computed(() => 1 + Math.floor(combo.value / 5));
const isGameOver = ref(false);
const gameStarted = ref(false);
const paused = ref(false);
const newHighScore = ref(false);
const highScoreLocal = ref(Number(localStorage.getItem('highScore') || 0));
const leaderboard = ref([]);

// Auth state
const user = ref(null); // { username, token }
const auth = reactive({ username: '', password: '' });
const authMessage = ref('');

const gameArea = ref(null);
const player = reactive({ x: GAME_WIDTH / 2 - 48, speed: 10 });
const stars = ref([]);
let starId = 0;
const starSpeed = ref(2);
const starSpawnRate = ref(1000);
let gameLoopId = null;
let spawnTimeout = null;
let lastCatchWasMiss = false;

// Web Audio (simple generated beeps)
let audioCtx;
function tone(freq = 440, duration = 0.1, type = 'sine', volume = 0.2) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {}
}
const sounds = {
  catchNormal: () => tone(520, 0.07, 'triangle', 0.25),
  catchBonus: () => { tone(700, 0.06, 'square', 0.2); setTimeout(()=>tone(900,0.06,'square',0.15),60); },
  miss: () => tone(180, 0.25, 'sawtooth', 0.3),
  levelUp: () => { [600,800,1000].forEach((f,i)=> setTimeout(()=>tone(f,0.08,'sine',0.22), i*90)); },
  penalty: () => tone(120,0.3,'square',0.35)
};

function resetGameState() {
  score.value = 0;
  lives.value = 3;
  level.value = 1;
  combo.value = 0;
  stars.value = [];
  player.x = GAME_WIDTH / 2 - 48;
  starSpeed.value = 2;
  starSpawnRate.value = 1000;
  newHighScore.value = false;
}

function startGame() {
  resetGameState();
  isGameOver.value = false;
  gameStarted.value = true;
  paused.value = false;
  cancelAnimationFrame(gameLoopId);
  clearTimeout(spawnTimeout);
  gameLoop();
  spawnStars();
}

function gameLoop() {
  if (isGameOver.value || paused.value) return;
  for (let i = stars.value.length - 1; i >= 0; i--) {
    const star = stars.value[i];
    star.y += starSpeed.value * star.speedMod;
    // Collision
    if (star.y + 24 > GAME_HEIGHT - 32 && star.x > player.x - 12 && star.x < player.x + 96 - 12) {
      stars.value.splice(i,1);
      handleStarCatch(star);
      continue;
    }
    // Missed
    if (star.y > GAME_HEIGHT) {
      stars.value.splice(i,1);
      handleMiss(star);
    }
  }
  gameLoopId = requestAnimationFrame(gameLoop);
}

function randomStarType() {
  const r = Math.random();
  if (r < 0.15) return 'bonus';
  if (r < 0.25) return 'penalty';
  return 'normal';
}

function spawnStars() {
  if (isGameOver.value || paused.value) return;
  stars.value.push({
    id: starId++,
    x: Math.random() * (GAME_WIDTH - 24),
    y: -24,
    type: randomStarType(),
    speedMod: 0.8 + Math.random()*0.5,
  });
  spawnTimeout = setTimeout(spawnStars, starSpawnRate.value);
}

function handleStarCatch(star) {
  lastCatchWasMiss = false;
  if (star.type === 'normal') {
    score.value += NORMAL_POINTS * multiplier.value;
    combo.value++;
    sounds.catchNormal();
  } else if (star.type === 'bonus') {
    score.value += BONUS_POINTS * multiplier.value;
    combo.value += 2;
    sounds.catchBonus();
  } else { // penalty
    score.value = Math.max(0, score.value + PENALTY_POINTS);
    lives.value = Math.max(0, lives.value - 1);
    combo.value = 0; // reset combo
    sounds.penalty();
    if (lives.value <= 0) return endGame();
  }
  maybeLevelUp();
}

function handleMiss(star) {
  // Only penalize on missing non-penalty stars
  if (star.type !== 'penalty') {
    combo.value = 0;
    lives.value -= 1;
    sounds.miss();
    if (lives.value <= 0) {
      endGame();
    }
  }
}

function maybeLevelUp() {
  const nextLevel = Math.floor(score.value / 100) + 1;
  if (nextLevel !== level.value) {
    level.value = nextLevel;
    starSpeed.value += 0.4;
    starSpawnRate.value = Math.max(180, starSpawnRate.value - 70);
    sounds.levelUp();
  }
}

function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(gameLoopId);
  clearTimeout(spawnTimeout);
  // Local high score
  if (score.value > highScoreLocal.value) {
    highScoreLocal.value = score.value;
    localStorage.setItem('highScore', String(score.value));
    newHighScore.value = true;
  }
  // Submit remote high score if logged in
  if (user.value) submitScore();
}

function handleKeyDown(e) {
  if (e.key === 'Escape' && gameStarted.value && !isGameOver.value) {
    togglePause();
    return;
  }
  if (!gameStarted.value || isGameOver.value || paused.value) return;
  if (e.key === 'a' || e.key === 'ArrowLeft') {
    player.x = Math.max(0, player.x - player.speed);
  } else if (e.key === 'd' || e.key === 'ArrowRight') {
    player.x = Math.min(GAME_WIDTH - 96, player.x + player.speed);
  }
}

function togglePause() {
  if (!gameStarted.value || isGameOver.value) return;
  paused.value = !paused.value;
  if (!paused.value) {
    gameLoop();
    spawnStars();
  } else {
    cancelAnimationFrame(gameLoopId);
    clearTimeout(spawnTimeout);
  }
}

// Touch / pointer controls
function handlePointer(e) {
  if (!gameStarted.value || isGameOver.value) return;
  const rect = gameArea.value.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const x = clientX - rect.left;
  player.x = Math.min(Math.max(0, x - 48), GAME_WIDTH - 96);
}

// Auth + API helpers
const API_BASE = '';// relative to Vercel serverless (same origin)
async function api(path, data, opts={}) {
  try {
    const res = await fetch(`${API_BASE}/api/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(user.value?.token ? { Authorization: `Bearer ${user.value.token}` } : {}) },
      body: JSON.stringify(data),
      ...opts
    });
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}
async function signup() {
  authMessage.value = '';
  const r = await api('signup', auth);
  if (r.error) authMessage.value = r.error; else authMessage.value = 'Signup success. You can now login.';
}
async function login() {
  authMessage.value = '';
  const r = await api('login', auth);
  if (r.error) authMessage.value = r.error; else {
    user.value = { username: auth.username, token: r.token };
    localStorage.setItem('session', JSON.stringify(user.value));
    fetchLeaderboard();
  }
}
function logout() {
  user.value = null;
  localStorage.removeItem('session');
}
async function submitScore() {
  if (!user.value) return;
  await api('submit-score', { score: score.value });
  fetchLeaderboard();
}
async function fetchLeaderboard() {
  try {
    const res = await fetch('/api/highscores');
    const data = await res.json();
    if (!data.error) leaderboard.value = data.scores;
  } catch {}
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  gameArea.value.addEventListener('pointerdown', handlePointer);
  gameArea.value.addEventListener('pointermove', e => { if (e.buttons===1) handlePointer(e); });
  const savedSession = localStorage.getItem('session');
  if (savedSession) {
    try { user.value = JSON.parse(savedSession); fetchLeaderboard(); } catch {}
  } else { fetchLeaderboard(); }
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  cancelAnimationFrame(gameLoopId);
  clearTimeout(spawnTimeout);
  if (gameArea.value) {
    gameArea.value.removeEventListener('pointerdown', handlePointer);
  }
});
</script>