import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  SHIP_TYPES,
  createShip,
  rotateShip,
  getShipPositions,
  isShipSunk,
  hitShip,
  isPositionOnShip
} from '../src/ship.js';

describe('SHIP_TYPES', () => {
  it('should define all 4 ship types with Turkish names', () => {
    expect(SHIP_TYPES.CARRIER).toEqual({ name: 'Taşıyıcı', length: 5 });
    expect(SHIP_TYPES.BATTLESHIP).toEqual({ name: 'Savaş Gemisi', length: 4 });
    expect(SHIP_TYPES.CRUISER).toEqual({ name: 'Kruvazör', length: 3 });
    expect(SHIP_TYPES.DESTROYER).toEqual({ name: 'Destroyer', length: 2 });
  });

  it('should have correct lengths', () => {
    expect(SHIP_TYPES.CARRIER.length).toBe(5);
    expect(SHIP_TYPES.BATTLESHIP.length).toBe(4);
    expect(SHIP_TYPES.CRUISER.length).toBe(3);
    expect(SHIP_TYPES.DESTROYER.length).toBe(2);
  });
});

describe('createShip', () => {
  it('should create a valid ship object', () => {
    const ship = createShip('CARRIER', 0, 0, true);

    expect(ship).not.toBeNull();
    expect(ship.type).toBe('CARRIER');
    expect(ship.name).toBe('Taşıyıcı');
    expect(ship.length).toBe(5);
    expect(ship.row).toBe(0);
    expect(ship.col).toBe(0);
    expect(ship.horizontal).toBe(true);
    expect(ship.hits).toBeInstanceOf(Set);
    expect(ship.hits.size).toBe(0);
    expect(ship.positions).toHaveLength(5);
  });

  it('should return null for invalid ship type', () => {
    const ship = createShip('INVALID', 0, 0, true);
    expect(ship).toBeNull();
  });

  it('should return null for invalid position', () => {
    const ship = createShip('CARRIER', -1, 0, true);
    expect(ship).toBeNull();
  });

  it('should create vertical ship correctly', () => {
    const ship = createShip('BATTLESHIP', 0, 0, false);

    expect(ship).not.toBeNull();
    expect(ship.horizontal).toBe(false);
    expect(ship.positions).toHaveLength(4);
    expect(ship.positions[0]).toEqual({ row: 0, col: 0 });
    expect(ship.positions[3]).toEqual({ row: 3, col: 0 });
  });

  it('should return null when ship goes out of bounds horizontally', () => {
    const ship = createShip('CARRIER', 0, 8, true); // 5 + 8 = 13 > 10
    expect(ship).toBeNull();
  });

  it('should return null when ship goes out of bounds vertically', () => {
    const ship = createShip('CARRIER', 8, 0, false); // 5 + 8 = 13 > 10
    expect(ship).toBeNull();
  });
});

describe('getShipPositions', () => {
  it('should return correct cell coordinates for horizontal ship', () => {
    const positions = getShipPositions('CRUISER', 3, 2, true);

    expect(positions).toHaveLength(3);
    expect(positions[0]).toEqual({ row: 3, col: 2 });
    expect(positions[1]).toEqual({ row: 3, col: 3 });
    expect(positions[2]).toEqual({ row: 3, col: 4 });
  });

  it('should return correct cell coordinates for vertical ship', () => {
    const positions = getShipPositions('DESTROYER', 5, 7, false);

    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({ row: 5, col: 7 });
    expect(positions[1]).toEqual({ row: 6, col: 7 });
  });

  it('should return null for invalid type', () => {
    const positions = getShipPositions('INVALID', 0, 0, true);
    expect(positions).toBeNull();
  });

  it('should return null for out of bounds position', () => {
    const positions = getShipPositions('CARRIER', 0, 8, true);
    expect(positions).toBeNull();
  });

  it('should return null for negative coordinates', () => {
    const positions = getShipPositions('CARRIER', -1, 0, true);
    expect(positions).toBeNull();
  });
});

describe('rotateShip', () => {
  it('should toggle orientation from horizontal to vertical', () => {
    const ship = createShip('BATTLESHIP', 2, 3, true);
    const rotated = rotateShip(ship);

    expect(rotated.horizontal).toBe(false);
    expect(rotated.positions).toHaveLength(4);
    expect(rotated.positions[0]).toEqual({ row: 2, col: 3 });
    expect(rotated.positions[3]).toEqual({ row: 5, col: 3 });
  });

  it('should toggle orientation from vertical to horizontal', () => {
    const ship = createShip('CRUISER', 4, 5, false);
    const rotated = rotateShip(ship);

    expect(rotated.horizontal).toBe(true);
    expect(rotated.positions[0]).toEqual({ row: 4, col: 5 });
    expect(rotated.positions[2]).toEqual({ row: 4, col: 7 });
  });

  it('should reset hits when rotating', () => {
    const ship = createShip('DESTROYER', 0, 0, true);
    hitShip(ship, 0, 0);
    expect(ship.hits.size).toBe(1);

    const rotated = rotateShip(ship);
    expect(rotated.hits.size).toBe(0);
  });

  it('should preserve ship type and name', () => {
    const ship = createShip('CARRIER', 0, 0, true);
    const rotated = rotateShip(ship);

    expect(rotated.type).toBe('CARRIER');
    expect(rotated.name).toBe('Taşıyıcı');
    expect(rotated.length).toBe(5);
  });
});

describe('hitShip', () => {
  let ship;

  beforeEach(() => {
    ship = createShip('BATTLESHIP', 0, 0, true);
  });

  it('should record a hit at valid position', () => {
    const result = hitShip(ship, 0, 0);
    expect(result).toBe(true);
    expect(ship.hits.size).toBe(1);
  });

  it('should record multiple hits', () => {
    hitShip(ship, 0, 0);
    hitShip(ship, 0, 1);
    hitShip(ship, 0, 2);

    expect(ship.hits.size).toBe(3);
  });

  it('should return false for position not on ship', () => {
    const result = hitShip(ship, 5, 5);
    expect(result).toBe(false);
    expect(ship.hits.size).toBe(0);
  });

  it('should not record duplicate hits', () => {
    hitShip(ship, 0, 0);
    hitShip(ship, 0, 0);

    expect(ship.hits.size).toBe(1);
  });
});

describe('isShipSunk', () => {
  it('should return false when ship has no hits', () => {
    const ship = createShip('DESTROYER', 0, 0, true);
    expect(isShipSunk(ship)).toBe(false);
  });

  it('should return false when ship has partial hits', () => {
    const ship = createShip('CRUISER', 0, 0, true);
    hitShip(ship, 0, 0);
    hitShip(ship, 0, 1);
    expect(isShipSunk(ship)).toBe(false);
  });

  it('should return true when all positions are hit', () => {
    const ship = createShip('DESTROYER', 0, 0, true);
    hitShip(ship, 0, 0);
    hitShip(ship, 0, 1);
    expect(isShipSunk(ship)).toBe(true);
  });

  it('should return true for carrier with 5 hits', () => {
    const ship = createShip('CARRIER', 0, 0, true);
    hitShip(ship, 0, 0);
    hitShip(ship, 0, 1);
    hitShip(ship, 0, 2);
    hitShip(ship, 0, 3);
    hitShip(ship, 0, 4);
    expect(isShipSunk(ship)).toBe(true);
  });
});

describe('isPositionOnShip', () => {
  let ship;

  beforeEach(() => {
    ship = createShip('CRUISER', 3, 4, true);
  });

  it('should return true for position on ship', () => {
    expect(isPositionOnShip(ship, 3, 4)).toBe(true);
    expect(isPositionOnShip(ship, 3, 5)).toBe(true);
    expect(isPositionOnShip(ship, 3, 6)).toBe(true);
  });

  it('should return false for position not on ship', () => {
    expect(isPositionOnShip(ship, 0, 0)).toBe(false);
    expect(isPositionOnShip(ship, 3, 3)).toBe(false);
    expect(isPositionOnShip(ship, 3, 7)).toBe(false);
  });

  it('should work for vertical ships', () => {
    const verticalShip = createShip('DESTROYER', 5, 5, false);
    expect(isPositionOnShip(verticalShip, 5, 5)).toBe(true);
    expect(isPositionOnShip(verticalShip, 6, 5)).toBe(true);
    expect(isPositionOnShip(verticalShip, 5, 6)).toBe(false);
  });
});
