import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem';
import useCampaignStore from '../stores/useCampaignStore';

export default function AreaCard({ area }) {
  const completedTasks = useCampaignStore((s) => s.completedTasks);
  const completeAllTasks = useCampaignStore((s) => s.completeAllTasks);
  const permTasks = area.tasks.filter((t) => t.type === 'permanent_reward');
  const permDone = permTasks.filter((t) => completedTasks.has(t.id)).length;
  const doneCount = area.tasks.filter((t) => completedTasks.has(t.id)).length;
  const totalCount = area.tasks.length;
  const permanentDone = permTasks.length > 0 ? permDone === permTasks.length : totalCount > 0 && doneCount === totalCount;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const [manualCollapse, setManualCollapse] = useState(null);
  const collapsed = manualCollapse !== null ? manualCollapse : allDone;

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
          : permanentDone
            ? 'border-gray-700/50 bg-gray-800/40'
            : area.optional
              ? 'border-dashed border-yellow-700/60 bg-gray-800'
              : 'border-gray-700 bg-gray-800'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 cursor-pointer ${collapsed ? '' : 'border-b border-gray-700/50'}`}
        onClick={() => setManualCollapse((v) => v !== null ? !v : !allDone)}
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
        <h3 className={`flex-1 font-semibold text-sm ${permanentDone ? 'text-gray-500' : 'text-gray-100'}`}>
          {area.name}
          {area.optional && (
            <span className="ml-2 text-[10px] font-normal text-yellow-600 bg-yellow-900/30 px-1.5 py-0.5 rounded">
              Optional
            </span>
          )}
        </h3>
        {!permanentDone && (
          <button
            onClick={() => completeAllTasks(area.tasks.map((t) => t.id))}
            className="text-[10px] text-gray-500 hover:text-gray-200 px-1.5 py-0.5 rounded border border-gray-700 hover:border-gray-500 transition-colors"
          >
            Check all
          </button>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          permanentDone
            ? 'bg-emerald-900/50 text-emerald-400'
            : 'bg-gray-700 text-gray-400'
        }`}>
          {doneCount}/{totalCount}
        </span>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          {collapsed
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          }
        </svg>
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
