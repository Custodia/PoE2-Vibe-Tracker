import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AreaCard from './AreaCard';
import useCampaignStore from '../stores/useCampaignStore';

// AreaCard requires DnD context to render properly
function renderAreaCard(area) {
  return render(
    <DndContext>
      <SortableContext items={[area.id]} strategy={verticalListSortingStrategy}>
        <AreaCard area={area} />
      </SortableContext>
    </DndContext>
  );
}

describe('AreaCard', () => {
  const testArea = {
    id: 'test-area',
    name: 'Test Area',
    prerequisites: [],
    tasks: [
      { id: 'task-1', name: 'Task One', type: 'quest' },
      { id: 'task-2', name: 'Task Two', type: 'waypoint' },
      { id: 'task-3', name: 'Task Three', type: 'skill_point' },
    ],
  };

  beforeEach(() => {
    act(() => {
      useCampaignStore.getState().resetProgress();
    });
  });

  it('renders the area name', () => {
    renderAreaCard(testArea);
    expect(screen.getByText('Test Area')).toBeInTheDocument();
  });

  it('renders all tasks', () => {
    renderAreaCard(testArea);
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
    expect(screen.getByText('Task Three')).toBeInTheDocument();
  });

  it('shows progress badge with correct counts', () => {
    renderAreaCard(testArea);
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });

  it('updates progress badge when tasks are completed', () => {
    act(() => {
      useCampaignStore.getState().toggleTask('task-1');
    });
    renderAreaCard(testArea);
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('shows "Check all" button when not all tasks are done', () => {
    renderAreaCard(testArea);
    expect(screen.getByText('Check all')).toBeInTheDocument();
  });

  it('hides "Check all" button when all tasks are done', () => {
    act(() => {
      useCampaignStore.getState().completeAllTasks(['task-1', 'task-2', 'task-3']);
    });
    renderAreaCard(testArea);
    expect(screen.queryByText('Check all')).not.toBeInTheDocument();
  });

  it('completes all tasks when "Check all" is clicked', async () => {
    const user = userEvent.setup();
    renderAreaCard(testArea);

    await user.click(screen.getByText('Check all'));

    const { completedTasks } = useCampaignStore.getState();
    expect(completedTasks.has('task-1')).toBe(true);
    expect(completedTasks.has('task-2')).toBe(true);
    expect(completedTasks.has('task-3')).toBe(true);
  });

  it('renders drag handle with accessible label', () => {
    renderAreaCard(testArea);
    expect(screen.getByLabelText('Drag to reorder')).toBeInTheDocument();
  });

  it('collapses tasks when all are completed', () => {
    act(() => {
      useCampaignStore.getState().completeAllTasks(['task-1', 'task-2', 'task-3']);
    });
    renderAreaCard(testArea);
    // When collapsed, individual task names should not be visible
    expect(screen.queryByText('Task One')).not.toBeInTheDocument();
  });

  it('shows tasks when area is expanded and not all complete', () => {
    act(() => {
      useCampaignStore.getState().toggleTask('task-1');
    });
    renderAreaCard(testArea);
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });
});
