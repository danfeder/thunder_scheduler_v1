import { useState, useCallback } from 'react';

interface Selection {
  startDayIndex: number | null;
  startPeriod: number | null;
  endDayIndex: number | null;
  endPeriod: number | null;
  isDragging: boolean;
  isShiftPressed: boolean;
}

interface MultiPeriodSelectionHandlers {
  handleMouseDown: (dayIndex: number, period: number, event: React.MouseEvent) => void;
  handleMouseEnter: (dayIndex: number, period: number) => void;
  handleMouseUp: () => void;
  handleClick: (dayIndex: number, period: number, event: React.MouseEvent) => void;
  isInSelection: (dayIndex: number, period: number) => boolean;
}

interface UseMultiPeriodSelectionProps {
  onSelectionComplete: (startDay: number, startPeriod: number, endDay: number, endPeriod: number) => void;
}

export function useMultiPeriodSelection({ onSelectionComplete }: UseMultiPeriodSelectionProps): MultiPeriodSelectionHandlers {
  const [selection, setSelection] = useState<Selection>({
    startDayIndex: null,
    startPeriod: null,
    endDayIndex: null,
    endPeriod: null,
    isDragging: false,
    isShiftPressed: false,
  });

  const handleMouseDown = useCallback((dayIndex: number, period: number, event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only handle left click
    
    setSelection({
      startDayIndex: dayIndex,
      startPeriod: period,
      endDayIndex: dayIndex,
      endPeriod: period,
      isDragging: true,
      isShiftPressed: event.shiftKey,
    });
  }, []);

  const handleMouseEnter = useCallback((dayIndex: number, period: number) => {
    if (selection.isDragging) {
      setSelection(prev => ({
        ...prev,
        endDayIndex: dayIndex,
        endPeriod: period,
      }));
    }
  }, [selection.isDragging]);

  const handleMouseUp = useCallback(() => {
    if (selection.isDragging && selection.startDayIndex !== null && selection.endDayIndex !== null && 
        selection.startPeriod !== null && selection.endPeriod !== null) {
      onSelectionComplete(
        selection.startDayIndex,
        selection.startPeriod,
        selection.endDayIndex,
        selection.endPeriod
      );
    }
    setSelection(prev => ({
      ...prev,
      isDragging: false,
    }));
  }, [selection, onSelectionComplete]);

  const handleClick = useCallback((dayIndex: number, period: number, event: React.MouseEvent) => {
    if (event.shiftKey && selection.startDayIndex !== null && selection.startPeriod !== null) {
      setSelection(prev => ({
        ...prev,
        endDayIndex: dayIndex,
        endPeriod: period,
        isShiftPressed: true,
      }));
      onSelectionComplete(
        selection.startDayIndex,
        selection.startPeriod,
        dayIndex,
        period
      );
    } else {
      setSelection({
        startDayIndex: dayIndex,
        startPeriod: period,
        endDayIndex: dayIndex,
        endPeriod: period,
        isDragging: false,
        isShiftPressed: event.shiftKey,
      });
      onSelectionComplete(dayIndex, period, dayIndex, period);
    }
  }, [selection, onSelectionComplete]);

  const isInSelection = useCallback((dayIndex: number, period: number): boolean => {
    if (!selection.startDayIndex || !selection.endDayIndex || !selection.startPeriod || !selection.endPeriod) {
      return false;
    }

    const startDay = Math.min(selection.startDayIndex, selection.endDayIndex);
    const endDay = Math.max(selection.startDayIndex, selection.endDayIndex);
    const startPeriod = Math.min(selection.startPeriod, selection.endPeriod);
    const endPeriod = Math.max(selection.startPeriod, selection.endPeriod);

    return (
      dayIndex >= startDay &&
      dayIndex <= endDay &&
      period >= startPeriod &&
      period <= endPeriod
    );
  }, [selection]);

  return {
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    handleClick,
    isInSelection,
  };
}