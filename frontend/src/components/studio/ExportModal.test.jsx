import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportModal } from './ExportModal';

// Mock Clerk user hook
vi.mock('@clerk/react', () => ({
  useUser: () => ({
    user: { id: 'test_user_123', fullName: 'Test User' },
    isSignedIn: true,
  }),
}));

// Mock Portfolio Context
vi.mock('../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    portfolio: {
      meta: { title: 'Test Portfolio', slug: 'test-slug' },
      theme: { palette: { primary: '#3b82f6', background: '#0a0a0a' } },
      sections: [],
    },
    githubUsername: 'testdev',
  }),
}));

// Mock Code Export Service
vi.mock('../../services/codeExportService', () => ({
  generateProjectFiles: vi.fn(() => ({
    'package.json': '{}',
    'src/App.jsx': '// App',
  })),
  downloadProjectZip: vi.fn().mockResolvedValue(true),
}));

describe('ExportModal Component', () => {
  beforeEach(() => {
    // Mock global fetch to return a clean mock response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { connected: false } }),
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<ExportModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog when isOpen is true', () => {
    render(<ExportModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/Exporter le Code Source/i)).toBeInTheDocument();
    expect(screen.getByText(/Télécharger \(\.ZIP\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Publier sur GitHub/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<ExportModal isOpen={true} onClose={handleClose} />);
    
    const closeBtn = screen.getByLabelText(/Close modal/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('switches tabs when clicking on tab headers', async () => {
    render(<ExportModal isOpen={true} onClose={() => {}} />);
    
    const githubTab = screen.getByText(/Publier sur GitHub/i);
    fireEvent.click(githubTab);
    
    expect(await screen.findByText(/Connexion GitHub requise pour publier/i)).toBeInTheDocument();
  });
});
