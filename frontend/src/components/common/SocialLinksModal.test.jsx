import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SocialLinksModal, AVAILABLE_PLATFORMS } from './SocialLinksModal';

vi.mock('../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    studioTheme: 'dark',
  }),
}));

describe('SocialLinksModal Component', () => {
  it('exports valid available platforms configuration', () => {
    expect(AVAILABLE_PLATFORMS.length).toBeGreaterThanOrEqual(10);
    expect(AVAILABLE_PLATFORMS.find((p) => p.id === 'github')).toBeDefined();
    expect(AVAILABLE_PLATFORMS.find((p) => p.id === 'linkedin')).toBeDefined();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SocialLinksModal isOpen={false} onClose={() => {}} onSave={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with existing social links when open', () => {
    const mockSocials = [
      { platform: 'github', url: 'https://github.com/zoubaax' },
    ];

    render(
      <SocialLinksModal isOpen={true} onClose={() => {}} onSave={() => {}} socials={mockSocials} />
    );

    expect(screen.getByText(/Gérer vos contacts & réseaux/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://github.com/zoubaax')).toBeInTheDocument();
  });

  it('calls onSave with updated links list upon clicking apply button', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <SocialLinksModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        socials={[{ platform: 'github', url: 'https://github.com/test' }]}
      />
    );

    const applyBtn = screen.getByText(/Appliquer au portfolio/i);
    fireEvent.click(applyBtn);

    expect(handleSave).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });
});
