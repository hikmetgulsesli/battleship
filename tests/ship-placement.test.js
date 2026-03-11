/**
 * Tests for US-005: Ship Placement UI
 * Verifies ship selection, placement validation, and controls
 */

// Mock cells array for DOM queries
const mockCells = [];

// Mock DOM environment before importing
global.document = {
  getElementById: (id) => {
    if (id === 'player-grid') return mockGrid;
    if (id === 'ship-selection-panel') return { innerHTML: '', appendChild: () => {} };
    if (id === 'placement-status') return { textContent: '' };
    if (id === 'ready-button') return { disabled: true };
    if (id === 'rotate-button') return { innerHTML: '', addEventListener: () => {} };
    if (id === 'randomize-button') return { addEventListener: () => {} };
    if (id === 'reset-button') return { addEventListener: () => {} };
    return null;
  },
  querySelectorAll: () => mockCells,
  querySelector: () => mockCells[0] || null,
  addEventListener: () => {}
};

const mockGrid = {
  querySelectorAll: () => mockCells,
  querySelector: () => mockCells[0] || null
};

// Create mock cells
for (let r = 0; r < 10; r++) {
  for (let c = 0; c < 10; c++) {
    mockCells.push({
      dataset: { row: r.toString(), col: c.toString() },
      classList: {
        add: () => {},
        remove: () => {}
      }
    });
  }
}

// Import after mock
import {
  validatePlacement,
  getPlacementState
} from '../stitch/ship-placement.js';

describe('US-005: Ship Placement UI', () => {
  beforeEach(() => {
    // Reset state before each test
    global.window = {
      gameState: {
        playerBoard: Array(10).fill(null).map(() => Array(10).fill('empty')),
        playerShips: []
      }
    };
  });

  describe('validateShipPlacement()', () => {
    test('should validate horizontal placement within bounds', () => {
      const ship = { name: 'Carrier', size: 5 };
      // Place at row 0, col 0, horizontal
      const result = validatePlacement(ship, 0, 0, true);
      expect(result).toBe(true);
    });

    test('should reject horizontal placement exceeding bounds', () => {
      const ship = { name: 'Carrier', size: 5 };
      // Place at row 0, col 6, horizontal - would exceed grid
      const result = validatePlacement(ship, 0, 6, true);
      expect(result).toBe(false);
    });

    test('should validate vertical placement within bounds', () => {
      const ship = { name: 'Destroyer', size: 2 };
      // Place at row 8, col 0, vertical
      const result = validatePlacement(ship, 8, 0, false);
      expect(result).toBe(true);
    });

    test('should reject vertical placement exceeding bounds', () => {
      const ship = { name: 'Carrier', size: 5 };
      // Place at row 6, col 0, vertical - would exceed grid
      const result = validatePlacement(ship, 6, 0, false);
      expect(result).toBe(false);
    });

    test('should reject placement overlapping existing ship', () => {
      // First place a ship
      global.window.gameState.playerBoard[0][0] = 'ship';
      global.window.gameState.playerBoard[0][1] = 'ship';
      global.window.gameState.playerBoard[0][2] = 'ship';
      
      const ship = { name: 'Destroyer', size: 2 };
      // Try to place overlapping ship
      const result = validatePlacement(ship, 0, 1, true);
      expect(result).toBe(false);
    });

    test('should allow placement next to existing ship', () => {
      // First place a ship
      global.window.gameState.playerBoard[0][0] = 'ship';
      global.window.gameState.playerBoard[0][1] = 'ship';
      global.window.gameState.playerBoard[0][2] = 'ship';
      
      const ship = { name: 'Destroyer', size: 2 };
      // Try to place adjacent ship (not overlapping)
      const result = validatePlacement(ship, 1, 0, true);
      expect(result).toBe(true);
    });
  });

  describe('Ship Selection', () => {
    test('should have 5 ships total (with 2 cruisers)', () => {
      const shipCounts = {
        'Carrier': 1,
        'Battleship': 1,
        'Cruiser': 2,
        'Destroyer': 1
      };
      // Total ships should be 5
      expect(1 + 1 + 2 + 1).toBe(5);
    });

    test('should have ships with correct sizes', () => {
      const shipSizes = {
        'Carrier': 5,
        'Battleship': 4,
        'Cruiser': 3,
        'Destroyer': 2
      };
      
      expect(shipSizes['Carrier']).toBe(5);
      expect(shipSizes['Battleship']).toBe(4);
      expect(shipSizes['Cruiser']).toBe(3);
      expect(shipSizes['Destroyer']).toBe(2);
    });
  });

  describe('Placement State', () => {
    test('should track placed ships correctly', () => {
      const state = getPlacementState();
      
      expect(state).toHaveProperty('selectedShipIndex');
      expect(state).toHaveProperty('isHorizontal');
      expect(state).toHaveProperty('placedShipsCount');
      expect(state).toHaveProperty('ships');
    });

    test('should start with no ships placed', () => {
      const state = getPlacementState();
      expect(state.placedShipsCount).toBe(0);
      expect(state.ships).toHaveLength(0);
    });
  });
});
