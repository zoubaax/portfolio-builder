import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  fetchUserRepos,
  fetchRepoReadme,
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
} from 'react-icons/ri';

export const GithubProjectsTab = ({ onApplyComplete }) => {
  const { user } = useUser();
  const { sendMessage, setViewMode, studioTheme, portfolio } = usePortfolio();
  const isLight = studioTheme === 'light';

  // Extract GitHub username from Clerk externalAccounts if logged in via GitHub
  const clerkGitHubAccount = user?.externalAccounts?.find(
    (acc) => acc.provider === 'oauth_github' || acc.verification?.strategy === 'oauth_github'
  );

  const [usernameInput, setUsernameInput] = useState(clerkGitHubAccount?.username || '');
  const [activeUsername, setActiveUsername] = useState(clerkGitHubAccount?.username || '');
  const [repos, setRepos] = useState([]);
  const [selectedRepoIds, setSelectedRepoIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generation options
  const [generateAiImages, setGenerateAiImages] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStep, setApplyStep] = useState('');

  // Initial fetch if username detected from Clerk
  useEffect(() => {
    if (clerkGitHubAccount?.username) {
      handleFetchRepos(clerkGitHubAccount.username);
    }
  }, [clerkGitHubAccount?.username]);

  const handleFetchRepos = async (userToFetch) => {
    const cleanUser = parseGitHubUsername(userToFetch);
    if (!cleanUser) {
      setError('Veuillez renseigner un pseudo ou lien de profil GitHub valide.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedRepoIds(new Set());

    try {
      const data = await fetchUserRepos(cleanUser);
      setRepos(data);
      setActiveUsername(cleanUser);
    } catch (err) {
      setError(err.message || 'Impossible de récupérer les dépôts.');
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (repoId) => {
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

  const handleSelectAllFiltered = (filteredList) => {
    if (selectedRepoIds.size === filteredList.length) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(filteredList.map((r) => r.id)));
    }
  };

  // Filtered repositories based on search
  const filteredRepos = repos.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q)) ||
      (r.topics && r.topics.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // Action: Apply selected projects to portfolio
  const handleApplyToPortfolio = async () => {
    const selectedList = repos.filter((r) => selectedRepoIds.has(r.id));
    if (selectedList.length === 0) return;

    setIsApplying(true);
    setApplyStep('Lecture des READMEs et extraction des fonctionnalités...');

    try {
      // 1. Fetch README snippets in parallel
      const enrichedProjects = await Promise.all(
        selectedList.map(async (repo) => {
          const readmeSnippet = await fetchRepoReadme(repo.owner, repo.name);
          return {
            ...repo,
            readmeSnippet,
          };
        })
      );

      // 2. Generate or assign images
      let projectImages = {};
      if (generateAiImages) {
        setApplyStep('Génération des mockups avec FLUX.1-schnell...');
        for (const proj of enrichedProjects) {
          const tags = [proj.language, ...(proj.topics || [])].filter(Boolean);
          const imgUrl = await generateProjectImageAi({
            title: proj.name,
            description: proj.readmeSnippet || proj.description,
            tags,
          });
          projectImages[proj.name] = imgUrl;
        }
      }

      // 3. Construct structured prompt for AI Copilot
      setApplyStep('Mise à jour de la section Projets via l\'IA...');

      const projectsPromptList = enrichedProjects
        .map((p, idx) => {
          const tech = [p.language, ...(p.topics || [])].filter(Boolean).join(', ');
          const img = projectImages[p.name] ? `\n- Image: ${projectImages[p.name]}` : '';
          return `${idx + 1}. **${p.name}**\n- Description: ${p.description}\n- Technologies: ${tech || 'Modern Web'}\n- GitHub: ${p.url}${p.homepage ? `\n- Demo: ${p.homepage}` : ''}${p.readmeSnippet ? `\n- Résumé README: ${p.readmeSnippet}` : ''}${img}`;
        })
        .join('\n\n');

      const fullPrompt = `Met à jour et enrichis la section Projets de mon portfolio avec mes vrais projets GitHub sélectionnés ci-dessous. 
Pour chaque projet, crée un titre accrocheur, une description percutante basée sur les détails, les bons tags technologiques, et conserve les liens GitHub et démo fournis.

Voici mes projets GitHub :
${projectsPromptList}

Génère une présentation professionnelle de haut niveau pour chacun de ces projets.`;

      // 4. Send to Copilot and switch back to preview
      await sendMessage(fullPrompt);

      if (onApplyComplete) {
        onApplyComplete();
      } else {
        setViewMode('preview');
      }
    } catch (err) {
      console.error('Error applying projects:', err);
      setError('Erreur lors de l\'intégration des projets. Veuillez réessayer.');
    } finally {
      setIsApplying(false);
      setApplyStep('');
    }
  };

  return (
    <div
      className={`h-full w-full overflow-y-auto p-6 md:p-8 transition-colors ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#090b10] text-slate-100'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-24">
        {/* Header Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
             style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <RiGithubFill className="w-4 h-4" />
              <span>Import GitHub & AI Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Importer vos Projets GitHub
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Connectez votre profil, cochez vos meilleurs dépôts et laissez l'IA générer des descriptions percutantes et des mockups visuels (FLUX.1-schnell).
            </p>
          </div>

          {/* Connected Profile Pill if known */}
          {activeUsername && (
            <div
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'
              }`}
            >
              <img
                src={`https://github.com/${activeUsername}.png?size=80`}
                alt={activeUsername}
                className="w-8 h-8 rounded-full border border-indigo-500/30"
                onError={(e) => {
                  e.target.src = 'https://github.com/github.png';
                }}
              />
              <div className="text-xs">
                <span className="block opacity-60">Compte actif</span>
                <span className="font-bold font-mono text-indigo-400">@{activeUsername}</span>
              </div>
            </div>
          )}
        </div>

        {/* Username Input / Change Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleFetchRepos(usernameInput);
          }}
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-3 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#10141f] border-white/10'
          }`}
        >
          <div className="relative flex-1 w-full">
            <RiGithubFill className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Entrez votre pseudo GitHub ou l'URL (ex: aminenahli ou https://github.com/...)"
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-transparent border text-sm outline-none transition-all focus:border-indigo-500"
              style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !usernameInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            {isLoading ? (
              <>
                <RiRefreshLine className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <RiRefreshLine className="w-4 h-4" />
                <span>Synchroniser les Dépôts</span>
              </>
            )}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <RiInformationLine className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Controls Bar: Search & Select All */}
        {repos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-72">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer par nom ou techno..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs bg-transparent outline-none focus:border-indigo-500"
                style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs opacity-60">
                {repos.length} dépôt{repos.length > 1 ? 's' : ''} trouvé{repos.length > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => handleSelectAllFiltered(filteredRepos)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {selectedRepoIds.size === filteredRepos.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
          </div>
        )}

        {/* Repositories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border animate-pulse space-y-3"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)',
                  borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.06)',
                }}
              >
                <div className="w-1/3 h-5 bg-indigo-500/20 rounded" />
                <div className="w-full h-4 bg-white/10 rounded" />
                <div className="w-2/3 h-4 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : repos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => {
              const isSelected = selectedRepoIds.has(repo.id);
              return (
                <div
                  key={repo.id}
                  onClick={() => handleToggleSelect(repo.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                      : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      : 'bg-[#10141f] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top row: Checkbox, Name, External Link */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : isLight
                              ? 'border border-slate-300 text-transparent'
                              : 'border border-white/20 text-transparent'
                          }`}
                        >
                          <RiCheckLine className="w-3.5 h-3.5 stroke-3" />
                        </div>
                        <h3 className="font-bold text-base truncate tracking-tight group-hover:text-indigo-400 transition-colors">
                          {repo.name}
                        </h3>
                      </div>

                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded opacity-40 hover:opacity-100 hover:text-indigo-400 transition-all"
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
                  <div className="flex items-center justify-between pt-4 mt-3 border-t text-xs opacity-60"
                       style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3">
                      {repo.language && (
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-400">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
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
                      <RiTimeLine className="w-3 h-3" />
                      <span>{new Date(repo.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && (
            <div
              className={`p-12 text-center rounded-3xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#10141f] border-white/10'
              }`}
            >
              <RiGithubFill className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
              <h3 className="font-bold text-lg mb-1">Aucun dépôt GitHub chargé</h3>
              <p className="text-xs opacity-60 max-w-sm mx-auto">
                Indiquez votre pseudo GitHub ci-dessus pour récupérer instantanément vos projets publics.
              </p>
            </div>
          )
        )}
      </div>

      {/* Floating Sticky Bottom Bar for Selection & Apply */}
      {selectedRepoIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl animate-in slide-in-from-bottom duration-200">
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isLight
                ? 'bg-white/95 border-slate-300 shadow-slate-900/20 text-slate-800'
                : 'bg-[#10141f]/95 border-white/20 shadow-black/80 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                {selectedRepoIds.size}
              </div>
              <div className="text-xs">
                <span className="font-bold block">
                  {selectedRepoIds.size} projet{selectedRepoIds.size > 1 ? 's' : ''} sélectionné{selectedRepoIds.size > 1 ? 's' : ''}
                </span>
                <span className="opacity-60">Prêt pour l'intégration portfolio</span>
              </div>
            </div>

            {/* Toggle AI image generation */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={generateAiImages}
                  onChange={(e) => setGenerateAiImages(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <RiSparkling2Fill className="w-3.5 h-3.5 text-amber-400" />
                  <span>Images IA (FLUX.1-schnell)</span>
                </span>
              </label>

              <button
                type="button"
                disabled={isApplying}
                onClick={handleApplyToPortfolio}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isApplying ? (
                  <>
                    <RiRefreshLine className="w-4 h-4 animate-spin" />
                    <span>{applyStep || 'Génération...'}</span>
                  </>
                ) : (
                  <>
                    <span>Appliquer au Portfolio</span>
                    <RiArrowRightLine className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
