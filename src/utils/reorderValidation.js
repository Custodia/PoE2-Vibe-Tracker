/**
 * Validate that a proposed area order respects prerequisites.
 * Every area's prerequisites must appear earlier in the list.
 */
export function isValidOrder(proposedOrder, areasById) {
  const seen = new Set();
  for (const areaId of proposedOrder) {
    const area = areasById[areaId];
    if (!area) continue;
    for (const prereq of area.prerequisites) {
      if (!seen.has(prereq)) {
        return false;
      }
    }
    seen.add(areaId);
  }
  return true;
}

export function getTransitivePrerequisites(areaId, areasById) {
  const result = new Set();
  const queue = [...(areasById[areaId]?.prerequisites || [])];
  while (queue.length > 0) {
    const current = queue.shift();
    if (result.has(current)) continue;
    result.add(current);
    const area = areasById[current];
    if (area) {
      for (const prereq of area.prerequisites) {
        if (!result.has(prereq)) queue.push(prereq);
      }
    }
  }
  return result;
}

export function getTransitiveDependents(areaId, areasById) {
  const result = new Set();
  const queue = [areaId];
  const visited = new Set();
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    for (const [id, area] of Object.entries(areasById)) {
      if (area.prerequisites.includes(current) && !result.has(id)) {
        result.add(id);
        queue.push(id);
      }
    }
  }
  return result;
}
