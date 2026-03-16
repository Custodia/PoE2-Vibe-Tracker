import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import ActTabs from './ActTabs';
import useCampaignStore from '../stores/useCampaignStore';
import campaignData from '../data/campaign.json';

describe('ActTabs', () => {
  const defaultProps = {
    acts: campaignData.acts,
    activeActId: 'act1',
    onSelectAct: vi.fn(),
  };

  beforeEach(() => {
    act(() => {
      useCampaignStore.getState().resetProgress();
    });
    defaultProps.onSelectAct.mockClear();
  });

  it('renders a tab button for each act', () => {
    render(<ActTabs {...defaultProps} />);
    for (const a of campaignData.acts) {
      expect(screen.getByRole('button', { name: new RegExp(a.name) })).toBeInTheDocument();
    }
  });

  it('calls onSelectAct when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<ActTabs {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Act 2/ }));
    expect(defaultProps.onSelectAct).toHaveBeenCalledWith('act2');
  });

  it('highlights the active tab with indigo styling', () => {
    render(<ActTabs {...defaultProps} activeActId="act1" />);
    const activeBtn = screen.getByRole('button', { name: /Act 1/ });
    expect(activeBtn.className).toContain('border-indigo-500');
  });

  it('shows checkmark when all tasks in an act are completed', () => {
    // Complete all tasks in act1
    const act1Tasks = campaignData.acts[0].areas.flatMap((a) => a.tasks.map((t) => t.id));
    act(() => {
      useCampaignStore.getState().completeAllTasks(act1Tasks);
    });

    render(<ActTabs {...defaultProps} />);
    // The checkmark ✓ (unicode 10003) should appear
    const act1Button = screen.getByRole('button', { name: /Act 1/ });
    expect(act1Button.textContent).toContain('\u2713');
  });

  it('does not show checkmark when act is incomplete', () => {
    render(<ActTabs {...defaultProps} />);
    const act1Button = screen.getByRole('button', { name: /Act 1/ });
    expect(act1Button.textContent).not.toContain('\u2713');
  });
});
