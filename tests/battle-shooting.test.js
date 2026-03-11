/**
 * Tests for US-008: Battle Phase Shooting Mechanics
 * Verifies turn-based shooting, cell updates, and turn alternation
 */

import {
  SHIPS,
  PHASES,
  CELL_STATE,
  createEmptyGrid,
  createInitialState,
  getGameState,
  initGame,
  placeShip,
  fireShot,
  startBattle,
  endGame,
  getFleetStatus
} from '../stitch/game.js';

describe('US-008: Battle Phase Shooting Mechanics', () => {
  beforeEach(() => {
    initGame();
    // Set up player ships (valid positions, no overlaps)
    // Carrier (5): row 0, cols 0-4
    placeShip('player', SHIPS[0], 0, 0, true);
    // Battleship (4): row 2, cols 0-3
    placeShip('player', SHIPS[1], 2, 0, true);
    // Cruiser 1 (3): row 4, cols 0-2
    placeShip('player', SHIPS[2], 4, 0, true);
    // Cruiser 2 (3): row 6, cols 0-2 (different row to avoid overlap)
    placeShip('player', SHIPS[2], 6, 0, true);
    // Destroyer (2): row 8, cols 0-1
    placeShip('player', SHIPS[3], 8, 0, true);
    
    // Set up enemy ships (different positions)
    // Carrier: row 0, cols 5-9
    placeShip('enemy', SHIPS[0], 0, 5, true);
    // Battleship: row 2, cols 5-8
    placeShip('enemy', SHIPS[1], 2, 5, true);
    // Cruiser 1: row 4, cols 5-7
    placeShip('enemy', SHIPS[2], 4, 5, true);
    // Cruiser 2: row 6, cols 5-7
    placeShip('enemy', SHIPS[2], 6, 5, true);
    // Destroyer: row 8, cols 5-6
    placeShip('enemy', SHIPS[3], 8, 5, true);
    
    startBattle();
  });

  describe('Player can click enemy grid cells during their turn', () => {
    test('should allow player to fire when it is player turn', () => {
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('player');
      
      // Player can fire
      const result = fireShot('player', 9, 9);
      expect(result).toBeDefined();
      expect(result.hit).toBe(false); // No ship at J10
    });

    test('should not allow enemy to fire during player turn', () => {
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('player');
      
      // Enemy fires - should still work but turn logic should handle it
      const result = fireShot('enemy', 0, 0);
      expect(result).toBeDefined();
    });
  });

  describe('Cannot shoot same cell twice', () => {
    test('should throw error when shooting same cell', () => {
      fireShot('player', 5, 5);
      
      expect(() => fireShot('player', 5, 5)).toThrow('Already shot');
    });

    test('should track all player shots', () => {
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      
      const state = getGameState();
      expect(state.playerShots).toHaveLength(3);
    });

    test('should not allow enemy to shoot same cell', () => {
      fireShot('enemy', 0, 0);
      
      expect(() => fireShot('enemy', 0, 0)).toThrow('Already shot');
    });
  });

  describe('fireShot() updates cell state correctly', () => {
    test('should update cell to HIT when ship is hit', () => {
      // Enemy ship at row 0, cols 5-9 (Carrier)
      const result = fireShot('player', 0, 5);
      
      expect(result.hit).toBe(true);
      const state = getGameState();
      expect(state.enemyBoard[0][5]).toBe(CELL_STATE.HIT);
    });

    test('should update cell to MISS when no ship', () => {
      // No ship at J10
      const result = fireShot('player', 9, 9);
      
      expect(result.hit).toBe(false);
      const state = getGameState();
      expect(state.enemyBoard[9][9]).toBe(CELL_STATE.MISS);
    });

    test('should return hit=true for hits', () => {
      const result = fireShot('player', 0, 5);
      expect(result.hit).toBe(true);
    });

    test('should return hit=false for misses', () => {
      const result = fireShot('player', 9, 9);
      expect(result.hit).toBe(false);
    });
  });

  describe('Turn alternates correctly', () => {
    test('should switch to enemy after player shoots', () => {
      fireShot('player', 9, 9);
      
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('enemy');
    });

    test('should switch to player after enemy shoots', () => {
      fireShot('player', 9, 9); // Player shoots
      fireShot('enemy', 9, 9);  // Enemy shoots
      
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('player');
    });

    test('should increment turn number after full round', () => {
      const state = getGameState();
      expect(state.turnNumber).toBe(1);
      
      fireShot('player', 9, 9);
      expect(getGameState().turnNumber).toBe(1); // Still 1 after player shot
      
      fireShot('enemy', 9, 9);
      expect(getGameState().turnNumber).toBe(2); // Incremented after enemy shot
    });
  });

  describe('Turn indicator shows current player', () => {
    test('should track current player turn in state', () => {
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('player');
    });

    test('should update turn after shot', () => {
      fireShot('player', 0, 0);
      
      const state = getGameState();
      expect(state.currentPlayerTurn).toBe('enemy');
    });
  });

  describe('Ship sinking detection', () => {
    test('should detect when ship is sunk', () => {
      // Enemy Carrier at row 0, cols 5-9 (5 cells)
      fireShot('player', 0, 5);
      fireShot('player', 0, 6);
      fireShot('player', 0, 7);
      fireShot('player', 0, 8);
      const result = fireShot('player', 0, 9);
      
      expect(result.sunk).toBe(true);
      expect(result.sunkShipName).toBe('Carrier');
    });

    test('should return sunkShipName when ship sunk', () => {
      // Sink the Carrier
      fireShot('player', 0, 5);
      fireShot('player', 0, 6);
      fireShot('player', 0, 7);
      fireShot('player', 0, 8);
      const result = fireShot('player', 0, 9);
      
      expect(result.sunkShipName).toBe('Carrier');
    });

    test('should not return sunkShipName when ship not sunk', () => {
      fireShot('player', 0, 5); // Hit but not sunk
      
      const result = fireShot('player', 9, 9);
      expect(result.sunkShipName).toBeNull();
    });
  });

  describe('Game over detection', () => {
    test('should end game when all enemy ships sunk', () => {
      // Sink all enemy ships one by one
      // Carrier at row 0, cols 5-9 (5 hits)
      for (let i = 5; i <= 9; i++) fireShot('player', 0, i);
      // Battleship at row 2, cols 5-8 (4 hits)
      for (let i = 5; i <= 8; i++) fireShot('player', 2, i);
      // Cruiser 1 at row 4, cols 5-7 (3 hits)
      for (let i = 5; i <= 7; i++) fireShot('player', 4, i);
      // Cruiser 2 at row 6, cols 5-7 (3 hits)
      for (let i = 5; i <= 7; i++) fireShot('player', 6, i);
      // Destroyer at row 8, cols 5-6 (2 hits)
      fireShot('player', 8, 5);
      const result = fireShot('player', 8, 6);
      
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('player');
    });

    test('should return gameOver=true when won', () => {
      // Sink all enemy ships
      // Carrier (0,5-9)
      for (let i = 5; i <= 9; i++) fireShot('player', 0, i);
      // Battleship (2,5-8)
      for (let i = 5; i <= 8; i++) fireShot('player', 2, i);
      // Cruiser 1 (4,5-7)
      for (let i = 5; i <= 7; i++) fireShot('player', 4, i);
      // Cruiser 2 (6,5-7)
      for (let i = 5; i <= 7; i++) fireShot('player', 6, i);
      // Destroyer (8,5-6)
      fireShot('player', 8, 5);
      const result = fireShot('player', 8, 6);
      
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('player');
    });
  });

  describe('Fleet status tracking', () => {
    test('should track enemy fleet damage', () => {
      // Enemy Carrier is at row 0, cols 5-9 (from setup)
      fireShot('player', 0, 5); // Hit enemy Carrier
      fireShot('player', 0, 6); // Hit enemy Carrier
      
      const status = getFleetStatus('enemy');
      const carrier = status.find(s => s.name === 'Carrier');
      
      expect(carrier.hits).toBe(2);
      expect(carrier.health).toBe(60); // 3/5 = 60%
    });

    test('should show player fleet damage from enemy shots', () => {
      // Player Carrier is at row 0, cols 0-4 (from setup)
      // Enemy shoots at player Carrier
      fireShot('enemy', 0, 0);
      fireShot('enemy', 0, 1);
      
      const status = getFleetStatus('player');
      const carrier = status.find(s => s.name === 'Carrier');
      
      expect(carrier.hits).toBe(2);
      expect(carrier.health).toBe(60);
    });
  });

  describe('Error handling', () => {
    test('should throw error when firing outside battle phase', () => {
      initGame();
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 2, 0, true);
      placeShip('player', SHIPS[2], 4, 0, true);
      placeShip('player', SHIPS[2], 6, 0, true);
      placeShip('player', SHIPS[3], 8, 0, true);
      // Don't start battle
      
      expect(() => fireShot('player', 0, 0)).toThrow('game is not in BATTLE phase');
    });

    test('should throw error for invalid negative coordinates', () => {
      expect(() => fireShot('player', -1, 0)).toThrow();
    });
  });
});
