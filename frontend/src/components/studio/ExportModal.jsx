import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useUser } from '@clerk/react';
import { generateProjectFiles, downloadProjectZip } from '../../services/codeExportService';
import {
  RiCloseLine,
  RiFolderZipLine,
  RiGithubFill,
  RiCodeSSlashLine,
  RiDownloadLine,
  RiCheckLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiLoader4Line,
  RiLockLine,
  RiGlobalLine,
  RiFileCodeLine,
  RiFileTextLine,
  RiSparkling2Fill,
  RiShieldCheckLine,
  RiAlertLine,
  RiKeyLine,
} from 'react-icons/ri';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5050' : '');

export const ExportModal = ({ isOpen, onClose }) => {
  const { portfolio, githubUsername } = usePortfolio();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState('zip'); // 'zip' | 'github' | 'code'
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // GitHub Connection State & PAT Fallback
  const [ghStatus, setGhStatus] = useState({ connected: false, username: null, avatarUrl: null });
  const [isCheckingGh, setIsCheckingGh] = useState(false);
  const [patToken, setPatToken] = useState(() => localStorage.getItem('gh_export_pat') || '');
  const [showPatInput, setShowPatInput] = useState(false);

  // Fetch verified status from backend Neon DB
  const checkGithubStatus = async () => {
    setIsCheckingGh(true);
    try {
      const uid = user?.id || '';
      const targetUser = githubUsername || '';
      if (!uid) {
        setGhStatus({ connected: false, username: null, avatarUrl: null });
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/api/v1/github/status?userId=${encodeURIComponent(uid)}&username=${encodeURIComponent(targetUser)}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGhStatus(json.data);
        }
      }
    } catch (err) {
      console.warn('GitHub status check failed:', err);
    } finally {
      setIsCheckingGh(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkGithubStatus();
    }
  }, [isOpen, activeTab, user?.id]);

  // Auto-refresh status whenever user focuses back to the window
  useEffect(() => {
    if (!isOpen) return;
    const onFocus = () => {
      checkGithubStatus();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isOpen]);

  // Handle OAuth Popup
  const handleConnectOAuth = () => {
    const uid = user?.id || '';
    if (!uid) return;
    window.open(
      `${API_BASE_URL}/api/v1/github/authorize?userId=${encodeURIComponent(uid)}`,
      'github_oauth_popup',
      'width=600,height=720,status=no,resizable=yes'
    );

    const handleMessage = (event) => {
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        if (event.data.token) {
          localStorage.setItem('gh_export_token', event.data.token);
        }
        checkGithubStatus();
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
  };

  // Handle Disconnect
  const handleDisconnect = async () => {
    try {
      const uid = user?.id || '';
      if (!uid) return;
      await fetch(`${API_BASE_URL}/api/v1/github/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      });
      localStorage.removeItem('gh_export_pat');
      localStorage.removeItem('gh_export_token');
      setPatToken('');
      setGhStatus({ connected: false, username: null, avatarUrl: null });
    } catch (e) {
      console.warn('Disconnect error:', e);
    }
  };

  const isAccountReady = Boolean(ghStatus.connected || (patToken && patToken.trim().length > 10));
  const effectiveUsername = ghStatus.username || (patToken ? 'Token Personnel' : githubUsername || '');

  // GitHub Export State
  const defaultRepoName = useMemo(() => {
    return (portfolio?.meta?.slug || portfolio?.meta?.title || 'my-portfolio')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
  }, [portfolio?.meta?.slug, portfolio?.meta?.title]);

  const [repoName, setRepoName] = useState(defaultRepoName);
  const [repoDesc, setRepoDesc] = useState(
    portfolio?.meta?.description || 'Personal developer portfolio generated with Portfolify Studio'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState(''); // 'creating' | 'committing' | 'done' | 'error'
  const [createdRepoUrl, setCreatedRepoUrl] = useState(null);
  const [pushError, setPushError] = useState(null);

  // Code Explorer State
  const projectFiles = useMemo(() => {
    if (!isOpen) return {};
    return generateProjectFiles(portfolio);
  }, [portfolio, isOpen]);

  const fileList = useMemo(() => Object.keys(projectFiles), [projectFiles]);
  const [selectedFile, setSelectedFile] = useState('src/App.jsx');
  const [copiedFile, setCopiedFile] = useState(false);

  if (!isOpen) return null;

  // 1. Download ZIP
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      await downloadProjectZip(portfolio);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to download ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  // 2. Push to GitHub
  const handlePushToGithub = async (e) => {
    e.preventDefault();
    if (!repoName.trim()) return;

    const effectiveToken = (patToken && patToken.trim()) || localStorage.getItem('gh_export_token') || undefined;

    if (!ghStatus.connected && !effectiveToken) {
      setPushError('Veuillez d\'abord lier votre compte GitHub via OAuth ou renseigner un Personal Access Token ci-dessus.');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setCreatedRepoUrl(null);
    setPushStatus('Création du dépôt sur GitHub...');

    try {
      const uid = user?.id || '';
      if (!uid) {
        setPushError('Session utilisateur requise.');
        setIsPushing(false);
        return;
      }
      const res = await fetch(`${API_BASE_URL}/api/v1/github/export-repo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': uid,
        },
        body: JSON.stringify({
          userId: uid,
          repoName: repoName.trim(),
          description: repoDesc.trim(),
          isPrivate,
          files: projectFiles,
          personalAccessToken: effectiveToken,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'Échec de l\'export vers GitHub');
      }

      setPushStatus('done');
      setCreatedRepoUrl(json.data.repoUrl);
    } catch (err) {
      console.error('GitHub push error:', err);
      setPushError(err.message || 'Une erreur est survenue lors de l\'exportation vers GitHub');
      setPushStatus('error');
    } finally {
      setIsPushing(false);
    }
  };

  // 3. Copy Active File Code
  const handleCopyCode = () => {
    const content = projectFiles[selectedFile] || '';
    if (content) {
      navigator.clipboard.writeText(content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <RiFolderZipLine className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Exporter le Code Source</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  React 19 + Tailwind v4
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                100% autonome, prêt pour <code className="text-zinc-300 font-mono">npm run dev</code> ou déploiement Vercel.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-900/30 px-6 gap-2 text-xs font-medium">
          <button
            onClick={() => setActiveTab('zip')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'zip'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RiDownloadLine className="w-3.5 h-3.5" />
            <span>Télécharger (.ZIP)</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'github'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RiGithubFill className="w-3.5 h-3.5" />
            <span>Publier sur GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'code'
                ? 'border-white text-white font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RiCodeSSlashLine className="w-3.5 h-3.5" />
            <span>Explorer les Fichiers ({fileList.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: DOWNLOAD ZIP */}
          {activeTab === 'zip' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Projet Vite + React 19 complet</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Comprend l'ensemble de vos composants configurés avec votre palette, polices, et images.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-lg">
                    {fileList.length} fichiers
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-zinc-300">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-emerald-400">✓</span> React 19.0
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-cyan-400">✓</span> Tailwind CSS v4
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-purple-400">✓</span> Vite 6 Bundler
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-amber-400">✓</span> React Icons
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-blue-400">✓</span> Lucide React
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <span className="text-pink-400">✓</span> Zero Config
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/60 text-xs text-zinc-400 space-y-2">
                <span className="font-semibold text-zinc-200">Comment le lancer localement :</span>
                <div className="p-2.5 rounded-lg bg-black border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
                  <p className="text-zinc-500"># 1. Décompresser le ZIP et ouvrir le terminal</p>
                  <p><span className="text-emerald-400">npm</span> install</p>
                  <p><span className="text-emerald-400">npm</span> run dev</p>
                </div>
              </div>

              {/* Download CTA */}
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <RiLoader4Line className="w-4 h-4 animate-spin" />
                    <span>Création de l'archive ZIP en cours...</span>
                  </>
                ) : zipSuccess ? (
                  <>
                    <RiCheckLine className="w-4 h-4 text-emerald-600" />
                    <span>Téléchargement terminé avec succès !</span>
                  </>
                ) : (
                  <>
                    <RiDownloadLine className="w-4 h-4" />
                    <span>Télécharger l'Archive Source (.ZIP)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: PUSH TO GITHUB */}
          {activeTab === 'github' && (
            <div className="space-y-5">
              {/* Account Status Card */}
              {isAccountReady ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <RiGithubFill className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-white block">
                        @{effectiveUsername || 'Compte GitHub'}
                      </span>
                      <span className="text-[10px] text-emerald-400/90 font-mono">
                        {ghStatus.connected ? 'OAuth Certifié & Connecté' : 'Token PAT Personnel Actif'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <RiShieldCheckLine className="w-3 h-3" />
                      Prêt
                    </span>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/15 text-xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <RiAlertLine className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-white">Connexion GitHub requise pour publier</h5>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Choisissez votre méthode de connexion pour créer et pousser le dépôt :
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConnectOAuth}
                      className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <RiGithubFill className="w-4 h-4" />
                      <span>Se connecter avec GitHub (OAuth)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPatInput(!showPatInput)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RiKeyLine className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{showPatInput ? 'Masquer le champ PAT' : 'Ou coller un Personal Access Token'}</span>
                    </button>
                  </div>

                  {showPatInput && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <label className="block text-[11px] font-semibold text-zinc-300">
                        Personal Access Token (permission <span className="font-mono text-amber-300">repo</span>)
                      </label>
                      <input
                        type="password"
                        value={patToken}
                        onChange={(e) => {
                          setPatToken(e.target.value);
                          localStorage.setItem('gh_export_pat', e.target.value.trim());
                        }}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white outline-none focus:border-zinc-400 font-mono"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Vous pouvez créer un token classique en 10 secondes sur{' '}
                        <a
                          href="https://github.com/settings/tokens/new?scopes=repo&description=Portfolify+Studio"
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          github.com/settings/tokens &rarr;
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Repo Config Form */}
              <form onSubmit={handlePushToGithub} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nom du Dépôt GitHub (Repository)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="mon-portfolio-dev"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white outline-none focus:border-zinc-500 font-mono transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Sera créé sous <span className="text-zinc-400 font-mono">github.com/{githubUsername || '{user}'}/{repoName}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Description (facultative)
                  </label>
                  <input
                    type="text"
                    value={repoDesc}
                    onChange={(e) => setRepoDesc(e.target.value)}
                    placeholder="Mon portfolio professionnel développé avec React 19 et Portfolify"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/20 text-xs">
                  <div className="flex items-center gap-2">
                    {isPrivate ? <RiLockLine className="w-4 h-4 text-amber-400" /> : <RiGlobalLine className="w-4 h-4 text-cyan-400" />}
                    <div>
                      <span className="font-semibold text-white block">
                        {isPrivate ? 'Dépôt Privé' : 'Dépôt Public'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {isPrivate ? 'Visible uniquement par vous' : 'Accessible mondialement et partageable'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className="px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-200 hover:text-white transition-colors cursor-pointer"
                  >
                    Basculer en {isPrivate ? 'Public' : 'Privé'}
                  </button>
                </div>

                {/* Push Error Message */}
                {pushError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                    <RiAlertLine className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{pushError}</span>
                  </div>
                )}

                {/* Success Message with Clickable Link */}
                {createdRepoUrl && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <RiCheckLine className="w-4 h-4 text-emerald-400" />
                      <span>Dépôt GitHub créé et code publié avec succès !</span>
                    </div>
                    <a
                      href={createdRepoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-mono text-[11px] transition-colors"
                    >
                      <span>{createdRepoUrl}</span>
                      <RiExternalLinkLine className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isPushing}
                  className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isPushing ? (
                    <>
                      <RiLoader4Line className="w-4 h-4 animate-spin" />
                      <span>{pushStatus || 'Publication en cours sur GitHub...'}</span>
                    </>
                  ) : (
                    <>
                      <RiGithubFill className="w-4 h-4" />
                      <span>Créer le Dépôt & Pousser le Code Source</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: EXPLORE FILES */}
          {activeTab === 'code' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px]">
              {/* File Tree on Left */}
              <div className="md:col-span-4 border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-y-auto p-2 space-y-1 text-xs font-mono">
                {fileList.map((file) => (
                  <button
                    key={file}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors flex items-center gap-2 cursor-pointer ${
                      selectedFile === file
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {file.endsWith('.json') || file.endsWith('.js') ? (
                      <RiFileCodeLine className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : file.endsWith('.css') ? (
                      <RiFileCodeLine className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    ) : file.endsWith('.md') ? (
                      <RiFileTextLine className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <RiFileCodeLine className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{file}</span>
                  </button>
                ))}
              </div>

              {/* Code Viewer on Right */}
              <div className="md:col-span-8 border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col overflow-hidden">
                <div className="px-3.5 py-2 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 truncate">{selectedFile}</span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer text-[11px]"
                  >
                    {copiedFile ? (
                      <>
                        <RiCheckLine className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copié</span>
                      </>
                    ) : (
                      <>
                        <RiFileCopyLine className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-3 text-xs font-mono leading-relaxed text-zinc-300 selection:bg-zinc-800 bg-[#09090b]">
                  <pre>
                    <code>{projectFiles[selectedFile] || ''}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-900/30 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Portfolify Code Engine v1.0</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
