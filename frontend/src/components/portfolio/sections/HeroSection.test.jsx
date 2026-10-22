import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

vi.mock('../../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    updateSectionField: vi.fn(),
    isEditMode: false,
    isMobileViewport: false,
    effectiveAvatar: 'https://avatar.example/me.png',
    githubUsername: 'alexdev',
  }),
}));

describe('HeroSection Component', () => {
  const mockHeroData = {
    badge: 'Available for hire',
    name: 'Alex Rivera',
    title: 'Senior Cloud Architect',
    tagline: 'Designing resilient distributed platforms at scale.',
    avatar: 'https://images.unsplash.com/photo-1234',
    primaryCta: { text: 'Explore Projects', link: '#projects' },
    secondaryCta: { text: 'Contact Me', link: '#contact' },
    socials: [
      { platform: 'github', url: 'https://github.com/alexdev' },
      { platform: 'linkedin', url: 'https://linkedin.com/in/alexdev' },
    ],
  };

  it('renders name, title, badge, and tagline properly', () => {
    render(<HeroSection data={mockHeroData} sectionId="sec-hero" />);

    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Senior Cloud Architect')).toBeInTheDocument();
    expect(screen.getByText('Available for hire')).toBeInTheDocument();
    expect(screen.getByText(/Designing resilient distributed platforms/i)).toBeInTheDocument();
  });

  it('renders call to action buttons with correct links', () => {
    render(<HeroSection data={mockHeroData} sectionId="sec-hero" />);

    const primaryBtn = screen.getByText('Explore Projects').closest('a');
    const secondaryBtn = screen.getByText('Contact Me').closest('a');

    expect(primaryBtn).toHaveAttribute('href', '#projects');
    expect(secondaryBtn).toHaveAttribute('href', '#contact');
  });

  it('renders different layout variants cleanly (e.g., centered-minimal)', () => {
    render(<HeroSection data={mockHeroData} variant="centered-minimal" sectionId="sec-hero" />);

    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByText('Senior Cloud Architect')).toBeInTheDocument();
  });
});
