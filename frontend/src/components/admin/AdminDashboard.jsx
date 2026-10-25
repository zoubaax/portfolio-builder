import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Cpu, 
  Globe, 
  Activity, 
  RefreshCw, 
  LogOut, 
  Lock, 
  ShieldCheck, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Database,
  Layers,
  ArrowUpRight,
  SlidersHorizontal,
  Flame,
  Zap,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5050' : '');

const STORAGE_KEY = 'portfolify_admin_key';

export function AdminDashboard() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [keyInput, setKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Dashboard data states
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Navigation & filters
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'tokens' | 'logs'
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'published' | 'with_portfolios'
  const [logFilter, setLogFilter] = useState('all'); // 'all' | 'stream-chat' | 'generate' | 'image' | 'summarize'

  // Verify and fetch dashboard payload
  const fetchDashboardData = useCallback(async (keyToUse) => {
    const key = keyToUse || adminKey;
    if (!key) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/dashboard`, {
        headers: {
          'x-admin-key': key.trim(),
        },
      });

      if (res.status === 401) {
        sessionStorage.removeItem(STORAGE_KEY);
        setAdminKey('');
        setAuthError('Clé secrète invalide ou expirée.');
        return;
      }

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Impossible de récupérer les statistiques');
      }

      setData(json.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
      setError(err.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    if (adminKey) {
      fetchDashboardData(adminKey);
    }
  }, [adminKey, fetchDashboardData]);

  // Handle key unlock submission
  const handleKeySubmit = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/verify`, {
        headers: {
          'x-admin-key': keyInput.trim(),
        },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        sessionStorage.setItem(STORAGE_KEY, keyInput.trim());
        setAdminKey(keyInput.trim());
        setKeyInput('');
        fetchDashboardData(keyInput.trim());
      } else {
        setAuthError('Clé d\'administration incorrecte.');
      }
    } catch {
      setAuthError('Erreur de connexion au serveur.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAdminKey('');
    setData(null);
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return data.users.filter((u) => {
      const matchesSearch = 
        u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.portfolios?.some(p => p.subdomainSlug?.toLowerCase().includes(userSearch.toLowerCase()));

      if (!matchesSearch) return false;
      if (userFilter === 'published') return u.hasPublished;
      if (userFilter === 'with_portfolios') return u.portfolioCount > 0;
      return true;
    });
  }, [data?.users, userSearch, userFilter]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!data?.recentLogs) return [];
    if (logFilter === 'all') return data.recentLogs;
    return data.recentLogs.filter(l => l.operation === logFilter);
  }, [data?.recentLogs, logFilter]);

  // If not authenticated, render Security Modal Gate
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
        {/* Subtle glowing background orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0f1422]/90 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Portfolify Admin Console</h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Console d'administration sécurisée. Entrez votre clé secrète configurée dans <code className="text-indigo-300 font-mono">ADMIN_SECRET_KEY</code>.
            </p>
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Clé Secrète Admin
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="portfolify_admin_..."
                autoFocus
                className="w-full px-4 py-3 bg-[#0a0d16] border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-zinc-600 outline-none transition-all font-mono"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !keyInput.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Déverrouiller le Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center">
            <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1">
              ← Retour au site public
            </a>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalUsers: 0,
    totalPortfolios: 0,
    publishedPortfolios: 0,
    totalAiRequests: 0,
    totalTokensConsumed: 0,
    promptTokensConsumed: 0,
    completionTokensConsumed: 0,
    avgDurationMs: 0,
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 font-sans select-none flex flex-col">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0c101d]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/20">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Portfolify</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold">
                Admin Console
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-[11px]">Neon Postgres</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <button
            onClick={() => fetchDashboardData()}
            disabled={loading}
            title="Rafraîchir les métriques"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden md:inline">Actualiser</span>
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Site Public</span>
          </a>

          <button
            onClick={handleLogout}
            title="Déconnexion admin"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Error notification banner if any */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <button onClick={() => fetchDashboardData()} className="underline font-semibold cursor-pointer">
              Réessayer
            </button>
          </div>
        )}

        {/* 3. Top KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Total Users */}
          <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Utilisateurs Inscrits</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stats.totalUsers.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-500 font-mono">Clerk Auth</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Comptes synchronisés avec Neon DB</span>
            </p>
          </div>

          {/* KPI 2: Portfolios Created & Published */}
          <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Portfolios Déployés</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stats.totalPortfolios}
              </span>
              <span className="text-xs text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {stats.publishedPortfolios} publiés live
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
              <span>Hébergés sur les sous-domaines <code className="text-indigo-300">*.portfolify.tech</code></span>
            </p>
          </div>

          {/* KPI 3: AI Tokens Consumed */}
          <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tokens IA Consommés</span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                {stats.totalTokensConsumed.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">tokens</span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-2 flex items-center justify-between font-mono">
              <span>Prompt: {stats.promptTokensConsumed.toLocaleString()}</span>
              <span>Gen: {stats.completionTokensConsumed.toLocaleString()}</span>
            </div>
          </div>

          {/* KPI 4: Total Requests & Avg Latency */}
          <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Requêtes IA & Latence</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stats.totalAiRequests.toLocaleString()}
              </span>
              <span className="text-xs text-amber-400 font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                ~{stats.avgDurationMs}ms moy.
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1">
              <span>NVIDIA NIM & Cloudflare FLUX.1</span>
            </p>
          </div>
        </div>

        {/* 4. Tab Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Utilisateurs & Portfolios ({data?.users?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'tokens'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Consommation des Tokens IA</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Logs en Direct ({data?.recentLogs?.length || 0})</span>
            </button>
          </div>

          {lastUpdated && (
            <div className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" />
              <span>Dernière synchro: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* 5. TAB 1: USERS & PORTFOLIOS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and filter controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0e1320] border border-zinc-800/80 p-3 rounded-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Rechercher par email, sous-domaine, Clerk ID..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    userFilter === 'all' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setUserFilter('with_portfolios')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    userFilter === 'with_portfolios' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Avec Portfolio
                </button>
                <button
                  onClick={() => setUserFilter('published')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    userFilter === 'published' ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🟢 Publiés Live
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090d16] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Utilisateur</th>
                      <th className="py-3 px-4">Portfolios & Sous-Domaines</th>
                      <th className="py-3 px-4 text-right">Tokens Consommés</th>
                      <th className="py-3 px-4 text-center">Appels IA</th>
                      <th className="py-3 px-4 text-right">Inscription / Dernière Activité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-sans">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs">
                          Aucun utilisateur ne correspond à votre recherche.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const topTokenUser = Math.max(...(data?.users?.map(x => x.tokensConsumed) || [1]));
                        const tokenPct = Math.min(100, Math.round(((u.tokensConsumed || 0) / (topTokenUser || 1)) * 100));

                        return (
                          <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                            {/* 1. User Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                {u.githubAvatarUrl ? (
                                  <img
                                    src={u.githubAvatarUrl}
                                    alt={u.email}
                                    className="w-9 h-9 rounded-xl object-cover border border-zinc-700"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-violet-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                                    {(u.email || u.username || 'U')[0]}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-white flex items-center gap-1.5">
                                    <span>{u.username || u.email?.split('@')[0]}</span>
                                    {u.plan === 'pro' && (
                                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                        PRO
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-zinc-400">{u.email}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{u.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Portfolios and Subdomains */}
                            <td className="py-3.5 px-4">
                              {u.portfolios?.length > 0 ? (
                                <div className="space-y-1.5">
                                  {u.portfolios.map((p) => {
                                    const liveUrl = `https://${p.subdomainSlug}.portfolify.tech`;
                                    return (
                                      <div key={p.id} className="flex items-center gap-2">
                                        <a
                                          href={liveUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-indigo-300 hover:text-indigo-200 transition-colors font-mono text-[11px]"
                                        >
                                          <span>{p.subdomainSlug}.portfolify.tech</span>
                                          <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                                        </a>

                                        {p.isPublished ? (
                                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            Publié
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                            Brouillon
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-zinc-500 italic text-[11px]">Aucun portfolio créé</span>
                              )}
                            </td>

                            {/* 3. Tokens Consumed */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="font-mono font-bold text-white text-sm">
                                {u.tokensConsumed?.toLocaleString() || 0}
                              </div>
                              <div className="w-24 ml-auto bg-zinc-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.max(tokenPct, 5)}%` }}
                                />
                              </div>
                            </td>

                            {/* 4. Request Count */}
                            <td className="py-3.5 px-4 text-center">
                              <span className="font-mono font-semibold px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200">
                                {u.requestCount || 0}
                              </span>
                            </td>

                            {/* 5. Date */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="text-zinc-300 font-medium">
                                {new Date(u.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                Actif: {u.lastActive ? new Date(u.lastActive).toLocaleDateString('fr-FR') : 'Jamais'}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB 2: AI TOKEN CONSUMPTION ANALYTICS */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Provider Breakdown */}
              <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span>Répartition par Fournisseur d'IA</span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">Tokens totaux</span>
                </div>

                <div className="space-y-4">
                  {data?.tokenAnalytics?.byProvider?.length > 0 ? (
                    data.tokenAnalytics.byProvider.map((p) => {
                      const pct = stats.totalTokensConsumed > 0 
                        ? Math.round((p.totalTokens / stats.totalTokensConsumed) * 100) 
                        : 0;

                      return (
                        <div key={p.provider} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="capitalize font-semibold text-white">{p.provider}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">({p.requestCount} requêtes)</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-indigo-300 font-bold">{p.totalTokens.toLocaleString()}</span>
                              <span className="text-zinc-500 text-[11px]">({pct}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-500 text-xs py-8 text-center italic">
                      Aucune requête enregistrée pour l'instant.
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Operation Breakdown */}
              <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    <span>Répartition par Type d'Opération</span>
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">Activité</span>
                </div>

                <div className="space-y-3">
                  {data?.tokenAnalytics?.byOperation?.length > 0 ? (
                    data.tokenAnalytics.byOperation.map((op) => {
                      const opLabels = {
                        'stream-chat': 'Édition Copilot v0 (Chat SSE)',
                        'generate': 'Génération initiale 0-to-1',
                        'image': 'Visuels FLUX.1 (Bannières)',
                        'summarize': 'Synthèse Projets GitHub',
                        'suggest-palettes': 'Génération Palettes Dynamiques',
                        'portfolio-chat': 'Assistant Recruteur IA (Twin)',
                      };

                      return (
                        <div key={op.operation} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                          <div>
                            <div className="font-medium text-xs text-white">
                              {opLabels[op.operation] || op.operation}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              {op.requestCount} requêtes exécutées
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-sm font-bold text-white">{op.totalTokens.toLocaleString()}</div>
                            <div className="text-[10px] text-zinc-400">tokens</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-500 text-xs py-8 text-center italic">
                      Aucune opération enregistrée pour l'instant.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Models Table */}
            <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl p-5">
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Modèles d'Inférence Actifs</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Modèle IA</th>
                      <th className="py-2.5 px-3">Provider</th>
                      <th className="py-2.5 px-3 text-center">Nombre d'Appels</th>
                      <th className="py-2.5 px-3 text-right">Tokens Consommés</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {data?.tokenAnalytics?.byModel?.map((m) => (
                      <tr key={m.model} className="hover:bg-zinc-900/40">
                        <td className="py-3 px-3 font-semibold text-white">{m.model}</td>
                        <td className="py-3 px-3">
                          <span className="capitalize text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 text-[11px]">
                            {m.provider}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-zinc-300">{m.requestCount}</td>
                        <td className="py-3 px-3 text-right font-bold text-indigo-300">
                          {m.totalTokens.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB 3: LIVE AI REQUEST LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#0e1320] border border-zinc-800/80 p-3 rounded-2xl">
              <span className="text-xs text-zinc-400 font-medium">
                Affichage des {filteredLogs.length} dernières requêtes IA
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-xs text-white rounded-lg px-3 py-1.5 outline-none font-mono"
                >
                  <option value="all">Toutes les opérations</option>
                  <option value="stream-chat">stream-chat</option>
                  <option value="generate">generate</option>
                  <option value="image">image</option>
                  <option value="summarize">summarize</option>
                  <option value="portfolio-chat">portfolio-chat</option>
                </select>
              </div>
            </div>

            <div className="bg-[#0e1320] border border-zinc-800/80 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#090d16] border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-semibold">
                    <tr>
                      <th className="py-3 px-4">Horodatage</th>
                      <th className="py-3 px-4">Utilisateur</th>
                      <th className="py-3 px-4">Opération</th>
                      <th className="py-3 px-4">Modèle & Provider</th>
                      <th className="py-3 px-4 text-right">Prompt / Gen</th>
                      <th className="py-3 px-4 text-right">Total Tokens</th>
                      <th className="py-3 px-4 text-right">Durée</th>
                      <th className="py-3 px-4 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-zinc-500 text-xs italic">
                          Aucun log disponible pour le filtre sélectionné.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-zinc-900/40">
                          <td className="py-3 px-4 text-zinc-400 text-[11px]">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-zinc-200 text-xs font-sans">
                              {log.userEmail || 'Visiteur / Anonyme'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
                              {log.operation}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300 text-[11px]">
                            <div className="truncate max-w-[180px]">{log.model}</div>
                            <div className="text-[10px] text-zinc-500 capitalize">{log.provider}</div>
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400 text-[11px]">
                            {log.promptTokens} / {log.completionTokens}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white text-xs">
                            {log.totalTokens?.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-zinc-400 text-[11px]">
                            {log.durationMs}ms
                          </td>
                          <td className="py-3 px-4 text-center">
                            {log.status === 'success' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                                200 OK
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                                Error
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
