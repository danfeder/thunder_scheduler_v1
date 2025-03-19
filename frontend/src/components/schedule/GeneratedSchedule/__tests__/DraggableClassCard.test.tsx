import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Conflict, Day } from '../../../../types/schedule.types';
import DraggableClassCard from '../DraggableClassCard';

// Helper function to simulate a drag operation
const simulateDrag = (element: HTMLElement, dropTargetId: string) => {
  // Create drag start event
  const dragStartEvent = new Event('dragstart', { bubbles: true });
  element.dispatchEvent(dragStartEvent);

  // Create drop event
  const dropTarget = document.querySelector(`[data-rbd-droppable-id="${dropTargetId}"]`);
  if (dropTarget) {
    const dropEvent = new Event('drop', { bubbles: true });
    dropTarget.dispatchEvent(dropEvent);
  }
};

// Mock component must be wrapped in DragDropContext and Droppable
const renderWithDragContext = (ui: React.ReactElement) => {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test-droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {ui}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

describe('DraggableClassCard', () => {
  const defaultProps = {
    classId: 'MATH101',
    grade: 3,
    index: 0,
    conflicts: [
      {
        type: 'teacher' as const,
        message: 'Teacher unavailable',
        classId: 'MATH101',
        day: Day.MONDAY,
        period: 1
      }
    ]
  };

  it('renders with required props', () => {
    const { container } = renderWithDragContext(<DraggableClassCard {...defaultProps} />);
    
    // Check that the class card content is rendered within class-name div
    expect(screen.getByText('MATH101').closest('.class-name')).toBeInTheDocument();
    
    // Check that it has draggable properties
    const draggableElement = container.querySelector('.draggable-class-card');
    expect(draggableElement).toBeInTheDocument();
  });

  it('renders as non-draggable when isDragDisabled is true', () => {
    const { container } = renderWithDragContext(
      <DraggableClassCard {...defaultProps} isDragDisabled={true} />
    );
    
    // Check that the element is disabled for dragging
    const draggableElement = container.querySelector('.draggable-class-card');
    expect(draggableElement).toBeInTheDocument();
  });

  it('passes conflicts to ClassCard', () => {
    const { container } = renderWithDragContext(<DraggableClassCard {...defaultProps} />);
    
    // Check that conflict indicator is present
    expect(screen.getByText('MATH101').closest('.class-card')).toHaveClass('border-2');
    expect(screen.getByText('MATH101').closest('.class-card')).toHaveClass('border-red-400');
    expect(container.querySelector('.conflict-indicator')).toBeInTheDocument();
  });

  it('applies correct base draggable styles', () => {
    const { container } = renderWithDragContext(<DraggableClassCard {...defaultProps} />);
    
    expect(container.querySelector('.draggable-class-card')).toBeInTheDocument();
  });
});