/**
 * Game State Management for Savaş Gemileri (Battleship)
 * Handles all game phases, turn tracking, and board states
 */

// Game phases
export const PHASES = {
  SETUP: 'SETUP',
  BATTLE: 'BATTLE',
  GAMEOVER: 'GAMEOVER'
};

// Players
export const PLAYERS = {
  PLAYER: 'player',
  ENEMY: 'enemy'
};

// Ship definitions: name, size, count
export const SHIPS = [
  { name: 'Carrier', size: 5, count: 1 },
  { name: 'Battleship', size: 4, count: 1 },
  { name: 'Cruiser', size: 3, count: 2 },
  { name: 'Destroyer', size: 2, count: 1 }
];

const GRID_SIZE = 10;

/**
 * Creates an empty 10x10 board
 * @returns {Array<Array<Object>>} 2D array of cell objects
 */
function createEmptyBoard() {
  const board = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = {
        hasShip: false,
        isHit: false,
        shipId: null
      };
    }
  }
  return board;
}

/**
 * Creates initial ship placement array
 * @returns {Array<Object>} Array of ship objects with empty positions
 */
function createInitialShips() {
  const ships = [];
  let shipId = 0;
  
  for (const shipDef of SHIPS) {
    for (let i = 0; i < shipDef.count; i++) {
      ships.push({
        id: shipId++,
        name: shipDef.name,
        size: shipDef.size,
        positions: [],
        hits: 0,
        sunk: false
      });
    }
  }
  
  return ships;
}

/**
 * Creates initial shot history array
 * @returns {Array<Object>} Empty array for shot history
 */
function createShotHistory() {
  return [];
}

/**
 * Global game state object
 */
let gameState = null;

/**
 * Initializes or resets the game state to initial values
 * @returns {Object} The initialized game state
 */
export function initGame() {
  gameState = {
    phase: PHASES.SETUP,
    currentPlayerTurn: PLAYERS.PLAYER,
    playerBoard: createEmptyBoard(),
    enemyBoard: createEmptyBoard(),
    playerShips: createInitialShips(),
    enemyShips: createInitialShips(),
    playerShotHistory: createShotHistory(),
    enemyShotHistory: createShotHistory(),
    winner: null
  };
  
  return gameState;
}

/**
 * Transitions the game from SETUP to BATTLE phase
 * @returns {boolean} True if transition successful, false otherwise
 */
export function startBattle() {
  if (!gameState) {
    throw new Error('Game not initialized. Call initGame() first.');
  }
  
  if (gameState.phase !== PHASES.SETUP) {
    return false;
  }
  
  // Validate that all player ships are placed
  const allPlayerShipsPlaced = gameState.playerShips.every(
    ship => ship.positions.length === ship.size
  );
  
  if (!allPlayerShipsPlaced) {
    return false;
  }
  
  // Validate that all enemy ships are placed
  const allEnemyShipsPlaced = gameState.enemyShips.every(
    ship => ship.positions.length === ship.size
  );
  
  if (!allEnemyShipsPlaced) {
    return false;
  }
  
  gameState.phase = PHASES.BATTLE;
  gameState.currentPlayerTurn = PLAYERS.PLAYER;
  
  return true;
}

/**
 * Transitions the game to GAMEOVER phase with a winner
 * @param {string} winner - The winner (PLAYERS.PLAYER or PLAYERS.ENEMY)
 * @returns {boolean} True if transition successful, false otherwise
 */
export function endGame(winner) {
  if (!gameState) {
    throw new Error('Game not initialized. Call initGame() first.');
  }
  
  if (gameState.phase !== PHASES.BATTLE) {
    return false;
  }
  
  if (winner !== PLAYERS.PLAYER && winner !== PLAYERS.ENEMY) {
    return false;
  }
  
  gameState.phase = PHASES.GAMEOVER;
  gameState.winner = winner;
  
  return true;
}

/**
 * Gets the current game state
 * @returns {Object|null} Current game state or null if not initialized
 */
export function getGameState() {
  return gameState;
}

/**
 * Sets the current player turn
 * @param {string} player - The player whose turn it is
 * @returns {boolean} True if successful
 */
export function setCurrentTurn(player) {
  if (!gameState || gameState.phase !== PHASES.BATTLE) {
    return false;
  }
  
  if (player !== PLAYERS.PLAYER && player !== PLAYERS.ENEMY) {
    return false;
  }
  
  gameState.currentPlayerTurn = player;
  return true;
}

/**
 * Switches to the other player's turn
 * @returns {string} The new current player
 */
export function switchTurn() {
  if (!gameState || gameState.phase !== PHASES.BATTLE) {
    return null;
  }
  
  gameState.currentPlayerTurn = 
    gameState.currentPlayerTurn === PLAYERS.PLAYER 
      ? PLAYERS.ENEMY 
      : PLAYERS.PLAYER;
  
  return gameState.currentPlayerTurn;
}

/**
 * Places a ship on a board
 * @param {string} boardOwner - 'player' or 'enemy'
 * @param {number} shipId - Ship ID to place
 * @param {Array<Object>} positions - Array of {row, col} positions
 * @returns {boolean} True if placement successful
 */
export function placeShip(boardOwner, shipId, positions) {
  if (!gameState || gameState.phase !== PHASES.SETUP) {
    return false;
  }
  
  const board = boardOwner === PLAYERS.PLAYER 
    ? gameState.playerBoard 
    : gameState.enemyBoard;
  const ships = boardOwner === PLAYERS.PLAYER 
    ? gameState.playerShips 
    : gameState.enemyShips;
  
  const ship = ships.find(s => s.id === shipId);
  if (!ship) {
    return false;
  }
  
  if (positions.length !== ship.size) {
    return false;
  }
  
  // Validate positions are within bounds and not overlapping
  for (const pos of positions) {
    if (pos.row < 0 || pos.row >= GRID_SIZE || pos.col < 0 || pos.col >= GRID_SIZE) {
      return false;
    }
    if (board[pos.row][pos.col].hasShip) {
      return false;
    }
  }
  
  // Place ship on board
  for (const pos of positions) {
    board[pos.row][pos.col].hasShip = true;
    board[pos.row][pos.col].shipId = shipId;
  }
  
  ship.positions = positions;
  
  return true;
}

/**
 * Records a shot on a board
 * @param {string} targetBoard - 'player' or 'enemy' (whose board is being shot at)
 * @param {number} row - Row coordinate
 * @param {number} col - Column coordinate
 * @returns {Object} Result of the shot {hit, sunk, shipName}
 */
export function fireShot(targetBoard, row, col) {
  if (!gameState || gameState.phase !== PHASES.BATTLE) {
    return { hit: false, error: 'Invalid game state' };
  }
  
  const board = targetBoard === PLAYERS.PLAYER 
    ? gameState.playerBoard 
    : gameState.enemyBoard;
  const ships = targetBoard === PLAYERS.PLAYER 
    ? gameState.playerShips 
    : gameState.enemyShips;
  const shotHistory = targetBoard === PLAYERS.PLAYER 
    ? gameState.enemyShotHistory 
    : gameState.playerShotHistory;
  
  const cell = board[row][col];
  
  // Check if already shot
  if (cell.isHit) {
    return { hit: false, error: 'Already shot' };
  }
  
  cell.isHit = true;
  
  // Record in shot history
  shotHistory.push({
    row,
    col,
    hit: cell.hasShip,
    timestamp: Date.now()
  });
  
  if (cell.hasShip) {
    const ship = ships.find(s => s.id === cell.shipId);
    ship.hits++;
    
    // Check if ship is sunk
    if (ship.hits === ship.size) {
      ship.sunk = true;
      return { hit: true, sunk: true, shipName: ship.name };
    }
    
    return { hit: true, sunk: false };
  }
  
  return { hit: false, sunk: false };
}

/**
 * Checks if all ships of a player are sunk
 * @param {string} player - 'player' or 'enemy'
 * @returns {boolean} True if all ships are sunk
 */
export function areAllShipsSunk(player) {
  if (!gameState) {
    return false;
  }
  
  const ships = player === PLAYERS.PLAYER 
    ? gameState.playerShips 
    : gameState.enemyShips;
  
  return ships.every(ship => ship.sunk);
}

/**
 * Validates that a ship placement is valid (contiguous cells in a line)
 * @param {Array<Object>} positions - Array of {row, col} positions
 * @returns {boolean} True if positions form a valid ship placement
 */
export function isValidShipPlacement(positions) {
  if (!positions || positions.length < 2) {
    return true; // Single cell or empty is valid
  }
  
  // Check if all cells are in a horizontal or vertical line
  const rows = positions.map(p => p.row);
  const cols = positions.map(p => p.col);
  
  const allSameRow = rows.every(r => r === rows[0]);
  const allSameCol = cols.every(c => c === cols[0]);
  
  if (!allSameRow && !allSameCol) {
    return false;
  }
  
  // Check if cells are contiguous
  if (allSameRow) {
    const sortedCols = [...cols].sort((a, b) => a - b);
    for (let i = 1; i < sortedCols.length; i++) {
      if (sortedCols[i] - sortedCols[i - 1] !== 1) {
        return false;
      }
    }
  } else {
    const sortedRows = [...rows].sort((a, b) => a - b);
    for (let i = 1; i < sortedRows.length; i++) {
      if (sortedRows[i] - sortedRows[i - 1] !== 1) {
        return false;
      }
    }
  }
  
  return true;
}

// Export constants and utilities
export { GRID_SIZE };