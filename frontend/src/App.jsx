import React, { useEffect } from 'react';
import { useUser } from '@clerk/react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { LandingPage } from './components/landing/LandingPage';
import { AgentOnboarding } from './components/onboarding/AgentOnboarding';
import { V0ChatPanel } from './components/studio/V0ChatPanel';
import { V0Canvas } from './components/studio/V0Canvas';

import { ChatHistoryDrawer } from './components/studio/ChatHistoryDrawer';

function StudioWorkspace() {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden bg-white text-zinc-900 select-none">
      {/* Session & Chat History Drawer */}
      <ChatHistoryDrawer />

      {/* 1. Left Side: v0 Chat Panel ([ ◫ ] ☆ Project Name ▾ + Message Stream + Input Dock) */}
      <V0ChatPanel onNewProject={() => navigate('/')} />

      {/* 2. Right Side: v0 Preview Canvas ([ 🌐 Preview ] + Address Bar + Canvas Placeholder / Live Site) */}
      <V0Canvas />
    </div>
  );
}

function StudioRoute() {
  const { id } = useParams();
  const { loadPortfolioSession, portfolioId, fetchUserSessions } = usePortfolio();

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  useEffect(() => {
    if (id && id !== portfolioId) {
      loadPortfolioSession(id);
    }
  }, [id, portfolioId, loadPortfolioSession]);

  return <StudioWorkspace />;
}

function PreviewRoute() {
  const { slug } = useParams();
  const { setPortfolioId, fetchVersions } = usePortfolio();

  useEffect(() => {
    if (slug) {
      setPortfolioId(slug);
      fetchVersions(slug);
    }
  }, [slug, setPortfolioId, fetchVersions]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-zinc-900 select-none">
      <V0Canvas />
    </div>
  );
}

function MainFlow() {
  const { isLoaded } = useUser();
  const navigate = useNavigate();

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

  return (
    <Routes>
      <Route path="/" element={<LandingPage onStartStudio={() => navigate('/studio')} />} />
      <Route path="/onboarding" element={<AgentOnboarding onComplete={() => navigate('/studio')} />} />
      <Route path="/studio" element={<StudioRoute />} />
      <Route path="/studio/:id" element={<StudioRoute />} />
      <Route path="/preview/:slug" element={<PreviewRoute />} />
    </Routes>
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
