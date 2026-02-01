import { useState } from 'react';
import campaignData from '../data/campaign.json';
import ActTabs from './ActTabs';
import ActPanel from './ActPanel';
import useCampaignStore from '../stores/useCampaignStore';

export default function App() {
  const [activeActId, setActiveActId] = useState(campaignData.acts[0]?.id);
  const resetProgress = useCampaignStore((s) => s.resetProgress);
  const [showReset, setShowReset] = useState(false);

  const activeAct = campaignData.acts.find((a) => a.id === activeActId);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-100">
              PoE2 Campaign Tracker
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track your Path of Exile 2 campaign progress
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowReset((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded border border-gray-700 hover:border-gray-600 transition-colors"
            >
              Reset
            </button>
            {showReset && (
              <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-3 z-20 w-48">
                <p className="text-xs text-gray-400 mb-2">
                  Clear all progress and reset area order?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      resetProgress();
                      setShowReset(false);
                    }}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowReset(false)}
                    className="text-xs text-gray-400 hover:text-gray-200 px-2.5 py-1 rounded border border-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        <ActTabs
          acts={campaignData.acts}
          activeActId={activeActId}
          onSelectAct={setActiveActId}
        />

        {activeAct && <ActPanel act={activeAct} />}
      </div>
    </div>
  );
}
