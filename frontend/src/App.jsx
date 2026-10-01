import React, { useState } from 'react';
import { useUser } from '@clerk/react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { LandingPage } from './components/landing/LandingPage';
import { AgentOnboarding } from './components/onboarding/AgentOnboarding';
import { V0ChatPanel } from './components/studio/V0ChatPanel';
import { V0Canvas } from './components/studio/V0Canvas';

function StudioWorkspace({ onReturnToOnboarding }) {
  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden bg-white text-zinc-900 select-none">
      {/* 1. Left Side: v0 Chat Panel ([ ◫ ] ☆ Project Name ▾ + Message Stream + Input Dock) */}
      <V0ChatPanel onNewProject={onReturnToOnboarding} />

      {/* 2. Right Side: v0 Preview Canvas ([ 🌐 Preview ] + Address Bar + Canvas Placeholder / Live Site) */}
      <V0Canvas />
    </div>
  );
}

function MainFlow() {
  const { isSignedIn, isLoaded } = useUser();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [guestMode, setGuestMode] = useState(false);

  // If Clerk is still initializing, show a clean loader
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-zinc-800 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-zinc-400">
            Loading v0 Studio...
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

  // 2. Authenticated Initial State: Show Agent Onboarding
  if (!hasCompletedOnboarding) {
    return (
      <AgentOnboarding
        onComplete={() => setHasCompletedOnboarding(true)}
      />
    );
  }

  // 3. Post-Onboarding: Full Interactive v0 Studio
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
