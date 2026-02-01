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
