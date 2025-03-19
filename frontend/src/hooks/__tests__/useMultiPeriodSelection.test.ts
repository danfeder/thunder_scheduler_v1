import { renderHook, act } from '@testing-library/react';
import { useMultiPeriodSelection } from '../useMultiPeriodSelection';
import { vi } from 'vitest';

describe('useMultiPeriodSelection', () => {
  const mockOnSelectionComplete = vi.fn();

  beforeEach(() => {
    mockOnSelectionComplete.mockClear();
  });

  it('handles single click selection', () => {
    const { result } = renderHook(() => useMultiPeriodSelection({
      onSelectionComplete: mockOnSelectionComplete,
    }));

    act(() => {
      result.current.handleClick(0, 1, { shiftKey: false } as React.MouseEvent);
    });

    expect(mockOnSelectionComplete).toHaveBeenCalledWith(0, 1, 0, 1);
  });

  it('handles shift+click range selection', () => {
    const { result } = renderHook(() => useMultiPeriodSelection({
      onSelectionComplete: mockOnSelectionComplete,
    }));

    // First click
    act(() => {
      result.current.handleClick(0, 1, { shiftKey: false } as React.MouseEvent);
    });

    // Shift+click
    act(() => {
      result.current.handleClick(1, 2, { shiftKey: true } as React.MouseEvent);
    });

    expect(mockOnSelectionComplete).toHaveBeenCalledTimes(2);
    expect(mockOnSelectionComplete).toHaveBeenLastCalledWith(0, 1, 1, 2);
  });

  it('handles drag selection', () => {
    const { result } = renderHook(() => useMultiPeriodSelection({
      onSelectionComplete: mockOnSelectionComplete,
    }));

    // Start drag
    act(() => {
      result.current.handleMouseDown(0, 1, { button: 0 } as React.MouseEvent);
    });

    // Drag over cells
    act(() => {
      result.current.handleMouseEnter(1, 2);
    });

    // End drag
    act(() => {
      result.current.handleMouseUp();
    });

    expect(mockOnSelectionComplete).toHaveBeenCalledWith(0, 1, 1, 2);
  });

  it('calculates selection range correctly', () => {
    const { result } = renderHook(() => useMultiPeriodSelection({
      onSelectionComplete: mockOnSelectionComplete,
    }));

    // Start drag from bottom right to top left
    act(() => {
      result.current.handleMouseDown(2, 3, { button: 0 } as React.MouseEvent);
    });

    act(() => {
      result.current.handleMouseEnter(1, 2);
    });

    // Check that cells in between are marked as selected
    expect(result.current.isInSelection(1, 2)).toBe(true);
    expect(result.current.isInSelection(1, 3)).toBe(true);
    expect(result.current.isInSelection(2, 2)).toBe(true);
    expect(result.current.isInSelection(2, 3)).toBe(true);
    
    // Check that cells outside range are not selected
    expect(result.current.isInSelection(0, 1)).toBe(false);
    expect(result.current.isInSelection(3, 4)).toBe(false);
  });

  it('ignores non-left mouse clicks', () => {
    const { result } = renderHook(() => useMultiPeriodSelection({
      onSelectionComplete: mockOnSelectionComplete,
    }));

    act(() => {
      result.current.handleMouseDown(0, 1, { button: 2 } as React.MouseEvent);
    });

    expect(result.current.isInSelection(0, 1)).toBe(false);
    expect(mockOnSelectionComplete).not.toHaveBeenCalled();
  });

  it('cancels selection on mouse up', () => {
    const { result } = renderHook(() => useMultiPeriodSelection({
      onSelectionComplete: mockOnSelectionComplete,
    }));

    // Start drag
    act(() => {
      result.current.handleMouseDown(0, 1, { button: 0 } as React.MouseEvent);
    });

    // End drag
    act(() => {
      result.current.handleMouseUp();
    });

    // Check that drag state is reset
    expect(result.current.isInSelection(0, 1)).toBe(false);
  });
});