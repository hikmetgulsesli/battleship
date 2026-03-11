/**
 * Savaş Gemileri (Battleship) Game
 * Main game logic for the naval combat game
 */

// Ship definitions: name, size, count
const SHIPS = [
  { name: 'Carrier', size: 5, count: 1 },
  { name: 'Battleship', size: 4, count: 1 },
  { name: 'Cruiser', size: 3, count: 2 },
  { name: 'Destroyer', size: 2, count: 1 }
];

const GRID_SIZE = 10;

// Initialize grids
function initGrid(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  
  grid.innerHTML = '';
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.dataset.coord = `${String.fromCharCode(65 + col)}${row + 1}`;
      grid.appendChild(cell);
    }
  }
}

// Initialize the game
function initGame() {
  initGrid('player-grid');
  initGrid('enemy-grid');
  console.log('Savaş Gemileri initialized!');
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);

// Export for testing
export { initGrid, SHIPS, GRID_SIZE };