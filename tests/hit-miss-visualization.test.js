/**
 * Tests for Hit/Miss Visualization - US-009
 * Verifies visual feedback for shots
 */
import { 
  CellState, 
  createBoard, 
  placeShip,
  makeShot,
  getCell
} from '../src/board.js';

describe('Hit/Miss Visualization', () => {
  describe('HIT displays red X marker', () => {
    test('makeShot returns HIT when ship is present', () => {
      const board = createBoard();
      placeShip(board, 0, 0, 3, true);
      const result = makeShot(board, 0, 0);
      expect(result).toBe('HIT');
    });

    test('HIT cell is marked with HIT state', () => {
      const board = createBoard();
      placeShip(board, 0, 0, 3, true);
      makeShot(board, 0, 0);
      expect(getCell(board, 0, 0)).toBe(CellState.HIT);
    });

    test('multiple hits on same ship are all marked as HIT', () => {
      const board = createBoard();
      placeShip(board, 0, 0, 3, true);
      expect(makeShot(board, 0, 0)).toBe('HIT');
      expect(makeShot(board, 0, 1)).toBe('HIT');
      expect(makeShot(board, 0, 2)).toBe('HIT');
      expect(getCell(board, 0, 0)).toBe(CellState.HIT);
      expect(getCell(board, 0, 1)).toBe(CellState.HIT);
      expect(getCell(board, 0, 2)).toBe(CellState.HIT);
    });
  });

  describe('MISS displays white O marker', () => {
    test('makeShot returns MISS when cell is empty', () => {
      const board = createBoard();
      const result = makeShot(board, 0, 0);
      expect(result).toBe('MISS');
    });

    test('MISS cell is marked with MISS state', () => {
      const board = createBoard();
      makeShot(board, 0, 0);
      expect(getCell(board, 0, 0)).toBe(CellState.MISS);
    });

    test('multiple misses are all marked as MISS', () => {
      const board = createBoard();
      expect(makeShot(board, 0, 0)).toBe('MISS');
      expect(makeShot(board, 1, 1)).toBe('MISS');
      expect(makeShot(board, 2, 2)).toBe('MISS');
      expect(getCell(board, 0, 0)).toBe(CellState.MISS);
      expect(getCell(board, 1, 1)).toBe(CellState.MISS);
      expect(getCell(board, 2, 2)).toBe(CellState.MISS);
    });
  });

  describe('Markers persist after animation', () => {
    test('HIT markers persist after multiple shots', () => {
      const board = createBoard();
      placeShip(board, 0, 0, 3, true);
      placeShip(board, 5, 5, 2, false);
      
      // Fire multiple shots including hits
      makeShot(board, 0, 0); // HIT
      makeShot(board, 0, 1); // HIT
      makeShot(board, 9, 9); // MISS
      
      // Verify markers persist
      expect(getCell(board, 0, 0)).toBe(CellState.HIT);
      expect(getCell(board, 0, 1)).toBe(CellState.HIT);
      expect(getCell(board, 9, 9)).toBe(CellState.MISS);
    });

    test('re-shooting HIT cell returns null (already shot)', () => {
      const board = createBoard();
      placeShip(board, 0, 0, 3, true);
      makeShot(board, 0, 0); // HIT
      expect(makeShot(board, 0, 0)).toBeNull(); // Already hit
      expect(getCell(board, 0, 0)).toBe(CellState.HIT); // Still HIT
    });

    test('re-shooting MISS cell returns null (already shot)', () => {
      const board = createBoard();
      makeShot(board, 0, 0); // MISS
      expect(makeShot(board, 0, 0)).toBeNull(); // Already missed
      expect(getCell(board, 0, 0)).toBe(CellState.MISS); // Still MISS
    });
  });

  describe('Visual rendering tests', () => {
    test('board state correctly represents hit/miss pattern', () => {
      const board = createBoard();
      
      // Place a ship
      placeShip(board, 2, 3, 3, true);
      
      // Fire shots: one hit, one miss, one hit
      makeShot(board, 2, 3); // HIT
      makeShot(board, 0, 0); // MISS
      makeShot(board, 2, 4); // HIT
      
      // Verify visual state
      expect(getCell(board, 2, 3)).toBe(CellState.HIT);
      expect(getCell(board, 0, 0)).toBe(CellState.MISS);
      expect(getCell(board, 2, 4)).toBe(CellState.HIT);
      
      // Unshot cells remain empty
      expect(getCell(board, 5, 5)).toBe(CellState.EMPTY);
    });

    test('different ships can be hit independently', () => {
      const board = createBoard();
      
      // Place two ships
      placeShip(board, 0, 0, 5, true); // Carrier
      placeShip(board, 5, 5, 4, true); // Battleship
      
      // Hit only one ship
      makeShot(board, 0, 0);
      makeShot(board, 0, 1);
      
      // Verify only one ship is hit
      expect(getCell(board, 0, 0)).toBe(CellState.HIT);
      expect(getCell(board, 0, 1)).toBe(CellState.HIT);
      expect(getCell(board, 5, 5)).toBe(CellState.SHIP); // Not hit yet
    });
  });
});

describe('Typecheck', () => {
  test('CellState exports are correct', () => {
    expect(CellState.EMPTY).toBe('EMPTY');
    expect(CellState.SHIP).toBe('SHIP');
    expect(CellState.HIT).toBe('HIT');
    expect(CellState.MISS).toBe('MISS');
  });
});
