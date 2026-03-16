import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import TaskItem from './TaskItem';
import useCampaignStore from '../stores/useCampaignStore';

describe('TaskItem', () => {
  beforeEach(() => {
    act(() => {
      useCampaignStore.getState().resetProgress();
    });
  });

  const questTask = { id: 'test-quest', name: 'Defeat the Boss', type: 'quest' };
  const waypointTask = { id: 'test-wp', name: 'Get Waypoint', type: 'waypoint' };
  const skillTask = { id: 'test-skill', name: 'Passive Skill Point', type: 'skill_point' };
  const trialTask = { id: 'test-trial', name: 'Complete Trial', type: 'trial' };

  it('renders the task name', () => {
    render(<TaskItem task={questTask} />);
    expect(screen.getByText('Defeat the Boss')).toBeInTheDocument();
  });

  it('renders a checkbox', () => {
    render(<TaskItem task={questTask} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders the correct type badge for quest', () => {
    render(<TaskItem task={questTask} />);
    expect(screen.getByText('Quest')).toBeInTheDocument();
  });

  it('renders the correct type badge for waypoint', () => {
    render(<TaskItem task={waypointTask} />);
    expect(screen.getByText('Waypoint')).toBeInTheDocument();
  });

  it('renders the correct type badge for skill_point', () => {
    render(<TaskItem task={skillTask} />);
    expect(screen.getByText('Skill Point')).toBeInTheDocument();
  });

  it('renders the correct type badge for trial', () => {
    render(<TaskItem task={trialTask} />);
    expect(screen.getByText('Trial')).toBeInTheDocument();
  });

  it('checkbox is unchecked initially', () => {
    render(<TaskItem task={questTask} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('toggles task completion when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={questTask} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(useCampaignStore.getState().completedTasks.has('test-quest')).toBe(true);
    expect(checkbox).toBeChecked();
  });

  it('shows completed state when task is already completed', () => {
    act(() => {
      useCampaignStore.getState().toggleTask('test-quest');
    });
    render(<TaskItem task={questTask} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('applies strikethrough style when completed', () => {
    act(() => {
      useCampaignStore.getState().toggleTask('test-quest');
    });
    render(<TaskItem task={questTask} />);
    const taskText = screen.getByText('Defeat the Boss');
    expect(taskText.className).toContain('line-through');
  });
});
