import { describe, it, expect } from 'vitest';
import { isValidOrder } from './reorderValidation';

// Helper to build an areasById map from simple definitions
function buildAreasById(defs) {
  const map = {};
  for (const [id, prerequisites] of Object.entries(defs)) {
    map[id] = { id, prerequisites };
  }
  return map;
}

describe('isValidOrder', () => {
  it('returns true for an empty order', () => {
    expect(isValidOrder([], {})).toBe(true);
  });

  it('returns true for a single area with no prerequisites', () => {
    const areasById = buildAreasById({ a: [] });
    expect(isValidOrder(['a'], areasById)).toBe(true);
  });

  it('returns true when prerequisites appear before dependents', () => {
    const areasById = buildAreasById({
      a: [],
      b: ['a'],
      c: ['b'],
    });
    expect(isValidOrder(['a', 'b', 'c'], areasById)).toBe(true);
  });

  it('returns false when a prerequisite appears after its dependent', () => {
    const areasById = buildAreasById({
      a: [],
      b: ['a'],
    });
    expect(isValidOrder(['b', 'a'], areasById)).toBe(false);
  });

  it('returns false when a prerequisite is missing entirely', () => {
    const areasById = buildAreasById({
      b: ['a'],
    });
    // 'a' is not in areasById, but 'b' requires it — 'a' was never seen
    expect(isValidOrder(['b'], areasById)).toBe(false);
  });

  it('handles multiple prerequisites correctly', () => {
    const areasById = buildAreasById({
      a: [],
      b: [],
      c: ['a', 'b'],
    });
    expect(isValidOrder(['a', 'b', 'c'], areasById)).toBe(true);
    expect(isValidOrder(['b', 'a', 'c'], areasById)).toBe(true);
    expect(isValidOrder(['a', 'c', 'b'], areasById)).toBe(false);
  });

  it('handles diamond dependency graphs', () => {
    // a -> b -> d
    // a -> c -> d
    const areasById = buildAreasById({
      a: [],
      b: ['a'],
      c: ['a'],
      d: ['b', 'c'],
    });
    expect(isValidOrder(['a', 'b', 'c', 'd'], areasById)).toBe(true);
    expect(isValidOrder(['a', 'c', 'b', 'd'], areasById)).toBe(true);
    expect(isValidOrder(['a', 'b', 'd', 'c'], areasById)).toBe(false);
  });

  it('skips unknown area IDs gracefully', () => {
    const areasById = buildAreasById({
      a: [],
      b: ['a'],
    });
    // 'x' is in proposedOrder but not in areasById — should be skipped
    expect(isValidOrder(['a', 'x', 'b'], areasById)).toBe(true);
  });

  it('validates real campaign-like data', () => {
    const areasById = buildAreasById({
      'clearfell-encampment': [],
      'the-grelwood': ['clearfell-encampment'],
      'hunting-grounds': ['the-grelwood'],
      'freythorn': ['the-grelwood'],
      'ogham-farmlands': ['hunting-grounds'],
    });

    // Valid order
    expect(
      isValidOrder(
        ['clearfell-encampment', 'the-grelwood', 'hunting-grounds', 'freythorn', 'ogham-farmlands'],
        areasById
      )
    ).toBe(true);

    // Invalid: ogham-farmlands before hunting-grounds
    expect(
      isValidOrder(
        ['clearfell-encampment', 'the-grelwood', 'ogham-farmlands', 'hunting-grounds', 'freythorn'],
        areasById
      )
    ).toBe(false);
  });
});
