import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import ActPanel from './ActPanel';
import useCampaignStore from '../stores/useCampaignStore';
import campaignData from '../data/campaign.json';

describe('ActPanel – hideCompletedZones', () => {
  const act1 = campaignData.acts[0];

  beforeEach(() => {
    act(() => {
      useCampaignStore.getState().resetProgress();
      for (const type of useCampaignStore.getState().hiddenTaskTypes) {
        useCampaignStore.getState().toggleHiddenTaskType(type);
      }
      if (useCampaignStore.getState().hideCompletedZones) {
        useCampaignStore.getState().toggleHideCompletedZones();
      }
    });
  });

  it('renders all areas when hideCompletedZones is off', () => {
    render(<ActPanel act={act1} />);
    for (const area of act1.areas) {
      expect(screen.getByText(area.name)).toBeInTheDocument();
    }
  });

  it('still shows all areas when hideCompletedZones is on but none are completed', () => {
    act(() => {
      useCampaignStore.getState().toggleHideCompletedZones();
    });
    render(<ActPanel act={act1} />);
    for (const area of act1.areas) {
      expect(screen.getByText(area.name)).toBeInTheDocument();
    }
  });

  it('hides a completed area when hideCompletedZones is on', () => {
    const clearfell = act1.areas.find((a) => a.id === 'clearfell');
    const allTaskIds = clearfell.tasks.map((t) => t.id);

    act(() => {
      useCampaignStore.getState().toggleHideCompletedZones();
      useCampaignStore.getState().completeAllTasks(allTaskIds);
    });

    render(<ActPanel act={act1} />);
    expect(screen.queryByText('Clearfell')).not.toBeInTheDocument();
  });

  it('still shows a completed area when hideCompletedZones is off', () => {
    const clearfell = act1.areas.find((a) => a.id === 'clearfell');
    const allTaskIds = clearfell.tasks.map((t) => t.id);

    act(() => {
      useCampaignStore.getState().completeAllTasks(allTaskIds);
    });

    render(<ActPanel act={act1} />);
    expect(screen.getByText('Clearfell')).toBeInTheDocument();
  });

  it('hides area when all visible tasks are done (some types hidden)', () => {
    const clearfell = act1.areas.find((a) => a.id === 'clearfell');
    // Hide waypoints and league mechanics
    act(() => {
      useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      useCampaignStore.getState().toggleHiddenTaskType('league_mechanic');
      useCampaignStore.getState().toggleHideCompletedZones();
    });

    // Only complete the non-hidden tasks (permanent_reward + additional_reward)
    const visibleTaskIds = clearfell.tasks
      .filter((t) => t.type !== 'waypoint' && t.type !== 'league_mechanic')
      .map((t) => t.id);

    act(() => {
      useCampaignStore.getState().completeAllTasks(visibleTaskIds);
    });

    render(<ActPanel act={act1} />);
    expect(screen.queryByText('Clearfell')).not.toBeInTheDocument();
  });

  it('does not hide area with partially completed visible tasks', () => {
    const clearfell = act1.areas.find((a) => a.id === 'clearfell');

    act(() => {
      useCampaignStore.getState().toggleHideCompletedZones();
      // Complete only the first task
      useCampaignStore.getState().toggleTask(clearfell.tasks[0].id);
    });

    render(<ActPanel act={act1} />);
    expect(screen.getByText('Clearfell')).toBeInTheDocument();
  });

  it('progress bars still count tasks from hidden zones', () => {
    const clearfell = act1.areas.find((a) => a.id === 'clearfell');
    const allTaskIds = clearfell.tasks.map((t) => t.id);

    act(() => {
      useCampaignStore.getState().toggleHideCompletedZones();
      useCampaignStore.getState().completeAllTasks(allTaskIds);
    });

    render(<ActPanel act={act1} />);

    // The "All" progress bar should show the completed count including hidden zone tasks
    const totalTasks = act1.areas.flatMap((a) => a.tasks).length;
    const progressText = screen.getByText(`${allTaskIds.length}/${totalTasks}`);
    expect(progressText).toBeInTheDocument();
  });
});
