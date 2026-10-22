import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudioHeader } from './StudioHeader';

const mockSetDeviceView = vi.fn();
const mockSetIsEditMode = vi.fn();
const mockUndo = vi.fn();
const mockRedo = vi.fn();
const mockSavePortfolio = vi.fn();

vi.mock('../../context/PortfolioContext', () => ({
  usePortfolio: () => ({
    portfolio: {
      meta: { title: 'Alex Rivera Studio', slug: 'alex-rivera' },
    },
    setPortfolio: vi.fn(),
    deviceView: 'desktop',
    setDeviceView: mockSetDeviceView,
    isEditMode: true,
    setIsEditMode: mockSetIsEditMode,
    studioTheme: 'dark',
    undo: mockUndo,
    redo: mockRedo,
    canUndo: true,
    canRedo: true,
    savePortfolio: mockSavePortfolio,
    saveStatus: 'idle',
    isPublished: false,
  }),
}));

describe('StudioHeader Component', () => {
  it('renders portfolio title in the header', () => {
    render(<StudioHeader />);
    expect(screen.getByText('Alex Rivera Studio')).toBeInTheDocument();
  });

  it('allows switching device views (desktop, tablet, mobile)', () => {
    render(<StudioHeader />);

    const tabletBtn = screen.getByTitle(/Tablet view/i);
    fireEvent.click(tabletBtn);
    expect(mockSetDeviceView).toHaveBeenCalledWith('tablet');

    const mobileBtn = screen.getByTitle(/Mobile view/i);
    fireEvent.click(mobileBtn);
    expect(mockSetDeviceView).toHaveBeenCalledWith('mobile');
  });

  it('triggers undo and redo operations when enabled', () => {
    render(<StudioHeader />);

    const undoBtn = screen.getByTitle(/Undo/i);
    const redoBtn = screen.getByTitle(/Redo/i);

    fireEvent.click(undoBtn);
    expect(mockUndo).toHaveBeenCalled();

    fireEvent.click(redoBtn);
    expect(mockRedo).toHaveBeenCalled();
  });

  it('toggles edit mode to preview mode', () => {
    render(<StudioHeader />);

    const toggleBtn = screen.getByTitle(/Visual Edit Mode active/i);
    fireEvent.click(toggleBtn);

    expect(mockSetIsEditMode).toHaveBeenCalledWith(false);
  });
});
