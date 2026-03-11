/**
 * Tests for US-013: Game Over Screens
 * Verifies game over functionality for Victory and Defeat scenarios
 */

import {
  SHIPS,
  PHASES,
  CELL_STATE,
  initGame,
  getGameState,
  startBattle,
  endGame,
  placeShip,
  fireShot,
  randomizeShips,
  getFleetStatus
} from '../stitch/game.js';

describe('US-013: Game Over Screens', () => {
  // Helper to set up a complete game state with known positions
  function setupGameForGameOver() {
    initGame();
    // Player ships (using unique positions)
    // Carrier (5): A1-A5 (0,0)-(0,4)
    placeShip('player', SHIPS[0], 0, 0, true);
    // Battleship (4): A3-D3 (2,0)-(2,3)
    placeShip('player', SHIPS[1], 2, 0, true);
    // Cruiser 1 (3): A5-C5 (4,0)-(4,2)
    placeShip('player', SHIPS[2], 4, 0, true);
    // Cruiser 2 (3): E5-G5 (4,4)-(4,6)
    placeShip('player', SHIPS[2], 4, 4, true);
    // Destroyer (2): A9-B9 (7,0)-(7,1)
    placeShip('player', SHIPS[3], 7, 0, true);
    
    // Enemy ships at same positions
    placeShip('enemy', SHIPS[0], 0, 0, true);
    placeShip('enemy', SHIPS[1], 2, 0, true);
    placeShip('enemy', SHIPS[2], 4, 0, true);
    placeShip('enemy', SHIPS[2], 4, 4, true);
    placeShip('enemy', SHIPS[3], 7, 0, true);
    
    startBattle();
  }

  describe('Victory Detection', () => {
    test('should detect player victory when all enemy ships sunk', () => {
      setupGameForGameOver();
      
      // Sink all enemy ships
      // Carrier at row 0, cols 0-4 (5 cells)
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      fireShot('player', 0, 3);
      fireShot('player', 0, 4);
      
      // Battleship at row 2, cols 0-3 (4 cells)
      fireShot('player', 2, 0);
      fireShot('player', 2, 1);
      fireShot('player', 2, 2);
      fireShot('player', 2, 3);
      
      // Cruiser 1 at row 4, cols 0-2 (3 cells)
      fireShot('player', 4, 0);
      fireShot('player', 4, 1);
      fireShot('player', 4, 2);
      
      // Cruiser 2 at row 4, cols 4-6 (3 cells)
      fireShot('player', 4, 4);
      fireShot('player', 4, 5);
      fireShot('player', 4, 6);
      
      // Destroyer at row 7, cols 0-1 (2 cells)
      fireShot('player', 7, 0);
      const result = fireShot('player', 7, 1);
      
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('player');
      
      const state = getGameState();
      expect(state.phase).toBe(PHASES.GAMEOVER);
      expect(state.winner).toBe('player');
    });

    test('should trigger victory screen after player wins', () => {
      setupGameForGameOver();
      
      // Sink all enemy ships (17 total hits)
      // Carrier: 5 hits
      for (let i = 0; i < 5; i++) fireShot('player', 0, i);
      // Battleship: 4 hits  
      for (let i = 0; i < 4; i++) fireShot('player', 2, i);
      // Cruiser 1: 3 hits
      for (let i = 0; i < 3; i++) fireShot('player', 4, i);
      // Cruiser 2: 3 hits
      for (let i = 4; i < 7; i++) fireShot('player', 4, i);
      // Destroyer: 2 hits
      fireShot('player', 7, 0);
      const result = fireShot('player', 7, 1);
      
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('player');
    });
  });

  describe('Defeat Detection', () => {
    test('should detect enemy victory when all player ships sunk', () => {
      setupGameForGameOver();
      
      // Enemy sinks all player ships
      // Carrier at row 0, cols 0-4
      fireShot('enemy', 0, 0);
      fireShot('enemy', 0, 1);
      fireShot('enemy', 0, 2);
      fireShot('enemy', 0, 3);
      fireShot('enemy', 0, 4);
      
      // Battleship at row 2, cols 0-3
      fireShot('enemy', 2, 0);
      fireShot('enemy', 2, 1);
      fireShot('enemy', 2, 2);
      fireShot('enemy', 2, 3);
      
      // Cruiser 1 at row 4, cols 0-2
      fireShot('enemy', 4, 0);
      fireShot('enemy', 4, 1);
      fireShot('enemy', 4, 2);
      
      // Cruiser 2 at row 4, cols 4-6
      fireShot('enemy', 4, 4);
      fireShot('enemy', 4, 5);
      fireShot('enemy', 4, 6);
      
      // Destroyer at row 7, cols 0-1
      fireShot('enemy', 7, 0);
      const result = fireShot('enemy', 7, 1);
      
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('enemy');
      
      const state = getGameState();
      expect(state.phase).toBe(PHASES.GAMEOVER);
      expect(state.winner).toBe('enemy');
    });

    test('should trigger defeat screen after player loses', () => {
      setupGameForGameOver();
      
      // Enemy sinks all player ships
      for (let i = 0; i < 5; i++) fireShot('enemy', 0, i);
      for (let i = 0; i < 4; i++) fireShot('enemy', 2, i);
      for (let i = 0; i < 3; i++) fireShot('enemy', 4, i);
      for (let i = 4; i < 7; i++) fireShot('enemy', 4, i);
      fireShot('enemy', 7, 0);
      const result = fireShot('enemy', 7, 1);
      
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('enemy');
    });
  });

  describe('Game Over State', () => {
    test('should have correct phase after game ends', () => {
      setupGameForGameOver();
      
      // Sink all enemy ships
      for (let i = 0; i < 5; i++) fireShot('player', 0, i);
      for (let i = 0; i < 4; i++) fireShot('player', 2, i);
      for (let i = 0; i < 3; i++) fireShot('player', 4, i);
      for (let i = 4; i < 7; i++) fireShot('player', 4, i);
      fireShot('player', 7, 0);
      fireShot('player', 7, 1);
      
      const state = getGameState();
      expect(state.phase).toBe(PHASES.GAMEOVER);
    });

    test('should preserve board state after game over', () => {
      setupGameForGameOver();
      
      // Make some shots before game over
      fireShot('player', 0, 0); // Hit
      fireShot('player', 9, 9); // Miss
      fireShot('enemy', 5, 5); // Miss
      
      // End game manually
      endGame('player');
      
      const state = getGameState();
      
      // Board states should be preserved
      expect(state.enemyBoard[0][0]).toBe(CELL_STATE.HIT);
      expect(state.enemyBoard[9][9]).toBe(CELL_STATE.MISS);
      expect(state.playerBoard[5][5]).toBe(CELL_STATE.MISS);
      
      // Shot history should be preserved
      expect(state.playerShots).toHaveLength(2);
      expect(state.enemyShots).toHaveLength(1);
    });

    test('should preserve shot statistics after game over', () => {
      setupGameForGameOver();
      
      // Player fires multiple shots
      fireShot('player', 0, 0); // Hit
      fireShot('player', 0, 1); // Hit
      fireShot('player', 0, 2); // Hit
      fireShot('player', 0, 3); // Hit
      fireShot('player', 0, 4); // Hit (Carrier sunk)
      fireShot('player', 9, 9); // Miss
      
      // Enemy fires multiple shots
      fireShot('enemy', 5, 5); // Miss
      fireShot('enemy', 6, 6); // Miss
      
      endGame('player');
      
      const state = getGameState();
      
      // Player statistics
      const playerHits = state.playerShots.filter(s => s.hit).length;
      const playerMisses = state.playerShots.filter(s => !s.hit).length;
      const playerTotal = state.playerShots.length;
      
      expect(playerTotal).toBe(6);
      expect(playerHits).toBe(5);
      expect(playerMisses).toBe(1);
      
      // Enemy statistics  
      const enemyHits = state.enemyShots.filter(s => s.hit).length;
      const enemyMisses = state.enemyShots.filter(s => !s.hit).length;
      const enemyTotal = state.enemyShots.length;
      
      expect(enemyTotal).toBe(2);
      expect(enemyHits).toBe(0);
      expect(enemyMisses).toBe(2);
    });
  });

  describe('Statistics Calculation', () => {
    test('should calculate accurate hit percentage for victory', () => {
      setupGameForGameOver();
      
      // Fire 10 shots: 4 hits, 6 misses
      fireShot('player', 0, 0); // Hit
      fireShot('player', 0, 1); // Hit
      fireShot('player', 0, 2); // Hit
      fireShot('player', 0, 3); // Hit
      fireShot('player', 9, 0); // Miss
      fireShot('player', 9, 1); // Miss
      fireShot('player', 9, 2); // Miss
      fireShot('player', 9, 3); // Miss
      fireShot('player', 9, 4); // Miss
      fireShot('player', 9, 5); // Miss
      
      const state = getGameState();
      const totalShots = state.playerShots.length;
      const hits = state.playerShots.filter(s => s.hit).length;
      const hitPercentage = Math.round((hits / totalShots) * 100);
      
      expect(hitPercentage).toBe(40);
    });

    test('should calculate accurate hit percentage for defeat', () => {
      setupGameForGameOver();
      
      // Enemy fires 20 shots: 3 hits, 17 misses
      fireShot('enemy', 0, 0); // Hit
      fireShot('enemy', 0, 1); // Hit
      fireShot('enemy', 0, 2); // Hit
      // Distribute 17 misses across valid grid coordinates
      let missCount = 0;
      for (let row = 5; row < 10 && missCount < 17; row++) {
        for (let col = 0; col < 10 && missCount < 17; col++) {
          fireShot('enemy', row, col); // Miss
          missCount++;
        }
      }
      
      const state = getGameState();
      const totalShots = state.enemyShots.length;
      const hits = state.enemyShots.filter(s => s.hit).length;
      const hitPercentage = Math.round((hits / totalShots) * 100);
      
      expect(hitPercentage).toBe(15);
    });

    test('should track sunk ships correctly in game over', () => {
      setupGameForGameOver();
      
      // Sink Carrier (5 hits at row 0, cols 0-4)
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      fireShot('player', 0, 3);
      const result = fireShot('player', 0, 4);
      
      expect(result.sunk).toBe(true);
      expect(result.sunkShipName).toBe('Carrier');
      
      const enemyStatus = getFleetStatus('enemy');
      const carrier = enemyStatus.find(s => s.name === 'Carrier');
      
      expect(carrier.sunk).toBe(true);
      expect(carrier.health).toBe(0);
    });
  });

  describe('Play Again Reset', () => {
    test('should reset game state for new game', () => {
      setupGameForGameOver();
      
      // Make some shots
      fireShot('player', 0, 0);
      fireShot('enemy', 5, 5);
      
      // End game
      endGame('player');
      
      // Reset for new game
      const newState = initGame();
      
      expect(newState.phase).toBe(PHASES.SETUP);
      expect(newState.winner).toBeNull();
      expect(newState.playerShips).toHaveLength(0);
      expect(newState.enemyShips).toHaveLength(0);
      expect(newState.playerShots).toHaveLength(0);
      expect(newState.enemyShots).toHaveLength(0);
    });

    test('should allow new game after victory', () => {
      setupGameForGameOver();
      
      // Win the game - sink all enemy ships
      for (let i = 0; i < 5; i++) fireShot('player', 0, i);
      for (let i = 0; i < 4; i++) fireShot('player', 2, i);
      for (let i = 0; i < 3; i++) fireShot('player', 4, i);
      for (let i = 4; i < 7; i++) fireShot('player', 4, i);
      fireShot('player', 7, 0);
      fireShot('player', 7, 1);
      
      expect(getGameState().winner).toBe('player');
      
      // Start new game
      initGame();
      randomizeShips('player');
      randomizeShips('enemy');
      startBattle();
      
      const stateAfter = getGameState();
      expect(stateAfter.phase).toBe(PHASES.BATTLE);
      expect(stateAfter.winner).toBeNull();
    });

    test('should allow new game after defeat', () => {
      setupGameForGameOver();
      
      // Lose the game - enemy sinks all player ships
      for (let i = 0; i < 5; i++) fireShot('enemy', 0, i);
      for (let i = 0; i < 4; i++) fireShot('enemy', 2, i);
      for (let i = 0; i < 3; i++) fireShot('enemy', 4, i);
      for (let i = 4; i < 7; i++) fireShot('enemy', 4, i);
      fireShot('enemy', 7, 0);
      fireShot('enemy', 7, 1);
      
      expect(getGameState().winner).toBe('enemy');
      
      // Start new game
      initGame();
      randomizeShips('player');
      randomizeShips('enemy');
      startBattle();
      
      const stateAfter = getGameState();
      expect(stateAfter.phase).toBe(PHASES.BATTLE);
      expect(stateAfter.winner).toBeNull();
    });
  });

  describe('Grid Display in Game Over', () => {
    test('should show complete board state after game over', () => {
      setupGameForGameOver();
      
      // Fire some shots
      fireShot('player', 0, 0); // Hit enemy carrier
      fireShot('player', 9, 9); // Miss
      fireShot('enemy', 5, 5); // Miss on player
      
      endGame('player');
      
      const state = getGameState();
      
      // Enemy board should show hits and misses (ships are hidden)
      expect(state.enemyBoard[0][0]).toBe(CELL_STATE.HIT);
      expect(state.enemyBoard[9][9]).toBe(CELL_STATE.MISS);
      
      // Player board should show ships, hits, misses
      // At 5,5 there's no ship so it becomes MISS
      expect(state.playerBoard[5][5]).toBe(CELL_STATE.MISS);
    });
  });
});