import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  fetchUserRepos,
  fetchRepoReadme,
  fetchRepoReadmeDetails,
  summarizeProjectAi,
  generateProjectImageAi,
  parseGitHubUsername,
} from '../../services/githubService';
import {
  RiGithubFill,
  RiSearchLine,
  RiStarLine,
  RiGitForkLine,
  RiCheckboxCircleFill,
  RiCheckboxBlankCircleLine,
  RiExternalLinkLine,
  RiSparkling2Fill,
  RiRefreshLine,
  RiCodeLine,
  RiArrowRightLine,
  RiCheckLine,
  RiTimeLine,
  RiInformationLine,
  RiShieldCheckLine,
  RiLockPasswordLine,
  RiUserSettingsLine,
  RiLogoutBoxRLine,
  RiDeleteBin6Line,
  RiAlertLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiFolder3Line,
} from 'react-icons/ri';
import { ImagePickerModal } from '../common/ImagePickerModal';

export const GithubProjectsTab = ({ onApplyComplete }) => {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const {
    sendChatMessage,
    sendMessage,
    setViewMode,
    studioTheme,
    portfolio,
    updateSection,
    updateSectionField,
  } = usePortfolio();
  const isLight = studioTheme === 'light';

  // State for direct Neon DB linked GitHub account
  const [linkedAccount, setLinkedAccount] = useState({ connected: false, username: null, avatarUrl: null });
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Certified GitHub account verified cryptographically (Direct OAuth or Clerk OAuth fallback)
  const clerkGitHubAccount = user?.externalAccounts?.find(
    (acc) => acc.provider === 'oauth_github' || acc.verification?.strategy === 'oauth_github'
  );

  const verifiedUsername = linkedAccount.username || clerkGitHubAccount?.username || '';
  const verifiedAvatar =
    linkedAccount.avatarUrl || (verifiedUsername ? `https://github.com/${verifiedUsername}.png` : null);

  // Auto-sync portfolio Hero avatar with GitHub avatar if current avatar is stock Unsplash
  useEffect(() => {
    if (verifiedAvatar && updateSectionField) {
      const heroSec = portfolio?.sections?.find((s) => s.type === 'hero');
      const isUnsplash = !heroSec?.data?.avatar || heroSec.data.avatar.includes('unsplash.com');
      if (isUnsplash) {
        updateSectionField('sec-hero', 'avatar', verifiedAvatar);
      }
    }
  }, [verifiedAvatar, portfolio?.sections, updateSectionField]);

  const [isLinkingOAuth, setIsLinkingOAuth] = useState(false);
  const [repos, setRepos] = useState([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Generation options
  const [generateAiImages, setGenerateAiImages] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStep, setApplyStep] = useState('');
  const [regeneratingId, setRegeneratingId] = useState(null);

  // Modal states for AI image error handling & manual image picker
  const [imageErrorPrompt, setImageErrorPrompt] = useState(null);
  const [pickerModalConfig, setPickerModalConfig] = useState(null);

  // Extract current projects in portfolio
  const currentPortfolioProjects = portfolio?.sections?.find((s) => s.type === 'projects')?.data?.projects || [];

  // Helper: check if a GitHub repo is already displayed in the portfolio
  const isRepoInPortfolio = (repo) => {
    if (!repo || !currentPortfolioProjects.length) return false;
    const cleanRepoName = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanRepoUrl = (repo.url || '').toLowerCase().replace(/\/+$/, '');
    return currentPortfolioProjects.some((p) => {
      if (p.github && cleanRepoUrl && p.github.toLowerCase().replace(/\/+$/, '') === cleanRepoUrl) {
        return true;
      }
      if (p.title) {
        const cleanTitle = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanTitle === cleanRepoName || cleanTitle.includes(cleanRepoName) || cleanRepoName.includes(cleanTitle)) {
          return true;
        }
      }
      return false;
    });
  };

  // Repositories not yet added to the portfolio
  const availableRepos = repos.filter((r) => !isRepoInPortfolio(r));

  // Filtered available repositories based on search
  const filteredAvailableRepos = availableRepos.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q)) ||
      (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // 1. Fetch linked GitHub account status from Neon DB
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      if (!user?.id) {
        setIsCheckingStatus(false);
        return;
      }
      try {
        const res = await fetch(`http://localhost:5050/api/v1/github/status?userId=${encodeURIComponent(user.id)}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data?.connected) {
            setLinkedAccount(json.data);
          }
        }
      } catch (e) {
        console.warn('GitHub status check error:', e);
      } finally {
        if (isMounted) setIsCheckingStatus(false);
      }
    };

    checkStatus();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // 2. Listen for OAuth popup postMessage success
  useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        const { username, avatarUrl } = event.data;
        setLinkedAccount({ connected: true, username, avatarUrl });
        setSuccessNotice(`Compte GitHub @${username} authentifié et connecté avec succès !`);
        handleFetchRepos(username);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [user?.id]);

  // Method: Fetch repositories for the authenticated GitHub user
  const handleFetchRepos = async (userToFetch) => {
    if (!userToFetch) return;

    setIsLoading(true);
    setError(null);
    setSelectedRepoIds(new Set());

    try {
      const data = await fetchUserRepos(userToFetch, user?.id);
      setRepos(data);
    } catch (err) {
      setError(err.message || 'Impossible de récupérer les dépôts.');
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch verified repositories when OAuth account is present
  useEffect(() => {
    if (verifiedUsername) {
      handleFetchRepos(verifiedUsername);
    }
  }, [verifiedUsername]);

  // Method: Initiate direct GitHub OAuth flow via secure popup (decoupled from Clerk email conflicts)
  const handleLinkGitHubOAuth = () => {
    setIsLinkingOAuth(true);
    setError(null);
    try {
      const userId = user?.id || 'guest';
      const authUrl = `http://localhost:5050/api/v1/github/authorize?userId=${encodeURIComponent(userId)}`;
      const width = 600;
      const height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        'github_oauth_popup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
      );

      if (!popup) {
        throw new Error('Le pop-up d\'authentification a été bloqué par votre navigateur. Veuillez autoriser les fenêtres pop-up.');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ouverture de la connexion GitHub.');
    } finally {
      setIsLinkingOAuth(false);
    }
  };

  // Method: Disconnect GitHub account
  const handleDisconnect = async () => {
    if (!confirm('Voulez-vous vraiment dissocier ce compte GitHub ?')) return;

    setIsLoading(true);
    setError(null);
    try {
      await fetch('http://localhost:5050/api/v1/github/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      setLinkedAccount({ connected: false, username: null, avatarUrl: null });
      setRepos([]);
      setSelectedRepoIds(new Set());
      setSuccessNotice('Compte GitHub dissocié avec succès.');
    } catch (err) {
      setError('Impossible de dissocier le compte.');
    } finally {
      setIsLoading(false);
    }
  };

  // Method: Regenerate 3D mockup image for a project already in portfolio
  const handleRegenerateImage = async (proj) => {
    if (!proj || regeneratingId) return;
    const targetKey = proj.id || proj.title;
    setRegeneratingId(targetKey);
    setError(null);

    try {
      const matchingRepo = repos.find((r) => {
        const cleanProjUrl = (proj.github || '').toLowerCase().replace(/\/+$/, '');
        const cleanRepoUrl = (r.url || '').toLowerCase().replace(/\/+$/, '');
        if (cleanProjUrl && cleanRepoUrl && cleanProjUrl === cleanRepoUrl) return true;
        const cleanRepoName = (r.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanProjTitle = (proj.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanRepoName && (cleanProjTitle === cleanRepoName || cleanProjTitle.includes(cleanRepoName) || cleanRepoName.includes(cleanProjTitle));
      });

      let readmeSnippet = '';
      if (matchingRepo) {
        readmeSnippet = await fetchRepoReadme(matchingRepo.owner, matchingRepo.name);
      }

      const tags = Array.isArray(proj.tags)
        ? proj.tags
        : matchingRepo
        ? [matchingRepo.language, ...(matchingRepo.topics || [])].filter(Boolean)
        : [];

      const newImageUrl = await generateProjectImageAi({
        title: proj.title,
        description: readmeSnippet || proj.description,
        tags,
        currentImageUrl: proj.image,
      });

      if (newImageUrl && updateSection) {
        updateSection('sec-projects', (prevData) => {
          const existing = Array.isArray(prevData?.projects) ? prevData.projects : [];
          return {
            ...prevData,
            projects: existing.map((p) => {
              if ((p.id && proj.id && p.id === proj.id) || p.title === proj.title) {
                return { ...p, image: newImageUrl };
              }
              return p;
            }),
          };
        });
        setSuccessNotice(`✨ Nouvelle image IA générée avec succès pour "${proj.title}" !`);
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to regenerate image:', err);
      setImageErrorPrompt({
        project: proj,
        isRegeneration: true,
        error: err.message,
      });
    } finally {
      setRegeneratingId(null);
    }
  };

  // Method: Remove a project from portfolio
  const handleRemovePortfolioProject = (proj) => {
    if (!proj || !updateSection) return;
    const cleanProjTitle = proj.title;
    updateSection('sec-projects', (prevData) => {
      const existingList = Array.isArray(prevData?.projects) ? prevData.projects : [];
      return {
        ...prevData,
        projects: existingList.filter((p) => {
          if (proj.id && p.id) return p.id !== proj.id;
          return p.title !== proj.title;
        }),
      };
    });
    setSuccessNotice(`Projet "${cleanProjTitle}" retiré de votre portfolio.`);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Toggle selection on available repo
  const handleToggleSelectAvailable = (repoId) => {
    setSelectedRepoIds((prev) => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const handleSelectAllAvailable = (list) => {
    if (selectedRepoIds.size === list.length && list.length > 0) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(list.map((r) => r.id)));
    }
  };

  // Helper: Finalize adding enriched projects with their images to the portfolio
  const finalizeProjectAddition = async (enrichedProjects, projectImages) => {
    // Build structured project objects with AI-synthesized metadata
    const projectsToAdd = enrichedProjects.map((p, idx) => {
      const summary = p.aiSummary || {};
      const fallbackTitle = p.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const fallbackDesc = p.readmeSnippet ? p.readmeSnippet.slice(0, 160) + '...' : (p.description || 'Projet open-source certifié GitHub');

      return {
        id: `proj-gh-${p.id || Date.now() + idx}`,
        title: summary.title || fallbackTitle,
        description: summary.description || fallbackDesc,
        tags: (Array.isArray(summary.tags) && summary.tags.length > 0)
          ? summary.tags
          : [p.language, ...(p.topics || [])].filter(Boolean).slice(0, 4),
        metrics: summary.metrics || `${p.stars || 0} Stars • GitHub Certified`,
        github: p.url,
        link: p.homepage || p.url,
        image:
          projectImages[p.name] ||
          p.githubImage ||
          (p.owner || verifiedUsername ? `https://opengraph.githubassets.com/1/${p.owner || verifiedUsername}/${p.name}` : ''),
        featured: false,
      };
    });

    // Directly update projects section immediately: MUST PRESERVE ALL EXISTING PROJECTS!
    if (updateSection) {
      updateSection('sec-projects', (prevData) => {
        const existingList = Array.isArray(prevData?.projects) ? [...prevData.projects] : [];
        const merged = [...existingList];
        projectsToAdd.forEach((np) => {
          const npUrl = (np.github || '').toLowerCase().replace(/\/+$/, '');
          const npTitle = (np.title || '').toLowerCase().trim();
          const exists = merged.some((ep) => {
            const epUrl = (ep.github || '').toLowerCase().replace(/\/+$/, '');
            const epTitle = (ep.title || '').toLowerCase().trim();
            return (npUrl && epUrl && npUrl === epUrl) || (npTitle && epTitle && npTitle === epTitle);
          });
          if (!exists) {
            merged.push(np);
          }
        });
        return {
          ...prevData,
          heading: prevData?.heading || 'Projets Réalisés',
          projects: merged,
        };
      });
    }

    // Clear selection
    setSelectedRepoIds(new Set());
    setSuccessNotice(`Projet(s) ajouté(s) avec succès au portfolio !`);
    setTimeout(() => setSuccessNotice(null), 3500);

    if (onApplyComplete) {
      onApplyComplete();
    } else {
      setViewMode('preview');
    }
  };

  // Helper: Sequentially generate AI images for projects, prompting the user immediately if any error occurs
  const generateImagesAndFinalize = async (enrichedProjects, currentImages, index) => {
    if (index >= enrichedProjects.length) {
      await finalizeProjectAddition(enrichedProjects, currentImages);
      setIsApplying(false);
      setApplyStep('');
      return;
    }

    const proj = enrichedProjects[index];
    const summary = proj.aiSummary || {};
    const displayTitle = summary.title || proj.name;
    setApplyStep(`Conception du visuel clean pour "${displayTitle}"...`);
    const tags = (Array.isArray(summary.tags) && summary.tags.length > 0)
      ? summary.tags
      : [proj.language, ...(proj.topics || [])].filter(Boolean);

    try {
      const imgUrl = await generateProjectImageAi({
        title: displayTitle,
        description: proj.readmeSnippet || summary.description || proj.description,
        tags,
        prompt: summary.imagePrompt,
      });
      const updatedImages = { ...currentImages, [proj.name]: imgUrl };
      await generateImagesAndFinalize(enrichedProjects, updatedImages, index + 1);
    } catch (err) {
      console.warn(`Échec de la génération IA pour ${proj.name}:`, err.message);
      setIsApplying(false);
      setApplyStep('');
      // Prompt user: Cancel addition or upload/choose an image manually
      setImageErrorPrompt({
        project: proj,
        enrichedProjects,
        projectImages: currentImages,
        currentIndex: index,
        error: err.message,
        isRegeneration: false,
      });
    }
  };

  // Action: Apply selected available projects to portfolio with AI summary & images generated from README
  const handleApplyToPortfolio = async () => {
    const selectedList = availableRepos.filter((r) => selectedRepoIds.has(r.id));
    if (selectedList.length === 0) return;

    setIsApplying(true);
    setApplyStep('Lecture des READMEs GitHub...');

    try {
      // 1. Fetch README snippets and extract authentic GitHub images in parallel
      const readmes = await Promise.all(
        selectedList.map(async (repo) => {
          const details = await fetchRepoReadmeDetails(repo.owner, repo.name);
          return { repo, readmeSnippet: details.cleanSnippet, githubImage: details.extractedImage };
        })
      );

      // 2. Synthesize clean titles, descriptions, tags, and metrics via LLM in parallel
      setApplyStep('Synthèse intelligente par IA (résumés, tags, métriques)...');
      const enrichedProjects = await Promise.all(
        readmes.map(async ({ repo, readmeSnippet, githubImage }) => {
          const summary = await summarizeProjectAi({
            name: repo.name,
            owner: repo.owner,
            language: repo.language,
            topics: repo.topics || [],
            rawDescription: repo.description,
            readmeContent: readmeSnippet,
          });

          return {
            ...repo,
            readmeSnippet,
            githubImage,
            aiSummary: summary,
          };
        })
      );

      // 3. Generate images via AI if enabled
      if (generateAiImages) {
        await generateImagesAndFinalize(enrichedProjects, {}, 0);
      } else {
        await finalizeProjectAddition(enrichedProjects, {});
        setIsApplying(false);
        setApplyStep('');
      }
    } catch (err) {
      console.error('Error applying projects:', err);
      setError(err.message || 'Erreur lors de l\'intégration des projets. Veuillez réessayer.');
      setIsApplying(false);
      setApplyStep('');
    }
  };

  // Handler for manual image picker save (triggered when user chooses "Ajouter moi-même")
  const handleManualImageSave = async (customImageUrl) => {
    if (!pickerModalConfig) return;
    const promptData = pickerModalConfig.promptData;
    setPickerModalConfig(null);

    if (!customImageUrl) return;

    if (promptData?.isRegeneration) {
      // Updating an existing project in portfolio
      if (updateSection) {
        updateSection('sec-projects', (prevData) => {
          const existing = Array.isArray(prevData?.projects) ? prevData.projects : [];
          return {
            ...prevData,
            projects: existing.map((p) => {
              if ((p.id && promptData.project.id && p.id === promptData.project.id) || p.title === promptData.project.title) {
                return { ...p, image: customImageUrl };
              }
              return p;
            }),
          };
        });
        setSuccessNotice(`Image personnalisée enregistrée pour "${promptData.project.title}" !`);
        setTimeout(() => setSuccessNotice(null), 3500);
      }
    } else if (promptData) {
      // Adding project(s) to portfolio
      const updatedImages = {
        ...(promptData.projectImages || {}),
        [promptData.project.name]: customImageUrl,
      };
      setIsApplying(true);
      await generateImagesAndFinalize(
        promptData.enrichedProjects,
        updatedImages,
        (promptData.currentIndex || 0) + 1
      );
    }
  };

  const handleClosePicker = () => {
    setPickerModalConfig(null);
    setIsApplying(false);
    setApplyStep('');
  };

  return (
    <div
      className={`h-full w-full overflow-y-auto p-6 md:p-8 transition-colors ${
        isLight ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-zinc-100'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        {/* Header Title & Description */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
          style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium mb-2 border ${
              isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}>
              <RiGithubFill className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>Dépôts GitHub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Importer vos Projets GitHub
            </h1>
            <p className="text-sm opacity-70 mt-1">
              {verifiedUsername
                ? `Connecté de façon certifiée avec votre profil GitHub @${verifiedUsername}. Cochez vos projets et appliquez-les à votre portfolio.`
                : `Authentifiez votre compte officiel GitHub via OAuth pour importer et certifier vos projets légitimes.`}
            </p>
          </div>

          {/* Connected Profile Status Card (Certifié OAuth) */}
          {verifiedUsername && (
            <div
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl border ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="relative">
                <img
                  src={verifiedAvatar || `https://github.com/${verifiedUsername}.png?size=80`}
                  alt={verifiedUsername}
                  className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://github.com/github.png';
                  }}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"
                  title="Connecté"
                />
              </div>

              <div className="text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs font-mono">@{verifiedUsername}</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                    isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Connecté</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleFetchRepos(verifiedUsername)}
                    disabled={isLoading}
                    className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RiRefreshLine className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Actualiser</span>
                  </button>
                  <span className="opacity-30">•</span>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isLoading}
                    className="text-[11px] text-rose-500 hover:text-rose-600 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RiLogoutBoxRLine className="w-3 h-3" />
                    <span>Dissocier</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Strict OAuth Authentication Panel - Clean & Minimal */}
        {!verifiedUsername && (
          <div
            className={`p-6 sm:p-8 rounded-2xl border text-center max-w-lg mx-auto space-y-4 ${
              isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
              isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
            }`}>
              <RiGithubFill className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Connecter votre compte GitHub
              </h2>
              <p className="text-xs opacity-70 max-w-sm mx-auto leading-relaxed">
                Synchronisez vos dépôts publics certifiés directement avec votre portfolio.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleLinkGitHubOAuth}
                disabled={isLinkingOAuth}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-zinc-900 hover:bg-black text-white'
                    : 'bg-white hover:bg-zinc-100 text-zinc-900'
                }`}
              >
                <RiGithubFill className="w-4 h-4" />
                <span>{isLinkingOAuth ? 'Connexion en cours...' : 'Connecter avec GitHub OAuth'}</span>
              </button>

              {openUserProfile && (
                <button
                  type="button"
                  onClick={() => openUserProfile()}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-lg font-medium text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isLight
                      ? 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      : 'border-zinc-700 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <RiUserSettingsLine className="w-3.5 h-3.5 opacity-70" />
                  <span>Gérer mon profil</span>
                </button>
              )}
            </div>

            <p className="text-[11px] opacity-50 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              Synchronisation directe et sécurisée via l'API officielle GitHub OAuth.
            </p>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-800' : 'bg-zinc-850 border-zinc-700 text-zinc-200'
          }`}>
            <RiCheckLine className="w-4 h-4 shrink-0 text-zinc-900 dark:text-white" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
            <RiInformationLine className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {currentPortfolioProjects.length > 0 && (
          <div className="space-y-4 pt-2">
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3"
              style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2.5">
                <RiFolder3Line className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Projets Actifs dans le Portfolio
                </h2>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                  isLight
                    ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                }`}>
                  {currentPortfolioProjects.length} projet{currentPortfolioProjects.length > 1 ? 's' : ''} en ligne
                </span>
              </div>
              <p className="text-xs opacity-60">
                Visible sur votre site public
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPortfolioProjects.map((proj, idx) => {
                const isRegenerating = regeneratingId === (proj.id || proj.title);
                return (
                  <div
                    key={proj.id || idx}
                    className={`rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${
                      isLight
                        ? 'bg-white border-zinc-200 shadow-xs hover:border-zinc-300'
                        : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Visual Banner Thumbnail */}
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-zinc-950 group">
                      {proj.image ? (
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800/60 text-zinc-400 text-xs">
                          Aucune image d'illustration
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900 backdrop-blur-md shadow-xs">
                          <RiCheckLine className="w-3 h-3" />
                          <span>Dans le portfolio</span>
                        </span>
                      </div>

                      {/* GitHub Link if available */}
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all shadow-xs"
                          title="Voir sur GitHub"
                        >
                          <RiExternalLinkLine className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* Regenerating Overlay */}
                      {isRegenerating && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-30 animate-in fade-in duration-150">
                          <RiRefreshLine className="w-6 h-6 animate-spin text-zinc-300" />
                          <span className="text-xs font-semibold tracking-wide">Conception du visuel...</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-base tracking-tight truncate" title={proj.title}>
                          {proj.title}
                        </h3>
                        <p className="text-xs opacity-70 line-clamp-2 mt-1 leading-relaxed">
                          {proj.description || 'Projet open-source certifié GitHub'}
                        </p>
                      </div>

                      {/* Tags */}
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.tags.slice(0, 4).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons Toolbar */}
                      <div
                        className="pt-3 border-t flex items-center gap-2"
                        style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                      >
                        {/* Button Refaire l'image */}
                        <button
                          type="button"
                          disabled={isRegenerating}
                          onClick={() => handleRegenerateImage(proj)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                            isLight
                              ? 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 border-zinc-200'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
                          }`}
                          title="Générer un nouveau visuel pour ce projet"
                        >
                          <RiRefreshLine className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                          <span>{isRegenerating ? 'Génération...' : 'Nouveau visuel'}</span>
                        </button>

                        {/* Button Supprimer */}
                        <button
                          type="button"
                          disabled={isRegenerating}
                          onClick={() => handleRemovePortfolioProject(proj)}
                          className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          title="Supprimer ce projet du portfolio"
                        >
                          <RiDeleteBin6Line className="w-3.5 h-3.5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: DÉPÔTS GITHUB DISPONIBLES À IMPORTER */}
        {repos.length > 0 && (
          <div className="space-y-4 pt-6 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <RiGithubFill className="w-5 h-5 opacity-70" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    Dépôts GitHub Disponibles à Importer
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {availableRepos.length} disponible{availableRepos.length > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs opacity-60 mt-0.5">
                  Sélectionnez les dépôts GitHub à intégrer à votre portfolio.
                </p>
              </div>

              {/* Search & Select All */}
              {availableRepos.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrer par nom ou techno..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs bg-transparent outline-none focus:border-zinc-900 dark:focus:border-white"
                      style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectAllAvailable(filteredAvailableRepos)}
                    className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    {selectedRepoIds.size === filteredAvailableRepos.length && filteredAvailableRepos.length > 0
                      ? 'Tout désélectionner'
                      : 'Tout sélectionner'}
                  </button>
                </div>
              )}
            </div>

            {/* Available Repositories Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border animate-pulse space-y-3"
                    style={{
                      backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                      borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="w-1/3 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="w-full h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                    <div className="w-2/3 h-4 bg-zinc-100 dark:bg-zinc-800/60 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredAvailableRepos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAvailableRepos.map((repo) => {
                  const isSelected = selectedRepoIds.has(repo.id);
                  return (
                    <div
                      key={repo.id}
                      onClick={() => handleToggleSelectAvailable(repo.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                        isSelected
                          ? isLight
                            ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50/70'
                            : 'border-white ring-1 ring-white bg-zinc-800/80'
                          : isLight
                          ? 'bg-white border-zinc-200 hover:border-zinc-300 shadow-xs'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top row: Checkbox, Name, External Link */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                                isSelected
                                  ? isLight
                                    ? 'bg-zinc-900 text-white'
                                    : 'bg-white text-zinc-900'
                                  : isLight
                                  ? 'border border-zinc-300 text-transparent'
                                  : 'border border-zinc-700 text-transparent'
                              }`}
                            >
                              <RiCheckLine className="w-3.5 h-3.5 stroke-3" />
                            </div>
                            <h3 className="font-bold text-base truncate tracking-tight group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                              {repo.name}
                            </h3>
                          </div>

                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded opacity-40 hover:opacity-100 hover:text-zinc-900 dark:hover:text-white transition-all"
                            title="Voir sur GitHub"
                          >
                            <RiExternalLinkLine className="w-4 h-4" />
                          </a>
                        </div>

                        {/* Description */}
                        <p className="text-xs leading-relaxed opacity-75 line-clamp-2">
                          {repo.description}
                        </p>
                      </div>

                      {/* Bottom Stats & Language */}
                      <div
                        className="flex items-center justify-between pt-4 mt-3 border-t text-xs opacity-60"
                        style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <span className="inline-flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                              <span className="w-2 h-2 rounded-full bg-zinc-500" />
                              {repo.language}
                            </span>
                          )}
                          {repo.stars > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <RiStarLine className="w-3.5 h-3.5 text-amber-400" />
                              {repo.stars}
                            </span>
                          )}
                          {repo.forks > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <RiGitForkLine className="w-3.5 h-3.5" />
                              {repo.forks}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-[10px]">
                          <RiTimeLine className="w-3.5 h-3.5" />
                          <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`p-8 text-center rounded-2xl border ${
                  isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <p className="text-xs opacity-75">
                  {searchQuery
                    ? 'Aucun dépôt ne correspond à votre recherche.'
                    : '🎉 Tous vos dépôts GitHub sont déjà intégrés dans votre portfolio !'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no repos at all */}
        {!isLoading && repos.length === 0 && (
          <div
            className={`p-10 text-center rounded-2xl border ${
              isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <RiGithubFill className="w-10 h-10 mx-auto mb-2.5 opacity-30" />
            <h3 className="font-semibold text-base mb-1">Aucun dépôt GitHub chargé</h3>
            <p className="text-xs opacity-60 max-w-sm mx-auto">
              Authentifiez votre compte officiel GitHub ci-dessus pour récupérer instantanément vos projets publics.
            </p>
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Bar for Selection & Apply */}
      {selectedRepoIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl animate-in slide-in-from-bottom duration-200">
          <div
            className={`p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isLight
                ? 'bg-white/95 border-zinc-200 shadow-zinc-900/10 text-zinc-900'
                : 'bg-zinc-900/95 border-zinc-800 shadow-black/80 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isLight ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-zinc-800 text-white border border-zinc-700'
              }`}>
                {selectedRepoIds.size}
              </div>
              <div className="text-xs">
                <span className="font-semibold block">
                  {selectedRepoIds.size} projet{selectedRepoIds.size > 1 ? 's' : ''} sélectionné{selectedRepoIds.size > 1 ? 's' : ''}
                </span>
                <span className="opacity-60 text-[11px]">Prêt pour l'intégration portfolio</span>
              </div>
            </div>

            {/* Toggle AI image generation */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={generateAiImages}
                  onChange={(e) => setGenerateAiImages(e.target.checked)}
                  className="rounded text-zinc-900 dark:text-white focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  Générer un visuel d'illustration
                </span>
              </label>

              <button
                type="button"
                disabled={isApplying}
                onClick={handleApplyToPortfolio}
                className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isLight
                    ? 'bg-zinc-900 hover:bg-black text-white shadow-xs'
                    : 'bg-white hover:bg-zinc-100 text-zinc-900 shadow-xs'
                }`}
              >
                {isApplying ? (
                  <>
                    <RiRefreshLine className="w-3.5 h-3.5 animate-spin" />
                    <span>{applyStep || 'Génération...'}</span>
                  </>
                ) : (
                  <>
                    <span>Appliquer au portfolio</span>
                    <RiArrowRightLine className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Generation Error Confirmation Modal */}
      {imageErrorPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl space-y-4 font-sans ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-900/10'
                : 'bg-zinc-900 border-zinc-800 text-white shadow-black/80'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <RiAlertLine className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">
                  {imageErrorPrompt.isRegeneration
                    ? "Impossible de créer le visuel"
                    : "Création du visuel non finalisée"}
                </h3>
                <p className="text-xs opacity-70">
                  {typeof imageErrorPrompt.error === 'string'
                    ? imageErrorPrompt.error
                    : (imageErrorPrompt.error?.message || "Le service d'image n'a pas pu générer le visuel.")}
                </p>
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              <div className="font-semibold text-xs">
                {imageErrorPrompt.project?.title || imageErrorPrompt.project?.name}
              </div>
              <p className="opacity-80">
                {imageErrorPrompt.isRegeneration
                  ? "Souhaitez-vous annuler ou choisir vous-même une image ?"
                  : "Souhaitez-vous annuler l'ajout de ce projet ou choisir une image vous-même ?"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setImageErrorPrompt(null);
                  setIsApplying(false);
                  setApplyStep('');
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {imageErrorPrompt.isRegeneration ? 'Annuler' : "Ignorer l'image"}
              </button>

              <button
                type="button"
                onClick={() => {
                  const promptData = imageErrorPrompt;
                  setImageErrorPrompt(null);
                  setPickerModalConfig({
                    isOpen: true,
                    currentImage: promptData.project?.image || '',
                    title: `Image pour : ${promptData.project?.title || promptData.project?.name}`,
                    promptData,
                  });
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight
                    ? 'bg-zinc-900 hover:bg-black text-white'
                    : 'bg-white hover:bg-zinc-100 text-zinc-900'
                }`}
              >
                <RiUploadCloud2Line className="w-3.5 h-3.5" />
                <span>Choisir une image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Image Picker Modal (Upload file / GitHub avatar / Direct URL) */}
      {pickerModalConfig && (
        <ImagePickerModal
          isOpen={pickerModalConfig.isOpen}
          onClose={handleClosePicker}
          currentImage={pickerModalConfig.currentImage}
          title={pickerModalConfig.title}
          onSave={handleManualImageSave}
        />
      )}
    </div>
  );
};
