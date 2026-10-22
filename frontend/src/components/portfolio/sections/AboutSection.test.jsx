import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutSection } from './AboutSection';

vi.mock('../../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    updateSectionField: vi.fn(),
    updateSection: vi.fn(),
    isMobileViewport: false,
  }),
}));

describe('AboutSection Component', () => {
  const mockAboutData = {
    heading: 'Background & Philosophy',
    subheading: 'MY JOURNEY',
    bio: 'Experienced engineer passionate about scalable microservices.',
    location: 'Berlin, Germany',
    stats: [
      { value: '8+', label: 'Years Experience' },
      { value: '45+', label: 'Production Apps' },
    ],
  };

  it('renders heading, subheading, bio, and location in bento variant', () => {
    render(<AboutSection data={mockAboutData} variant="bento" sectionId="sec-about" />);

    expect(screen.getByText('Background & Philosophy')).toBeInTheDocument();
    expect(screen.getByText('MY JOURNEY')).toBeInTheDocument();
    expect(screen.getByText(/Experienced engineer passionate/i)).toBeInTheDocument();
    expect(screen.getByText('Berlin, Germany')).toBeInTheDocument();
    expect(screen.getByText('8+')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
  });

  it('renders story variant cleanly', () => {
    render(<AboutSection data={mockAboutData} variant="story" sectionId="sec-about" />);

    expect(screen.getByText('Background & Philosophy')).toBeInTheDocument();
    expect(screen.getByText(/Experienced engineer passionate/i)).toBeInTheDocument();
  });
});
