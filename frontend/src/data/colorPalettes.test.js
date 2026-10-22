import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  generateCustomSubPalettes,
  doesPromptSpecifyColor,
  isPortfolioGenerationPrompt,
} from './colorPalettes';

describe('colorPalettes Utility Functions', () => {
  describe('getLuminance', () => {
    it('calculates relative luminance for black, white, and hex colors', () => {
      expect(getLuminance('#000000')).toBeCloseTo(0, 2);
      expect(getLuminance('#ffffff')).toBeCloseTo(1, 2);
      expect(getLuminance(null)).toBe(0);
      expect(getLuminance('#123')).toBe(0.5); // short clean length < 6 returns 0.5
    });
  });

  describe('generateCustomSubPalettes', () => {
    it('generates high contrast dark text options for light backgrounds', () => {
      const subPalettes = generateCustomSubPalettes('#ffffff');
      expect(subPalettes.length).toBeGreaterThanOrEqual(2);
      expect(subPalettes[0].textPrimary).toBe('#0f172a'); // dark slate
    });

    it('generates light text options for dark backgrounds', () => {
      const subPalettes = generateCustomSubPalettes('#000000');
      expect(subPalettes.length).toBeGreaterThanOrEqual(2);
      expect(subPalettes[0].textPrimary).toBe('#f8fafc'); // light slate text
    });
  });

  describe('doesPromptSpecifyColor', () => {
    it('detects hex codes in prompt', () => {
      expect(doesPromptSpecifyColor('I want #3b82f6 as my main accent')).toBe(true);
      expect(doesPromptSpecifyColor('use #fff theme')).toBe(true);
    });

    it('detects French and English color keywords', () => {
      expect(doesPromptSpecifyColor('Un portfolio sombre avec du bleu')).toBe(true);
      expect(doesPromptSpecifyColor('A dark theme with emerald highlights')).toBe(true);
      expect(doesPromptSpecifyColor('Simple full stack developer portfolio')).toBe(false);
      expect(doesPromptSpecifyColor(null)).toBe(false);
    });
  });

  describe('isPortfolioGenerationPrompt', () => {
    it('detects intent to generate or update portfolio', () => {
      expect(isPortfolioGenerationPrompt('Crée moi un portfolio pour un DevOps engineer')).toBe(true);
      expect(isPortfolioGenerationPrompt('Génère une page d accueil moderne')).toBe(true);
      expect(isPortfolioGenerationPrompt('Make me a portfolio as a Python developer')).toBe(true);
      expect(isPortfolioGenerationPrompt('bonjour')).toBe(false);
      expect(isPortfolioGenerationPrompt('')).toBe(false);
    });
  });
});
