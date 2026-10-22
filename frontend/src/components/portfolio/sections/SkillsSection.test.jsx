import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillsSection } from './SkillsSection';

const mockSetViewMode = vi.fn();
vi.mock('../../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    isMobileViewport: false,
    isEditMode: true,
    setViewMode: mockSetViewMode,
  }),
}));

describe('SkillsSection Component', () => {
  const mockSkillsData = {
    heading: 'Core Competencies',
    subheading: 'TECH ARSENAL',
    categories: [
      {
        name: 'Languages & Frameworks',
        skills: ['TypeScript', 'React', 'Node.js'],
      },
      {
        name: 'DevOps & Cloud',
        skills: ['Docker', 'Kubernetes', 'GitHub Actions'],
      },
    ],
  };

  it('renders heading, subheading, category names, and skills', () => {
    render(<SkillsSection data={mockSkillsData} variant="category-cards" />);

    expect(screen.getByText('Core Competencies')).toBeInTheDocument();
    expect(screen.getByText('TECH ARSENAL')).toBeInTheDocument();
    expect(screen.getByText('Languages & Frameworks')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('GitHub Actions')).toBeInTheDocument();
  });

  it('renders pill cloud variant with all flat skills', () => {
    render(<SkillsSection data={mockSkillsData} variant="pill-cloud" />);

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('triggers setViewMode when manage skills button is clicked in edit mode', () => {
    render(<SkillsSection data={mockSkillsData} />);

    const manageBtn = screen.getByTitle('Gérer les compétences');
    fireEvent.click(manageBtn);

    expect(mockSetViewMode).toHaveBeenCalledWith('skills');
  });
});
