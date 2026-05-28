import { useMemo } from 'react';
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

  const completedTasks = useCampaignStore((s) => s.completedTasks);

  const allTasks = act.areas.flatMap((a) => a.tasks);
  const permTasks = allTasks.filter((t) => t.type === 'permanent_reward');
  const permDone = permTasks.filter((t) => completedTasks.has(t.id)).length;
  const permPct = permTasks.length === 0 ? 0 : Math.round((permDone / permTasks.length) * 100);

  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => completedTasks.has(t.id)).length;
  const pct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div>
      <div className="mb-4 space-y-1.5">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">Permanent</span>
            <span className="text-xs text-gray-400 tabular-nums">{permDone}/{permTasks.length}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-300"
              style={{ width: `${permPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-gray-400">All</span>
            <span className="text-xs text-gray-400 tabular-nums">{doneTasks}/{totalTasks}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={areaOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {orderedAreas.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
