/**
 * Win/Lose Condition module for Battleship Game
 * US-012: Win/Lose Detection
 */

// Import game state from game.js
import { getGameState, PHASES } from './game.js';

/**
 * Check if the enemy fleet is completely sunk (Win condition)
 * @returns {boolean} True if all enemy ships are sunk
 */
export function checkWinCondition() {
  const state = getGameState();
  
  if (state.phase !== PHASES.BATTLE) {
    return false;
  }
  
  // Check if all enemy ships are sunk
  return state.enemyShips.every(ship => ship.sunk);
}

/**
 * Check if the player fleet is completely sunk (Lose condition)
 * @returns {boolean} True if all player ships are sunk
 */
export function checkLoseCondition() {
  const state = getGameState();
  
  if (state.phase !== PHASES.BATTLE) {
    return false;
  }
  
  // Check if all player ships are sunk
  return state.playerShips.every(ship => ship.sunk);
}

/**
 * Check if the game is over (either win or lose)
 * @returns {boolean} True if game is over
 */
export function isGameOver() {
  const state = getGameState();
  return state.phase === PHASES.GAMEOVER;
}

/**
 * Calculate final game statistics
 * @param {string} winner - 'player' or 'enemy'
 * @returns {Object} Statistics object
 */
export function calculateStatistics(winner) {
  const state = getGameState();
  
  const shots = winner === 'player' ? state.playerShots : state.enemyShots;
  const totalShots = shots.length;
  const hits = shots.filter(s => s.hit).length;
  const misses = totalShots - hits;
  const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;
  
  // Get fleet status for winner and loser
  const winnerFleet = winner === 'player' ? state.playerShips : state.enemyShips;
  const loserFleet = winner === 'player' ? state.enemyShips : state.playerShips;
  
  // Calculate ships sunk by each side
  const winnerShipsSunk = winnerFleet.filter(s => s.sunk).length;
  const loserShipsSunk = loserFleet.filter(s => s.sunk).length;
  
  return {
    totalShots,
    hits,
    misses,
    accuracy,
    winnerShipsSunk,
    loserShipsSunk,
    winnerFleetHealth: Math.round(winnerFleet.reduce((acc, ship) => {
      return acc + ((ship.size - ship.hits) / ship.size) * 100;
    }, 0) / winnerFleet.length),
    loserFleetHealth: Math.round(loserFleet.reduce((acc, ship) => {
      return acc + ((ship.size - ship.hits) / ship.size) * 100;
    }, 0) / loserFleet.length),
    turnNumber: state.turnNumber
  };
}

/**
 * Get the current game result
 * @returns {Object} { isGameOver, winner, statistics }
 */
export function getGameResult() {
  const state = getGameState();
  
  if (state.phase !== PHASES.GAMEOVER) {
    return {
      isGameOver: false,
      winner: null,
      statistics: null
    };
  }
  
  return {
    isGameOver: true,
    winner: state.winner,
    statistics: calculateStatistics(state.winner)
  };
}
