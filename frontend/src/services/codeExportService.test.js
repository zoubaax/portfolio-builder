import { describe, it, expect } from 'vitest';
import { generateProjectFiles } from './codeExportService';

describe('codeExportService: generateProjectFiles', () => {
  const mockPortfolio = {
    meta: {
      title: 'Alex Rivera Portfolio',
      slug: 'alex-rivera',
      description: 'Senior Full-Stack Engineer showcase',
    },
    theme: {
      palette: {
        primary: '#3b82f6',
        background: '#090d16',
      },
    },
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          fullName: 'Alex Rivera',
          roleTitle: 'Full-Stack Engineer',
          bioHeadline: 'Building intelligent cloud applications',
        },
      },
      {
        id: 'about-1',
        type: 'about',
        content: {
          bio: 'Passionate software craftsman.',
        },
      },
    ],
  };

  it('generates essential project files map', () => {
    const files = generateProjectFiles(mockPortfolio);

    expect(files).toBeDefined();
    expect(files['package.json']).toBeDefined();
    expect(files['vite.config.js']).toBeDefined();
    expect(files['index.html']).toBeDefined();
    expect(files['src/App.jsx']).toBeDefined();
    expect(files['src/main.jsx']).toBeDefined();
    expect(files['src/index.css']).toBeDefined();
  });

  it('correctly sets portfolio metadata in package.json and index.html', () => {
    const files = generateProjectFiles(mockPortfolio);

    const pkg = JSON.parse(files['package.json']);
    expect(pkg.name).toBe('alex-rivera');
    expect(pkg.dependencies.react).toBeDefined();

    expect(files['index.html']).toContain('Alex Rivera Portfolio');
    expect(files['index.html']).toContain('Senior Full-Stack Engineer showcase');
  });

  it('handles empty or missing portfolio safely with sensible fallbacks', () => {
    const files = generateProjectFiles(null);

    expect(files).toBeDefined();
    const pkg = JSON.parse(files['package.json']);
    expect(pkg.name).toBe('my-portfolio');
    expect(files['index.html']).toContain('My Developer Portfolio');
  });
});
