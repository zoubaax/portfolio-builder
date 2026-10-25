import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import { LandingPage } from './components/landing/LandingPage';
import { AgentOnboarding } from './components/onboarding/AgentOnboarding';
import { V0ChatPanel } from './components/studio/V0ChatPanel';
import { V0Canvas } from './components/studio/V0Canvas';

import { ChatHistoryDrawer } from './components/studio/ChatHistoryDrawer';
import { getSubdomain } from './utils/subdomain';
import { PortfolioRenderer } from './components/portfolio/PortfolioRenderer';
import { PortfolioChatWidget } from './components/portfolio/PortfolioChatWidget';

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
  const { loadPortfolioSession, fetchUserSessions } = usePortfolio();
  const loadedIdRef = useRef(null);

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  useEffect(() => {
    if (id && id !== loadedIdRef.current) {
      loadedIdRef.current = id;
      loadPortfolioSession(id);
    } else if (!id) {
      loadedIdRef.current = null;
    }
  }, [id, loadPortfolioSession]);

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

function SubdomainPortfolioWrapper({ slug }) {
  const { portfolio, loadPublicPortfolio, setIsEditMode } = usePortfolio();
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  useEffect(() => {
    setIsEditMode(false);
  }, [setIsEditMode]);

  useEffect(() => {
    let isMounted = true;
    if (slug) {
      setLoading(true);
      if (typeof loadPublicPortfolio === 'function') {
        loadPublicPortfolio(slug).then((res) => {
          if (!isMounted) return;
          setLoading(false);
          if (!res) setNotFound(true);
        });
      } else {
        setLoading(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [slug, loadPublicPortfolio]);

  useEffect(() => {
    if (portfolio) {
      const hero = portfolio.sections?.find((s) => s.type === 'hero')?.data;
      const name = hero?.name || slug;
      const title = hero?.title || 'Portfolio';
      document.title = `${name} — ${title}`;
    }
  }, [portfolio, slug]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0a0e17] text-white">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-400">Chargement du portfolio @{slug}...</span>
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#090d16] text-white p-6 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-3xl mb-4">
          🔍
        </div>
        <h2 className="text-lg font-bold mb-1">Portfolio Introuvable</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          Aucun portfolio publié ne correspond au sous-domaine <strong className="text-orange-400">@{slug}</strong>.
        </p>
        <a
          href="https://portfolify.tech"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-600 to-[#FF4500] hover:from-orange-500 hover:to-[#ff5722] text-white transition-all shadow-lg shadow-orange-500/20"
        >
          Créer mon portfolio sur Portfolify
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-[#0a0e17]">
      <PortfolioRenderer portfolio={portfolio} isPreview={false} />
    </div>
  );
}

function MainFlow() {
  const { isLoaded } = useUser();
  const navigate = useNavigate();
  const subdomain = getSubdomain();

  // If visitor is accessing via a user subdomain (e.g. alex.yourdomain.com or alex.localhost:5174)
  if (subdomain) {
    return <SubdomainPortfolioWrapper slug={subdomain} />;
  }

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-lg font-bold mb-2">Une erreur d'affichage est survenue</h2>
          <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'Erreur inattendue dans le Studio.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/studio';
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            Recharger le Studio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <PortfolioProvider>
        <MainFlow />
      </PortfolioProvider>
    </ErrorBoundary>
  );
}

export default App;
