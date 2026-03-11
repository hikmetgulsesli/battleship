/**
 * Ship Placement UI Module
 * Handles interactive ship placement on the game setup screen
 */

// Ship selection state
let selectedShipIndex = null;
let isHorizontal = true;
let placedShipsCount = 0;

// Ship definitions matching game.js
const SHIPS = [
  { name: 'Carrier', size: 5, count: 1 },
  { name: 'Battleship', size: 4, count: 1 },
  { name: 'Cruiser', size: 3, count: 2 },
  { name: 'Destroyer', size: 2, count: 1 }
];

// Ship icons mapping
const SHIP_ICONS = {
  'Carrier': 'directions_boat',
  'Battleship': 'directions_boat',
  'Cruiser': 'sailing',
  'Destroyer': 'kayaking'
};

/**
 * Initialize the ship placement UI
 */
function initShipPlacementUI() {
  renderShipSelectionPanel();
  setupGridEventListeners();
  setupControlButtons();
  updatePlacementStatus();
}

/**
 * Render the ship selection panel
 */
function renderShipSelectionPanel() {
  const panel = document.getElementById('ship-selection-panel');
  if (!panel) return;

  panel.innerHTML = '';

  SHIPS.forEach((ship, index) => {
    const shipItem = createShipItem(ship, index);
    panel.appendChild(shipItem);
  });
}

/**
 * Create a ship selection item element
 */
function createShipItem(ship, index) {
  const item = document.createElement('div');
  item.className = 'ship-item';
  item.dataset.index = index;
  item.dataset.size = ship.size;
  item.dataset.name = ship.name;

  // Check if this ship is already placed
  const isPlaced = isShipPlaced(ship.name);
  const isDisabled = isPlaced && !canPlaceMultiple(ship.name);

  if (isDisabled) {
    item.classList.add('placed');
    item.dataset.placed = 'true';
  }

  const icon = SHIP_ICONS[ship.name] || 'directions_boat';

  item.innerHTML = `
    <div class="ship-item-content">
      <span class="material-symbols-outlined ship-icon">${icon}</span>
      <span class="ship-name">${ship.name}</span>
    </div>
    <div class="ship-preview">
      ${Array(ship.size).fill('<div class="ship-segment"></div>').join('')}
    </div>
  `;

  if (!isDisabled) {
    item.addEventListener('click', () => selectShip(index));
  }

  return item;
}

/**
 * Check if a ship type is already placed
 */
function isShipPlaced(shipName) {
  const gameState = window.gameState || { playerShips: [] };
  return gameState.playerShips?.some(ship => ship.name === shipName) || false;
}

/**
 * Check if we can place multiple of this ship type
 */
function canPlaceMultiple(shipName) {
  return shipName === 'Cruiser'; // Cruiser has count: 2
}

/**
 * Handle ship selection
 */
function selectShip(index) {
  // Deselect previous
  document.querySelectorAll('.ship-item').forEach(item => {
    item.classList.remove('selected');
  });

  const items = document.querySelectorAll('.ship-item');
  const selectedItem = items[index];

  if (!selectedItem || selectedItem.dataset.placed === 'true') {
    selectedShipIndex = null;
    clearPlacementPreview();
    return;
  }

  selectedShipIndex = index;
  selectedItem.classList.add('selected');
}

/**
 * Setup grid event listeners for hover and click
 */
function setupGridEventListeners() {
  const grid = document.getElementById('player-grid');
  if (!grid) return;

  const cells = grid.querySelectorAll('.grid-cell');

  cells.forEach(cell => {
    cell.addEventListener('mouseenter', handleCellHover);
    cell.addEventListener('mouseleave', handleCellLeave);
    cell.addEventListener('click', handleCellClick);
  });
}

/**
 * Handle cell hover - show placement preview
 */
function handleCellHover(event) {
  if (selectedShipIndex === null) return;

  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  showPlacementPreview(row, col);
}

/**
 * Handle cell leave - clear preview
 */
function handleCellLeave() {
  // Preview will be cleared on next hover or click
}

/**
 * Show placement preview on grid
 */
function showPlacementPreview(row, col) {
  clearPlacementPreview();

  const ship = SHIPS[selectedShipIndex];
  if (!ship) return;

  const isValid = validatePlacement(ship, row, col, isHorizontal);
  const previewClass = isValid ? 'preview-valid' : 'preview-invalid';

  // Get cells that would be occupied
  const cells = getShipCells(row, col, ship.size, isHorizontal);
  if (!cells) return;

  const grid = document.getElementById('player-grid');

  cells.forEach(({ row: r, col: c }) => {
    const cell = grid?.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (cell) {
      cell.classList.add(previewClass);
    }
  });
}

/**
 * Clear all placement previews
 */
function clearPlacementPreview() {
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('preview-valid', 'preview-invalid');
  });
}

/**
 * Validate if ship can be placed at position
 */
function validatePlacement(ship, row, col, horizontal) {
  const board = window.gameState?.playerBoard;

  // Check bounds
  if (horizontal) {
    if (col + ship.size > 10) return false;
  } else {
    if (row + ship.size > 10) return false;
  }

  if (!board) return true;

  // Check for overlaps
  const cells = getShipCells(row, col, ship.size, horizontal);
  if (!cells) return false;

  return cells.every(({ row: r, col: c }) => {
    return board[r]?.[c] === 'empty' || board[r]?.[c] === undefined;
  });
}

/**
 * Get ship cell positions
 */
function getShipCells(row, col, size, horizontal) {
  const cells = [];

  for (let i = 0; i < size; i++) {
    const r = horizontal ? row : row + i;
    const c = horizontal ? col + i : col;

    if (r >= 10 || c >= 10) return null;
    cells.push({ row: r, col: c });
  }

  return cells;
}

/**
 * Handle cell click - place ship
 */
function handleCellClick(event) {
  if (selectedShipIndex === null) return;

  const cell = event.target;
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  const ship = SHIPS[selectedShipIndex];
  const isValid = validatePlacement(ship, row, col, isHorizontal);

  if (isValid) {
    placeShipOnBoard(ship, row, col, isHorizontal);
    clearPlacementPreview();
    updateShipSelectionAfterPlacement();
    updatePlacementStatus();
  }
}

/**
 * Place ship on the game board
 */
function placeShipOnBoard(ship, row, col, horizontal) {
  if (!window.gameState) {
    window.gameState = {
      playerBoard: Array(10).fill(null).map(() => Array(10).fill('empty')),
      playerShips: []
    };
  }

  const board = window.gameState.playerBoard;
  const ships = window.gameState.playerShips;

  const cells = getShipCells(row, col, ship.size, horizontal);
  if (!cells) return;

  // Mark cells as occupied
  cells.forEach(({ row: r, col: c }) => {
    board[r][c] = 'ship';
  });

  // Add ship to ships array
  ships.push({
    name: ship.name,
    size: ship.size,
    positions: cells,
    hits: 0,
    sunk: false,
    horizontal
  });

  placedShipsCount++;

  // Render placed ships on grid
  renderPlacedShips();
}

/**
 * Render placed ships on the grid
 */
function renderPlacedShips() {
  const ships = window.gameState?.playerShips || [];

  // Clear existing ship markers
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('cell-ship');
  });

  // Mark ship cells
  ships.forEach(ship => {
    ship.positions.forEach(({ row, col }) => {
      const cell = document.querySelector(`#player-grid [data-row="${row}"][data-col="${col}"]`);
      if (cell) {
        cell.classList.add('cell-ship');
      }
    });
  });
}

/**
 * Update ship selection panel after placement
 */
function updateShipSelectionAfterPlacement() {
  // Check if all ships of current type are placed
  const ship = SHIPS[selectedShipIndex];
  const placedCount = (window.gameState?.playerShips || [])
    .filter(s => s.name === ship.name).length;

  if (placedCount >= (ship.count || 1)) {
    // Mark as placed in UI
    const items = document.querySelectorAll('.ship-item');
    if (items[selectedShipIndex]) {
      items[selectedShipIndex].classList.add('placed');
      items[selectedShipIndex].classList.remove('selected');
      items[selectedShipIndex].dataset.placed = 'true';
    }

    selectedShipIndex = null;
    clearPlacementPreview();
  }
}

/**
 * Update placement status display
 */
function updatePlacementStatus() {
  const statusEl = document.getElementById('placement-status');
  if (!statusEl) return;

  const placed = window.gameState?.playerShips?.length || 0;
  const total = 5;

  statusEl.textContent = `${placed}/${total} Ships Placed`;

  // Update ready button
  const readyBtn = document.getElementById('ready-button');
  if (readyBtn) {
    readyBtn.disabled = placed < total;
  }
}

/**
 * Setup control buttons
 */
function setupControlButtons() {
  // Rotate button
  const rotateBtn = document.getElementById('rotate-button');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', toggleOrientation);
  }

  // Randomize button
  const randomizeBtn = document.getElementById('randomize-button');
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', randomizePlacement);
  }

  // Reset button
  const resetBtn = document.getElementById('reset-button');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetPlacement);
  }

  // Ready button
  const readyBtn = document.getElementById('ready-button');
  if (readyBtn) {
    readyBtn.addEventListener('click', startGame);
  }

  // Keyboard shortcut for rotate
  document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
      toggleOrientation();
    }
  });
}

/**
 * Toggle ship orientation
 */
function toggleOrientation() {
  isHorizontal = !isHorizontal;

  // Update rotate button text
  const rotateBtn = document.getElementById('rotate-button');
  if (rotateBtn) {
    const status = isHorizontal ? 'Horizontal' : 'Vertical';
    rotateBtn.innerHTML = `
      <span class="material-symbols-outlined text-lg">rotate_right</span>
      Rotate (R) - ${status}
    `;
  }

  // Re-show preview if ship is selected
  if (selectedShipIndex !== null) {
    const selectedCell = document.querySelector('.grid-cell:hover');
    if (selectedCell) {
      const row = parseInt(selectedCell.dataset.row);
      const col = parseInt(selectedCell.dataset.col);
      showPlacementPreview(row, col);
    }
  }
}

/**
 * Randomize ship placement
 */
function randomizePlacement() {
  // Clear existing placement
  resetPlacement();

  // Use game.js randomizeShips if available
  if (typeof window.randomizeShips === 'function') {
    try {
      window.randomizeShips('player');
      renderPlacedShips();
      renderShipSelectionPanel();
      updatePlacementStatus();
    } catch (e) {
      console.error('Randomize failed:', e);
    }
  }
}

/**
 * Reset grid placement
 */
function resetPlacement() {
  // Reset game state
  if (window.gameState) {
    window.gameState.playerBoard = Array(10).fill(null).map(() => Array(10).fill('empty'));
    window.gameState.playerShips = [];
  }

  placedShipsCount = 0;
  selectedShipIndex = null;

  // Clear grid
  document.querySelectorAll('.grid-cell').forEach(cell => {
    cell.classList.remove('cell-ship', 'preview-valid', 'preview-invalid');
  });

  // Reset UI
  renderShipSelectionPanel();
  updatePlacementStatus();
}

/**
 * Start game with placed ships
 */
function startGame() {
  const placed = window.gameState?.playerShips?.length || 0;

  if (placed < 5) {
    alert('Please place all 5 ships before starting!');
    return;
  }

  // Transition to battle phase
  if (typeof window.startBattle === 'function') {
    try {
      window.startBattle();
      console.log('Battle started!');
      // Here you would transition to battle screen
    } catch (e) {
      console.error('Failed to start battle:', e);
    }
  }
}

/**
 * Get current placement state (for testing)
 */
function getPlacementState() {
  return {
    selectedShipIndex,
    isHorizontal,
    placedShipsCount,
    ships: window.gameState?.playerShips || []
  };
}

// Export for testing
export {
  selectShip,
  validatePlacement,
  getPlacementState,
  placeShipOnBoard,
  resetPlacement,
  clearPlacementPreview,
  showPlacementPreview,
  initShipPlacementUI
};
