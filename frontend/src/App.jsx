import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { StudioHeader } from './components/studio/StudioHeader';
import { StudioLeftPanel } from './components/studio/StudioLeftPanel';
import { LiveCanvas } from './components/studio/LiveCanvas';

function StudioWorkspace() {
  const { studioTheme } = usePortfolio();
  const isLight = studioTheme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090d16] text-white'
      }`}
    >
      {/* SaaS Studio Header */}
      <StudioHeader />

      {/* Main Studio Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Inspector / AI Copilot / Sections / Theme */}
        <StudioLeftPanel />

        {/* Right Live Preview Canvas */}
        <LiveCanvas />
      </div>
    </div>
  );
}

function App() {
  return (
    <PortfolioProvider>
      <StudioWorkspace />
    </PortfolioProvider>
  );
}

export default App;
