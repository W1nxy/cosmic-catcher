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
    <div class="absolute top-0 right-0 p-4 z-10 flex space-x-6 text-xl">
      <div>Score: <span class="font-bold text-yellow-300">{{ score }}</span></div>
      <div>Lives: <span class="font-bold text-red-400">{{ lives }} ❤️</span></div>
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
        class="absolute text-2xl"
        :style="{ left: `${star.x}px`, top: `${star.y}px` }">
        ⭐
      </div>
    </div>
    <div v-if="isGameOver" class="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div class="bg-gray-800 p-10 rounded-xl border border-purple-500 text-center shadow-2xl">
        <h2 class="text-5xl font-bold text-red-500 mb-4">Game Over</h2>
        <p class="text-2xl mb-2">Final Score: <span class="text-yellow-300">{{ score }}</span></p>
        <button @click="startGame" class="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-xl font-bold transition-all duration-200 transform hover:scale-110">
          Play Again
        </button>
      </div>
    </div>
    <div v-if="!gameStarted" class="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
      <div class="bg-gray-800 p-10 rounded-xl border border-purple-500 text-center shadow-2xl">
        <h2 class="text-5xl font-bold text-cyan-400 mb-4">Cosmic Catcher</h2>
        <p class="text-xl mb-6">Use 'A'/'D' or Arrow Keys to move.</p>
        <button @click="startGame" class="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-2xl font-bold transition-all duration-200 transform hover:scale-110">
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue';
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const score = ref(0);
const lives = ref(3);
const isGameOver = ref(false);
const gameStarted = ref(false);
const gameArea = ref(null);
const player = reactive({
  x: GAME_WIDTH / 2 - 48,
  speed: 10,
});
const stars = ref([]);
let starId = 0;
let starSpeed = ref(2);
let starSpawnRate = ref(1000);
let gameLoopId = null;
function startGame() {
  score.value = 0;
  lives.value = 3;
  isGameOver.value = false;
  gameStarted.value = true;
  stars.value = [];
  player.x = GAME_WIDTH / 2 - 48;
  starSpeed.value = 2;
  starSpawnRate.value = 1000;
  gameLoop();
  spawnStars();
}
function gameLoop() {
  if (isGameOver.value) return;
  stars.value.forEach((star, index) => {
    star.y += starSpeed.value;
    if (
      star.y + 24 > GAME_HEIGHT - 32 &&
      star.x > player.x - 12 &&
      star.x < player.x + 96 - 12
    ) {
      stars.value.splice(index, 1);
      score.value += 10;
      if (score.value % 50 === 0) {
        starSpeed.value += 0.5;
        starSpawnRate.value = Math.max(200, starSpawnRate.value - 100);
      }
    }
    if (star.y > GAME_HEIGHT) {
      stars.value.splice(index, 1);
      lives.value -= 1;
      if (lives.value <= 0) {
        endGame();
      }
    }
  });
  gameLoopId = requestAnimationFrame(gameLoop);
}
function spawnStars() {
  if (isGameOver.value) return;
  stars.value.push({
    id: starId++,
    x: Math.random() * (GAME_WIDTH - 24),
    y: -24,
  });
  setTimeout(spawnStars, starSpawnRate.value);
}
function endGame() {
  isGameOver.value = true;
  cancelAnimationFrame(gameLoopId);
}
function handleKeyDown(e) {
  if (!gameStarted.value || isGameOver.value) return;
  if (e.key === 'a' || e.key === 'ArrowLeft') {
    player.x = Math.max(0, player.x - player.speed);
  } else if (e.key === 'd' || e.key === 'ArrowRight') {
    player.x = Math.min(GAME_WIDTH - 96, player.x + player.speed);
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  cancelAnimationFrame(gameLoopId);
});
</script>