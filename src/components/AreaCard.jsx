import { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem';
import useCampaignStore from '../stores/useCampaignStore';

export default function AreaCard({ area }) {
  const completedTasks = useCampaignStore((s) => s.completedTasks);
  const completeAllTasks = useCampaignStore((s) => s.completeAllTasks);
  const doneCount = area.tasks.filter((t) => completedTasks.has(t.id)).length;
  const totalCount = area.tasks.length;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const [collapsed, setCollapsed] = useState(allDone);

  useEffect(() => {
    setCollapsed(allDone);
  }, [allDone]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border transition-colors ${
        isDragging
          ? 'border-indigo-500 bg-gray-800/80 shadow-lg shadow-indigo-500/10 z-10'
          : allDone
            ? 'border-gray-700/50 bg-gray-800/40'
            : 'border-gray-700 bg-gray-800'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 ${collapsed ? '' : 'border-b border-gray-700/50'} ${allDone ? 'cursor-pointer' : ''}`}
        onClick={allDone ? () => setCollapsed((v) => !v) : undefined}
      >
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 touch-none"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
        <h3 className={`flex-1 font-semibold text-sm ${allDone ? 'text-gray-500' : 'text-gray-100'}`}>
          {area.name}
        </h3>
        {!allDone && (
          <button
            onClick={() => completeAllTasks(area.tasks.map((t) => t.id))}
            className="text-[10px] text-gray-500 hover:text-gray-200 px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Check all
          </button>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          allDone
            ? 'bg-emerald-900/50 text-emerald-400'
            : 'bg-gray-700 text-gray-400'
        }`}>
          {doneCount}/{totalCount}
        </span>
        {allDone && (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {collapsed
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            }
          </svg>
        )}
      </div>
      {!collapsed && (
        <div className="px-2 py-2 space-y-0.5">
          {area.tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
