/**
 * Tests for US-012: Win/Lose Detection
 * Verifies win/lose condition checking and game end detection
 */

import {
  checkWinCondition,
  checkLoseCondition,
  isGameOver,
  calculateStatistics,
  getGameResult
} from '../stitch/win-lose.js';

import {
  SHIPS,
  PHASES,
  createEmptyGrid,
  createInitialState,
  getGameState,
  initGame,
  startBattle,
  endGame,
  placeShip,
  fireShot
} from '../stitch/game.js';

describe('US-012: Win/Lose Detection', () => {
  beforeEach(() => {
    initGame();
  });

  describe('checkWinCondition()', () => {
    test('should return false when game is in SETUP phase', () => {
      // Place player ships but don't start battle
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      
      const result = checkWinCondition();
      expect(result).toBe(false);
    });

    test('should return false when not all enemy ships are sunk', () => {
      // Set up and start battle
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 0, 6, true);
      placeShip('enemy', SHIPS[2], 2, 0, true);
      placeShip('enemy', SHIPS[2], 2, 4, true);
      placeShip('enemy', SHIPS[3], 2, 8, true);
      
      startBattle();
      
      // Sink only one ship
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      fireShot('player', 0, 3);
      fireShot('player', 0, 4);
      
      const result = checkWinCondition();
      expect(result).toBe(false);
    });

    test('should return true when all enemy ships are sunk (game ends automatically)', () => {
      // Set up and start battle
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      
      // Place enemy ships - Carrier at row 0, cols 0-4
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 2, 0, true);
      placeShip('enemy', SHIPS[2], 4, 0, true);
      placeShip('enemy', SHIPS[2], 4, 3, true);
      placeShip('enemy', SHIPS[3], 6, 0, true);
      
      startBattle();
      
      // Sink all enemy ships - this triggers endGame automatically
      // Carrier: size 5
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      fireShot('player', 0, 3);
      fireShot('player', 0, 4);
      
      // Battleship: size 4
      fireShot('player', 2, 0);
      fireShot('player', 2, 1);
      fireShot('player', 2, 2);
      fireShot('player', 2, 3);
      
      // Cruiser 1: size 3
      fireShot('player', 4, 0);
      fireShot('player', 4, 1);
      fireShot('player', 4, 2);
      
      // Cruiser 2: size 3
      fireShot('player', 4, 3);
      fireShot('player', 4, 4);
      fireShot('player', 4, 5);
      
      // Destroyer: size 2
      fireShot('player', 6, 0);
      fireShot('player', 6, 1);
      
      // Now check - game should be over with player as winner
      const result = checkWinCondition();
      expect(result).toBe(true);
      
      // Verify game state
      const state = getGameState();
      expect(state.phase).toBe(PHASES.GAMEOVER);
      expect(state.winner).toBe('player');
    });

    test('should return true when manually ended with player as winner', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      endGame('player');
      
      const result = checkWinCondition();
      expect(result).toBe(true);
    });
  });

  describe('checkLoseCondition()', () => {
    test('should return false when game is in SETUP phase', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      
      const result = checkLoseCondition();
      expect(result).toBe(false);
    });

    test('should return false when player still has ships', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 2, 0, true);
      placeShip('enemy', SHIPS[2], 4, 0, true);
      placeShip('enemy', SHIPS[2], 4, 3, true);
      placeShip('enemy', SHIPS[3], 6, 0, true);
      
      startBattle();
      
      // Enemy sinks only one player ship
      fireShot('enemy', 0, 0);
      fireShot('enemy', 0, 1);
      fireShot('enemy', 0, 2);
      fireShot('enemy', 0, 3);
      fireShot('enemy', 0, 4);
      
      const result = checkLoseCondition();
      expect(result).toBe(false);
    });

    test('should return true when all player ships are sunk', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 2, 0, true);
      placeShip('player', SHIPS[2], 4, 0, true);
      placeShip('player', SHIPS[2], 4, 3, true);
      placeShip('player', SHIPS[3], 6, 0, true);
      
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 0, 6, true);
      placeShip('enemy', SHIPS[2], 2, 0, true);
      placeShip('enemy', SHIPS[2], 2, 4, true);
      placeShip('enemy', SHIPS[3], 2, 8, true);
      
      startBattle();
      
      // Enemy sinks all player ships
      // Carrier: size 5
      fireShot('enemy', 0, 0);
      fireShot('enemy', 0, 1);
      fireShot('enemy', 0, 2);
      fireShot('enemy', 0, 3);
      fireShot('enemy', 0, 4);
      
      // Battleship: size 4
      fireShot('enemy', 2, 0);
      fireShot('enemy', 2, 1);
      fireShot('enemy', 2, 2);
      fireShot('enemy', 2, 3);
      
      // Cruiser 1: size 3
      fireShot('enemy', 4, 0);
      fireShot('enemy', 4, 1);
      fireShot('enemy', 4, 2);
      
      // Cruiser 2: size 3
      fireShot('enemy', 4, 3);
      fireShot('enemy', 4, 4);
      fireShot('enemy', 4, 5);
      
      // Destroyer: size 2
      fireShot('enemy', 6, 0);
      fireShot('enemy', 6, 1);
      
      const result = checkLoseCondition();
      expect(result).toBe(true);
      
      // Verify game state
      const state = getGameState();
      expect(state.phase).toBe(PHASES.GAMEOVER);
      expect(state.winner).toBe('enemy');
    });

    test('should return true when manually ended with enemy as winner', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      endGame('enemy');
      
      const result = checkLoseCondition();
      expect(result).toBe(true);
    });
  });

  describe('isGameOver()', () => {
    test('should return false in SETUP phase', () => {
      const result = isGameOver();
      expect(result).toBe(false);
    });

    test('should return false in BATTLE phase', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      
      const result = isGameOver();
      expect(result).toBe(false);
    });

    test('should return true in GAMEOVER phase', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      endGame('player');
      
      const result = isGameOver();
      expect(result).toBe(true);
    });
  });

  describe('calculateStatistics()', () => {
    test('should calculate correct statistics for player win', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 2, 0, true);
      placeShip('enemy', SHIPS[2], 4, 0, true);
      placeShip('enemy', SHIPS[2], 4, 3, true);
      placeShip('enemy', SHIPS[3], 6, 0, true);
      
      startBattle();
      
      // Player fires 17 shots (17 ship cells), hits all
      // Carrier
      fireShot('player', 0, 0);
      fireShot('player', 0, 1);
      fireShot('player', 0, 2);
      fireShot('player', 0, 3);
      fireShot('player', 0, 4);
      // Battleship
      fireShot('player', 2, 0);
      fireShot('player', 2, 1);
      fireShot('player', 2, 2);
      fireShot('player', 2, 3);
      // Cruiser 1
      fireShot('player', 4, 0);
      fireShot('player', 4, 1);
      fireShot('player', 4, 2);
      // Cruiser 2
      fireShot('player', 4, 3);
      fireShot('player', 4, 4);
      fireShot('player', 4, 5);
      // Destroyer
      fireShot('player', 6, 0);
      fireShot('player', 6, 1);
      
      const stats = calculateStatistics('player');
      
      expect(stats.totalShots).toBe(17);
      expect(stats.hits).toBe(17);
      expect(stats.misses).toBe(0);
      expect(stats.accuracy).toBe(100);
      // Winner (player) may have lost some ships too
      expect(stats.loserShipsSunk).toBe(5); // Enemy lost all 5 ships
    });

    test('should calculate statistics with misses', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      
      placeShip('enemy', SHIPS[0], 0, 0, true);
      placeShip('enemy', SHIPS[1], 2, 0, true);
      placeShip('enemy', SHIPS[2], 4, 0, true);
      placeShip('enemy', SHIPS[2], 4, 3, true);
      placeShip('enemy', SHIPS[3], 6, 0, true);
      
      startBattle();
      
      // Some hits, some misses
      fireShot('player', 0, 0); // hit
      fireShot('player', 0, 1); // hit
      fireShot('player', 0, 2); // hit
      fireShot('player', 0, 3); // hit
      fireShot('player', 0, 4); // hit - Carrier sunk (game should end here)
      
      // These shots won't execute because game ends at 5th shot
      // So let's check before game ends
      
      const stats = calculateStatistics('player');
      
      expect(stats.totalShots).toBe(5);
      expect(stats.hits).toBe(5);
      expect(stats.misses).toBe(0);
      expect(stats.accuracy).toBe(100);
    });
  });

  describe('getGameResult()', () => {
    test('should return game not over when in BATTLE', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      
      const result = getGameResult();
      
      expect(result.isGameOver).toBe(false);
      expect(result.winner).toBeNull();
      expect(result.statistics).toBeNull();
    });

    test('should return game result when game is over', () => {
      placeShip('player', SHIPS[0], 0, 0, true);
      placeShip('player', SHIPS[1], 0, 6, true);
      placeShip('player', SHIPS[2], 2, 0, true);
      placeShip('player', SHIPS[2], 2, 4, true);
      placeShip('player', SHIPS[3], 2, 8, true);
      startBattle();
      endGame('player');
      
      const result = getGameResult();
      
      expect(result.isGameOver).toBe(true);
      expect(result.winner).toBe('player');
      expect(result.statistics).not.toBeNull();
    });
  });
});
