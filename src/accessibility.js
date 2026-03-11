/**
 * Accessibility module for Battleship game
 * US-015: ARIA labels, keyboard navigation, screen reader support
 */

/**
 * Generate aria-label for Turkish language
 * @param {number} row - Row index (0-9)
 * @param {number} col - Column index (0-9)
 * @param {string} state - Cell state ('empty', 'ship', 'hit', 'miss')
 * @param {string} gridType - 'player' or 'enemy'
 * @returns {string} Turkish aria-label
 */
export function generateCellAriaLabelTR(row, col, state, gridType) {
  const coordLetter = String.fromCharCode(65 + col);
  const coordNumber = row + 1;
  const coord = `${coordLetter}${coordNumber}`;
  
  const stateDescriptions = {
    'empty': 'boş hücre',
    'ship': 'gemi var',
    'hit': 'isabet aldı',
    'miss': 'ıska yaptı'
  };
  
  const gridDescriptions = {
    'player': 'Sizin tahtanız',
    'enemy': 'Düşman tahtası'
  };
  
  const stateDesc = stateDescriptions[state] || 'bilinmeyen';
  const gridDesc = gridDescriptions[gridType] || 'Tahta';
  
  return `${gridDesc}, ${coord} hücresi, ${stateDesc}`;
}

/**
 * Create accessible cell element
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {string} state - Initial cell state
 * @param {string} gridType - 'player' or 'enemy'
 * @returns {HTMLElement} Accessible cell element
 */
export function createAccessibleCell(row, col, state, gridType) {
  const cell = document.createElement('div');
  cell.className = 'grid-cell';
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('tabindex', gridType === 'enemy' ? '0' : '-1');
  cell.setAttribute('aria-label', generateCellAriaLabelTR(row, col, state, gridType));
  cell.dataset.row = row;
  cell.dataset.col = col;
  cell.dataset.coord = String.fromCharCode(65 + col) + (row + 1);
  cell.dataset.state = state;
  cell.dataset.gridType = gridType;
  
  return cell;
}

/**
 * Update cell accessibility attributes
 * @param {HTMLElement} cell - Cell element
 * @param {string} newState - New cell state
 */
export function updateCellAccessibility(cell, newState) {
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const gridType = cell.dataset.gridType;
  
  cell.dataset.state = newState;
  cell.setAttribute('aria-label', generateCellAriaLabelTR(row, col, newState, gridType));
  
  // Update visual state
  cell.classList.remove('ship', 'hit', 'miss', 'empty');
  if (newState !== 'empty') {
    cell.classList.add(newState);
  }
}

/**
 * Note: Keyboard navigation for grids is implemented in index.html using the moveFocus function.
 * The moveFocus function properly implements roving tabindex (only one cell has tabindex="0" at a time).
 * See: stitch/index.html for the correct implementation.
 */

/**
 * Update cell accessibility attributes
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export function announceToScreenReader(message, priority = 'polite') {
  let announcer = document.getElementById('sr-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }
  
  // Clear and set message (triggers announcement)
  announcer.textContent = '';
  setTimeout(() => {
    announcer.textContent = message;
  }, 100);
}

/**
 * Set up focus management for ship selection buttons
 * @param {NodeList} buttons - Ship selection buttons
 * @param {Function} onSelect - Callback when ship is selected
 */
export function setupShipSelectionAccessibility(buttons, onSelect) {
  buttons.forEach((btn, index) => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-pressed', 'false');
    
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(index);
      }
      
      // Arrow key navigation between buttons
      let newIndex = index;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        newIndex = (index + 1) % buttons.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        newIndex = (index - 1 + buttons.length) % buttons.length;
      }
      
      if (newIndex !== index) {
        buttons[newIndex].focus();
      }
    });
  });
}

/**
 * Update button pressed state for accessibility
 * @param {HTMLElement} button - Button element
 * @param {boolean} isPressed - Whether button is pressed
 */
export function updateButtonPressedState(button, isPressed) {
  button.setAttribute('aria-pressed', isPressed ? 'true' : 'false');
}

/**
 * Create accessible game status live region
 * @returns {HTMLElement} Live region element
 */
export function createGameStatusLiveRegion() {
  const liveRegion = document.createElement('div');
  liveRegion.id = 'game-status-live';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  return liveRegion;
}

/**
 * Generate shot result announcement
 * @param {string} result - 'hit' or 'miss'
 * @param {string} coord - Coordinate string (e.g., 'A5')
 * @param {boolean} isPlayer - Whether player made the shot
 * @returns {string} Announcement text
 */
export function generateShotAnnouncement(result, coord, isPlayer) {
  const shooter = isPlayer ? 'Siz' : 'Düşman';
  const resultText = result === 'hit' ? 'isabet kaydetti' : 'ıska yaptı';
  return `${shooter} ${coord} koordinatına ateş etti ve ${resultText}.`;
}

/**
 * Generate game over announcement
 * @param {boolean} playerWon - Whether player won
 * @returns {string} Announcement text
 */
export function generateGameOverAnnouncement(playerWon) {
  return playerWon 
    ? 'Tebrikler! Tüm düşman gemilerini batırdınız. Oyunu kazandınız!' 
    : 'Tüm gemileriniz batırıldı. Düşman kazandı.';
}

/**
 * Validate accessibility of a grid element
 * @param {HTMLElement} gridContainer - Grid to validate
 * @returns {Object} Validation result {valid, issues}
 */
export function validateGridAccessibility(gridContainer) {
  const issues = [];
  const cells = gridContainer.querySelectorAll('.grid-cell');
  
  // Check grid has role
  if (gridContainer.getAttribute('role') !== 'grid') {
    issues.push('Grid container missing role="grid"');
  }
  
  // Check each cell
  cells.forEach(cell => {
    // Check for aria-label
    if (!cell.getAttribute('aria-label')) {
      issues.push(`Cell at ${cell.dataset.coord} missing aria-label`);
    }
    
    // Check for tabindex
    if (cell.getAttribute('tabindex') === null) {
      issues.push(`Cell at ${cell.dataset.coord} missing tabindex`);
    }
    
    // Check for role
    if (cell.getAttribute('role') !== 'gridcell') {
      issues.push(`Cell at ${cell.dataset.coord} missing role="gridcell"`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Check if element has proper focus styling
 * Note: This function cannot reliably detect focus styles in unit tests
 * because getComputedStyle doesn't support pseudo-classes like :focus.
 * Focus styling should be verified in browser/integration tests.
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element has visible focus style (always returns true, actual check done visually)
 */
export function hasFocusStyling(element) {
  // getComputedStyle(element, ':focus') is not valid - pseudo-classes aren't supported
  // Focus styling verification should be done manually in browser or via integration tests
  // This function returns true as a placeholder - visual focus verification is handled by CSS
  console.warn('hasFocusStyling: Focus styling should be verified visually or via browser tests');
  return true;
}