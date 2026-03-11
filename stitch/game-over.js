/**
 * Game Over Screens Component
 * Renders Victory and Defeat screens based on game result
 */

import { getGameState, initGame, getFleetStatus, GRID_SIZE, CELL_STATE } from './game.js';

/**
 * Calculate game statistics
 * @returns {Object} Statistics object with total shots, hits, misses, and percentage
 */
function calculateStats(shooter) {
  const state = getGameState();
  const shots = shooter === 'player' ? state.playerShots : state.enemyShots;
  
  const total = shots.length;
  const hits = shots.filter(s => s.hit).length;
  const misses = total - hits;
  const percentage = total > 0 ? Math.round((hits / total) * 100) : 0;
  
  return { total, hits, misses, percentage };
}

/**
 * Render a grid for game over display
 * @param {string[][]} board - The game board
 * @param {boolean} showShips - Whether to show ship positions
 * @returns {string} HTML string
 */
function renderGameOverGrid(board, showShips) {
  let html = '';
  for (let row = 0; row < GRID_SIZE; row++) {
    html += '<div class="flex">';
    html += `<div class="grid-header">${String.fromCharCode(65 + row)}</div>`;
    for (let col = 0; col < GRID_SIZE; col++) {
      const cellState = board[row][col];
      let cellClass = 'bg-blue-900/40';
      let content = '';
      
      if (cellState === CELL_STATE.HIT) {
        cellClass = 'bg-red-500 flex items-center justify-center';
        content = '<span class="text-white font-bold text-xs">X</span>';
      } else if (cellState === CELL_STATE.MISS) {
        cellClass = 'bg-slate-600 flex items-center justify-center';
        content = '<span class="text-white text-xs opacity-50">O</span>';
      } else if (cellState === CELL_STATE.SHIP && showShips) {
        cellClass = 'bg-slate-700 border border-slate-500';
      }
      
      html += `<div class="grid-cell ${cellClass}">${content}</div>`;
    }
    html += '</div>';
  }
  return html;
}

/**
 * Render Victory Screen
 * @returns {string} HTML string for victory screen
 */
export function renderVictoryScreen() {
  const state = getGameState();
  const playerStats = calculateStats('player');
  const playerFleet = getFleetStatus('player');
  const enemyFleet = getFleetStatus('enemy');
  
  const playerGridHtml = renderGameOverGrid(state.playerBoard, true);
  const enemyGridHtml = renderGameOverGrid(state.enemyBoard, true);
  
  return `
    <div id="victory-screen" class="fixed inset-0 bg-background-dark flex flex-col z-50 overflow-y-auto">
      <!-- Header -->
      <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/20 px-10 py-4 bg-slate-900/80 backdrop-blur-sm sticky top-0">
        <div class="flex items-center gap-4 text-slate-100">
          <span class="material-symbols-outlined text-primary text-3xl">directions_boat</span>
          <h2 class="text-xl font-bold leading-tight tracking-[-0.015em]">Savaş Gemileri</h2>
        </div>
      </header>
      
      <!-- Main Content -->
      <div class="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
        <!-- Victory Banner -->
        <div class="text-center mb-8">
          <div class="mx-auto mb-4 text-primary">
            <span class="material-symbols-outlined text-7xl" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
          </div>
          <h1 class="text-primary text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase drop-shadow-lg">Zafer!</h1>
          <h2 class="text-slate-300 text-lg md:text-xl font-medium mt-3 uppercase tracking-widest">Düşman Filosu Yok Edildi</h2>
        </div>
        
        <!-- Statistics -->
        <div class="flex flex-wrap gap-4 justify-center mb-8">
          <div class="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-primary/20 shadow-sm backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-slate-400">my_location</span>
              <p class="text-slate-400 text-sm font-medium uppercase tracking-wider">Atış Sayısı</p>
            </div>
            <p class="text-primary tracking-tight text-3xl font-bold leading-tight">${playerStats.total}</p>
          </div>
          <div class="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-primary/20 shadow-sm backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-green-400">crisis_alert</span>
              <p class="text-slate-400 text-sm font-medium uppercase tracking-wider">İsabet</p>
            </div>
            <p class="text-slate-100 tracking-tight text-3xl font-bold leading-tight">${playerStats.hits}</p>
          </div>
          <div class="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-primary/20 shadow-sm backdrop-blur-sm">
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-red-400">water_drop</span>
              <p class="text-slate-400 text-sm font-medium uppercase tracking-wider">Karavana</p>
            </div>
            <p class="text-slate-100 tracking-tight text-3xl font-bold leading-tight">${playerStats.misses}</p>
          </div>
          <div class="flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-primary/20 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div class="flex items-center gap-2 mb-1 z-10 relative">
              <span class="material-symbols-outlined text-primary">percent</span>
              <p class="text-slate-400 text-sm font-medium uppercase tracking-wider">İsabet Oranı</p>
            </div>
            <p class="text-primary tracking-tight text-3xl font-bold leading-tight z-10 relative">${playerStats.percentage}%</p>
            <div class="absolute right-[-20px] bottom-[-20px] w-28 h-28 rounded-full border-8 border-primary/20 z-0"></div>
            <div class="absolute right-[-20px] bottom-[-20px] w-28 h-28 rounded-full border-8 border-primary border-t-transparent border-l-transparent z-0 transform rotate-45"></div>
          </div>
        </div>
        
        <!-- Grids -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <!-- Player Fleet -->
          <div class="flex flex-col gap-4">
            <h3 class="text-xl font-bold leading-tight tracking-tight text-slate-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">anchor</span> Senin Filon
            </h3>
            <div class="w-full aspect-square bg-slate-800/80 rounded-xl border-2 border-slate-700 p-3 grid grid-cols-10 grid-rows-10 gap-0.5 shadow-inner relative overflow-hidden">
              <div class="absolute inset-0 pointer-events-none opacity-10" style="background-image: linear-gradient(#f4c025 1px, transparent 1px), linear-gradient(90deg, #f4c025 1px, transparent 1px); background-size: 10% 10%;"></div>
              ${playerGridHtml}
            </div>
          </div>
          
          <!-- Enemy Fleet (Destroyed) -->
          <div class="flex flex-col gap-4">
            <h3 class="text-xl font-bold leading-tight tracking-tight text-slate-100 flex items-center gap-2">
              <span class="material-symbols-outlined text-red-400">skull</span> Düşman Filosu (Yok Edildi)
            </h3>
            <div class="w-full aspect-square bg-slate-800/80 rounded-xl border-2 border-primary/50 p-3 grid grid-cols-10 grid-rows-10 gap-0.5 shadow-[0_0_15px_rgba(244,192,37,0.2)] relative overflow-hidden">
              <div class="absolute inset-0 pointer-events-none opacity-10" style="background-image: linear-gradient(#f4c025 1px, transparent 1px), linear-gradient(90deg, #f4c025 1px, transparent 1px); background-size: 10% 10%;"></div>
              ${enemyGridHtml}
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex-wrap gap-4 flex justify-center p-6 border-t border-primary/10">
          <button id="play-again-btn" class="flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-primary text-slate-900 text-lg font-bold leading-normal tracking-wide shadow-lg hover:bg-amber-400 transition-all hover:scale-105">
            <span class="material-symbols-outlined mr-2">replay</span>
            <span class="truncate">Tekrar Oyna</span>
          </button>
          <button id="home-btn" class="flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-slate-800 text-white border-2 border-slate-700 text-lg font-bold leading-normal tracking-wide hover:bg-slate-700 hover:border-slate-600 transition-all">
            <span class="material-symbols-outlined mr-2">home</span>
            <span class="truncate">Ana Menü</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Defeat Screen
 * @returns {string} HTML string for defeat screen
 */
export function renderDefeatScreen() {
  const state = getGameState();
  const enemyStats = calculateStats('enemy');
  const playerFleet = getFleetStatus('player');
  const enemyFleet = getFleetStatus('enemy');
  
  const playerGridHtml = renderGameOverGrid(state.playerBoard, true);
  const enemyGridHtml = renderGameOverGrid(state.enemyBoard, true);
  
  return `
    <div id="defeat-screen" class="fixed inset-0 bg-background-dark flex flex-col z-50 overflow-y-auto">
      <!-- Header -->
      <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-red-900/30 px-10 py-4 bg-slate-900/80 backdrop-blur-sm sticky top-0">
        <div class="flex items-center gap-4 text-slate-100">
          <span class="material-symbols-outlined text-red-500 text-3xl">directions_boat</span>
          <h2 class="text-xl font-bold leading-tight tracking-[-0.015em]">Savaş Gemileri</h2>
        </div>
      </header>
      
      <!-- Main Content -->
      <div class="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8">
        <!-- Defeat Banner -->
        <div class="text-center mb-8">
          <div class="mx-auto mb-4 text-red-500/80">
            <span class="material-symbols-outlined text-7xl">skull</span>
          </div>
          <h1 class="text-red-500 text-5xl md:text-7xl font-black leading-tight tracking-tight uppercase">Yenilgi!</h1>
          <h2 class="text-slate-400 text-lg md:text-xl font-medium mt-3 uppercase tracking-widest">Düşman donanması galip geldi.</h2>
        </div>
        
        <!-- Statistics -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="flex flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <p class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Toplam Atış</p>
            <p class="text-slate-100 text-3xl font-bold">${enemyStats.total}</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <p class="text-slate-400 text-sm font-semibold uppercase tracking-wider">İsabet</p>
            <p class="text-emerald-400 text-3xl font-bold">${enemyStats.hits}</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
            <p class="text-slate-400 text-sm font-semibold uppercase tracking-wider">Karavana</p>
            <p class="text-red-400 text-3xl font-bold">${enemyStats.misses}</p>
          </div>
          <div class="flex flex-col gap-2 rounded-xl p-5 bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
            <div class="absolute right-[-20%] top-[-20%] w-24 h-24 rounded-full border-8 border-blue-500/20 flex items-center justify-center opacity-50 pointer-events-none"></div>
            <p class="text-slate-400 text-sm font-semibold uppercase tracking-wider">İsabet Oranı</p>
            <p class="text-blue-400 text-3xl font-bold">%${enemyStats.percentage}</p>
          </div>
        </div>
        
        <!-- Grids -->
        <div class="flex flex-col lg:flex-row w-full gap-8 mb-8">
          <!-- Player Grid -->
          <div class="flex-1 flex flex-col gap-4 items-center">
            <h2 class="text-lg font-semibold text-slate-300 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">directions_boat</span> Senin Filon
            </h2>
            <div class="w-full max-w-[400px] aspect-square bg-slate-800/80 rounded-xl border-2 border-slate-700 p-3 grid grid-cols-10 grid-rows-10 gap-0.5 shadow-lg relative overflow-hidden">
              ${playerGridHtml}
            </div>
          </div>
          
          <!-- Enemy Grid -->
          <div class="flex-1 flex flex-col gap-4 items-center">
            <h2 class="text-lg font-semibold text-slate-300 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">radar</span> Düşman Filosu (İfşa Edildi)
            </h2>
            <div class="w-full max-w-[400px] aspect-square bg-slate-800/80 rounded-xl border-2 border-red-500/50 p-3 grid grid-cols-10 grid-rows-10 gap-0.5 shadow-lg relative overflow-hidden opacity-90">
              ${enemyGridHtml}
            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex justify-center mt-auto pb-8">
          <div class="flex flex-col sm:flex-row flex-1 gap-4 px-4 w-full max-w-[600px] justify-center">
            <button id="play-again-btn" class="flex items-center justify-center gap-2 rounded-xl h-14 px-8 bg-primary hover:bg-amber-400 transition-colors text-slate-900 text-lg font-bold tracking-wide shadow-lg shadow-primary/20 grow">
              <span class="material-symbols-outlined">replay</span>
              <span>Tekrar Oyna</span>
            </button>
            <button id="home-btn" class="flex items-center justify-center gap-2 rounded-xl h-14 px-8 bg-slate-700 hover:bg-slate-600 transition-colors text-slate-100 border border-slate-600 text-lg font-bold tracking-wide shadow-sm grow">
              <span class="material-symbols-outlined">home</span>
              <span>Ana Menü</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show the appropriate game over screen
 */
export function showGameOverScreen() {
  const state = getGameState();
  const container = document.getElementById('game-over-container');
  
  if (!container) return;
  
  // Clear any existing screen
  container.innerHTML = '';
  
  // Render the appropriate screen
  if (state.winner === 'player') {
    container.innerHTML = renderVictoryScreen();
  } else {
    container.innerHTML = renderDefeatScreen();
  }
  
  // Add event listeners
  const playAgainBtn = document.getElementById('play-again-btn');
  const homeBtn = document.getElementById('home-btn');
  
  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      container.innerHTML = '';
      resetGame();
    });
  }
  
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      container.innerHTML = '';
      resetGame();
    });
  }
}

/**
 * Reset game and return to setup
 */
function resetGame() {
  initGame();
  
  // Dispatch event to notify main game to re-render
  window.dispatchEvent(new CustomEvent('gameReset', { detail: { phase: 'setup' } }));
}
