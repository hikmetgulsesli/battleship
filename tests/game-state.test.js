/**
 * Tests for US-002: Game State Management
 * Verifies game state object and all state transitions
 */

import {
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
} from '../stitch/game.js';

describe('US-002: Game State Management', () => {
  describe('Game State Structure', () => {
    test('gameState should track phase', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('phase');
      expect(state.phase).toBe(PHASES.SETUP);
    });

    test('gameState should track currentPlayerTurn', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('currentPlayerTurn');
      expect(state.currentPlayerTurn).toBe('player');
    });

    test('gameState should have playerBoard and enemyBoard', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('playerBoard');
      expect(state).toHaveProperty('enemyBoard');
      expect(Array.isArray(state.playerBoard)).toBe(true);
      expect(Array.isArray(state.enemyBoard)).toBe(true);
    });

    test('gameState should have playerShips and enemyShips arrays', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('playerShips');
      expect(state).toHaveProperty('enemyShips');
      expect(Array.isArray(state.playerShips)).toBe(true);
      expect(Array.isArray(state.enemyShips)).toBe(true);
    });

    test('gameState should have shot history arrays', () => {
      const state = createInitialState();
      expect(state).toHaveProperty('playerShots');
      expect(state).toHaveProperty('enemyShots');
      expect(Array.isArray(state.playerShots)).toBe(true);
      expect(Array.isArray(state.enemyShots)).toBe(true);
    });
  });

  describe('initGame()', () => {
    test('should reset all state to initial values', () => {
      // Modify state first
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[0], 0, 0, true);
      
      // Reset
      const newState = initGame();
      
      expect(newState.phase).toBe(PHASES.SETUP);
      expect(newState.currentPlayerTurn).toBe('player');
      expect(newState.playerShips).toHaveLength(0);
      expect(newState.enemyShips).toHaveLength(0);
      expect(newState.playerShots).toHaveLength(0);
      expect(newState.enemyShots).toHaveLength(0);
      expect(newState.winner).toBeNull();
    });
  });

  describe('startBattle()', () => {
    test('should transition phase from SETUP to BATTLE', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true); // Carrier (size 5) at A1-E1
      placeShip('player', SHIPS[1], 0, 6, true); // Battleship (size 4) at G1-J1
      placeShip('player', SHIPS[2], 2, 0, true); // Cruiser 1 (size 3) at A3-C3
      placeShip('player', SHIPS[2], 2, 4, true); // Cruiser 2 (size 3) at E3-G3 (using same ship config for 2nd cruiser)
      placeShip('player', SHIPS[3], 2, 8, true); // Destroyer (size 2) at I3-J3
      
      const state = startBattle();
      
      expect(state.phase).toBe(PHASES.BATTLE);
    });

    test('should throw error if not all ships are placed', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      
      expect(() => startBattle()).toThrow('all 5 ships must be placed');
    });

    test('should throw error if not in SETUP phase', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true); // Carrier
      placeShip('player', SHIPS[1], 0, 6, true); // Battleship
      placeShip('player', SHIPS[2], 2, 0, true); // Cruiser 1
      placeShip('player', SHIPS[2], 2, 4, true); // Cruiser 2
      placeShip('player', SHIPS[3], 2, 8, true); // Destroyer
      startBattle();
      
      expect(() => startBattle()).toThrow('game is not in SETUP phase');
    });
  });

  describe('endGame(winner)', () => {
    test('should transition to GAMEOVER with player as winner', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      
      const state = endGame('player');
      
      expect(state.phase).toBe(PHASES.GAMEOVER);
      expect(state.winner).toBe('player');
    });

    test('should transition to GAMEOVER with enemy as winner', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      
      const state = endGame('enemy');
      
      expect(state.phase).toBe(PHASES.GAMEOVER);
      expect(state.winner).toBe('enemy');
    });

    test('should throw error if game is not in BATTLE phase', () => {
      initGame();
      
      expect(() => endGame('player')).toThrow('battle has not started');
    });

    test('should throw error for invalid winner', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      
      expect(() => endGame('invalid')).toThrow('Winner must be "player" or "enemy"');
    });
  });

  describe('placeShip()', () => {
    test('should place ship on player board', () => {
      initGame();
      
      const state = placeShip('player', SHIPS[0], 0, 0, true); // Carrier (5 cells)
      
      expect(state.playerShips).toHaveLength(1);
      expect(state.playerShips[0].name).toBe('Carrier');
      expect(state.playerBoard[0][0]).toBe(CELL_STATE.SHIP);
      expect(state.playerBoard[0][4]).toBe(CELL_STATE.SHIP);
    });

    test('should place ship vertically', () => {
      initGame();
      
      const state = placeShip('player', SHIPS[3], 0, 0, false); // Destroyer (2 cells)
      
      expect(state.playerBoard[0][0]).toBe(CELL_STATE.SHIP);
      expect(state.playerBoard[1][0]).toBe(CELL_STATE.SHIP);
    });

    test('should throw error for horizontal overflow', () => {
      initGame();
      
      expect(() => placeShip('player', SHIPS[0], 0, 7, true)).toThrow('out of bounds');
    });

    test('should throw error for vertical overflow', () => {
      initGame();
      
      expect(() => placeShip('player', SHIPS[0], 7, 0, false)).toThrow('out of bounds');
    });

    test('should throw error for ship overlap', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      
      expect(() => placeShip('player', SHIPS[1], 0, 3, true)).toThrow('overlaps');
    });

    test('should place ship on enemy board', () => {
      initGame();
      
      const state = placeShip('enemy', SHIPS[0], 0, 0, true);
      
      expect(state.enemyShips).toHaveLength(1);
      expect(state.enemyBoard[0][0]).toBe(CELL_STATE.SHIP);
    });
  });

  describe('fireShot()', () => {
    beforeEach(() => {
      initGame();
      // Set up player ships
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 2, 0, true);
      placeShip('player', SHIPS[2], 4, 0, true);
      placeShip('player', SHIPS[2], 4, 3, true);
      placeShip('player', SHIPS[3], 6, 0, true);
      // Set up enemy ships
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 2, 0, true);
      placeShip('enemy', SHIPS[2], 4, 0, true);
      placeShip('enemy', SHIPS[2], 4, 3, true);
      placeShip('enemy', SHIPS[3], 6, 0, true);
      startBattle();
    });

    test('should record a hit on enemy ship', () => {
      // Enemy ship at A1-A5 (row 0, cols 0-4)
      const result = fireShot('player', 0, 0);
      
      expect(result.hit).toBe(true);
      const state = getGameState();
      expect(state.playerShots).toHaveLength(1);
      expect(state.playerShots[0].hit).toBe(true);
    });

    test('should record a miss when no ship', () => {
      // No ship at J10 (row 9, col 9)
      const result = fireShot('player', 9, 9);
      
      expect(result.hit).toBe(false);
      const state = getGameState();
      expect(state.playerShots[0].hit).toBe(false);
    });

    test('should switch turns after shot', () => {
      fireShot('player', 9, 9);
      
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('enemy');
    });

    test('should throw error for already shot position', () => {
      fireShot('player', 9, 9);
      
      expect(() => fireShot('player', 9, 9)).toThrow('Already shot');
    });

    test('should throw error when not in BATTLE phase', () => {
      initGame();
      
      expect(() => fireShot('player', 0, 0)).toThrow('game is not in BATTLE phase');
    });

    test('should mark ship as sunk when all cells hit', () => {
      // Enemy Carrier at A1-A5 (row 0, cols 0-4)
      // Fire at all 5 positions
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      fireShot('player', 0, 3);
      const result = fireShot('player', 0, 4);
      
      expect(result.sunk).toBe(true);
      expect(result.sunkShipName).toBe('Carrier');
    });
  });

  describe('validateShipPlacement()', () => {
    test('should validate valid horizontal placement', () => {
      initGame();
      
      const result = validateShipPlacement('player', SHIPS[0], 0, 0, true);
      
      expect(result.valid).toBe(true);
    });

    test('should validate valid vertical placement', () => {
      initGame();
      
      const result = validateShipPlacement('player', SHIPS[0], 0, 0, false);
      
      expect(result.valid).toBe(true);
    });

    test('should reject out of bounds placement', () => {
      initGame();
      
      const result = validateShipPlacement('player', SHIPS[0], 0, 8, true);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Extends beyond grid');
    });

    test('should reject placement over existing ship', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      
      const result = validateShipPlacement('player', SHIPS[1], 0, 2, true);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Overlaps with existing ship');
    });
  });

  describe('randomizeShips()', () => {
    test('should place all ships randomly on player board', () => {
      initGame();
      
      randomizeShips('player');
      
      const state = getGameState();
      // Carrier (5), Battleship (4), 2x Cruiser (3), Destroyer (2) = 5 ships total
      expect(state.playerShips).toHaveLength(5);
      // 5 + 4 + 3 + 3 + 2 = 17 cells
      let shipCells = 0;
      for (const ship of state.playerShips) {
        shipCells += ship.size;
      }
      expect(shipCells).toBe(17);
    });

    test('should place all ships randomly on enemy board', () => {
      initGame();
      
      randomizeShips('enemy');
      
      const state = getGameState();
      expect(state.enemyShips).toHaveLength(5);
    });

    test('should clear existing ships before randomizing', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      
      randomizeShips('player');
      
      const state = getGameState();
      // Should have all 4 ships (including 2 cruisers)
      expect(state.playerShips.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('getFleetStatus()', () => {
    test('should return player fleet status', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      
      const status = getFleetStatus('player');
      
      expect(status).toHaveLength(1);
      expect(status[0]).toHaveProperty('name');
      expect(status[0]).toHaveProperty('hits');
      expect(status[0]).toHaveProperty('sunk');
      expect(status[0]).toHaveProperty('health');
    });

    test('should track ship health', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true); // Carrier
      placeShip('player', SHIPS[1], 0, 6, true);  // Battleship
      placeShip('player', SHIPS[2], 2, 0, true);  // Cruiser 1
      placeShip('player', SHIPS[2], 2, 4, true);  // Cruiser 2
      placeShip('player', SHIPS[3], 2, 8, true);  // Destroyer (size 2)
      startBattle();
      fireShot('enemy', 2, 8); // Hit destroyer
      
      const status = getFleetStatus('player');
      const destroyer = status.find(s => s.name === 'Destroyer');
      
      expect(destroyer.health).toBe(50);
      expect(destroyer.hits).toBe(1);
    });

    test('should mark sunk ships', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true); // Carrier
      placeShip('player', SHIPS[1], 0, 6, true);  // Battleship
      placeShip('player', SHIPS[2], 2, 0, true);  // Cruiser 1
      placeShip('player', SHIPS[2], 2, 4, true);  // Cruiser 2
      placeShip('player', SHIPS[3], 2, 8, true);  // Destroyer (size 2)
      startBattle();
      fireShot('enemy', 2, 8);
      fireShot('enemy', 2, 9);
      
      const status = getFleetStatus('player');
      const destroyer = status.find(s => s.name === 'Destroyer');
      
      expect(destroyer.sunk).toBe(true);
      expect(destroyer.health).toBe(0);
    });
  });

  describe('Constants', () => {
    test('GRID_SIZE should be 10', () => {
      expect(GRID_SIZE).toBe(10);
    });

    test('SHIPS should have correct configuration', () => {
      expect(SHIPS).toHaveLength(4);
      expect(SHIPS[0]).toEqual({ name: 'Carrier', size: 5, count: 1 });
      expect(SHIPS[1]).toEqual({ name: 'Battleship', size: 4, count: 1 });
      expect(SHIPS[2]).toEqual({ name: 'Cruiser', size: 3, count: 2 });
      expect(SHIPS[3]).toEqual({ name: 'Destroyer', size: 2, count: 1 });
    });

    test('PHASES should have all required phases', () => {
      expect(PHASES.SETUP).toBe('SETUP');
      expect(PHASES.BATTLE).toBe('BATTLE');
      expect(PHASES.GAMEOVER).toBe('GAMEOVER');
    });

    test('CELL_STATE should have all states', () => {
      expect(CELL_STATE.EMPTY).toBe('empty');
      expect(CELL_STATE.SHIP).toBe('ship');
      expect(CELL_STATE.HIT).toBe('hit');
      expect(CELL_STATE.MISS).toBe('miss');
    });
  });

  describe('createEmptyGrid()', () => {
    test('should create 10x10 grid', () => {
      const grid = createEmptyGrid();
      
      expect(grid).toHaveLength(10);
      expect(grid[0]).toHaveLength(10);
    });

    test('should fill grid with EMPTY state', () => {
      const grid = createEmptyGrid();
      
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          expect(grid[row][col]).toBe(CELL_STATE.EMPTY);
        }
      }
    });
  });
});
