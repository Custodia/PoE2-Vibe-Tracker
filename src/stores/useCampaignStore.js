import { create } from 'zustand';
import campaignData from '../data/campaign.json';

const STORAGE_KEY = 'poe2-campaign-progress';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      completedTasks: new Set(parsed.completedTasks || []),
      areaOrder: parsed.areaOrder || {},
    };
  } catch {
    return null;
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completedTasks: [...state.completedTasks],
        areaOrder: state.areaOrder,
      })
    );
  } catch {
    // localStorage unavailable or full
  }
}

function buildDefaultAreaOrder() {
  const order = {};
  for (const act of campaignData.acts) {
    order[act.id] = act.areas.map((a) => a.id);
  }
  return order;
}

const saved = loadFromStorage();
const defaultOrder = buildDefaultAreaOrder();

const useCampaignStore = create((set, _get) => ({
  completedTasks: saved?.completedTasks || new Set(),
  areaOrder: { ...defaultOrder, ...saved?.areaOrder },

  toggleTask(taskId) {
    set((state) => {
      const next = new Set(state.completedTasks);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      const newState = { completedTasks: next };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  completeAllTasks(taskIds) {
    set((state) => {
      const next = new Set(state.completedTasks);
      for (const id of taskIds) {
        next.add(id);
      }
      const newState = { completedTasks: next };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  reorderAreas(actId, newOrder) {
    set((state) => {
      const newAreaOrder = { ...state.areaOrder, [actId]: newOrder };
      const newState = { areaOrder: newAreaOrder };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  resetProgress() {
    const freshOrder = buildDefaultAreaOrder();
    set(() => {
      const newState = { completedTasks: new Set(), areaOrder: freshOrder };
      saveToStorage(newState);
      return newState;
    });
  },
}));

export default useCampaignStore;
