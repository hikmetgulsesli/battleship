/**
 * Board module for Battleship game
 * Manages 10x10 grid with cell states
 */

// Cell states
export const CellState = {
  EMPTY: 'EMPTY',
  SHIP: 'SHIP',
  HIT: 'HIT',
  MISS: 'MISS'
};

/**
 * Creates a 10x10 2D array initialized to EMPTY
 * @returns {Array<Array<string>>} 10x10 grid
 */
export function createBoard() {
  return Array.from({ length: 10 }, () => 
    Array.from({ length: 10 }, () => CellState.EMPTY)
  );
}

/**
 * Gets the cell value at the specified coordinates
 * @param {Array<Array<string>>} board - The game board
 * @param {number} row - Row index (0-9)
 * @param {number} col - Column index (0-9)
 * @returns {string|null} Cell value or null if invalid
 */
export function getCell(board, row, col) {
  if (!isValidCoordinate(row, col)) {
    return null;
  }
  return board[row][col];
}

/**
 * Sets the cell value at the specified coordinates
 * @param {Array<Array<string>>} board - The game board
 * @param {number} row - Row index (0-9)
 * @param {number} col - Column index (0-9)
 * @param {string} value - Cell value to set
 * @returns {boolean} True if successful, false if invalid
 */
export function setCell(board, row, col, value) {
  if (!isValidCoordinate(row, col)) {
    return false;
  }
  board[row][col] = value;
  return true;
}

/**
 * Checks if coordinates are within the board bounds
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidCoordinate(row, col) {
  return Number.isInteger(row) && Number.isInteger(col) &&
         row >= 0 && row < 10 && col >= 0 && col < 10;
}

/**
 * Checks if a ship can be placed at the specified position
 * @param {Array<Array<string>>} board - The game board
 * @param {number} row - Starting row index
 * @param {number} col - Starting column index
 * @param {number} length - Ship length
 * @param {boolean} horizontal - true for horizontal, false for vertical
 * @returns {boolean} True if ship can be placed
 */
export function canPlaceShip(board, row, col, length, horizontal) {
  if (!isValidCoordinate(row, col)) {
    return false;
  }

  if (horizontal) {
    if (col + length > 10) return false;
    for (let i = 0; i < length; i++) {
      if (!isValidCoordinate(row, col + i) || board[row][col + i] !== CellState.EMPTY) {
        return false;
      }
    }
  } else {
    if (row + length > 10) return false;
    for (let i = 0; i < length; i++) {
      if (!isValidCoordinate(row + i, col) || board[row + i][col] !== CellState.EMPTY) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Places a ship on the board
 * @param {Array<Array<string>>} board - The game board
 * @param {number} row - Starting row index
 * @param {number} col - Starting column index
 * @param {number} length - Ship length
 * @param {boolean} horizontal - true for horizontal, false for vertical
 * @returns {boolean} True if ship was placed successfully
 */
export function placeShip(board, row, col, length, horizontal) {
  if (!canPlaceShip(board, row, col, length, horizontal)) {
    return false;
  }

  if (horizontal) {
    for (let i = 0; i < length; i++) {
      board[row][col + i] = CellState.SHIP;
    }
  } else {
    for (let i = 0; i < length; i++) {
      board[row + i][col] = CellState.SHIP;
    }
  }
  return true;
}

/**
 * Makes a shot at the specified position
 * @param {Array<Array<string>>} board - The game board
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {string|null} Result: HIT, MISS, or null if invalid
 */
export function makeShot(board, row, col) {
  if (!isValidCoordinate(row, col)) {
    return null;
  }

  const cell = board[row][col];
  
  if (cell === CellState.SHIP) {
    board[row][col] = CellState.HIT;
    return 'HIT';
  } else if (cell === CellState.EMPTY) {
    board[row][col] = CellState.MISS;
    return 'MISS';
  }
  
  // Already shot at this cell
  return null;
}
