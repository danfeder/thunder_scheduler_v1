import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Conflict, DayOfWeek } from '../../../../types/schedule.types';
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
        day: 'Monday' as DayOfWeek,
        period: 1
      }
    ]
  };

  it('renders with required props', () => {
    renderWithDragContext(<DraggableClassCard {...defaultProps} />);
    
    // Check that the class card content is rendered
    expect(screen.getByText('MATH101')).toBeInTheDocument();
    
    // Check that it has draggable properties
    const wrapper = screen.getByText('MATH101').closest('.draggable-class-card');
    expect(wrapper).toBeInTheDocument();
    // The wrapper should have draggable-related attributes
    expect(wrapper).toHaveAttribute('draggable', 'false'); // DnD sets false and handles it internally
    expect(wrapper).toHaveAttribute('data-rbd-draggable-id', 'MATH101');
  });

  it('renders as non-draggable when isDragDisabled is true', () => {
    renderWithDragContext(
      <DraggableClassCard {...defaultProps} isDragDisabled={true} />
    );
    
    // Check that the element is disabled for dragging
    const wrapper = screen.getByText('MATH101').closest('.draggable-class-card');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('draggable', 'false');
    expect(wrapper).toHaveAttribute('data-rbd-draggable-id', 'MATH101');
    expect(wrapper).toHaveAttribute('data-rbd-drag-disabled', 'true');
  });

  it('passes conflicts to ClassCard', () => {
    renderWithDragContext(<DraggableClassCard {...defaultProps} />);
    
    // Check that conflict indicator is present
    const cardElement = screen.getByText('MATH101').closest('.class-card');
    expect(cardElement).toHaveClass('border-2', 'border-red-400');
  });

  it('applies correct base draggable styles', () => {
    renderWithDragContext(<DraggableClassCard {...defaultProps} />);
    
    const wrapper = screen.getByText('MATH101').closest('.draggable-class-card');
    expect(wrapper).toHaveClass('draggable-class-card');
  });

  // Note: Testing drag states would require a more complex setup with jsdom
  // and simulating drag events. For now, we just test the static rendering.
});