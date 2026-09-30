import React, { useState } from 'react';
import { useUser } from '@clerk/react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { LandingPage } from './components/landing/LandingPage';
import { AgentOnboarding } from './components/onboarding/AgentOnboarding';
import { StudioHeader } from './components/studio/StudioHeader';
import { StudioLeftPanel } from './components/studio/StudioLeftPanel';
import { LiveCanvas } from './components/studio/LiveCanvas';

function StudioWorkspace({ onReturnToOnboarding }) {
  const { studioTheme } = usePortfolio();
  const isLight = studioTheme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
        isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090d16] text-white'
      }`}
    >
      {/* SaaS Studio Header */}
      <StudioHeader onNewProject={onReturnToOnboarding} />

      {/* Main Studio Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Inspector / AI Copilot / Sections / Theme / History */}
        <StudioLeftPanel />

        {/* Right Live Preview Canvas */}
        <LiveCanvas />
      </div>
    </div>
  );
}

function MainFlow() {
  const { isSignedIn, isLoaded } = useUser();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  // If Clerk is still initializing, show a sleek dark loader
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF4500] border-t-transparent animate-spin" />
          <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">
            Loading Superdesign...
          </span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated Wall: Show Superdesign Landing Page
  if (!isSignedIn && !guestMode) {
    return (
      <LandingPage
        onStartStudio={() => setGuestMode(true)}
      />
    );
  }

  // 2. Authenticated Initial State: Show imfa.app-style Agent Onboarding
  if (!hasCompletedOnboarding) {
    return (
      <AgentOnboarding
        onComplete={() => setHasCompletedOnboarding(true)}
      />
    );
  }

  // 3. Post-Onboarding: Full Interactive Elementor Studio
  return (
    <StudioWorkspace
      onReturnToOnboarding={() => setHasCompletedOnboarding(false)}
    />
  );
}

function App() {
  return (
    <PortfolioProvider>
      <MainFlow />
    </PortfolioProvider>
  );
}

export default App;
