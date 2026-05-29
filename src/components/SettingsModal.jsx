import { useEffect } from 'react';
import useCampaignStore from '../stores/useCampaignStore';

const TOGGLES = [
  { type: 'waypoint', label: 'Hide Waypoints' },
  { type: 'league_mechanic', label: 'Hide League Mechanics' },
  { type: 'additional_reward', label: 'Hide Bonus Rewards' },
];

export default function SettingsModal({ onClose }) {
  const hiddenTaskTypes = useCampaignStore((s) => s.hiddenTaskTypes);
  const toggleHiddenTaskType = useCampaignStore((s) => s.toggleHiddenTaskType);
  const hideCompletedZones = useCampaignStore((s) => s.hideCompletedZones);
  const toggleHideCompletedZones = useCampaignStore((s) => s.toggleHideCompletedZones);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-5 w-80 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-100">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">General</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Hide completed zones</span>
              <button
                onClick={toggleHideCompletedZones}
                className={`relative w-9 h-5 rounded-full transition-colors ${hideCompletedZones ? 'bg-indigo-500' : 'bg-gray-600'}`}
                role="switch"
                aria-checked={hideCompletedZones}
                aria-label="Hide completed zones"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hideCompletedZones ? 'translate-x-4' : ''}`}
                />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-700" />
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Visibility</h3>
            <div className="space-y-3">
              {TOGGLES.map(({ type, label }) => {
                const active = hiddenTaskTypes.has(type);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{label}</span>
                    <button
                      onClick={() => toggleHiddenTaskType(type)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${active ? 'bg-indigo-500' : 'bg-gray-600'}`}
                      role="switch"
                      aria-checked={active}
                      aria-label={label}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-4' : ''}`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
