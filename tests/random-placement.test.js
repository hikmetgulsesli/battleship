/**
 * Tests for US-006: Random Placement & Reset
 * Verifies auto-placement and reset functionality
 */

import {
  createEmptyGrid,
  createInitialState,
  getGameState,
  initGame,
  randomizeShips,
  SHIPS,
  PHASES,
  startBattle,
  placeShip
} from '../stitch/game.js';

describe('US-006: Random Placement & Reset', () => {
  describe('randomizeShips()', () => {
    beforeEach(() => {
      initGame();
    });

    test('randomPlacement() places all 5 ships with no overlaps', () => {
      randomizeShips('player');
      
      const state = getGameState();
      // Should have 5 ships: Carrier(1), Battleship(1), 2xCruiser(2), Destroyer(1)
      expect(state.playerShips).toHaveLength(5);
      
      // Collect all ship positions
      const allPositions = [];
      let totalCells = 0;
      
      for (const ship of state.playerShips) {
        expect(ship.positions).toBeDefined();
        expect(ship.positions.length).toBe(ship.size);
        totalCells += ship.size;
        
        for (const pos of ship.positions) {
          // Check no duplicates
          const alreadyExists = allPositions.some(
            p => p.row === pos.row && p.col === pos.col
          );
          expect(alreadyExists).toBe(false);
          allPositions.push(pos);
        }
      }
      
      // Total should be 5+4+3+3+2 = 17 cells
      expect(totalCells).toBe(17);
    });

    test('Ships placed within grid boundaries', () => {
      randomizeShips('player');
      
      const state = getGameState();
      
      for (const ship of state.playerShips) {
        for (const pos of ship.positions) {
          expect(pos.row).toBeGreaterThanOrEqual(0);
          expect(pos.row).toBeLessThan(10);
          expect(pos.col).toBeGreaterThanOrEqual(0);
          expect(pos.col).toBeLessThan(10);
        }
      }
    });

    test('should randomize enemy ships as well', () => {
      randomizeShips('enemy');
      
      const state = getGameState();
      expect(state.enemyShips).toHaveLength(5);
    });

    test('should clear existing ships before placing new ones', () => {
      // Manually place a ship first
      placeShip('player', SHIPS[0], 0, 0, true);
      expect(getGameState().playerShips).toHaveLength(1);
      
      // Randomize should clear and place fresh
      randomizeShips('player');
      
      const state = getGameState();
      expect(state.playerShips).toHaveLength(5);
      
      // The ship should not be at original position
      const hasShipAtOriginal = state.playerShips.some(ship =>
        ship.positions.some(pos => pos.row === 0 && pos.col === 0)
      );
      expect(hasShipAtOriginal).toBe(false);
    });

    test('should place ships in valid positions only', () => {
      // Run randomization multiple times to ensure it consistently works
      for (let i = 0; i < 10; i++) {
        initGame();
        randomizeShips('player');
        
        const state = getGameState();
        
        // Check board state matches ship positions
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            const isShipPosition = state.playerShips.some(ship =>
              ship.positions.some(pos => pos.row === r && pos.col === c)
            );
            
            // If board says ship, it should be in ship positions
            if (state.playerBoard[r][c] === 'ship') {
              expect(isShipPosition).toBe(true);
            }
          }
        }
      }
    });
  });

  describe('Reset functionality', () => {
    test('Reset button clears all ships', () => {
      // Place some ships
      randomizeShips('player');
      expect(getGameState().playerShips.length).toBe(5);
      
      // Reset
      const newState = initGame();
      
      expect(newState.playerShips).toHaveLength(0);
      expect(newState.enemyShips).toHaveLength(0);
    });

    test('Reset clears board state', () => {
      randomizeShips('player');
      
      // Verify ships exist on board
      let shipCount = 0;
      const board = getGameState().playerBoard;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (board[r][c] === 'ship') shipCount++;
        }
      }
      expect(shipCount).toBeGreaterThan(0);
      
      // Reset
      initGame();
      
      const newBoard = getGameState().playerBoard;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          expect(newBoard[r][c]).toBe('empty');
        }
      }
    });

    test('Reset returns to SETUP phase', () => {
      randomizeShips('player');
      startBattle();
      expect(getGameState().phase).toBe(PHASES.BATTLE);
      
      initGame();
      
      expect(getGameState().phase).toBe(PHASES.SETUP);
    });

    test('Both randomize and reset update UI immediately', () => {
      // After randomization, game state should be immediately available
      randomizeShips('player');
      const state = getGameState();
      
      expect(state.playerShips).toHaveLength(5);
      expect(state.playerShips.length).toBeGreaterThan(0);
      
      // After reset, should be immediately empty
      initGame();
      const resetState = getGameState();
      
      expect(resetState.playerShips).toHaveLength(0);
    });
  });

  describe('Integration: randomize then reset', () => {
    test('should work correctly in sequence', () => {
      // Randomize
      randomizeShips('player');
      const afterRandomize = getGameState();
      expect(afterRandomize.playerShips.length).toBe(5);
      
      // Reset
      initGame();
      const afterReset = getGameState();
      expect(afterReset.playerShips.length).toBe(0);
      
      // Randomize again
      randomizeShips('player');
      const afterSecondRandomize = getGameState();
      expect(afterSecondRandomize.playerShips.length).toBe(5);
      
      // Different from first randomization
      const firstPositions = afterRandomize.playerShips.flatMap(s => s.positions);
      const secondPositions = afterSecondRandomize.playerShips.flatMap(s => s.positions);
      
      // At least some should be different (very high probability)
      const allSame = firstPositions.every((pos, i) =>
        pos.row === secondPositions[i].row && pos.col === secondPositions[i].col
      );
      // This is extremely unlikely to be true
      expect(allSame).toBe(false);
    });
  });
});
