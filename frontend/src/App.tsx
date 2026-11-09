import React, { useState, useEffect } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { Header } from './components/layout/Header';
import { Dashboard } from './features/dashboard/Dashboard';
import { Workspace } from './features/workspace/Workspace';
import { DocsView } from './features/docs/DocsView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'workspace' | 'docs'>('dashboard');
  const { checkBackendHealth } = useSimulationStore();

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  return (
    <div className="min-h-screen bg-[#090D16] text-[#F1F5F9] flex flex-col font-sans">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 flex flex-col">
        {currentTab === 'dashboard' && (
          <Dashboard onOpenWorkspace={() => setCurrentTab('workspace')} />
        )}
        {currentTab === 'workspace' && <Workspace />}
        {currentTab === 'docs' && <DocsView />}
      </main>
    </div>
  );
};

export default App;
