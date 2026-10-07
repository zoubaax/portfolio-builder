import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { DEFAULT_SKILL_CATEGORIES } from '../../data/skillsCatalog';
import {
  RiCodeSSlashLine,
  RiServerLine,
  RiDatabase2Line,
  RiCloudLine,
  RiSmartphoneLine,
  RiBrainLine,
  RiToolsLine,
  RiStackLine,
  RiSearchLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiArrowRightLine,
  RiEyeLine,
  RiSparklingFill,
  RiInformationLine,
  RiFolderAddLine
} from 'react-icons/ri';

/**
 * Retourne l'icône appropriée pour une catégorie
 */
const getCategoryIcon = (categoryName = '', iconName = '') => {
  const norm = categoryName.toLowerCase();
  if (norm.includes('front') || iconName === 'Layout') return <RiCodeSSlashLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  if (norm.includes('back') || iconName === 'Server') return <RiServerLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  if (norm.includes('base') || norm.includes('data') || iconName === 'Database') return <RiDatabase2Line className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  if (norm.includes('devops') || norm.includes('cloud') || iconName === 'Cloud') return <RiCloudLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  if (norm.includes('mobile') || iconName === 'Smartphone') return <RiSmartphoneLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  if (norm.includes('ia') || norm.includes('ai') || norm.includes('ml') || iconName === 'Brain') return <RiBrainLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  if (norm.includes('outil') || norm.includes('tool') || iconName === 'Wrench') return <RiToolsLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
  return <RiStackLine className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />;
};

export const SkillsTab = ({ onApplyComplete }) => {
  const { portfolio, updateSection, setViewMode, studioTheme } = usePortfolio();
  const isLight = studioTheme === 'light';

  // Recherche textuelle pour filtrer les compétences
  const [searchQuery, setSearchQuery] = useState('');

  // Saisie pour une nouvelle catégorie sur-mesure
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Saisie locale pour l'ajout d'une compétence par catégorie : { [categoryName]: string }
  const [newSkillInputs, setNewSkillInputs] = useState({});

  // Récupérer ou initialiser la section 'skills' du portfolio
  const skillsSection = useMemo(() => {
    return portfolio.sections?.find((s) => s.type === 'skills') || null;
  }, [portfolio.sections]);

  // Catégories actuellement enregistrées dans le portfolio de l'utilisateur
  const portfolioCategories = useMemo(() => {
    return skillsSection?.data?.categories || [];
  }, [skillsSection]);

  // Ensemble des noms de catégories par défaut normalisés
  const defaultCategoryNames = useMemo(() => {
    return new Set(DEFAULT_SKILL_CATEGORIES.map((c) => c.name.toLowerCase()));
  }, []);

  /**
   * Fusionner le catalogue de référence avec les catégories et compétences du portfolio de l'utilisateur.
   * Garantit l'isolation multi-tenant : les catégories/compétences personnelles viennent uniquement du portfolio de l'utilisateur.
   */
  const mergedCategories = useMemo(() => {
    const list = [];

    // 1. Ajouter les catégories standard du catalogue
    DEFAULT_SKILL_CATEGORIES.forEach((defCat) => {
      // Trouver si l'utilisateur a cette catégorie dans son portfolio
      const matchedPortfolioCat = portfolioCategories.find(
        (pc) => (pc.name || pc.label || '').toLowerCase() === defCat.name.toLowerCase()
      );

      const activeSkillsInPortfolio = new Set(matchedPortfolioCat?.skills || matchedPortfolioCat?.items || []);

      // Compétences personnalisées ajoutées par cet utilisateur à cette catégorie
      const customSkillsForCat = Array.from(activeSkillsInPortfolio).filter(
        (s) => !defCat.skills.some((ds) => ds.toLowerCase() === s.toLowerCase())
      );

      // Fusionner toutes les compétences disponibles pour cette catégorie
      const allSkills = [
        ...defCat.skills,
        ...customSkillsForCat,
      ];

      list.push({
        id: defCat.id,
        name: defCat.name,
        iconName: defCat.iconName,
        description: defCat.description,
        isCustomCategory: false,
        allSkills,
        activeSkills: activeSkillsInPortfolio,
        customSkills: new Set(customSkillsForCat),
      });
    });

    // 2. Ajouter les catégories entièrement personnalisées créées par l'utilisateur
    portfolioCategories.forEach((pCat) => {
      const pCatName = pCat.name || pCat.label || '';
      if (!pCatName || defaultCategoryNames.has(pCatName.toLowerCase())) {
        return; // Déjà traitée dans les catégories standard
      }

      const activeSkills = new Set(pCat.skills || pCat.items || []);

      list.push({
        id: `custom-${pCatName.toLowerCase().replace(/\s+/g, '-')}`,
        name: pCatName,
        iconName: 'Custom',
        description: 'Catégorie personnalisée',
        isCustomCategory: true,
        allSkills: Array.from(activeSkills),
        activeSkills,
        customSkills: activeSkills,
      });
    });

    return list;
  }, [portfolioCategories, defaultCategoryNames]);

  /**
   * Calcul du nombre total de compétences actives
   */
  const totalActiveSkillsCount = useMemo(() => {
    return portfolioCategories.reduce((acc, cat) => {
      const list = cat.skills || cat.items || [];
      return acc + list.length;
    }, 0);
  }, [portfolioCategories]);

  /**
   * Filtrage par recherche
   */
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return mergedCategories;
    const q = searchQuery.toLowerCase().trim();

    return mergedCategories
      .map((cat) => {
        const matchesCategory = cat.name.toLowerCase().includes(q);
        const matchingSkills = cat.allSkills.filter((s) => s.toLowerCase().includes(q));

        if (matchesCategory) {
          return cat;
        }

        if (matchingSkills.length > 0) {
          return {
            ...cat,
            allSkills: matchingSkills,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [mergedCategories, searchQuery]);

  /**
   * Met à jour la liste des catégories de la section 'skills' du portfolio
   */
  const syncCategoriesToPortfolio = (newCategories) => {
    if (!skillsSection) {
      console.warn("Section skills non trouvée dans le portfolio.");
      return;
    }

    updateSection(skillsSection.id, (currentData) => {
      return {
        ...currentData,
        categories: newCategories,
      };
    });
  };

  /**
   * Basculer l'état d'une compétence (l'activer ou la retirer du portfolio)
   */
  const handleToggleSkill = (categoryName, skillName) => {
    const currentCats = [...portfolioCategories];
    const catIndex = currentCats.findIndex(
      (c) => (c.name || c.label || '').toLowerCase() === categoryName.toLowerCase()
    );

    if (catIndex >= 0) {
      const existingCat = currentCats[catIndex];
      const existingSkills = existingCat.skills || existingCat.items || [];
      const isAlreadyActive = existingSkills.some(
        (s) => s.toLowerCase() === skillName.toLowerCase()
      );

      let updatedSkills;
      if (isAlreadyActive) {
        // Retirer la compétence
        updatedSkills = existingSkills.filter(
          (s) => s.toLowerCase() !== skillName.toLowerCase()
        );
      } else {
        // Ajouter la compétence
        updatedSkills = [...existingSkills, skillName];
      }

      currentCats[catIndex] = {
        ...existingCat,
        name: existingCat.name || existingCat.label || categoryName,
        skills: updatedSkills,
      };
    } else {
      // La catégorie n'était pas encore présente dans le portfolio, la créer avec cette compétence
      currentCats.push({
        name: categoryName,
        skills: [skillName],
      });
    }

    syncCategoriesToPortfolio(currentCats);
  };

  /**
   * Ajouter une compétence personnalisée dans une catégorie
   */
  const handleAddCustomSkill = (categoryName) => {
    const rawVal = newSkillInputs[categoryName] || '';
    const cleanSkill = rawVal.trim();
    if (!cleanSkill) return;

    const currentCats = [...portfolioCategories];
    const catIndex = currentCats.findIndex(
      (c) => (c.name || c.label || '').toLowerCase() === categoryName.toLowerCase()
    );

    if (catIndex >= 0) {
      const existingCat = currentCats[catIndex];
      const existingSkills = existingCat.skills || existingCat.items || [];
      const alreadyExists = existingSkills.some(
        (s) => s.toLowerCase() === cleanSkill.toLowerCase()
      );

      if (!alreadyExists) {
        currentCats[catIndex] = {
          ...existingCat,
          name: existingCat.name || existingCat.label || categoryName,
          skills: [...existingSkills, cleanSkill],
        };
      }
    } else {
      currentCats.push({
        name: categoryName,
        skills: [cleanSkill],
      });
    }

    syncCategoriesToPortfolio(currentCats);

    // Réinitialiser le champ de saisie
    setNewSkillInputs((prev) => ({
      ...prev,
      [categoryName]: '',
    }));
  };

  /**
   * Supprimer définitivement une compétence personnalisée du portfolio
   */
  const handleDeleteCustomSkill = (categoryName, skillName, e) => {
    e.stopPropagation();
    const currentCats = [...portfolioCategories];
    const catIndex = currentCats.findIndex(
      (c) => (c.name || c.label || '').toLowerCase() === categoryName.toLowerCase()
    );

    if (catIndex >= 0) {
      const existingCat = currentCats[catIndex];
      const existingSkills = existingCat.skills || existingCat.items || [];
      const updatedSkills = existingSkills.filter(
        (s) => s.toLowerCase() !== skillName.toLowerCase()
      );

      currentCats[catIndex] = {
        ...existingCat,
        skills: updatedSkills,
      };

      syncCategoriesToPortfolio(currentCats);
    }
  };

  /**
   * Créer une nouvelle catégorie personnalisée
   */
  const handleCreateNewCategory = (e) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    const exists = portfolioCategories.some(
      (c) => (c.name || c.label || '').toLowerCase() === cleanName.toLowerCase()
    );

    if (!exists) {
      const currentCats = [
        ...portfolioCategories,
        {
          name: cleanName,
          skills: [],
        },
      ];
      syncCategoriesToPortfolio(currentCats);
    }

    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  /**
   * Supprimer une catégorie personnalisée
   */
  const handleDeleteCategory = (categoryName) => {
    const currentCats = portfolioCategories.filter(
      (c) => (c.name || c.label || '').toLowerCase() !== categoryName.toLowerCase()
    );
    syncCategoriesToPortfolio(currentCats);
  };

  return (
    <div
      className={`h-full w-full overflow-y-auto p-6 md:p-8 transition-colors ${
        isLight ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-zinc-100'
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6 pb-28">
        
        {/* En-tête : Titre, Explication et Bouton Nouvelle Catégorie */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
          style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium mb-2 border ${
                isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
            >
              <RiStackLine className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>Gestionnaire de Compétences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Compétences & Technologies
            </h1>
            <p className="text-sm opacity-70 mt-1">
              Activez les technologies de votre stack en 1 clic ou ajoutez vos propres compétences et catégories personnalisées.
            </p>
          </div>

          {/* Badge Compteur & Bouton Nouvelle Catégorie */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-2 ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-800' : 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                <strong>{totalActiveSkillsCount}</strong> active{totalActiveSkillsCount > 1 ? 's' : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                isLight
                  ? 'bg-zinc-900 hover:bg-black text-white border-zinc-900 shadow-xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-900 border-white shadow-xs'
              }`}
            >
              <RiAddLine className="w-4 h-4" />
              <span>Nouvelle Catégorie</span>
            </button>
          </div>
        </div>

        {/* Modal / Formulaire d'ajout de nouvelle catégorie personnalisée */}
        {isAddingCategory && (
          <form
            onSubmit={handleCreateNewCategory}
            className={`p-4 rounded-2xl border space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 ${
              isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-800/90 border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <RiFolderAddLine className="w-4 h-4" />
                <span>Créer une catégorie personnalisée</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Ex: Cybersécurité, Blockchain, Design UI/UX..."
                autoFocus
                className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none transition-all ${
                  isLight
                    ? 'bg-white border-zinc-300 focus:border-zinc-900 text-zinc-900'
                    : 'bg-zinc-900 border-zinc-700 focus:border-white text-zinc-100'
                }`}
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                    isLight ? 'bg-zinc-900 hover:bg-black text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900'
                  }`}
                >
                  Créer la catégorie
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border cursor-pointer ${
                    isLight ? 'border-zinc-300 text-zinc-600 hover:bg-zinc-100' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  Annuler
                </button>
              </div>
            </div>
            <p className="text-[11px] opacity-60">
              Cette catégorie sera enregistrée exclusivement sur votre portfolio.
            </p>
          </form>
        )}

        {/* Barre de Recherche Rapide */}
        <div className="relative">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une technologie parmi toutes les catégories (ex: React, Docker, Python)..."
            className={`w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border outline-none transition-all ${
              isLight
                ? 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400'
                : 'bg-zinc-800/60 border-zinc-700 focus:bg-zinc-800 focus:border-white text-zinc-100 placeholder:text-zinc-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Grille des Catégories de Compétences */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCategories.map((cat) => {
              const activeCount = cat.allSkills.filter((s) => cat.activeSkills.has(s)).length;
              const inputVal = newSkillInputs[cat.name] || '';

              return (
                <div
                  key={cat.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                    isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  {/* En-tête de la carte */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                            isLight
                              ? 'bg-zinc-100 border-zinc-200 text-zinc-800'
                              : 'bg-zinc-800 border-zinc-700 text-zinc-200'
                          }`}
                        >
                          {getCategoryIcon(cat.name, cat.iconName)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                            <span>{cat.name}</span>
                            {cat.isCustomCategory && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                Personnel
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] opacity-60">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      {/* Badge sélection & Option suppression si catégorie perso */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                            activeCount > 0
                              ? isLight
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-white text-zinc-900 border-white font-bold'
                              : isLight
                              ? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          }`}
                        >
                          {activeCount} active{activeCount > 1 ? 's' : ''}
                        </span>

                        {cat.isCustomCategory && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.name)}
                            className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Supprimer cette catégorie"
                          >
                            <RiDeleteBin6Line className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Puces de compétences */}
                  <div className="flex flex-wrap gap-1.5 min-h-12 items-start content-start">
                    {cat.allSkills.map((skill) => {
                      const isActive = cat.activeSkills.has(skill);
                      const isCustomSkill = cat.customSkills.has(skill);

                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleToggleSkill(cat.name, skill)}
                          className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer select-none border ${
                            isActive
                              ? isLight
                                ? 'bg-zinc-900 hover:bg-black text-white border-zinc-900 font-medium shadow-xs'
                                : 'bg-white hover:bg-zinc-100 text-zinc-900 border-white font-semibold shadow-xs'
                              : isLight
                              ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                              : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                          }`}
                        >
                          {isActive && <RiCheckLine className="w-3 h-3 stroke-2" />}
                          <span>{skill}</span>

                          {/* Bouton pour supprimer une compétence personnalisée */}
                          {isCustomSkill && (
                            <span
                              onClick={(e) => handleDeleteCustomSkill(cat.name, skill, e)}
                              className={`ml-0.5 p-0.5 rounded transition-opacity opacity-60 hover:opacity-100 ${
                                isActive
                                  ? 'hover:bg-white/20 text-white'
                                  : 'hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-500'
                              }`}
                              title="Retirer cette compétence personnalisée"
                            >
                              <RiCloseLine className="w-3 h-3" />
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {cat.allSkills.length === 0 && (
                      <p className="text-xs opacity-50 italic py-2">
                        Aucune compétence dans cette catégorie. Ajoutez-en une ci-dessous.
                      </p>
                    )}
                  </div>

                  {/* Formulaire d'ajout rapide sous chaque catégorie */}
                  <div className="pt-3 border-t" style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddCustomSkill(cat.name);
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={inputVal}
                        onChange={(e) =>
                          setNewSkillInputs((prev) => ({
                            ...prev,
                            [cat.name]: e.target.value,
                          }))
                        }
                        placeholder={`+ Ajouter une compétence à ${cat.name}...`}
                        className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                          isLight
                            ? 'bg-zinc-50 border-zinc-200 focus:bg-white focus:border-zinc-900 text-zinc-900 placeholder:text-zinc-400'
                            : 'bg-zinc-800 border-zinc-700 focus:border-white text-zinc-100 placeholder:text-zinc-500'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={!inputVal.trim()}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-40 ${
                          isLight
                            ? 'bg-zinc-900 hover:bg-black text-white'
                            : 'bg-white hover:bg-zinc-100 text-zinc-900'
                        }`}
                      >
                        Ajouter
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`p-12 text-center rounded-2xl border ${
              isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'
            }`}
          >
            <RiInformationLine className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <h4 className="font-semibold text-sm mb-1">Aucune compétence trouvée</h4>
            <p className="text-xs opacity-60 max-w-sm mx-auto mb-3">
              Aucune technologie ne correspond à "{searchQuery}". Vous pouvez la créer directement via le bouton ci-dessous.
            </p>
            <button
              type="button"
              onClick={() => setIsAddingCategory(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
              }`}
            >
              Créer une nouvelle catégorie
            </button>
          </div>
        )}
      </div>

      {/* Barre Flottante Inférieure : Résumé & Retour Aperçu */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-xl animate-in slide-in-from-bottom duration-200">
        <div
          className={`p-3 rounded-2xl border shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 ${
            isLight
              ? 'bg-white/95 border-zinc-200 shadow-zinc-900/10 text-zinc-900'
              : 'bg-zinc-900/95 border-zinc-800 shadow-black/80 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs border ${
                isLight ? 'bg-zinc-100 text-zinc-900 border-zinc-200' : 'bg-zinc-800 text-white border-zinc-700'
              }`}
            >
              {totalActiveSkillsCount}
            </div>
            <div className="text-xs">
              <span className="font-semibold block">
                {totalActiveSkillsCount} compétence{totalActiveSkillsCount > 1 ? 's' : ''} active{totalActiveSkillsCount > 1 ? 's' : ''}
              </span>
              <span className="opacity-60 text-[11px]">Enregistrement automatique au portfolio</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onApplyComplete) onApplyComplete();
              else setViewMode('preview');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isLight ? 'bg-zinc-900 hover:bg-black text-white' : 'bg-white hover:bg-zinc-100 text-zinc-900'
            }`}
          >
            <RiEyeLine className="w-3.5 h-3.5" />
            <span>Voir l'Aperçu</span>
            <RiArrowRightLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
