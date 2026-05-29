import React from 'react';
import useCampaignStore from '../stores/useCampaignStore';

export default function ActTabs({ acts, activeActId, onSelectAct }) {
  const completedTasks = useCampaignStore((s) => s.completedTasks);
  const hiddenTaskTypes = useCampaignStore((s) => s.hiddenTaskTypes);

  return (
    <div className="flex gap-1 border-b border-gray-700 mb-6 overflow-x-auto scrollbar-hide">
      {acts.map((act, i) => {
        const visibleTasks = act.areas.flatMap((a) => a.tasks).filter((t) => !hiddenTaskTypes.has(t.type));
        const total = visibleTasks.length;
        const done = visibleTasks.filter((t) => completedTasks.has(t.id)).length;
        const isActive = act.id === activeActId;
        const allDone = total > 0 && done === total;
        const prevGroup = i > 0 ? acts[i - 1].group : null;
        const showDivider = prevGroup && act.group !== prevGroup;

        return (
          <React.Fragment key={act.id}>
            {showDivider && (
              <div className="w-px shrink-0 bg-gray-600 self-stretch my-1.5" />
            )}
            <button
              onClick={() => onSelectAct(act.id)}
              className={`flex-1 min-w-0 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
              }`}
            >
              {act.name}
              {allDone && (
                <span className="ml-1.5 text-emerald-500">&#10003;</span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
