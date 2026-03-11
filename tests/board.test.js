/**
 * Tests for board module
 */
import { 
  CellState, 
  createBoard, 
  getCell, 
  setCell, 
  isValidCoordinate,
  canPlaceShip,
  placeShip,
  makeShot
} from '../src/board.js';

describe('createBoard', () => {
  test('returns 10x10 2D array', () => {
    const board = createBoard();
    expect(board).toHaveLength(10);
    board.forEach(row => {
      expect(row).toHaveLength(10);
    });
  });

  test('initializes all cells to EMPTY', () => {
    const board = createBoard();
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        expect(cell).toBe(CellState.EMPTY);
      });
    });
  });
});

describe('getCell', () => {
  test('returns cell value for valid coordinates', () => {
    const board = createBoard();
    expect(getCell(board, 0, 0)).toBe(CellState.EMPTY);
    expect(getCell(board, 5, 5)).toBe(CellState.EMPTY);
    expect(getCell(board, 9, 9)).toBe(CellState.EMPTY);
  });

  test('returns null for invalid coordinates', () => {
    const board = createBoard();
    expect(getCell(board, -1, 0)).toBeNull();
    expect(getCell(board, 0, -1)).toBeNull();
    expect(getCell(board, 10, 0)).toBeNull();
    expect(getCell(board, 0, 10)).toBeNull();
    expect(getCell(board, 5.5, 5)).toBeNull();
    expect(getCell(board, 5, 5.5)).toBeNull();
  });
});

describe('setCell', () => {
  test('sets cell value for valid coordinates', () => {
    const board = createBoard();
    expect(setCell(board, 0, 0, CellState.SHIP)).toBe(true);
    expect(getCell(board, 0, 0)).toBe(CellState.SHIP);
  });

  test('returns false for invalid coordinates', () => {
    const board = createBoard();
    expect(setCell(board, -1, 0, CellState.SHIP)).toBe(false);
    expect(setCell(board, 0, 10, CellState.SHIP)).toBe(false);
    expect(setCell(board, 5.5, 5, CellState.SHIP)).toBe(false);
  });
});

describe('isValidCoordinate', () => {
  test('returns true for valid coordinates', () => {
    expect(isValidCoordinate(0, 0)).toBe(true);
    expect(isValidCoordinate(5, 5)).toBe(true);
    expect(isValidCoordinate(9, 9)).toBe(true);
  });

  test('returns false for out-of-bounds coordinates', () => {
    expect(isValidCoordinate(-1, 0)).toBe(false);
    expect(isValidCoordinate(0, -1)).toBe(false);
    expect(isValidCoordinate(10, 0)).toBe(false);
    expect(isValidCoordinate(0, 10)).toBe(false);
  });

  test('returns false for non-integer coordinates', () => {
    expect(isValidCoordinate(5.5, 5)).toBe(false);
    expect(isValidCoordinate(5, 5.5)).toBe(false);
    expect(isValidCoordinate(5.5, 5.5)).toBe(false);
  });
});

describe('canPlaceShip', () => {
  test('returns true for valid horizontal placement', () => {
    const board = createBoard();
    expect(canPlaceShip(board, 0, 0, 5, true)).toBe(true);
    expect(canPlaceShip(board, 5, 5, 3, true)).toBe(true);
  });

  test('returns true for valid vertical placement', () => {
    const board = createBoard();
    expect(canPlaceShip(board, 0, 0, 5, false)).toBe(true);
    expect(canPlaceShip(board, 5, 5, 3, false)).toBe(true);
  });

  test('returns false for out-of-bounds horizontal placement', () => {
    const board = createBoard();
    expect(canPlaceShip(board, 0, 6, 5, true)).toBe(false);
    expect(canPlaceShip(board, 0, 9, 2, true)).toBe(false);
  });

  test('returns false for out-of-bounds vertical placement', () => {
    const board = createBoard();
    expect(canPlaceShip(board, 6, 0, 5, false)).toBe(false);
    expect(canPlaceShip(board, 9, 0, 2, false)).toBe(false);
  });

  test('returns false when cells are not empty', () => {
    const board = createBoard();
    board[0][0] = CellState.SHIP;
    expect(canPlaceShip(board, 0, 0, 2, true)).toBe(false);
  });

  test('returns false for invalid starting coordinates', () => {
    const board = createBoard();
    expect(canPlaceShip(board, -1, 0, 3, true)).toBe(false);
    expect(canPlaceShip(board, 0, -1, 3, true)).toBe(false);
  });
});

describe('placeShip', () => {
  test('places ship horizontally', () => {
    const board = createBoard();
    expect(placeShip(board, 0, 0, 5, true)).toBe(true);
    expect(getCell(board, 0, 0)).toBe(CellState.SHIP);
    expect(getCell(board, 0, 1)).toBe(CellState.SHIP);
    expect(getCell(board, 0, 2)).toBe(CellState.SHIP);
    expect(getCell(board, 0, 3)).toBe(CellState.SHIP);
    expect(getCell(board, 0, 4)).toBe(CellState.SHIP);
    expect(getCell(board, 0, 5)).toBe(CellState.EMPTY);
  });

  test('places ship vertically', () => {
    const board = createBoard();
    expect(placeShip(board, 0, 0, 4, false)).toBe(true);
    expect(getCell(board, 0, 0)).toBe(CellState.SHIP);
    expect(getCell(board, 1, 0)).toBe(CellState.SHIP);
    expect(getCell(board, 2, 0)).toBe(CellState.SHIP);
    expect(getCell(board, 3, 0)).toBe(CellState.SHIP);
    expect(getCell(board, 4, 0)).toBe(CellState.EMPTY);
  });

  test('returns false for invalid placement', () => {
    const board = createBoard();
    expect(placeShip(board, 0, 6, 5, true)).toBe(false);
  });
});

describe('makeShot', () => {
  test('returns HIT and marks cell as HIT when ship is present', () => {
    const board = createBoard();
    placeShip(board, 0, 0, 3, true);
    expect(makeShot(board, 0, 0)).toBe('HIT');
    expect(getCell(board, 0, 0)).toBe(CellState.HIT);
  });

  test('returns MISS and marks cell as MISS when empty', () => {
    const board = createBoard();
    expect(makeShot(board, 0, 0)).toBe('MISS');
    expect(getCell(board, 0, 0)).toBe(CellState.MISS);
  });

  test('returns null for invalid coordinates', () => {
    const board = createBoard();
    expect(makeShot(board, -1, 0)).toBeNull();
    expect(makeShot(board, 0, 10)).toBeNull();
  });

  test('returns null when cell already shot at', () => {
    const board = createBoard();
    placeShip(board, 0, 0, 3, true);
    makeShot(board, 0, 0); // HIT
    expect(makeShot(board, 0, 0)).toBeNull(); // Already hit
  });
});
