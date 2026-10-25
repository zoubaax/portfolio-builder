import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutDashboard,
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
  Zap,
  Sparkles,
  Server,
  ChevronRight,
  Menu,
  X,
  Key,
  BarChart3,
  Terminal,
  Shield,
  CircleDot
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
  
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'tokens' | 'logs' | 'system'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'published' | 'with_portfolios'
  const [logFilter, setLogFilter] = useState('all'); // 'all' | 'stream-chat' | 'generate' | 'image' | 'summarize'

  // Fetch dashboard data
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

  // Handle password key submission
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
        setAuthError('Clé secrète invalide.');
      }
    } catch {
      setAuthError('Impossible de joindre le serveur backend.');
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

  // Safe fallback stats
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

  // 1. GATE MODAL (If adminKey is not present)
  if (!adminKey) {
    return (
      <div className="min-h-screen bg-[#000000] text-zinc-100 flex items-center justify-center p-4 font-sans select-none antialiased">
        <div className="w-full max-w-sm bg-[#09090b] border border-zinc-800 rounded-2xl p-7 shadow-2xl relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm">
              ▲
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight">Portfolify Admin</div>
              <div className="text-[11px] text-zinc-400">Authentification sécurisée</div>
            </div>
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1.5">
                Clé d'accès administrateur
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="portfolify_admin_..."
                autoFocus
                className="w-full px-3.5 py-2.5 bg-[#121215] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 outline-none focus:outline-none focus:ring-0 focus:border-zinc-800 font-mono shadow-none"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !keyInput.trim()}
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-xs tracking-wide rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Continuer vers la Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-900 text-center">
            <a href="/" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1">
              ← Retour au site public
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN VERCEL / CLOUDFLARE STYLE DASHBOARD WITH SIDEBAR
  const navItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs & Portfolios', icon: Users, badge: stats.totalUsers },
    { id: 'tokens', label: 'Tokens IA & Quotas', icon: Cpu, badge: `${(stats.totalTokensConsumed / 1000).toFixed(0)}k` },
    { id: 'logs', label: 'Logs en Direct', icon: Terminal, badge: stats.totalAiRequests },
    { id: 'system', label: 'Système & Services', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans flex antialiased select-none">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2.1 SIDEBAR (Vercel / Cloudflare style) */}
      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Workspace Brand Switcher */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs tracking-tighter">
              ▲
            </div>
            <div>
              <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span>Portfolify</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                  PROD
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>portfolify.tech</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 px-3 py-1 font-semibold">
            Plateforme
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800/80 text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800 space-y-2">
          {/* Neon DB Status */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[11px]">
            <div className="flex items-center gap-2 text-zinc-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Neon Postgres</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          {/* Quick links & Logout */}
          <div className="flex items-center gap-1.5">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              <span>Site Public</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-400" />
            </a>

            <button
              onClick={handleLogout}
              title="Déconnexion admin"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2.2 MAIN CONTENT WRAPPER */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header / Breadcrumbs Bar */}
        <header className="sticky top-0 z-30 bg-[#000000]/80 backdrop-blur-md border-b border-zinc-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">portfolify</span>
              <span className="text-zinc-600">/</span>
              <span className="text-zinc-400">admin</span>
              <span className="text-zinc-600">/</span>
              <span className="text-white font-medium capitalize">
                {navItems.find(n => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="hidden sm:inline text-[11px] text-zinc-400 font-mono">
                Sync {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            <button
              onClick={() => fetchDashboardData()}
              disabled={loading}
              title="Rafraîchir les métriques"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
              <span className="hidden md:inline">Actualiser</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <button onClick={() => fetchDashboardData()} className="underline font-semibold cursor-pointer">
                Réessayer
              </button>
            </div>
          )}

          {/* VIEW 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards (Vercel Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Utilisateurs Inscrits</span>
                    <Users className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {stats.totalUsers}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Clerk Authentication & Neon DB</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Portfolios Déployés</span>
                    <Globe className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      {stats.totalPortfolios}
                    </span>
                    <span className="text-xs text-emerald-400 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {stats.publishedPortfolios} live
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2">
                    Domaines <code className="text-zinc-300">*.portfolify.tech</code>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Tokens IA Consommés</span>
                    <Zap className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                    {stats.totalTokensConsumed.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2 font-mono flex items-center justify-between">
                    <span>Prompt: {stats.promptTokensConsumed.toLocaleString()}</span>
                    <span>Gen: {stats.completionTokensConsumed.toLocaleString()}</span>
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                    <span>Requêtes & Latence</span>
                    <Activity className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                      {stats.totalAiRequests}
                    </span>
                    <span className="text-xs text-zinc-300 font-mono px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                      ~{stats.avgDurationMs}ms
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-2">
                    NVIDIA NIM & Cloudflare FLUX.1
                  </div>
                </div>
              </div>

              {/* Quick Summary Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider breakdown summary */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Consommation par Fournisseur
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">Part de tokens</span>
                  </div>

                  <div className="space-y-3.5">
                    {data?.tokenAnalytics?.byProvider?.length > 0 ? (
                      data.tokenAnalytics.byProvider.map((p) => {
                        const pct = stats.totalTokensConsumed > 0 
                          ? Math.round((p.totalTokens / stats.totalTokensConsumed) * 100) 
                          : 0;

                        return (
                          <div key={p.provider} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="capitalize font-medium text-white">{p.provider}</span>
                              <div className="flex items-center gap-2 font-mono text-[11px]">
                                <span className="text-zinc-300">{p.totalTokens.toLocaleString()} tokens</span>
                                <span className="text-zinc-400 font-semibold">{pct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-zinc-850 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-white h-full rounded-full transition-all"
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-zinc-500 text-xs py-8 text-center italic">
                        Aucune donnée d'inférence disponible.
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations breakdown */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Opérations Populaires
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">Total requêtes</span>
                  </div>

                  <div className="space-y-2.5">
                    {data?.tokenAnalytics?.byOperation?.length > 0 ? (
                      data.tokenAnalytics.byOperation.map((op) => (
                        <div key={op.operation} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                          <div>
                            <div className="text-xs font-medium text-white font-mono">{op.operation}</div>
                            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{op.requestCount} appels</div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-xs font-bold text-white">{op.totalTokens.toLocaleString()}</div>
                            <div className="text-[10px] text-zinc-400">tokens</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-zinc-500 text-xs py-8 text-center italic">
                        Aucune opération enregistrée.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Users Preview */}
              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Derniers Utilisateurs Enregistrés
                  </h3>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Voir tout</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-zinc-800/60">
                  {data?.users?.slice(0, 5).map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {u.githubAvatarUrl ? (
                          <img src={u.githubAvatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-zinc-800" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center uppercase">
                            {(u.email || 'U')[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-medium text-white">{u.email}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{u.id}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-white">
                            {u.tokensConsumed?.toLocaleString() || 0} tokens
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {u.portfolioCount} portfolio{u.portfolioCount > 1 ? 's' : ''}
                          </div>
                        </div>

                        {u.hasPublished ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            Live
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                            Draft
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#09090b] border border-zinc-800 p-3 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Filtrer par email, sous-domaine, identifiant..."
                    className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-700 transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      userFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Tous ({data?.users?.length || 0})
                  </button>
                  <button
                    onClick={() => setUserFilter('with_portfolios')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      userFilter === 'with_portfolios' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Avec Portfolios
                  </button>
                  <button
                    onClick={() => setUserFilter('published')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      userFilter === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ● Publiés Live
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#050507] border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Utilisateur</th>
                        <th className="py-3 px-4">Sous-Domaines & Statut</th>
                        <th className="py-3 px-4 text-right">Tokens Consommés</th>
                        <th className="py-3 px-4 text-center">Appels IA</th>
                        <th className="py-3 px-4 text-right">Inscription</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-sans">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-zinc-500 text-xs">
                            Aucun utilisateur ne correspond à votre filtre.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const topToken = Math.max(...(data?.users?.map(x => x.tokensConsumed) || [1]));
                          const pct = Math.min(100, Math.round(((u.tokensConsumed || 0) / (topToken || 1)) * 100));

                          return (
                            <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                              {/* User Info */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {u.githubAvatarUrl ? (
                                    <img src={u.githubAvatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-zinc-800" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold text-xs uppercase">
                                      {(u.email || u.username || 'U')[0]}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-white flex items-center gap-1.5">
                                      <span>{u.username || u.email?.split('@')[0]}</span>
                                      {u.plan === 'pro' && (
                                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                          PRO
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-zinc-400">{u.email}</div>
                                    <div className="text-[10px] text-zinc-400 font-mono">{u.id}</div>
                                  </div>
                                </div>
                              </td>

                              {/* Portfolios */}
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
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors font-mono text-[11px]"
                                          >
                                            <span>{p.subdomainSlug}.portfolify.tech</span>
                                            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                                          </a>

                                          {p.isPublished ? (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                              ● Live
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                              ● Draft
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-zinc-500 italic text-[11px]">Aucun portfolio</span>
                                )}
                              </td>

                              {/* Tokens */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="font-mono font-bold text-white text-xs">
                                  {u.tokensConsumed?.toLocaleString() || 0}
                                </div>
                                <div className="w-20 ml-auto bg-zinc-850 rounded-full h-1 mt-1 overflow-hidden">
                                  <div className="bg-white h-full rounded-full" style={{ width: `${Math.max(pct, 4)}%` }} />
                                </div>
                              </td>

                              {/* Requests */}
                              <td className="py-3.5 px-4 text-center">
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                                  {u.requestCount || 0}
                                </span>
                              </td>

                              {/* Date */}
                              <td className="py-3.5 px-4 text-right font-mono text-[11px] text-zinc-400">
                                {new Date(u.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
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

          {/* VIEW 3: AI TOKENS ANALYTICS */}
          {activeTab === 'tokens' && (
            <div className="space-y-6">
              {/* Models Table */}
              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Modèles d'Inférence Actifs
                  </h3>
                  <span className="text-[11px] font-mono text-zinc-400">Consommation exacte</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Modèle IA</th>
                        <th className="py-2.5 px-3">Provider</th>
                        <th className="py-2.5 px-3 text-center">Requêtes</th>
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
                          <td className="py-3 px-3 text-right font-bold text-white">
                            {m.totalTokens.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Provider Breakdown Detail */}
              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Détail par Fournisseur
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.tokenAnalytics?.byProvider?.map((p) => (
                    <div key={p.provider} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white capitalize text-sm">{p.provider}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{p.requestCount} req</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {p.totalTokens.toLocaleString()}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400 flex justify-between">
                        <span>P: {p.promptTokens.toLocaleString()}</span>
                        <span>C: {p.completionTokens.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: REALTIME LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#09090b] border border-zinc-800 p-3 rounded-2xl">
                <span className="text-xs text-zinc-400 font-mono">
                  {filteredLogs.length} événements récents
                </span>

                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-[#121215] border border-zinc-800 text-xs text-white rounded-lg px-3 py-1.5 outline-none font-mono"
                >
                  <option value="all">Toutes opérations</option>
                  <option value="stream-chat">stream-chat</option>
                  <option value="generate">generate</option>
                  <option value="image">image</option>
                  <option value="summarize">summarize</option>
                  <option value="portfolio-chat">portfolio-chat</option>
                </select>
              </div>

              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#050507] border-b border-zinc-800 text-zinc-400 uppercase text-[10px] font-semibold font-mono">
                      <tr>
                        <th className="py-3 px-4">Heure</th>
                        <th className="py-3 px-4">Utilisateur</th>
                        <th className="py-3 px-4">Opération</th>
                        <th className="py-3 px-4">Modèle</th>
                        <th className="py-3 px-4 text-right">Tokens</th>
                        <th className="py-3 px-4 text-right">Durée</th>
                        <th className="py-3 px-4 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-zinc-500 text-xs italic">
                            Aucun log enregistré pour ce filtre.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-900/40">
                            <td className="py-3 px-4 text-zinc-400 text-[11px]">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-4 font-sans text-zinc-200">
                              {log.userEmail || 'Visiteur / Guest'}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                                {log.operation}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-zinc-300 text-[11px]">
                              <div className="truncate max-w-[160px]">{log.model}</div>
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-white">
                              {log.totalTokens?.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-zinc-400">
                              {log.durationMs}ms
                            </td>
                            <td className="py-3 px-4 text-center">
                              {log.status === 'success' ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  200 OK
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
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

          {/* VIEW 5: SYSTEM & HEALTH */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  État de l'Infrastructure Portfolify
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Database */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-400" />
                        <span>Neon Serverless PostgreSQL</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Connecté via WebSocket pooler sécurisé
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 mt-2">
                        Tables: users, portfolios, portfolio_versions, ai_token_logs
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Healthy
                    </span>
                  </div>

                  {/* Vercel Frontend */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-indigo-400" />
                        <span>Vercel Multi-Service Hosting</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        SPA Vite Build & Serverless Express API
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 mt-2">
                        Region: iad1 / Edge Rewrites
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Active
                    </span>
                  </div>

                  {/* Cloudflare Edge Routing */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <Activity className="w-4 h-4 text-amber-400" />
                        <span>Cloudflare Edge Worker</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        Routage dynamique des sous-domaines (*.portfolify.tech)
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 mt-2">
                        Open Graph previews WhatsApp / Twitter
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Routing
                    </span>
                  </div>

                  {/* AI Providers */}
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-400" />
                        <span>AI Inference Pipeline</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        NVIDIA NIM (Llama 3.2 Vision) & Cloudflare FLUX.1
                      </p>
                      <div className="text-[10px] font-mono text-zinc-400 mt-2">
                        Tracking asynchrone non-bloquant
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
