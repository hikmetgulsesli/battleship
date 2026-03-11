/**
 * Game Over Screens Component
 * Renders Victory and Defeat screens based on game result
 */

import { getGameState, initGame, getFleetStatus, GRID_SIZE, CELL_STATE } from './game.js';

/**
 * Calculate game statistics for the shooter
 * @param {string} shooter - 'player' or 'enemy'
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
    html += '<div class="grid-row">';
    for (let col = 0; col < GRID_SIZE; col++) {
      const cellState = board[row][col];
      let cellClass = 'cell-empty';
      let content = '';
      
      if (cellState === CELL_STATE.HIT) {
        cellClass = 'cell-hit';
        content = 'X';
      } else if (cellState === CELL_STATE.MISS) {
        cellClass = 'cell-miss';
        content = 'O';
      } else if (cellState === CELL_STATE.SHIP && showShips) {
        cellClass = 'cell-ship';
      }
      
      html += `<div class="grid-cell ${cellClass}">${content}</div>`;
    }
    html += '</div>';
  }
  return html;
}

/**
 * Show the appropriate game over screen
 */
export function showGameOverScreen() {
  const state = getGameState();
  
  // Create or get container
  let container = document.getElementById('game-over-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'game-over-container';
    document.body.appendChild(container);
  }
  
  // Calculate stats
  const playerStats = calculateStats('player');
  const enemyStats = calculateStats('enemy');
  
  // Render the appropriate screen
  if (state.winner === 'player') {
    container.innerHTML = renderVictoryScreen(playerStats, state);
  } else {
    container.innerHTML = renderDefeatScreen(enemyStats, state);
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
 * Render Victory Screen
 * @param {Object} playerStats - Player statistics
 * @param {Object} state - Game state
 * @returns {string} HTML string for victory screen
 */
function renderVictoryScreen(playerStats, state) {
  const playerGridHtml = renderGameOverGrid(state.playerBoard, true);
  const enemyGridHtml = renderGameOverGrid(state.enemyBoard, true);
  
  return `
    <div id="victory-screen" class="game-over-screen">
      <header class="go-header">
        <div class="logo">
          <span class="material-symbols-outlined logo-icon">sailing</span>
          <h1>Savaş Gemileri</h1>
        </div>
      </header>
      
      <main class="go-main">
        <div class="go-banner victory">
          <span class="material-symbols-outlined go-icon">emoji_events</span>
          <h2>Zafer!</h2>
          <p>Düşman Filosu Yok Edildi</p>
        </div>
        
        <div class="go-stats">
          <div class="stat-card">
            <span class="material-symbols-outlined">my_location</span>
            <p class="stat-label">Atış Sayısı</p>
            <p class="stat-value">${playerStats.total}</p>
          </div>
          <div class="stat-card">
            <span class="material-symbols-outlined stat-hit">crisis_alert</span>
            <p class="stat-label">İsabet</p>
            <p class="stat-value">${playerStats.hits}</p>
          </div>
          <div class="stat-card">
            <span class="material-symbols-outlined stat-miss">water_drop</span>
            <p class="stat-label">Karavana</p>
            <p class="stat-value">${playerStats.misses}</p>
          </div>
          <div class="stat-card">
            <span class="material-symbols-outlined">percent</span>
            <p class="stat-label">İsabet Oranı</p>
            <p class="stat-value stat-primary">${playerStats.percentage}%</p>
          </div>
        </div>
        
        <div class="go-grids">
          <div class="go-grid">
            <h3>
              <span class="material-symbols-outlined">anchor</span>
              Senin Filon
            </h3>
            <div class="grid-container">${playerGridHtml}</div>
          </div>
          <div class="go-grid">
            <h3>
              <span class="material-symbols-outlined">skull</span>
              Düşman Filosu
            </h3>
            <div class="grid-container enemy">${enemyGridHtml}</div>
          </div>
        </div>
        
        <div class="go-actions">
          <button id="play-again-btn" class="btn btn-primary">
            <span class="material-symbols-outlined">replay</span>
            Tekrar Oyna
          </button>
          <button id="home-btn" class="btn btn-secondary">
            <span class="material-symbols-outlined">home</span>
            Ana Menü
          </button>
        </div>
      </main>
    </div>
  `;
}

/**
 * Render Defeat Screen
 * @param {Object} enemyStats - Enemy statistics (player's perspective)
 * @param {Object} state - Game state
 * @returns {string} HTML string for defeat screen
 */
function renderDefeatScreen(enemyStats, state) {
  const playerGridHtml = renderGameOverGrid(state.playerBoard, true);
  const enemyGridHtml = renderGameOverGrid(state.enemyBoard, true);
  
  return `
    <div id="defeat-screen" class="game-over-screen">
      <header class="go-header defeat">
        <div class="logo">
          <span class="material-symbols-outlined logo-icon">sailing</span>
          <h1>Savaş Gemileri</h1>
        </div>
      </header>
      
      <main class="go-main">
        <div class="go-banner defeat">
          <span class="material-symbols-outlined go-icon">skull</span>
          <h2>Yenilgi!</h2>
          <p>Düşman donanması galip geldi.</p>
        </div>
        
        <div class="go-stats">
          <div class="stat-card">
            <span class="material-symbols-outlined">my_location</span>
            <p class="stat-label">Toplam Atış</p>
            <p class="stat-value">${enemyStats.total}</p>
          </div>
          <div class="stat-card">
            <span class="material-symbols-outlined stat-hit">crisis_alert</span>
            <p class="stat-label">İsabet</p>
            <p class="stat-value">${enemyStats.hits}</p>
          </div>
          <div class="stat-card">
            <span class="material-symbols-outlined stat-miss">water_drop</span>
            <p class="stat-label">Karavana</p>
            <p class="stat-value">${enemyStats.misses}</p>
          </div>
          <div class="stat-card">
            <span class="material-symbols-outlined">percent</span>
            <p class="stat-label">İsabet Oranı</p>
            <p class="stat-value">${enemyStats.percentage}%</p>
          </div>
        </div>
        
        <div class="go-grids two-column">
          <div class="go-grid">
            <h3>
              <span class="material-symbols-outlined">directions_boat</span>
              Senin Filon
            </h3>
            <div class="grid-container">${playerGridHtml}</div>
          </div>
          <div class="go-grid">
            <h3>
              <span class="material-symbols-outlined">radar</span>
              Düşman Filosu
            </h3>
            <div class="grid-container enemy">${enemyGridHtml}</div>
          </div>
        </div>
        
        <div class="go-actions">
          <button id="play-again-btn" class="btn btn-primary">
            <span class="material-symbols-outlined">replay</span>
            Tekrar Oyna
          </button>
          <button id="home-btn" class="btn btn-secondary">
            <span class="material-symbols-outlined">home</span>
            Ana Menü
          </button>
        </div>
      </main>
    </div>
  `;
}

/**
 * Reset game and return to setup
 */
function resetGame() {
  // Reload the page to reset everything
  window.location.reload();
}