import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImagePickerModal } from './ImagePickerModal';

vi.mock('../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    studioTheme: 'dark',
    githubUsername: 'testdev',
  }),
}));

describe('ImagePickerModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ImagePickerModal isOpen={false} onClose={() => {}} onSave={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title and tabs when isOpen is true', () => {
    render(
      <ImagePickerModal isOpen={true} onClose={() => {}} onSave={() => {}} title="Modifier la photo" />
    );

    expect(screen.getByText('Modifier la photo')).toBeInTheDocument();
    expect(screen.getByText('Fichier local')).toBeInTheDocument();
    expect(screen.getByText('Avatar GitHub')).toBeInTheDocument();
    expect(screen.getByText('Lien URL')).toBeInTheDocument();
  });

  it('allows entering image URL on URL tab and saving', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <ImagePickerModal isOpen={true} onClose={handleClose} onSave={handleSave} />
    );

    // Switch to URL tab
    const urlTab = screen.getByText('Lien URL');
    fireEvent.click(urlTab);

    // Enter URL
    const input = screen.getByPlaceholderText(/https:\/\/images\.unsplash\.com/i);
    fireEvent.change(input, { target: { value: 'https://cdn.example.com/me.png' } });

    // Submit URL form with Aperçu button
    const apercuBtn = screen.getByRole('button', { name: 'Aperçu' });
    fireEvent.click(apercuBtn);

    // Confirm button in modal footer
    const confirmBtn = screen.getByText("Appliquer l'image");
    fireEvent.click(confirmBtn);

    expect(handleSave).toHaveBeenCalledWith('https://cdn.example.com/me.png');
    expect(handleClose).toHaveBeenCalled();
  });
});
