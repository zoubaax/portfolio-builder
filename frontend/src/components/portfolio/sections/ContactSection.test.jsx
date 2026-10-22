import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContactSection } from './ContactSection';

vi.mock('../../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    updateSectionField: vi.fn(),
    isMobileViewport: false,
    isEditMode: false,
  }),
}));

describe('ContactSection Component', () => {
  const mockData = {
    heading: 'Work With Me',
    subheading: 'GET IN TOUCH',
    text: 'Available for freelance architecture consultations.',
    email: 'alex@example.com',
    location: 'San Francisco, CA',
    buttonText: 'Send Message',
  };

  it('renders heading, text, email, and location', () => {
    render(<ContactSection data={mockData} sectionId="sec-contact" />);

    expect(screen.getByText('Work With Me')).toBeInTheDocument();
    expect(screen.getByText('GET IN TOUCH')).toBeInTheDocument();
    expect(screen.getByText(/Available for freelance architecture/i)).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('renders a mailto link with the correct email address', () => {
    render(<ContactSection data={mockData} sectionId="sec-contact" />);

    const mailLink = screen.getByText('Send Message').closest('a');
    expect(mailLink).toHaveAttribute('href', 'mailto:alex@example.com');
  });

  it('copies email to clipboard on copy button click', () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<ContactSection data={mockData} sectionId="sec-contact" />);

    const copyBtn = screen.getByText('alex@example.com').closest('button');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('alex@example.com');
  });
});
