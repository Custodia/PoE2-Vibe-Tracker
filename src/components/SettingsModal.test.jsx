import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import SettingsModal from './SettingsModal';
import useCampaignStore from '../stores/useCampaignStore';

describe('SettingsModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    onClose.mockClear();
    act(() => {
      useCampaignStore.getState().resetProgress();
      // Ensure all types are unhidden
      for (const type of useCampaignStore.getState().hiddenTaskTypes) {
        useCampaignStore.getState().toggleHiddenTaskType(type);
      }
      // Reset hideCompletedZones
      if (useCampaignStore.getState().hideCompletedZones) {
        useCampaignStore.getState().toggleHideCompletedZones();
      }
    });
  });

  it('renders all three toggle options', () => {
    render(<SettingsModal onClose={onClose} />);
    expect(screen.getByText('Hide Waypoints')).toBeInTheDocument();
    expect(screen.getByText('Hide League Mechanics')).toBeInTheDocument();
    expect(screen.getByText('Hide Bonus Rewards')).toBeInTheDocument();
  });

  it('renders the Settings title', () => {
    render(<SettingsModal onClose={onClose} />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('toggles waypoint visibility when clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    await user.click(screen.getByRole('switch', { name: 'Hide Waypoints' }));
    expect(useCampaignStore.getState().hiddenTaskTypes.has('waypoint')).toBe(true);
  });

  it('toggles league mechanic visibility when clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    await user.click(screen.getByRole('switch', { name: 'Hide League Mechanics' }));
    expect(useCampaignStore.getState().hiddenTaskTypes.has('league_mechanic')).toBe(true);
  });

  it('toggles bonus reward visibility when clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    await user.click(screen.getByRole('switch', { name: 'Hide Bonus Rewards' }));
    expect(useCampaignStore.getState().hiddenTaskTypes.has('additional_reward')).toBe(true);
  });

  it('reflects current hidden state in toggle switches', () => {
    act(() => {
      useCampaignStore.getState().toggleHiddenTaskType('waypoint');
    });
    render(<SettingsModal onClose={onClose} />);

    const wpSwitch = screen.getByRole('switch', { name: 'Hide Waypoints' });
    expect(wpSwitch.getAttribute('aria-checked')).toBe('true');

    const leagueSwitch = screen.getByRole('switch', { name: 'Hide League Mechanics' });
    expect(leagueSwitch.getAttribute('aria-checked')).toBe('false');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    await user.click(screen.getByLabelText('Close settings'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders General section header', () => {
    render(<SettingsModal onClose={onClose} />);
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('renders Visibility section header', () => {
    render(<SettingsModal onClose={onClose} />);
    expect(screen.getByText('Visibility')).toBeInTheDocument();
  });

  it('renders the Hide completed zones toggle', () => {
    render(<SettingsModal onClose={onClose} />);
    expect(screen.getByText('Hide completed zones')).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Hide completed zones' })).toBeInTheDocument();
  });

  it('toggles hideCompletedZones when switch is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    const toggle = screen.getByRole('switch', { name: 'Hide completed zones' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(useCampaignStore.getState().hideCompletedZones).toBe(true);
  });

  it('reflects current hideCompletedZones state', () => {
    act(() => {
      useCampaignStore.getState().toggleHideCompletedZones();
    });
    render(<SettingsModal onClose={onClose} />);

    const toggle = screen.getByRole('switch', { name: 'Hide completed zones' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('can toggle a type off after toggling it on', async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={onClose} />);

    const wpSwitch = screen.getByRole('switch', { name: 'Hide Waypoints' });
    await user.click(wpSwitch);
    expect(useCampaignStore.getState().hiddenTaskTypes.has('waypoint')).toBe(true);

    await user.click(wpSwitch);
    expect(useCampaignStore.getState().hiddenTaskTypes.has('waypoint')).toBe(false);
  });
});
