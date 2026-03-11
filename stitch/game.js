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

// Game phases
const PHASES = {
  SETUP: 'SETUP',
  BATTLE: 'BATTLE',
  GAMEOVER: 'GAMEOVER'
};

// Cell states
const CELL_STATE = {
  EMPTY: 'empty',
  SHIP: 'ship',
  HIT: 'hit',
  MISS: 'miss'
};

/**
 * Creates an empty 10x10 grid
 * @returns {string[][]} 2D array of cell states
 */
function createEmptyGrid() {
  return Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill(CELL_STATE.EMPTY)
  );
}

/**
 * Creates initial game state
 * @returns {Object} Initial game state
 */
function createInitialState() {
  return {
    phase: PHASES.SETUP,
    currentPlayerTurn: 'player',
    playerBoard: createEmptyGrid(),
    enemyBoard: createEmptyGrid(),
    playerShips: [],
    enemyShips: [],
    playerShots: [],
    enemyShots: [],
    winner: null,
    turnNumber: 1
  };
}

// Game state singleton
let gameState = createInitialState();

/**
 * Get current game state
 * @returns {Object} Current game state
 */
function getGameState() {
  return gameState;
}

/**
 * Initialize/Reset game to initial state
 * @returns {Object} The new game state
 */
function initGame() {
  gameState = createInitialState();
  return gameState;
}

/**
 * Start the battle phase
 * @returns {Object} Updated game state
 * @throws {Error} If game is not in SETUP phase
 */
function startBattle() {
  if (gameState.phase !== PHASES.SETUP) {
    throw new Error('Cannot start battle: game is not in SETUP phase');
  }
  
  if (gameState.playerShips.length !== 5) {
    throw new Error('Cannot start battle: all 5 ships must be placed');
  }
  
  // Place AI/computer ships automatically only if not already placed
  if (gameState.enemyShips.length === 0) {
    randomizeShips('enemy');
  }
  
  gameState.phase = PHASES.BATTLE;
  gameState.turnNumber = 1;
  gameState.currentPlayerTurn = 'player';
  
  return gameState;
}

/**
 * End the game with a winner
 * @param {string} winner - 'player' or 'enemy'
 * @returns {Object} Updated game state
 * @throws {Error} If game is not in BATTLE phase
 */
function endGame(winner) {
  if (gameState.phase !== PHASES.BATTLE) {
    throw new Error('Cannot end game: battle has not started');
  }
  
  if (winner !== 'player' && winner !== 'enemy') {
    throw new Error('Winner must be "player" or "enemy"');
  }
  
  gameState.phase = PHASES.GAMEOVER;
  gameState.winner = winner;
  return gameState;
}

/**
 * Place a ship on a board
 * @param {string} boardType - 'player' or 'enemy'
 * @param {Object} ship - Ship object with name and size
 * @param {number} row - Starting row (0-9)
 * @param {number} col - Starting column (0-9)
 * @param {boolean} horizontal - Ship orientation
 * @returns {Object} Updated game state
 */
function placeShip(boardType, ship, row, col, horizontal) {
  const board = boardType === 'player' ? gameState.playerBoard : gameState.enemyBoard;
  const ships = boardType === 'player' ? gameState.playerShips : gameState.enemyShips;
  
  // Check bounds
  if (horizontal) {
    if (col + ship.size > GRID_SIZE) {
      throw new Error('Ship placement out of bounds');
    }
  } else {
    if (row + ship.size > GRID_SIZE) {
      throw new Error('Ship placement out of bounds');
    }
  }
  
  // Check for overlaps
  const cells = [];
  for (let i = 0; i < ship.size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (board[r][c] !== CELL_STATE.EMPTY) {
      throw new Error('Ship overlaps with existing ship');
    }
    cells.push({ row: r, col: c });
  }
  
  // Place ship
  cells.forEach(({ row: r, col: c }) => {
    board[r][c] = CELL_STATE.SHIP;
  });
  
  ships.push({
    ...ship,
    positions: cells,
    hits: 0,
    sunk: false
  });
  
  return gameState;
}

/**
 * Fire a shot at the enemy board
 * @param {string} shooter - 'player' or 'enemy'
 * @param {number} row - Target row
 * @param {number} col - Target column
 * @returns {Object} Result of the shot {hit, sunk, gameOver, winner}
 */
function fireShot(shooter, row, col) {
  if (gameState.phase !== PHASES.BATTLE) {
    throw new Error('Cannot fire: game is not in BATTLE phase');
  }
  
  const isPlayer = shooter === 'player';
  const targetBoard = isPlayer ? gameState.enemyBoard : gameState.playerBoard;
  const targetShips = isPlayer ? gameState.enemyShips : gameState.playerShips;
  const shooterShots = isPlayer ? gameState.playerShots : gameState.enemyShots;
  
  // Check if already shot here
  const alreadyShot = shooterShots.some(shot => shot.row === row && shot.col === col);
  if (alreadyShot) {
    throw new Error('Already shot at this position');
  }
  
  // Record the shot
  shooterShots.push({ row, col, hit: null });
  
  const cellState = targetBoard[row][col];
  let hit = false;
  let sunk = false;
  let sunkShipName = null;
  
  if (cellState === CELL_STATE.SHIP) {
    hit = true;
    targetBoard[row][col] = CELL_STATE.HIT;
    
    // Update ship damage
    const ship = targetShips.find(s => 
      s.positions.some(p => p.row === row && p.col === col)
    );
    if (ship) {
      ship.hits++;
      if (ship.hits === ship.size) {
        sunk = true;
        sunkShipName = ship.name;
        ship.sunk = true;
      }
    }
  } else if (cellState === CELL_STATE.EMPTY) {
    targetBoard[row][col] = CELL_STATE.MISS;
  }
  
  // Update shot record
  const shotRecord = shooterShots[shooterShots.length - 1];
  shotRecord.hit = hit;
  shotRecord.sunk = sunk;
  
  // Check for game over
  const allShipsSunk = targetShips.every(ship => ship.sunk);
  let gameOver = false;
  let winner = null;
  
  if (allShipsSunk) {
    gameOver = true;
    winner = shooter;
    endGame(winner);
  } else {
    // Switch turns
    gameState.currentPlayerTurn = isPlayer ? 'enemy' : 'player';
    if (!isPlayer) {
      gameState.turnNumber++;
    }
  }
  
  return {
    hit,
    sunk,
    sunkShipName,
    gameOver,
    winner,
    nextTurn: gameState.currentPlayerTurn
  };
}

/**
 * Get ship placement validity
 * @param {string} boardType - 'player' or 'enemy'
 * @param {Object} ship - Ship object with size
 * @param {number} row - Starting row
 * @param {number} col - Starting column
 * @param {boolean} horizontal - Ship orientation
 * @returns {Object} Validity result {valid, reason}
 */
function validateShipPlacement(boardType, ship, row, col, horizontal) {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return { valid: false, reason: 'Out of bounds' };
  }
  
  if (horizontal && col + ship.size > GRID_SIZE) {
    return { valid: false, reason: 'Extends beyond grid' };
  }
  
  if (!horizontal && row + ship.size > GRID_SIZE) {
    return { valid: false, reason: 'Extends beyond grid' };
  }
  
  const board = boardType === 'player' ? gameState.playerBoard : gameState.enemyBoard;
  
  for (let i = 0; i < ship.size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;
    if (board[r][c] !== CELL_STATE.EMPTY) {
      return { valid: false, reason: 'Overlaps with existing ship' };
    }
  }
  
  return { valid: true, reason: null };
}

/**
 * Randomize ship placement for a board
 * @param {string} boardType - 'player' or 'enemy'
 * @returns {Object} Updated game state
 */
function randomizeShips(boardType) {
  const ships = boardType === 'player' ? gameState.playerShips : gameState.enemyShips;
  const board = boardType === 'player' ? gameState.playerBoard : gameState.enemyBoard;
  
  // Clear existing ships
  ships.length = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === CELL_STATE.SHIP) {
        board[r][c] = CELL_STATE.EMPTY;
      }
    }
  }
  
  // Place each ship randomly (handle ships with count > 1)
  for (const shipConfig of SHIPS) {
    const numToPlace = shipConfig.count || 1;
    for (let shipIndex = 0; shipIndex < numToPlace; shipIndex++) {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const horizontal = Math.random() > 0.5;
        const maxRow = horizontal ? GRID_SIZE : GRID_SIZE - shipConfig.size;
        const maxCol = horizontal ? GRID_SIZE - shipConfig.size : GRID_SIZE;
        
        const row = Math.floor(Math.random() * maxRow);
        const col = Math.floor(Math.random() * maxCol);
        
        const validation = validateShipPlacement(boardType, shipConfig, row, col, horizontal);
        
        if (validation.valid) {
          placeShip(boardType, shipConfig, row, col, horizontal);
          placed = true;
        }
        
        attempts++;
      }
      
      if (!placed) {
        throw new Error(`Failed to place ship ${shipConfig.name} after 100 attempts`);
      }
    }
  }
  
  return gameState;
}

/**
 * Get fleet status for display
 * @param {string} boardType - 'player' or 'enemy'
 * @returns {Array} Array of ship status objects
 */
function getFleetStatus(boardType) {
  const ships = boardType === 'player' ? gameState.playerShips : gameState.enemyShips;
  
  return ships.map(ship => ({
    name: ship.name,
    size: ship.size,
    hits: ship.hits,
    sunk: ship.sunk,
    health: Math.round(((ship.size - ship.hits) / ship.size) * 100)
  }));
}

// Initialize grids in DOM (only in browser environment)
function initGrid(gridId) {
  if (typeof document === 'undefined') return;
  
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

// Initialize the game (only in browser environment)
function initGameUI() {
  initGrid('player-grid');
  initGrid('enemy-grid');
  console.log('Savaş Gemileri initialized!');
}

// Start when DOM is ready (only in browser environment)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initGameUI);
}

// Export for testing
export {
  SHIPS,
  GRID_SIZE,
  PHASES,
  CELL_STATE,
  createEmptyGrid,
  createInitialState,
  getGameState,
  initGame,
  startBattle,
  endGame,
  placeShip,
  fireShot,
  validateShipPlacement,
  randomizeShips,
  getFleetStatus
};
