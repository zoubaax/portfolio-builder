import { describe, it, expect } from 'vitest';
import {
  THEME_PRESETS,
  createFreshPortfolio,
  MOCK_DEVELOPER_PORTFOLIO,
  MOCK_DESIGNER_PORTFOLIO,
} from './portfolio';

describe('Portfolio Schema & Presets', () => {
  describe('THEME_PRESETS', () => {
    it('defines valid theme presets with required color palettes', () => {
      const presets = Object.values(THEME_PRESETS);
      expect(presets.length).toBeGreaterThanOrEqual(4);

      presets.forEach((preset) => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.palette.bg).toBeDefined();
        expect(preset.palette.surface).toBeDefined();
        expect(preset.palette.accent).toBeDefined();
        expect(preset.palette.textPrimary).toBeDefined();
        expect(preset.typography.headingFont).toBeDefined();
      });
    });
  });

  describe('createFreshPortfolio', () => {
    it('generates a fresh portfolio initialized with user details', () => {
      const fresh = createFreshPortfolio('Sarah Conner', 'https://avatar.example/sarah.jpg');

      expect(fresh.meta).toBeDefined();
      expect(fresh.meta.title).toContain('Sarah Conner');
      expect(fresh.theme).toBeDefined();
      expect(Array.isArray(fresh.sections)).toBe(true);

      const hero = fresh.sections.find((s) => s.type === 'hero');
      expect(hero).toBeDefined();
      expect(hero.data.name).toBe('Sarah Conner');
      expect(hero.data.avatar).toBe('https://avatar.example/sarah.jpg');

      const projects = fresh.sections.find((s) => s.type === 'projects');
      expect(projects).toBeDefined();
      expect(projects.data.projects).toEqual([]);
    });

    it('falls back gracefully when user parameters are omitted', () => {
      const fresh = createFreshPortfolio();
      expect(fresh.meta.title).toBeDefined();
      const hero = fresh.sections.find((s) => s.type === 'hero');
      expect(hero.data.name).toBe('Mon Portfolio');
    });
  });

  describe('Mock Presets', () => {
    it('exports developer and designer sample portfolios', () => {
      expect(MOCK_DEVELOPER_PORTFOLIO.sections.length).toBeGreaterThan(0);
      expect(MOCK_DESIGNER_PORTFOLIO.sections.length).toBeGreaterThan(0);
    });
  });
});
