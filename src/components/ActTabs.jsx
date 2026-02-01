import useCampaignStore from '../stores/useCampaignStore';

export default function ActTabs({ acts, activeActId, onSelectAct }) {
  const completedTasks = useCampaignStore((s) => s.completedTasks);

  return (
    <div className="flex gap-1 border-b border-gray-700 mb-6">
      {acts.map((act) => {
        const total = act.areas.reduce((s, a) => s + a.tasks.length, 0);
        const done = act.areas.reduce(
          (s, a) => s + a.tasks.filter((t) => completedTasks.has(t.id)).length,
          0
        );
        const isActive = act.id === activeActId;
        const allDone = total > 0 && done === total;

        return (
          <button
            key={act.id}
            onClick={() => onSelectAct(act.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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
        );
      })}
    </div>
  );
}
