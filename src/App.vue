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
    <div class="absolute top-0 right-0 p-4 z-10 flex flex-col items-end space-y-2 text-sm sm:text-base w-72">
      <div class="flex flex-wrap gap-3 text-lg justify-end">
        <div class="px-2 py-1 rounded bg-white/5 backdrop-blur border border-yellow-400/30">Score <span class="font-bold text-yellow-300">{{ score }}</span></div>
        <div class="px-2 py-1 rounded bg-white/5 backdrop-blur border border-green-400/30">x<span class="font-bold text-green-400">{{ multiplier }}</span></div>
        <div class="px-2 py-1 rounded bg-white/5 backdrop-blur border border-red-400/30">❤️ <span class="font-bold text-red-400">{{ lives }}</span></div>
      </div>
      <div class="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide opacity-80 justify-end">
        <div class="px-2 py-0.5 rounded bg-white/5">Combo {{ combo }}</div>
        <div class="px-2 py-0.5 rounded bg-white/5">Lvl {{ level }}</div>
        <div class="px-2 py-0.5 rounded bg-white/5" v-if="displayHighScore">Best {{ displayHighScore }}</div>
        <div class="px-2 py-0.5 rounded bg-white/5" v-if="user">{{ user.username }}</div>
      </div>
      <div class="group relative w-full">
        <div class="flex items-center justify-between mb-1 text-xs font-semibold text-cyan-300">
          <span>Top 10</span>
          <div class="space-x-2 flex items-center">
            <span v-if="leaderboardLoading" class="animate-pulse text-gray-400">Loading...</span>
            <button @click="manualRefreshLeaderboard" class="px-2 py-0.5 rounded bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300">↻</button>
            <button v-if="leaderboard.length" @click="showRankings=true" class="px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-300">Full</button>
          </div>
        </div>
        <div class="bg-white/5 rounded border border-cyan-400/20 max-h-48 overflow-auto fancy-scroll shadow-inner shadow-cyan-900/40">
          <template v-if="leaderboard.length">
            <div v-for="(entry,i) in leaderboard" :key="entry.username" class="flex justify-between px-2 py-1 text-xs font-mono" :class="entry.username===user?.username ? 'bg-cyan-500/10' : 'odd:bg-white/5'">
              <span class="flex items-center space-x-1">
                <span class="w-4 text-center">{{ i+1 }}</span>
                <span class="truncate max-w-[90px]">{{ entry.username }}</span>
              </span>
              <span class="text-yellow-300">{{ entry.score }}</span>
            </div>
          </template>
          <div v-else class="px-3 py-6 text-center text-[11px] opacity-60">
            <p>No leaderboard data.</p>
            <p class="mt-1">Deploy with Vercel / Upstash.</p>
          </div>
        </div>
      </div>
    </div>
    <div ref="gameArea" class="relative w-[800px] h-[600px] bg-gradient-to-b from-black via-indigo-950 to-black border-2 border-purple-500 rounded-lg shadow-lg shadow-purple-500/50 overflow-hidden">
      <div 
        class="absolute w-24 h-8 bg-blue-500 rounded-t-lg bottom-0 transition-transform duration-75 ease-out"
        :style="{ left: `${player.x}px` }">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">🧺</div>
      </div>
      <div 
        v-for="star in stars" 
        :key="star.id"
        class="absolute select-none"
        :class="star.type === 'penalty' ? 'bomb-sprite' : 'text-2xl'"
        :style="{ left: `${star.x}px`, top: `${star.y}px` }">
        <template v-if="star.type==='normal'">⭐</template>
        <template v-else-if="star.type==='bonus'">🌟</template>
        <template v-else>
          <div class="relative w-8 h-8 flex items-center justify-center">
            <div class="absolute inset-0 rounded-full bg-red-600 animate-pulse shadow-lg shadow-red-700/70 border-2 border-red-300"></div>
            <div class="relative text-[18px]">💣</div>
          </div>
        </template>
      </div>
      <div v-if="paused && !isGameOver" class="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
        <div class="text-center">
          <h2 class="text-4xl font-bold mb-4 text-cyan-300">Paused</h2>
          <p class="mb-4 text-sm opacity-80">Press Esc to resume</p>
          <button @click="togglePause" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">Resume</button>
        </div>
      </div>
      <!-- Combo / Multiplier indicator -->
      <transition name="pop">
        <div v-if="combo >= 5 && !isGameOver && !paused" class="absolute top-2 left-1/2 -translate-x-1/2 bg-white/10 border border-cyan-400/40 backdrop-blur px-4 py-2 rounded-full flex items-center space-x-2 text-sm">
          <span class="text-cyan-300 font-semibold">Combo {{ combo }}</span>
          <span class="text-green-400 font-bold">x{{ multiplier }}</span>
        </div>
      </transition>
      <transition-group name="particle" tag="div">
        <div v-for="p in particles" :key="p.id" class="pointer-events-none absolute text-xs font-bold"
          :style="{ left: p.x+'px', top: p.y+'px', color: p.color, transform: `translate(-50%,-50%) scale(${p.scale})`, opacity: p.opacity }">{{ p.text }}</div>
      </transition-group>
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
    <canvas ref="starfieldCanvas" class="absolute inset-0 w-full h-full opacity-40 pointer-events-none"></canvas>
    <div v-if="!gameStarted" class="absolute inset-0 bg-black/80 flex items-center justify-center z-20 backdrop-blur-sm">
      <div class="bg-gradient-to-br from-gray-900/90 via-purple-900/60 to-cyan-900/40 p-10 rounded-2xl border border-purple-500/60 text-center shadow-2xl w-[760px] max-w-full relative overflow-hidden fancy-auth">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse"></div>
        <h2 class="text-5xl font-bold text-cyan-400 mb-4">Cosmic Catcher</h2>
        <p class="text-xl mb-2">Use 'A'/'D' or Arrow Keys to move.</p>
        <p class="text-sm mb-6 opacity-80">Touch / drag on mobile. Esc to pause.</p>
        <div v-if="!user" class="mb-6 w-[420px] max-w-full">
          <div class="flex mb-3 rounded overflow-hidden border border-purple-600/50">
            <button @click="authMode='login'" :class="authMode==='login' ? activeTab : inactiveTab" class="flex-1 py-2 font-semibold">Login</button>
            <button @click="authMode='signup'" :class="authMode==='signup' ? activeTab : inactiveTab" class="flex-1 py-2 font-semibold">Sign Up</button>
          </div>
          <form @submit.prevent="authMode==='login'? login() : signup()" class="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-4 rounded-xl border border-purple-700/40 shadow-inner shadow-purple-900/40 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2 flex flex-col text-left text-sm">
                <label class="mb-1 font-semibold tracking-wide">Username</label>
                <input v-model="auth.username" required minlength="3" maxlength="16" placeholder="galaxyHunter" class="px-3 py-2 rounded bg-gray-700/70 focus:outline-none focus:ring focus:ring-purple-500/60" />
              </div>
              <div class="col-span-2 flex flex-col text-left text-sm">
                <label class="mb-1 font-semibold tracking-wide flex items-center justify-between">
                  <span>Password</span>
                  <button type="button" @click="showPassword=!showPassword" class="text-cyan-300 text-xs underline">{{ showPassword? 'Hide':'Show' }}</button>
                </label>
                <input :type="showPassword? 'text':'password'" v-model="auth.password" required minlength="6" placeholder="••••••" class="px-3 py-2 rounded bg-gray-700/70 focus:outline-none focus:ring focus:ring-purple-500/60" />
                <div class="h-2 mt-2 rounded bg-gray-700 overflow-hidden">
                  <div :style="{ width: passwordStrength.width, background: passwordStrength.color }" class="h-full transition-all"></div>
                </div>
                <p class="mt-1 text-xs" :class="passwordStrength.textColor">{{ passwordStrength.label }}</p>
              </div>
              <div class="col-span-2 flex items-center space-x-2" v-if="authMode==='signup'">
                <input id="agree" type="checkbox" v-model="acceptedTerms" class="w-4 h-4" required />
                <label for="agree" class="text-xs opacity-80">I accept the cosmic terms</label>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs opacity-70" v-if="authMode==='login'">
              <span>Tip: Use a throwaway password.</span>
              <button type="button" @click="authMode='signup'" class="underline">Need an account?</button>
            </div>
            <div class="pt-2 flex justify-center">
              <button :disabled="submitting" class="relative group px-8 py-2 font-bold rounded-lg overflow-hidden bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                <span class="relative z-10">{{ authMode==='login'? (submitting? 'Logging in...' : 'Login') : (submitting? 'Creating...' : 'Create Account') }}</span>
                <span class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-fuchsia-500/50 to-cyan-500/40 transition-opacity"></span>
              </button>
            </div>
            <p v-if="authMessage" class="text-xs text-center" :class="authError? 'text-red-400':'text-green-400'">{{ authMessage }}</p>
          </form>
        </div>
        <div v-else class="mb-4 text-sm text-green-300">Logged in as {{ user.username }} <button @click="logout" class="ml-2 text-red-400 underline">Logout</button></div>
        <div class="mt-8">
          <button @click="startGame" class="relative group px-14 py-5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 rounded-xl text-2xl font-extrabold tracking-wide drop-shadow-lg hover:shadow-[0_0_20px_#a855f7] transition-transform hover:scale-105">
            <span class="relative z-10">Launch</span>
            <span class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25),transparent)] transition-opacity"></span>
          </button>
        </div>
        <div class="mt-6">
          <button v-if="leaderboard.length" @click="showRankings=true" class="text-xs text-cyan-300 underline">View Full Rankings</button>
        </div>
      </div>
    </div>
    <!-- Rankings Modal -->
    <div v-if="showRankings" class="absolute inset-0 bg-black/80 flex items-center justify-center z-30">
      <div class="bg-gray-900/90 rounded-xl border border-cyan-500/40 p-6 w-[480px] max-h-[80vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-cyan-300">Global Rankings</h3>
          <button @click="showRankings=false" class="text-red-400 hover:text-red-300">✕</button>
        </div>
        <div class="overflow-auto fancy-scroll pr-1">
          <table class="w-full text-sm">
            <thead class="sticky top-0 bg-gray-800/80 backdrop-blur">
              <tr class="text-left">
                <th class="py-2 px-2">#</th>
                <th class="py-2 px-2">Player</th>
                <th class="py-2 px-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry,i) in leaderboardAll" :key="entry.username" :class="entry.username===user?.username ? 'bg-purple-800/40' : 'odd:bg-gray-800/40'">
                <td class="py-1 px-2 font-mono text-xs">{{ i+1 }}</td>
                <td class="py-1 px-2 flex items-center space-x-1">
                  <span v-if="i===0">🥇</span>
                  <span v-else-if="i===1">🥈</span>
                  <span v-else-if="i===2">🥉</span>
                  <span v-else class="w-4"></span>
                  <span>{{ entry.username }}</span>
                </td>
                <td class="py-1 px-2 text-right text-yellow-300 font-semibold">{{ entry.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 text-right text-xs opacity-60">Top {{ leaderboardAll.length }}</div>
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
const displayHighScore = computed(()=> user.value ? Math.max(remoteUserHighScore.value, highScoreLocal.value) : highScoreLocal.value );
const leaderboard = ref([]); // top 10 preview
const leaderboardAll = ref([]); // extended
const remoteUserHighScore = ref(0);
const showRankings = ref(false);
const leaderboardLoading = ref(false);
let leaderboardPollInterval;

// Auth state
const user = ref(null); // { username, token }
const authMode = ref('login');
const showPassword = ref(false);
const submitting = ref(false);
const acceptedTerms = ref(false);
const authError = ref(false);
// Particles for feedback
const particles = ref([]);
let particleId = 0;
function spawnParticle({ x, y, text, color }) {
  particles.value.push({ id: particleId++, x, y, text, color, opacity: 1, scale: 1 });
  const start = performance.now();
  const dur = 600;
  (function anim(t){
    const p = particles.value.find(p=>p.id===particleId-1); // last is fine
    particles.value.forEach(pt => {
      if (pt.id === p?.id) {
        const k = Math.min(1, (performance.now()-start)/dur);
        pt.opacity = 1 - k;
        pt.y -= 0.4;
        pt.scale = 1 + k*0.5;
      }
    });
    if (performance.now()-start < dur) requestAnimationFrame(anim);
    else particles.value = particles.value.filter(p=>p.opacity>0.05);
  })();
}
const auth = reactive({ username: '', password: '' });
const authMessage = ref('');

const gameArea = ref(null);
const starfieldCanvas = ref(null);
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
  const catchX = player.x + 48; // center
  const catchY = GAME_HEIGHT - 60;
  if (star.type === 'normal') {
    score.value += NORMAL_POINTS * multiplier.value;
    combo.value++;
    sounds.catchNormal();
    spawnParticle({ x: catchX, y: catchY, text: `+${NORMAL_POINTS*multiplier.value}`, color: '#facc15' });
  } else if (star.type === 'bonus') {
    score.value += BONUS_POINTS * multiplier.value;
    combo.value += 2;
    sounds.catchBonus();
    spawnParticle({ x: catchX, y: catchY, text: `+${BONUS_POINTS*multiplier.value}!`, color: '#34d399' });
  } else { // penalty
    score.value = Math.max(0, score.value + PENALTY_POINTS);
    lives.value = Math.max(0, lives.value - 1);
    combo.value = 0; // reset combo
    sounds.penalty();
    spawnParticle({ x: catchX, y: catchY, text: `${PENALTY_POINTS}`, color: '#f87171' });
    if (lives.value <= 0) return endGame();
  }
  maybeLevelUp();
  maybeSubmitImprovedScore();
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
    spawnParticle({ x: GAME_WIDTH/2, y: 80, text: `LEVEL ${level.value}`, color: '#7dd3fc' });
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
// Debounced remote submission while playing
let submitTimeout;
function maybeSubmitImprovedScore() {
  if (!user.value) return;
  if (score.value <= remoteUserHighScore.value) return;
  clearTimeout(submitTimeout);
  submitTimeout = setTimeout(async () => {
    await submitScore();
    remoteUserHighScore.value = score.value;
  }, 800);
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
function resetAuthMessages(){ authMessage.value=''; authError.value=false; }
async function signup() {
  if (submitting.value) return; submitting.value=true; resetAuthMessages();
  const r = await api('signup', auth);
  submitting.value=false;
  if (r.error) { authMessage.value = r.error; authError.value=true; }
  else { authMessage.value='Signup success! Please login.'; authMode.value='login'; }
}
async function login() {
  if (submitting.value) return; submitting.value=true; resetAuthMessages();
  const r = await api('login', auth);
  submitting.value=false;
  if (r.error) { authMessage.value=r.error; authError.value=true; }
  else {
    user.value = { username: auth.username, token: r.token };
    localStorage.setItem('session', JSON.stringify(user.value));
    await loadProfile();
    fetchLeaderboard();
    fetchLeaderboardAll();
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
  fetchLeaderboardAll();
}
async function fetchLeaderboard() {
  try {
    leaderboardLoading.value = true;
    const res = await fetch('/api/highscores');
    const data = await res.json();
    if (!data.error) leaderboard.value = data.scores;
  } catch {}
  finally { leaderboardLoading.value = false; }
}
async function fetchLeaderboardAll() {
  try {
    const res = await fetch('/api/highscores-all');
    const data = await res.json();
    if (!data.error) leaderboardAll.value = data.scores;
  } catch {}
}
function manualRefreshLeaderboard(){ fetchLeaderboard(); fetchLeaderboardAll(); }
async function loadProfile() {
  if (!user.value) return;
  try { const r = await api('profile', {}); if (!r.error) remoteUserHighScore.value = r.bestScore || 0; } catch {}
}

const activeTab = 'bg-purple-700/70 text-white';
const inactiveTab = 'bg-gray-800/60 hover:bg-gray-700/60 text-gray-300';

const passwordStrength = computed(()=>{
  const pw = auth.password || '';
  let score=0;
  if (pw.length>=6) score++;
  if (pw.length>=10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const percent = (score/5)*100;
  const palette = [ '#dc2626', '#f97316', '#facc15', '#4ade80', '#34d399' ];
  const labels = ['Very Weak','Weak','Fair','Strong','Elite'];
  return { width: percent+'%', color: palette[score-1]||'#1f2937', label: labels[score-1]||'Too Short', textColor: score>=3? 'text-green-400':'text-red-400' };
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  gameArea.value.addEventListener('pointerdown', handlePointer);
  gameArea.value.addEventListener('pointermove', e => { if (e.buttons===1) handlePointer(e); });
  const savedSession = localStorage.getItem('session');
  if (savedSession) {
    try { user.value = JSON.parse(savedSession); loadProfile(); fetchLeaderboard(); fetchLeaderboardAll(); } catch {}
  } else { fetchLeaderboard(); fetchLeaderboardAll(); }
  startStarfield();
  leaderboardPollInterval = setInterval(()=> fetchLeaderboard(), 15000);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  cancelAnimationFrame(gameLoopId);
  clearTimeout(spawnTimeout);
  if (gameArea.value) {
    gameArea.value.removeEventListener('pointerdown', handlePointer);
  }
  clearInterval(leaderboardPollInterval);
});

// Fancy starfield background canvas
function startStarfield(){
  const canvas = starfieldCanvas.value; if (!canvas) return; const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
  resize(); window.addEventListener('resize', resize);
  const starsArr = Array.from({length: 160}, () => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, z: Math.random()*0.8 + 0.2, t: Math.random()*360 }));
  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (const s of starsArr){
      s.y += 0.25 * s.z; if (s.y > canvas.height) { s.y = 0; s.x = Math.random()*canvas.width; }
      s.t += 2; const alpha = 0.5 + 0.5*Math.sin(s.t * Math.PI/180);
      ctx.fillStyle = `rgba(${180+60*s.z},${180+80*s.z},255,${alpha})`;
      ctx.fillRect(s.x, s.y, s.z*2, s.z*2);
    }
    requestAnimationFrame(loop);
  }
  loop();
}
</script>