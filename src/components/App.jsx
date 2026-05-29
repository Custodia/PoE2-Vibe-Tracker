import { useState } from 'react';
import campaignData from '../data/campaign.json';
import ActTabs from './ActTabs';
import ActPanel from './ActPanel';
import SettingsModal from './SettingsModal';
import useCampaignStore from '../stores/useCampaignStore';

export default function App() {
  const [activeActId, setActiveActId] = useState(campaignData.acts[0]?.id);
  const resetProgress = useCampaignStore((s) => s.resetProgress);
  const [showReset, setShowReset] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-500 hover:text-gray-300 p-1 rounded border border-gray-700 hover:border-gray-600 transition-colors"
              aria-label="Settings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
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
          </div>
        </header>

        <ActTabs
          acts={campaignData.acts}
          activeActId={activeActId}
          onSelectAct={setActiveActId}
        />

        {activeAct && <ActPanel act={activeAct} />}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
