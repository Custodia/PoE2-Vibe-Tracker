import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import AreaCard from './AreaCard';
import useCampaignStore from '../stores/useCampaignStore';
import { isValidOrder } from '../utils/reorderValidation';

export default function ActPanel({ act }) {
  const areaOrder = useCampaignStore((s) => s.areaOrder[act.id] || []);
  const reorderAreas = useCampaignStore((s) => s.reorderAreas);

  const areasById = useMemo(() => {
    const map = {};
    for (const area of act.areas) {
      map[area.id] = area;
    }
    return map;
  }, [act.areas]);

  const orderedAreas = useMemo(() => {
    return areaOrder.map((id) => areasById[id]).filter(Boolean);
  }, [areaOrder, areasById]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = areaOrder.indexOf(active.id);
    const newIndex = areaOrder.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const proposed = arrayMove(areaOrder, oldIndex, newIndex);
    if (isValidOrder(proposed, areasById)) {
      reorderAreas(act.id, proposed);
    }
  }

  const [showCompleted, setShowCompleted] = useState(false);

  const completedTasks = useCampaignStore((s) => s.completedTasks);
  const totalTasks = act.areas.reduce((sum, a) => sum + a.tasks.length, 0);
  const doneTasks = act.areas.reduce(
    (sum, a) => sum + a.tasks.filter((t) => completedTasks.has(t.id)).length,
    0
  );
  const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const isAreaComplete = (area) => {
    return area.tasks.length > 0 && area.tasks.every((t) => completedTasks.has(t.id));
  };

  const incompleteAreas = orderedAreas.filter((a) => !isAreaComplete(a));
  const completedAreas = orderedAreas.filter((a) => isAreaComplete(a));
  const visibleAreas = showCompleted ? orderedAreas : incompleteAreas;
  const visibleAreaIds = showCompleted ? areaOrder : incompleteAreas.map((a) => a.id);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
          {doneTasks}/{totalTasks} ({pct}%)
        </span>
      </div>

      {completedAreas.length > 0 && (
        <button
          onClick={() => setShowCompleted((v) => !v)}
          className="mb-3 w-full text-xs text-gray-500 hover:text-gray-300 py-2 rounded border border-gray-800 hover:border-gray-700 transition-colors"
        >
          {showCompleted ? 'Hide' : 'Show'} completed ({completedAreas.length})
        </button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleAreaIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {visibleAreas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
