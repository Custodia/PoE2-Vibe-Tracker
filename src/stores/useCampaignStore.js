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
      hiddenTaskTypes: new Set(parsed.hiddenTaskTypes || []),
      hideCompletedZones: parsed.hideCompletedZones || false,
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
        hiddenTaskTypes: [...(state.hiddenTaskTypes || [])],
        hideCompletedZones: state.hideCompletedZones || false,
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

function reconcileAreaOrder(savedOrder, defaultOrder) {
  const reconciled = {};
  for (const actId of Object.keys(defaultOrder)) {
    const defaultIds = defaultOrder[actId];
    const savedIds = savedOrder[actId];
    if (!savedIds) {
      reconciled[actId] = defaultIds;
      continue;
    }
    const defaultSet = new Set(defaultIds);
    const savedSet = new Set(savedIds);
    const hasAdded = defaultIds.some((id) => !savedSet.has(id));
    const hasRemoved = savedIds.some((id) => !defaultSet.has(id));
    if (hasAdded || hasRemoved) {
      reconciled[actId] = defaultIds;
      continue;
    }
    reconciled[actId] = savedIds;
  }
  return reconciled;
}

const saved = loadFromStorage();
const defaultOrder = buildDefaultAreaOrder();

const useCampaignStore = create((set, _get) => ({
  completedTasks: saved?.completedTasks || new Set(),
  areaOrder: saved?.areaOrder
    ? reconcileAreaOrder(saved.areaOrder, defaultOrder)
    : defaultOrder,
  hiddenTaskTypes: saved?.hiddenTaskTypes || new Set(),
  hideCompletedZones: saved?.hideCompletedZones || false,

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

  toggleHideCompletedZones() {
    set((state) => {
      const newState = { hideCompletedZones: !state.hideCompletedZones };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  toggleHiddenTaskType(taskType) {
    set((state) => {
      const next = new Set(state.hiddenTaskTypes);
      if (next.has(taskType)) {
        next.delete(taskType);
      } else {
        next.add(taskType);
      }
      const newState = { hiddenTaskTypes: next };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  resetProgress() {
    const freshOrder = buildDefaultAreaOrder();
    set((state) => {
      const newState = { completedTasks: new Set(), areaOrder: freshOrder };
      saveToStorage({ ...newState, hiddenTaskTypes: state.hiddenTaskTypes, hideCompletedZones: state.hideCompletedZones });
      return newState;
    });
  },
}));

export default useCampaignStore;
