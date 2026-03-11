/**
 * Tests for US-014: Responsive Design
 * Verifies responsive layout behavior for different screen sizes
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the CSS file
const cssPath = join(__dirname, '../stitch/styles.css');
const cssContent = readFileSync(cssPath, 'utf-8');

// Read the HTML file
const htmlPath = join(__dirname, '../stitch/index.html');
const htmlContent = readFileSync(htmlPath, 'utf-8');

describe('US-014 Responsive Design', () => {
  describe('AC1: Desktop - grids side-by-side', () => {
    test('should have default cell size of 36px for desktop', () => {
      expect(cssContent).toContain('--cell-size: 36px');
    });

    test('should have responsive flex layout classes in HTML for side-by-side grids', () => {
      // HTML uses Tailwind responsive classes for layout
      expect(htmlContent).toMatch(/flex-col\s+lg:flex-row|lg:flex-row/);
    });
  });

  describe('AC2: Tablet - grids fit with condensed panels', () => {
    test('should have tablet breakpoint at 1024px', () => {
      expect(cssContent).toContain('@media (max-width: 1024px)');
    });

    test('should reduce cell size for tablet (32px)', () => {
      // Find tablet breakpoint and verify cell-size
      const tabletMatch = cssContent.match(/@media \(max-width: 1024px\)[\s\S]*?(?=@media|$)/);
      expect(tabletMatch).toBeTruthy();
      expect(tabletMatch[0]).toContain('--cell-size: 32px');
    });

    test('should have tablet portrait breakpoint at 900px', () => {
      expect(cssContent).toContain('@media (max-width: 900px)');
    });

    test('should have smaller cell size for tablet portrait (28px)', () => {
      const tabletPortraitMatch = cssContent.match(/@media \(max-width: 900px\)[\s\S]*?(?=@media\s|$)/);
      expect(tabletPortraitMatch).toBeTruthy();
      expect(tabletPortraitMatch[0]).toContain('--cell-size: 28px');
    });
  });

  describe('AC3: Mobile - grids stacked vertically', () => {
    test('should have mobile breakpoint at 640px', () => {
      expect(cssContent).toContain('@media (max-width: 640px)');
    });

    test('should have cell size of 30px for mobile', () => {
      const mobileMatch = cssContent.match(/@media \(max-width: 640px\)[\s\S]*?(?=@media\s|$)/);
      expect(mobileMatch).toBeTruthy();
      expect(mobileMatch[0]).toContain('--cell-size: 30px');
    });

    test('should have responsive layout in HTML for vertical stacking', () => {
      // HTML uses flex-col for mobile (default), lg:flex-row for desktop
      expect(htmlContent).toContain('flex-col');
    });

    test('should have extra small mobile breakpoint at 400px', () => {
      expect(cssContent).toContain('@media (max-width: 400px)');
    });

    test('should reduce cell size further for extra small mobile (26px)', () => {
      const xsMobileMatch = cssContent.match(/@media \(max-width: 400px\)[\s\S]*?(?=@media\s|$)/);
      expect(xsMobileMatch).toBeTruthy();
      expect(xsMobileMatch[0]).toContain('--cell-size: 26px');
    });
  });

  describe('AC4: Cell size minimum 30px on touch', () => {
    test('should have touch device media query', () => {
      expect(cssContent).toContain('@media (hover: none) and (pointer: coarse)');
    });

    test('should enforce minimum 30px cell size on touch devices', () => {
      const touchMatch = cssContent.match(/@media \(hover: none\) and \(pointer: coarse\)[\s\S]*?(?=@media\s|$)/);
      expect(touchMatch).toBeTruthy();
      expect(touchMatch[0]).toContain('.grid-cell');
      expect(touchMatch[0]).toContain('min-width: 30px');
      expect(touchMatch[0]).toContain('min-height: 30px');
    });
  });

  describe('Accessibility - Reduced motion', () => {
    test('should have reduced motion media query', () => {
      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    });

    test('should disable animations for reduced motion preference', () => {
      const reducedMotionMatch = cssContent.match(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?(?=@media\s|$)/);
      expect(reducedMotionMatch).toBeTruthy();
      expect(reducedMotionMatch[0]).toContain('animation: none');
    });
  });

  describe('Accessibility - High contrast', () => {
    test('should have high contrast media query', () => {
      expect(cssContent).toContain('@media (prefers-contrast: high)');
    });

    test('should enhance cell visibility for high contrast mode', () => {
      const highContrastMatch = cssContent.match(/@media \(prefers-contrast: high\)[\s\S]*?(?=@media\s|$)/);
      expect(highContrastMatch).toBeTruthy();
      expect(highContrastMatch[0]).toContain('border: 2px solid #fff');
    });
  });

  describe('HTML responsive structure', () => {
    test('should have viewport meta tag', () => {
      expect(htmlContent).toContain('viewport');
      expect(htmlContent).toContain('width=device-width');
      expect(htmlContent).toContain('initial-scale=1.0');
    });

    test('should have responsive Tailwind classes for layout', () => {
      // Check for responsive flex classes
      expect(htmlContent).toMatch(/flex-col\s+lg:flex-row|lg:flex-row\s+flex-col/);
    });

    test('should have responsive container classes', () => {
      expect(htmlContent).toContain('max-w-[');
      expect(htmlContent).toContain('w-full');
    });
  });

  describe('CSS variable usage', () => {
    test('should use CSS variable for cell size in grid definitions', () => {
      expect(cssContent).toContain('grid-template-columns: repeat(10, var(--cell-size))');
      expect(cssContent).toContain('grid-template-rows: repeat(10, var(--cell-size))');
    });

    test('should update cell-size variable in media queries', () => {
      // Desktop default
      expect(cssContent).toContain('--cell-size: 36px');
      // Tablet
      expect(cssContent).toContain('--cell-size: 32px');
      // Tablet portrait
      expect(cssContent).toContain('--cell-size: 28px');
      // Mobile
      expect(cssContent).toContain('--cell-size: 30px');
      // Extra small mobile
      expect(cssContent).toContain('--cell-size: 26px');
    });
  });

  describe('Active CSS classes used in implementation', () => {
    test('should have grid-cell class for cells', () => {
      expect(cssContent).toContain('.grid-cell');
      expect(htmlContent).toContain('grid-cell');
    });

    test('should have grid-header class for row/column labels', () => {
      expect(cssContent).toContain('.grid-header');
      expect(htmlContent).toContain('grid-header');
    });

    test('should have hit/miss/ship classes for cell states', () => {
      expect(cssContent).toContain('.grid-cell.hit');
      expect(cssContent).toContain('.grid-cell.miss');
      expect(cssContent).toContain('.grid-cell.ship');
    });

    test('should have preview classes for ship placement', () => {
      expect(cssContent).toContain('.preview-valid');
      expect(cssContent).toContain('.preview-invalid');
    });
  });
});