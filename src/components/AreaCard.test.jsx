import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import AreaCard from './AreaCard';
import useCampaignStore from '../stores/useCampaignStore';

// AreaCard requires DnD context to render properly
function renderAreaCard(area, { isBoundary = false } = {}) {
  return render(
    <DndContext>
      <SortableContext items={[area.id]} strategy={verticalListSortingStrategy}>
        <AreaCard area={area} isBoundary={isBoundary} />
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
      for (const type of useCampaignStore.getState().hiddenTaskTypes) {
        useCampaignStore.getState().toggleHiddenTaskType(type);
      }
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

  describe('boundary styling', () => {
    it('applies reddish styling when isBoundary is true', () => {
      renderAreaCard(testArea, { isBoundary: true });
      const card = screen.getByText('Test Area').closest('.rounded-lg');
      expect(card.className).toContain('border-red-800/60');
      expect(card.className).toContain('bg-red-950/30');
    });

    it('does not apply reddish styling when isBoundary is false', () => {
      renderAreaCard(testArea, { isBoundary: false });
      const card = screen.getByText('Test Area').closest('.rounded-lg');
      expect(card.className).not.toContain('border-red-800/60');
      expect(card.className).not.toContain('bg-red-950/30');
    });

    it('does not apply transform when isBoundary is true', () => {
      renderAreaCard(testArea, { isBoundary: true });
      const card = screen.getByText('Test Area').closest('.rounded-lg');
      expect(card.style.transform).toBe('');
    });
  });

  describe('hidden task types', () => {
    it('hides tasks of a hidden type', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      renderAreaCard(testArea);
      expect(screen.getByText('Task One')).toBeInTheDocument();
      expect(screen.queryByText('Task Two')).not.toBeInTheDocument();
      expect(screen.getByText('Task Three')).toBeInTheDocument();
    });

    it('updates progress badge to reflect only visible tasks', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      renderAreaCard(testArea);
      expect(screen.getByText('0/2')).toBeInTheDocument();
    });

    it('shows empty state when all tasks are hidden', () => {
      const waypointOnlyArea = {
        id: 'wp-area',
        name: 'Waypoint Area',
        prerequisites: [],
        tasks: [
          { id: 'wp-1', name: 'WP One', type: 'waypoint' },
          { id: 'wp-2', name: 'WP Two', type: 'waypoint' },
        ],
      };
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      renderAreaCard(waypointOnlyArea);
      expect(screen.getByText('All content here has been hidden by your settings')).toBeInTheDocument();
    });

    it('hides "Check all" button when all tasks are hidden', () => {
      const waypointOnlyArea = {
        id: 'wp-area',
        name: 'Waypoint Area',
        prerequisites: [],
        tasks: [{ id: 'wp-1', name: 'WP One', type: 'waypoint' }],
      };
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      renderAreaCard(waypointOnlyArea);
      expect(screen.queryByText('Check all')).not.toBeInTheDocument();
    });

    it('"Check all" only completes visible tasks', async () => {
      const user = userEvent.setup();
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      renderAreaCard(testArea);

      await user.click(screen.getByText('Check all'));

      const { completedTasks } = useCampaignStore.getState();
      expect(completedTasks.has('task-1')).toBe(true);
      expect(completedTasks.has('task-2')).toBe(false);
      expect(completedTasks.has('task-3')).toBe(true);
    });
  });
});
