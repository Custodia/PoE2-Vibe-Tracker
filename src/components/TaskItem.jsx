import useCampaignStore from '../stores/useCampaignStore';

const typeBadgeColors = {
  quest: 'bg-amber-700 text-amber-100',
  waypoint: 'bg-sky-700 text-sky-100',
  skill_point: 'bg-emerald-700 text-emerald-100',
  trial: 'bg-purple-700 text-purple-100',
  permanent_reward: 'bg-rose-700 text-rose-100',
  additional_reward: 'bg-teal-700 text-teal-100',
  league_mechanic: 'bg-orange-700 text-orange-100',
};

const typeLabels = {
  quest: 'Quest',
  waypoint: 'Waypoint',
  skill_point: 'Skill Point',
  trial: 'Trial',
  permanent_reward: 'Permanent',
  additional_reward: 'Bonus',
  league_mechanic: 'League',
};

export default function TaskItem({ task }) {
  const completed = useCampaignStore((s) => s.completedTasks.has(task.id));
  const toggleTask = useCampaignStore((s) => s.toggleTask);

  const badgeColor = typeBadgeColors[task.type] || 'bg-gray-700 text-gray-100';
  const label = typeLabels[task.type] || task.type;

  return (
    <label className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-gray-700/50 cursor-pointer select-none group">
      <input
        type="checkbox"
        checked={completed}
        onChange={() => toggleTask(task.id)}
        className="w-4 h-4 rounded border-gray-500 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900 shrink-0"
      />
      <span className={`flex-1 text-sm ${completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
        {task.reward || task.name}
        {task.reward && (
          <span className={`block text-xs mt-0.5 ${completed ? 'text-gray-600' : 'text-gray-400'}`}>{task.name}</span>
        )}
      </span>
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeColor}`}>
        {label}
      </span>
    </label>
  );
}
