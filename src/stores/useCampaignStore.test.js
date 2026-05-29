import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// Must import store after localStorage mock is in place
const { default: useCampaignStore } = await import('./useCampaignStore');

describe('useCampaignStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset store to initial state
    act(() => {
      useCampaignStore.getState().resetProgress();
      // Clear any hidden task types (resetProgress preserves them by design)
      for (const type of useCampaignStore.getState().hiddenTaskTypes) {
        useCampaignStore.getState().toggleHiddenTaskType(type);
      }
      // Reset hideCompletedZones (also preserved by resetProgress)
      if (useCampaignStore.getState().hideCompletedZones) {
        useCampaignStore.getState().toggleHideCompletedZones();
      }
    });
  });

  describe('initial state', () => {
    it('starts with an empty completedTasks set', () => {
      const { completedTasks } = useCampaignStore.getState();
      expect(completedTasks).toBeInstanceOf(Set);
      expect(completedTasks.size).toBe(0);
    });

    it('has default area order for all acts', () => {
      const { areaOrder } = useCampaignStore.getState();
      expect(areaOrder).toHaveProperty('act1');
      expect(areaOrder).toHaveProperty('act2');
      expect(areaOrder).toHaveProperty('act3');
      expect(areaOrder.act1.length).toBeGreaterThan(0);
    });
  });

  describe('toggleTask', () => {
    it('adds a task to completedTasks when toggled on', () => {
      act(() => {
        useCampaignStore.getState().toggleTask('a1-ce-wp');
      });
      expect(useCampaignStore.getState().completedTasks.has('a1-ce-wp')).toBe(true);
    });

    it('removes a task from completedTasks when toggled off', () => {
      act(() => {
        useCampaignStore.getState().toggleTask('a1-ce-wp');
      });
      expect(useCampaignStore.getState().completedTasks.has('a1-ce-wp')).toBe(true);

      act(() => {
        useCampaignStore.getState().toggleTask('a1-ce-wp');
      });
      expect(useCampaignStore.getState().completedTasks.has('a1-ce-wp')).toBe(false);
    });

    it('persists to localStorage after toggle', () => {
      act(() => {
        useCampaignStore.getState().toggleTask('a1-ce-wp');
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.completedTasks).toContain('a1-ce-wp');
    });
  });

  describe('completeAllTasks', () => {
    it('marks multiple tasks as complete', () => {
      const taskIds = ['a1-ce-wp', 'a1-ce-talk', 'a1-gw-explore'];
      act(() => {
        useCampaignStore.getState().completeAllTasks(taskIds);
      });
      const { completedTasks } = useCampaignStore.getState();
      for (const id of taskIds) {
        expect(completedTasks.has(id)).toBe(true);
      }
    });

    it('does not remove previously completed tasks', () => {
      act(() => {
        useCampaignStore.getState().toggleTask('a1-hg-wp');
      });
      act(() => {
        useCampaignStore.getState().completeAllTasks(['a1-ce-wp', 'a1-ce-talk']);
      });
      const { completedTasks } = useCampaignStore.getState();
      expect(completedTasks.has('a1-hg-wp')).toBe(true);
      expect(completedTasks.has('a1-ce-wp')).toBe(true);
    });

    it('handles empty array', () => {
      act(() => {
        useCampaignStore.getState().completeAllTasks([]);
      });
      expect(useCampaignStore.getState().completedTasks.size).toBe(0);
    });
  });

  describe('reorderAreas', () => {
    it('updates area order for a specific act', () => {
      const newOrder = ['the-grelwood', 'clearfell-encampment'];
      act(() => {
        useCampaignStore.getState().reorderAreas('act1', newOrder);
      });
      expect(useCampaignStore.getState().areaOrder.act1).toEqual(newOrder);
    });

    it('does not affect other acts when reordering one', () => {
      const originalAct2Order = [...useCampaignStore.getState().areaOrder.act2];
      act(() => {
        useCampaignStore.getState().reorderAreas('act1', ['the-grelwood', 'clearfell-encampment']);
      });
      expect(useCampaignStore.getState().areaOrder.act2).toEqual(originalAct2Order);
    });

    it('persists reorder to localStorage', () => {
      const newOrder = ['the-grelwood', 'clearfell-encampment'];
      act(() => {
        useCampaignStore.getState().reorderAreas('act1', newOrder);
      });
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.areaOrder.act1).toEqual(newOrder);
    });
  });

  describe('resetProgress', () => {
    it('clears all completed tasks', () => {
      act(() => {
        useCampaignStore.getState().toggleTask('a1-ce-wp');
        useCampaignStore.getState().toggleTask('a2-vo-wp');
      });
      act(() => {
        useCampaignStore.getState().resetProgress();
      });
      expect(useCampaignStore.getState().completedTasks.size).toBe(0);
    });

    it('restores default area order', () => {
      act(() => {
        useCampaignStore.getState().reorderAreas('act1', ['the-grelwood', 'clearfell-encampment']);
      });
      act(() => {
        useCampaignStore.getState().resetProgress();
      });
      const { areaOrder } = useCampaignStore.getState();
      // Default order has clearfell first
      expect(areaOrder.act1[0]).toBe('clearfell');
    });

    it('persists reset state to localStorage', () => {
      act(() => {
        useCampaignStore.getState().toggleTask('a1-ce-wp');
      });
      act(() => {
        useCampaignStore.getState().resetProgress();
      });
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.completedTasks).toEqual([]);
    });

    it('preserves hiddenTaskTypes when resetting', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      act(() => {
        useCampaignStore.getState().resetProgress();
      });
      expect(useCampaignStore.getState().hiddenTaskTypes.has('waypoint')).toBe(true);
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.hiddenTaskTypes).toContain('waypoint');
    });
  });

  describe('toggleHiddenTaskType', () => {
    it('adds a task type to hiddenTaskTypes', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      expect(useCampaignStore.getState().hiddenTaskTypes.has('waypoint')).toBe(true);
    });

    it('removes a task type when toggled again', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
      });
      expect(useCampaignStore.getState().hiddenTaskTypes.has('waypoint')).toBe(false);
    });

    it('supports multiple hidden types simultaneously', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('waypoint');
        useCampaignStore.getState().toggleHiddenTaskType('league_mechanic');
      });
      const { hiddenTaskTypes } = useCampaignStore.getState();
      expect(hiddenTaskTypes.has('waypoint')).toBe(true);
      expect(hiddenTaskTypes.has('league_mechanic')).toBe(true);
    });

    it('persists to localStorage', () => {
      act(() => {
        useCampaignStore.getState().toggleHiddenTaskType('additional_reward');
      });
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.hiddenTaskTypes).toContain('additional_reward');
    });
  });

  describe('hideCompletedZones', () => {
    it('defaults to false', () => {
      expect(useCampaignStore.getState().hideCompletedZones).toBe(false);
    });

    it('toggles to true', () => {
      act(() => {
        useCampaignStore.getState().toggleHideCompletedZones();
      });
      expect(useCampaignStore.getState().hideCompletedZones).toBe(true);
    });

    it('toggles back to false', () => {
      act(() => {
        useCampaignStore.getState().toggleHideCompletedZones();
      });
      act(() => {
        useCampaignStore.getState().toggleHideCompletedZones();
      });
      expect(useCampaignStore.getState().hideCompletedZones).toBe(false);
    });

    it('persists to localStorage', () => {
      act(() => {
        useCampaignStore.getState().toggleHideCompletedZones();
      });
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.hideCompletedZones).toBe(true);
    });

    it('is preserved across resetProgress', () => {
      act(() => {
        useCampaignStore.getState().toggleHideCompletedZones();
      });
      act(() => {
        useCampaignStore.getState().resetProgress();
      });
      expect(useCampaignStore.getState().hideCompletedZones).toBe(true);
      const saved = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)[1]);
      expect(saved.hideCompletedZones).toBe(true);
    });
  });
});
