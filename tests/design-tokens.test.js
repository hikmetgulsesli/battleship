/**
 * Tests for US-001: Design Tokens
 * Verifies that all required CSS custom properties are defined correctly
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the design tokens CSS file
const cssPath = join(__dirname, '../stitch/design-tokens.css');
const cssContent = readFileSync(cssPath, 'utf-8');

// Required design tokens from US-001 acceptance criteria
const requiredTokens = [
  { name: '--color-ocean-bg', value: '#0B1D2E' },
  { name: '--color-water', value: '#1a2333' },
  { name: '--color-ship', value: '#8ba1b5' },
  { name: '--color-hit', value: '#ef4444' },
  { name: '--color-miss', value: '#e2e8f0' }
];

describe('US-001 Design Tokens', () => {
  describe('Required tokens', () => {
    requiredTokens.forEach(({ name, value }) => {
      test(`${name} should be defined with value ${value}`, () => {
        const regex = new RegExp(`${name}:\\s*${value}`, 'i');
        expect(cssContent).toMatch(regex);
      });
    });
  });

  describe('CSS structure', () => {
    test('should have :root selector', () => {
      expect(cssContent).toContain(':root');
    });

    test('should define all 5 required color tokens', () => {
      requiredTokens.forEach(({ name }) => {
        expect(cssContent).toContain(name);
      });
    });
  });
});