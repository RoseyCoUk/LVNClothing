import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteConfirmationModal from './DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?'
  };

  it('renders when open', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onConfirm={onConfirm} />);
    
    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when escape key is pressed', () => {
    const onCancel = vi.fn();
    render(<DeleteConfirmationModal {...defaultProps} onCancel={onCancel} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows warning text when provided', () => {
    const warningText = 'This action cannot be undone';
    render(
      <DeleteConfirmationModal 
        {...defaultProps} 
        warningText={warningText} 
      />
    );
    
    expect(screen.getByText(`⚠️ ${warningText}`)).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(<DeleteConfirmationModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-modal-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-modal-description');
  });

  it('focuses cancel button by default for safety', () => {
    render(<DeleteConfirmationModal {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toHaveFocus();
  });

  it('uses custom button text when provided', () => {
    render(
      <DeleteConfirmationModal 
        {...defaultProps} 
        confirmText="Remove"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText('Remove')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });
});