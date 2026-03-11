/**
 * Tests for Game State Management (US-002)
 */

import {
  initGame,
  startBattle,
  endGame,
  getGameState,
  setCurrentTurn,
  switchTurn,
  placeShip,
  fireShot,
  areAllShipsSunk,
  isValidShipPlacement,
  PHASES,
  PLAYERS,
  GRID_SIZE
} from '../js/gameState.js';

describe('Game State Management', () => {
  
  beforeEach(() => {
    // Reset game state before each test
    initGame();
  });
  
  describe('initGame()', () => {
    test('should initialize gameState with all required properties', () => {
      const state = getGameState();
      
      expect(state).not.toBeNull();
      expect(state.phase).toBe(PHASES.SETUP);
      expect(state.currentPlayerTurn).toBe(PLAYERS.PLAYER);
      expect(state.playerBoard).toBeDefined();
      expect(state.enemyBoard).toBeDefined();
      expect(state.playerShips).toBeDefined();
      expect(state.enemyShips).toBeDefined();
    });
    
    test('should create 10x10 boards', () => {
      const state = getGameState();
      
      expect(state.playerBoard.length).toBe(10);
      expect(state.enemyBoard.length).toBe(10);
      
      for (let row = 0; row < 10; row++) {
        expect(state.playerBoard[row].length).toBe(10);
        expect(state.enemyBoard[row].length).toBe(10);
      }
    });
    
    test('should initialize empty board cells', () => {
      const state = getGameState();
      const cell = state.playerBoard[0][0];
      
      expect(cell.hasShip).toBe(false);
      expect(cell.isHit).toBe(false);
      expect(cell.shipId).toBeNull();
    });
    
    test('should create ships with correct configuration', () => {
      const state = getGameState();
      
      // Should have 5 ships total: 1 Carrier, 1 Battleship, 2 Cruisers, 1 Destroyer
      expect(state.playerShips.length).toBe(5);
      
      const carrier = state.playerShips.find(s => s.name === 'Carrier');
      expect(carrier.size).toBe(5);
      
      const battleship = state.playerShips.find(s => s.name === 'Battleship');
      expect(battleship.size).toBe(4);
      
      const cruisers = state.playerShips.filter(s => s.name === 'Cruiser');
      expect(cruisers.length).toBe(2);
      expect(cruisers[0].size).toBe(3);
      
      const destroyer = state.playerShips.find(s => s.name === 'Destroyer');
      expect(destroyer.size).toBe(2);
    });
    
    test('should reset to initial values when called again', () => {
      const state1 = getGameState();
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      
      // Re-initialize
      initGame();
      const state2 = getGameState();
      
      expect(state2.phase).toBe(PHASES.SETUP);
      expect(state2.playerShips[0].positions.length).toBe(0);
    });
  });
  
  describe('startBattle()', () => {
    test('should transition from SETUP to BATTLE phase', () => {
      // Place all ships for both players
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      const result = startBattle();
      
      expect(result).toBe(true);
      expect(getGameState().phase).toBe(PHASES.BATTLE);
      expect(getGameState().currentPlayerTurn).toBe(PLAYERS.PLAYER);
    });
    
    test('should fail if not all player ships are placed', () => {
      // Don't place all ships
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      const result = startBattle();
      
      expect(result).toBe(false);
      expect(getGameState().phase).toBe(PHASES.SETUP);
    });
    
    test('should fail if not in SETUP phase', () => {
      // Place all ships and start battle
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      startBattle();
      
      // Try to start battle again
      const result = startBattle();
      
      expect(result).toBe(false);
    });
  });
  
  describe('endGame()', () => {
    test('should transition to GAMEOVER phase with winner', () => {
      // Setup and start battle
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      startBattle();
      
      const result = endGame(PLAYERS.PLAYER);
      
      expect(result).toBe(true);
      expect(getGameState().phase).toBe(PHASES.GAMEOVER);
      expect(getGameState().winner).toBe(PLAYERS.PLAYER);
    });
    
    test('should fail if not in BATTLE phase', () => {
      // In SETUP phase
      const result = endGame(PLAYERS.PLAYER);
      
      expect(result).toBe(false);
      expect(getGameState().phase).toBe(PHASES.SETUP);
    });
    
    test('should fail with invalid winner', () => {
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      startBattle();
      
      const result = endGame('invalid');
      
      expect(result).toBe(false);
      expect(getGameState().phase).toBe(PHASES.BATTLE);
    });
  });
  
  describe('turn management', () => {
    beforeEach(() => {
      // Setup and start battle
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      startBattle();
    });
    
    test('should switch turn from player to enemy', () => {
      expect(getGameState().currentPlayerTurn).toBe(PLAYERS.PLAYER);
      
      const newTurn = switchTurn();
      
      expect(newTurn).toBe(PLAYERS.ENEMY);
      expect(getGameState().currentPlayerTurn).toBe(PLAYERS.ENEMY);
    });
    
    test('should switch turn from enemy to player', () => {
      switchTurn(); // Now enemy's turn
      
      const newTurn = switchTurn();
      
      expect(newTurn).toBe(PLAYERS.PLAYER);
    });
    
    test('should set current turn directly', () => {
      setCurrentTurn(PLAYERS.ENEMY);
      
      expect(getGameState().currentPlayerTurn).toBe(PLAYERS.ENEMY);
    });
  });
  
  describe('placeShip()', () => {
    test('should place ship on player board', () => {
      const result = placeShip(PLAYERS.PLAYER, 0, [
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
        {row: 0, col: 3},
        {row: 0, col: 4}
      ]);
      
      expect(result).toBe(true);
      
      const state = getGameState();
      expect(state.playerBoard[0][0].hasShip).toBe(true);
      expect(state.playerBoard[0][0].shipId).toBe(0);
      expect(state.playerShips[0].positions.length).toBe(5);
    });
    
    test('should fail to place overlapping ships', () => {
      placeShip(PLAYERS.PLAYER, 0, [
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
        {row: 0, col: 3},
        {row: 0, col: 4}
      ]);
      
      const result = placeShip(PLAYERS.PLAYER, 1, [
        {row: 0, col: 2},
        {row: 0, col: 3},
        {row: 0, col: 4},
        {row: 0, col: 5}
      ]);
      
      expect(result).toBe(false);
    });
    
    test('should fail if ship size does not match positions', () => {
      const result = placeShip(PLAYERS.PLAYER, 0, [
        {row: 0, col: 0},
        {row: 0, col: 1}
      ]);
      
      expect(result).toBe(false);
    });
    
    test('should fail if positions are out of bounds', () => {
      const result = placeShip(PLAYERS.PLAYER, 0, [
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
        {row: 0, col: 3},
        {row: 0, col: 10} // Invalid
      ]);
      
      expect(result).toBe(false);
    });
  });
  
  describe('fireShot()', () => {
    beforeEach(() => {
      // Setup and start battle
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      startBattle();
    });
    
    test('should record a hit when shooting at enemy ship', () => {
      const result = fireShot(PLAYERS.ENEMY, 0, 0);
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      
      const state = getGameState();
      expect(state.enemyBoard[0][0].isHit).toBe(true);
      expect(state.playerShotHistory.length).toBe(1);
    });
    
    test('should record a miss when shooting at empty cell', () => {
      const result = fireShot(PLAYERS.ENEMY, 5, 5);
      
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });
    
    test('should detect when ship is sunk', () => {
      // Sink the Destroyer (2 cells)
      fireShot(PLAYERS.ENEMY, 4, 0);
      const result = fireShot(PLAYERS.ENEMY, 4, 1);
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.shipName).toBe('Destroyer');
    });
    
    test('should not allow shooting same cell twice', () => {
      fireShot(PLAYERS.ENEMY, 0, 0);
      const result = fireShot(PLAYERS.ENEMY, 0, 0);
      
      expect(result.hit).toBe(false);
      expect(result.error).toBe('Already shot');
    });
  });
  
  describe('areAllShipsSunk()', () => {
    test('should return false when no ships are sunk', () => {
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}]);
      
      expect(areAllShipsSunk(PLAYERS.PLAYER)).toBe(false);
    });
    
    test('should return true when all ships are sunk', () => {
      initGame();
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      // Manually sink all ships
      for (const ship of getGameState().playerShips) {
        ship.sunk = true;
      }
      
      expect(areAllShipsSunk(PLAYERS.PLAYER)).toBe(true);
    });
  });
  
  describe('isValidShipPlacement()', () => {
    test('should validate horizontal placement', () => {
      const positions = [
        {row: 0, col: 0},
        {row: 0, col: 1},
        {row: 0, col: 2},
        {row: 0, col: 3}
      ];
      
      expect(isValidShipPlacement(positions)).toBe(true);
    });
    
    test('should validate vertical placement', () => {
      const positions = [
        {row: 0, col: 0},
        {row: 1, col: 0},
        {row: 2, col: 0}
      ];
      
      expect(isValidShipPlacement(positions)).toBe(true);
    });
    
    test('should reject diagonal placement', () => {
      const positions = [
        {row: 0, col: 0},
        {row: 1, col: 1},
        {row: 2, col: 2}
      ];
      
      expect(isValidShipPlacement(positions)).toBe(false);
    });
    
    test('should reject non-contiguous placement', () => {
      const positions = [
        {row: 0, col: 0},
        {row: 0, col: 2}, // Gap
        {row: 0, col: 3}
      ];
      
      expect(isValidShipPlacement(positions)).toBe(false);
    });
  });
  
  describe('state transitions', () => {
    test('should follow complete game flow: SETUP -> BATTLE -> GAMEOVER', () => {
      const state1 = getGameState();
      expect(state1.phase).toBe(PHASES.SETUP);
      
      // Place all ships
      placeShip(PLAYERS.PLAYER, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.PLAYER, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.PLAYER, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.PLAYER, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.PLAYER, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      placeShip(PLAYERS.ENEMY, 0, [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}]);
      placeShip(PLAYERS.ENEMY, 1, [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}]);
      placeShip(PLAYERS.ENEMY, 2, [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}]);
      placeShip(PLAYERS.ENEMY, 3, [{row: 3, col: 0}, {row: 3, col: 1}, {row: 3, col: 2}]);
      placeShip(PLAYERS.ENEMY, 4, [{row: 4, col: 0}, {row: 4, col: 1}]);
      
      startBattle();
      
      const state2 = getGameState();
      expect(state2.phase).toBe(PHASES.BATTLE);
      
      endGame(PLAYERS.PLAYER);
      
      const state3 = getGameState();
      expect(state3.phase).toBe(PHASES.GAMEOVER);
      expect(state3.winner).toBe(PLAYERS.PLAYER);
    });
  });
});