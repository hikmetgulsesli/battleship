/**
 * Ship module for Battleship game
 * Manages ship data model and operations
 */

// Ship types with Turkish names
export const SHIP_TYPES = {
  CARRIER: {
    name: 'Taşıyıcı',
    length: 5
  },
  BATTLESHIP: {
    name: 'Savaş Gemisi',
    length: 4
  },
  CRUISER: {
    name: 'Kruvazör',
    length: 3
  },
  DESTROYER: {
    name: 'Destroyer',
    length: 2
  }
};

/**
 * Creates a new ship object
 * @param {string} type - Ship type key (CARRIER, BATTLESHIP, CRUISER, DESTROYER)
 * @param {number} row - Starting row index
 * @param {number} col - Starting column index
 * @param {boolean} horizontal - true for horizontal, false for vertical
 * @returns {Object|null} Ship object or null if invalid type
 */
export function createShip(type, row, col, horizontal = true) {
  const shipType = SHIP_TYPES[type];
  if (!shipType) {
    return null;
  }

  const positions = getShipPositions(type, row, col, horizontal);
  if (!positions) {
    return null;
  }

  return {
    type,
    name: shipType.name,
    length: shipType.length,
    row,
    col,
    horizontal,
    hits: new Set(),
    positions
  };
}

/**
 * Gets all cell positions occupied by a ship
 * @param {string} type - Ship type key
 * @param {number} row - Starting row index
 * @param {number} col - Starting column index
 * @param {boolean} horizontal - true for horizontal, false for vertical
 * @returns {Array<{row: number, col: number}>|null} Array of positions or null if invalid
 */
export function getShipPositions(type, row, col, horizontal) {
  const shipType = SHIP_TYPES[type];
  if (!shipType) {
    return null;
  }

  if (typeof row !== 'number' || typeof col !== 'number' ||
      row < 0 || row > 9 || col < 0 || col > 9) {
    return null;
  }

  const positions = [];
  const length = shipType.length;

  if (horizontal) {
    if (col + length > 10) {
      return null;
    }
    for (let i = 0; i < length; i++) {
      positions.push({ row, col: col + i });
    }
  } else {
    if (row + length > 10) {
      return null;
    }
    for (let i = 0; i < length; i++) {
      positions.push({ row: row + i, col });
    }
  }

  return positions;
}

/**
 * Rotates a ship (toggles horizontal/vertical)
 * @param {Object} ship - Ship object
 * @returns {Object} New ship object with toggled orientation
 */
export function rotateShip(ship) {
  const newHorizontal = !ship.horizontal;
  const positions = getShipPositions(ship.type, ship.row, ship.col, newHorizontal);
  
  return {
    ...ship,
    horizontal: newHorizontal,
    positions,
    // Reset hits as positions changed
    hits: new Set()
  };
}

/**
 * Records a hit on the ship
 * @param {Object} ship - Ship object
 * @param {number} row - Hit row index
 * @param {number} col - Hit column index
 * @returns {boolean} True if hit was recorded, false if not a valid position
 */
export function hitShip(ship, row, col) {
  const positionKey = `${row},${col}`;
  
  // Check if this position belongs to the ship
  const isHitPosition = ship.positions.some(p => p.row === row && p.col === col);
  
  if (!isHitPosition) {
    return false;
  }

  ship.hits.add(positionKey);
  return true;
}

/**
 * Checks if a ship is sunk (all positions hit)
 * @param {Object} ship - Ship object
 * @returns {boolean} True if all positions are hit
 */
export function isShipSunk(ship) {
  return ship.hits.size === ship.length;
}

/**
 * Checks if a position is part of a ship
 * @param {Object} ship - Ship object
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {boolean} True if position is part of ship
 */
export function isPositionOnShip(ship, row, col) {
  return ship.positions.some(p => p.row === row && p.col === col);
}
