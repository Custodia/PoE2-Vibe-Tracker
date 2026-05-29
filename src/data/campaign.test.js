import { describe, it, expect } from 'vitest';
import campaignData from './campaign.json';

describe('campaign.json data integrity', () => {
  it('has an acts array', () => {
    expect(campaignData).toHaveProperty('acts');
    expect(Array.isArray(campaignData.acts)).toBe(true);
    expect(campaignData.acts.length).toBeGreaterThan(0);
  });

  it('every act has required fields', () => {
    for (const act of campaignData.acts) {
      expect(act).toHaveProperty('id');
      expect(act).toHaveProperty('name');
      expect(act).toHaveProperty('areas');
      expect(typeof act.id).toBe('string');
      expect(typeof act.name).toBe('string');
      expect(Array.isArray(act.areas)).toBe(true);
    }
  });

  it('every area has required fields', () => {
    for (const act of campaignData.acts) {
      for (const area of act.areas) {
        expect(area).toHaveProperty('id');
        expect(area).toHaveProperty('name');
        expect(area).toHaveProperty('prerequisites');
        expect(area).toHaveProperty('tasks');
        expect(typeof area.id).toBe('string');
        expect(typeof area.name).toBe('string');
        expect(Array.isArray(area.prerequisites)).toBe(true);
        expect(Array.isArray(area.tasks)).toBe(true);
      }
    }
  });

  it('every task has required fields with valid type', () => {
    const validTypes = ['quest', 'waypoint', 'skill_point', 'trial', 'permanent_reward', 'additional_reward', 'league_mechanic'];
    for (const act of campaignData.acts) {
      for (const area of act.areas) {
        for (const task of area.tasks) {
          expect(task).toHaveProperty('id');
          expect(task).toHaveProperty('name');
          expect(task).toHaveProperty('type');
          expect(typeof task.id).toBe('string');
          expect(typeof task.name).toBe('string');
          expect(validTypes).toContain(task.type);
        }
      }
    }
  });

  it('all act IDs are unique', () => {
    const ids = campaignData.acts.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all area IDs are unique across the entire campaign', () => {
    const ids = campaignData.acts.flatMap((a) => a.areas.map((area) => area.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all task IDs are unique across the entire campaign', () => {
    const ids = campaignData.acts.flatMap((a) =>
      a.areas.flatMap((area) => area.tasks.map((t) => t.id))
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all prerequisites reference valid area IDs within the same act', () => {
    for (const act of campaignData.acts) {
      const areaIds = new Set(act.areas.map((a) => a.id));
      for (const area of act.areas) {
        for (const prereq of area.prerequisites) {
          expect(areaIds.has(prereq)).toBe(true);
        }
      }
    }
  });

  it('default area order respects prerequisites', () => {
    for (const act of campaignData.acts) {
      const seen = new Set();
      for (const area of act.areas) {
        for (const prereq of area.prerequisites) {
          expect(seen.has(prereq)).toBe(true);
        }
        seen.add(area.id);
      }
    }
  });

  it('every area has at least one task', () => {
    for (const act of campaignData.acts) {
      for (const area of act.areas) {
        expect(area.tasks.length).toBeGreaterThan(0);
      }
    }
  });
});
