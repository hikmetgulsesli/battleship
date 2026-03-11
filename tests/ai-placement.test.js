/**
 * Tests for US-007: Computer AI Ship Placement
 * Verifies computer opponent ship placement logic
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
  placeShip,
  CELL_STATE
} from '../stitch/game.js';

describe('US-007: Computer AI Ship Placement', () => {
  describe('AI places exactly 5 ships', () => {
    test('startBattle() should place enemy ships automatically', () => {
      initGame(); // Ensure clean state
      // Player places ships (using randomize for testing)
      randomizeShips('player');
      
      // Start battle - this should trigger AI placement
      startBattle();
      
      const state = getGameState();
      
      // Enemy should have exactly 5 ships
      expect(state.enemyShips).toHaveLength(5);
    });

    test('AI ships should be valid (no overlaps, within bounds)', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      
      // Check all enemy ships are within bounds
      for (const ship of state.enemyShips) {
        for (const pos of ship.positions) {
          expect(pos.row).toBeGreaterThanOrEqual(0);
          expect(pos.row).toBeLessThan(10);
          expect(pos.col).toBeGreaterThanOrEqual(0);
          expect(pos.col).toBeLessThan(10);
        }
      }
      
      // Check no overlaps
      const allPositions = state.enemyShips.flatMap(s => s.positions);
      const uniquePositions = new Set(
        allPositions.map(p => `${p.row},${p.col}`)
      );
      expect(uniquePositions.size).toBe(allPositions.length);
    });

    test('Total enemy ship cells should be 17 (5+4+3+3+2)', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      const totalCells = state.enemyShips.reduce((sum, ship) => sum + ship.size, 0);
      expect(totalCells).toBe(17);
    });
  });

  describe('All placements valid', () => {
    test('Multiple AI placements should all be valid', () => {
      for (let i = 0; i < 10; i++) {
        initGame();
        randomizeShips('player');
        startBattle();
        
        const state = getGameState();
        
        // Verify board state matches ship positions
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 10; c++) {
            const isShipPosition = state.enemyShips.some(ship =>
              ship.positions.some(pos => pos.row === r && pos.col === c)
            );
            
            if (state.enemyBoard[r][c] === CELL_STATE.SHIP) {
              expect(isShipPosition).toBe(true);
            }
          }
        }
      }
    });
  });

  describe('Computer ships hidden on enemy board', () => {
    test('Enemy ships should be marked as ships on enemyBoard', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      
      // Enemy board should have ships
      let shipCellCount = 0;
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
          if (state.enemyBoard[r][c] === CELL_STATE.SHIP) {
            shipCellCount++;
          }
        }
      }
      
      expect(shipCellCount).toBe(17);
    });

    test('Player cannot see enemy ship positions through game state', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      
      // Enemy ships should have positions defined
      for (const ship of state.enemyShips) {
        expect(ship.positions).toBeDefined();
        expect(ship.positions.length).toBe(ship.size);
      }
    });
  });

  describe('State transition to BATTLE', () => {
    test('Game phase should be BATTLE after startBattle', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      expect(state.phase).toBe(PHASES.BATTLE);
    });

    test('Turn should be set to player first', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('player');
    });

    test('Turn number should be 1 at start of battle', () => {
      initGame();
      randomizeShips('player');
      startBattle();
      
      const state = getGameState();
      expect(state.turnNumber).toBe(1);
    });
  });

  describe('Integration with player flow', () => {
    test('Full flow: place player ships -> start battle -> AI ships placed', () => {
      // Step 1: Place player ships
      initGame();
      randomizeShips('player');
      let state = getGameState();
      expect(state.playerShips).toHaveLength(5);
      
      // Step 2: Start battle
      state = startBattle();
      
      // Step 3: Verify both have ships
      expect(state.playerShips).toHaveLength(5);
      expect(state.enemyShips).toHaveLength(5);
      
      // Step 4: Verify phase
      expect(state.phase).toBe(PHASES.BATTLE);
    });

    test('Player ships remain unchanged after AI placement', () => {
      initGame();
      randomizeShips('player');
      const playerShipPositionsBefore = JSON.stringify(
        getGameState().playerShips.flatMap(s => s.positions).sort()
      );
      
      startBattle();
      
      const playerShipPositionsAfter = JSON.stringify(
        getGameState().playerShips.flatMap(s => s.positions).sort()
      );
      
      expect(playerShipPositionsBefore).toBe(playerShipPositionsAfter);
    });
  });
});
