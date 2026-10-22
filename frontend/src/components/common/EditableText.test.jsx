import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditableText } from './EditableText';

const mockUsePortfolio = vi.fn();
vi.mock('../../context/PortfolioContext', () => ({
  usePortfolio: () => mockUsePortfolio(),
}));

describe('EditableText Component', () => {
  it('renders read-only text when isEditMode is false', () => {
    mockUsePortfolio.mockReturnValue({ isEditMode: false });

    render(<EditableText value="Senior Developer" as="h1" />);
    const heading = screen.getByRole('heading', { level: 1 });

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Senior Developer');
    expect(heading).not.toHaveAttribute('contenteditable');
  });

  it('renders contentEditable element when isEditMode is true', () => {
    mockUsePortfolio.mockReturnValue({ isEditMode: true });

    render(<EditableText value="Click to edit me" as="span" />);
    const editable = screen.getByText('Click to edit me');

    expect(editable).toHaveAttribute('contenteditable', 'true');
  });

  it('calls onSave on blur when text is modified', () => {
    mockUsePortfolio.mockReturnValue({ isEditMode: true });
    const handleSave = vi.fn();

    render(<EditableText value="Old Title" onSave={handleSave} />);
    const el = screen.getByText('Old Title');

    // Simulate user editing the innerText
    el.innerText = 'New Title';
    fireEvent.blur(el);

    expect(handleSave).toHaveBeenCalledWith('New Title');
  });

  it('does not trigger onSave if text remains unchanged on blur', () => {
    mockUsePortfolio.mockReturnValue({ isEditMode: true });
    const handleSave = vi.fn();

    render(<EditableText value="Unchanged" onSave={handleSave} />);
    const el = screen.getByText('Unchanged');

    fireEvent.blur(el);
    expect(handleSave).not.toHaveBeenCalled();
  });
});
