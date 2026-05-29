import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import App from './App';
import useCampaignStore from '../stores/useCampaignStore';

describe('App', () => {
  beforeEach(() => {
    act(() => {
      useCampaignStore.getState().resetProgress();
    });
  });

  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText('PoE2 Campaign Tracker')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Track your Path of Exile 2 campaign progress')).toBeInTheDocument();
  });

  it('renders act tabs', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Act 1/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Act 2/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Act 3/ })).toBeInTheDocument();
  });

  it('renders the Reset button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('shows confirmation dialog when Reset is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByText('Clear all progress and reset area order?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('hides confirmation dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Clear all progress and reset area order?')).not.toBeInTheDocument();
  });

  it('resets progress when Confirm is clicked', async () => {
    const user = userEvent.setup();

    // Complete some tasks first
    act(() => {
      useCampaignStore.getState().toggleTask('a1-ce-wp');
      useCampaignStore.getState().toggleTask('a1-ce-talk');
    });

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    expect(useCampaignStore.getState().completedTasks.size).toBe(0);
  });

  it('switches act panels when clicking a different tab', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Should show Act 1 content by default
    expect(screen.getByText('Clearfell')).toBeInTheDocument();

    // Click Act 2 tab
    await user.click(screen.getByRole('button', { name: /Act 2/ }));
    expect(screen.getByText('Vastiri Outskirts')).toBeInTheDocument();
    expect(screen.queryByText('Clearfell')).not.toBeInTheDocument();
  });

  it('shows Act 1 areas by default', () => {
    render(<App />);
    expect(screen.getByText('Clearfell')).toBeInTheDocument();
    expect(screen.getByText('The Grelwood')).toBeInTheDocument();
  });

  it('displays progress counts', () => {
    render(<App />);
    // The "All" progress bar shows "0/N" for Act 1's total tasks
    expect(screen.getByText('0/51')).toBeInTheDocument();
  });

  it('renders the Settings button', () => {
    render(<App />);
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('opens settings modal when Settings is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByLabelText('Settings'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Hide Waypoints')).toBeInTheDocument();
  });

  it('closes settings modal when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByLabelText('Settings'));
    expect(screen.getByText('Hide Waypoints')).toBeInTheDocument();

    // Click the backdrop (the fixed overlay div)
    await user.click(screen.getByText('Hide Waypoints').closest('[class*="fixed"]'));
    expect(screen.queryByText('Hide Waypoints')).not.toBeInTheDocument();
  });
});
