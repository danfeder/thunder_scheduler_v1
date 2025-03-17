import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ConflictGrid from '../ClassConflictManager/ConflictGrid';
import { DayOfWeek } from '../../../types/schedule.types';

describe('ConflictGrid', () => {
  const mockOnConflictToggle = jest.fn();
  const mockConflicts = [
    {
      day: 'Monday' as DayOfWeek,
      periods: [1, 2],
    },
  ];

  beforeEach(() => {
    mockOnConflictToggle.mockClear();
  });

  it('renders grid with correct number of cells', () => {
    render(
      <ConflictGrid
        conflicts={mockConflicts}
        onConflictToggle={mockOnConflictToggle}
      />
    );

    // 5 days x 8 periods = 40 cells
    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(40);
  });

  it('displays initial conflicts correctly', () => {
    render(
      <ConflictGrid
        conflicts={mockConflicts}
        onConflictToggle={mockOnConflictToggle}
      />
    );

    // Check that Monday period 1 and 2 are marked as conflicts
    const mondayPeriod1 = screen.getByLabelText('Toggle conflict for Monday Period 1');
    const mondayPeriod2 = screen.getByLabelText('Toggle conflict for Monday Period 2');

    expect(mondayPeriod1).toHaveClass('is-blocked');
    expect(mondayPeriod2).toHaveClass('is-blocked');
  });

  it('calls onConflictToggle when cell is clicked', () => {
    render(
      <ConflictGrid
        conflicts={mockConflicts}
        onConflictToggle={mockOnConflictToggle}
      />
    );

    // Click on a non-conflicted cell
    const tuesdayPeriod1 = screen.getByLabelText('Toggle conflict for Tuesday Period 1');
    fireEvent.click(tuesdayPeriod1);

    expect(mockOnConflictToggle).toHaveBeenCalledWith('Tuesday', 1);
  });

  it('handles toggling existing conflicts', () => {
    render(
      <ConflictGrid
        conflicts={mockConflicts}
        onConflictToggle={mockOnConflictToggle}
      />
    );

    // Click on an existing conflict
    const mondayPeriod1 = screen.getByLabelText('Toggle conflict for Monday Period 1');
    fireEvent.click(mondayPeriod1);

    expect(mockOnConflictToggle).toHaveBeenCalledWith('Monday', 1);
  });

  it('maintains grid layout with correct headers', () => {
    render(
      <ConflictGrid
        conflicts={mockConflicts}
        onConflictToggle={mockOnConflictToggle}
      />
    );

    // Check day headers
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });

    // Check period labels
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByText(`Period ${i}`)).toBeInTheDocument();
    }
  });
});