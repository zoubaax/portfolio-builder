import React, { useState, useMemo } from 'react';
import {
  RiPaletteLine,
  RiCheckLine,
  RiArrowRightLine,
  RiSparkling2Fill,
  RiContrastLine,
  RiShieldCheckLine,
  RiArrowDownSLine
} from 'react-icons/ri';
import { getLuminance, generateCustomSubPalettes } from '../../data/colorPalettes';

export const ColorPaletteCard = ({
  messageId,
  originalPrompt,
  detectedRole,
  questionMessage,
  palettes = [],
  isResolved = false,
  selectedPaletteData = null,
  onConfirm,
  onSkip,
}) => {
  const [selectedBaseId, setSelectedBaseId] = useState(() => palettes[0]?.id || 'palette-dark-tech');
  const [selectedSubId, setSelectedSubId] = useState(() => palettes[0]?.subOptions?.[0]?.id || 'sub-0');
  
  // Custom Color State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customBg, setCustomBg] = useState('#09090b');
  const [customAccent, setCustomAccent] = useState('#06b6d4');
  const [customSubId, setCustomSubId] = useState('custom-cyan');

  // Currently selected base palette
  const activeBase = useMemo(() => {
    if (isCustomMode) {
      const lum = getLuminance(customBg);
      const isDark = lum <= 0.45;
      const subPalettes = generateCustomSubPalettes(customBg);
      return {
        id: 'custom',
        name: 'Couleur Personnalisée',
        description: 'Harmonie calculée sur mesure selon votre couleur d’arrière-plan.',
        bg: customBg,
        surface: isDark ? '#18181b' : '#ffffff',
        isDark,
        subOptions: subPalettes,
      };
    }
    return palettes.find((p) => p.id === selectedBaseId) || palettes[0] || null;
  }, [palettes, selectedBaseId, isCustomMode, customBg]);

  // Currently selected sub-option
  const activeSub = useMemo(() => {
    if (!activeBase) return null;
    if (isCustomMode) {
      return activeBase.subOptions.find((s) => s.id === customSubId) || activeBase.subOptions[0];
    }
    return activeBase.subOptions.find((s) => s.id === selectedSubId) || activeBase.subOptions[0];
  }, [activeBase, selectedSubId, isCustomMode, customSubId]);

  // Handle Base Color Selection
  const handleSelectBase = (palette) => {
    setIsCustomMode(false);
    setSelectedBaseId(palette.id);
    if (palette.subOptions?.length > 0) {
      setSelectedSubId(palette.subOptions[0].id);
    }
  };

  const handleSelectCustom = () => {
    setIsCustomMode(true);
    const customSubs = generateCustomSubPalettes(customBg);
    if (customSubs.length > 0) {
      setCustomSubId(customSubs[0].id);
    }
  };

  const handleConfirm = () => {
    if (!activeBase || !activeSub) return;
    const resolvedPalette = {
      baseId: activeBase.id,
      baseName: activeBase.name,
      subName: activeSub.name,
      bg: activeBase.bg,
      surface: activeBase.surface,
      isDark: activeBase.isDark,
      textPrimary: activeSub.textPrimary,
      textSecondary: activeSub.textSecondary,
      accent: isCustomMode && customAccent ? customAccent : activeSub.accent,
      accentHover: activeSub.accentHover || activeSub.accent,
      accentGlow: activeSub.accentGlow || 'rgba(59, 130, 246, 0.25)',
      border: activeSub.border || 'rgba(255, 255, 255, 0.1)',
    };
    onConfirm?.(resolvedPalette);
  };

  // If already resolved, display a compact confirmed badge
  if (isResolved && selectedPaletteData) {
    return (
      <div className="mt-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs animate-in fade-in duration-200">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <RiCheckLine className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="font-medium text-zinc-900">
              Palette validée : <span className="font-semibold">{selectedPaletteData.baseName}</span> ({selectedPaletteData.subName})
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: selectedPaletteData.bg }} />
                Fond {selectedPaletteData.bg}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: selectedPaletteData.textPrimary }} />
                Texte {selectedPaletteData.textPrimary}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" style={{ backgroundColor: selectedPaletteData.accent }} />
                Accent {selectedPaletteData.accent}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm text-zinc-900 space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <RiPaletteLine className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-zinc-900">
              Harmonies de Couleurs Suggérées par l'IA
            </h4>
            {detectedRole && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                {detectedRole}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-600 leading-relaxed mt-1">
            {questionMessage || "Pour concevoir un portfolio qui vous ressemble, quelle direction chromatique préférez-vous ?"}
          </p>
        </div>
      </div>

      {/* 1. Base Colors List */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
          1. Sélectionnez une ambiance de base :
        </label>

        <div className="space-y-1.5">
          {palettes.map((palette) => {
            const isSelected = !isCustomMode && selectedBaseId === palette.id;
            return (
              <div
                key={palette.id}
                onClick={() => handleSelectBase(palette)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-50 shadow-xs'
                    : 'border-zinc-100 hover:border-zinc-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Radio indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-300 bg-white'
                      }`}
                    >
                      {isSelected && <RiCheckLine className="w-2.5 h-2.5" />}
                    </div>

                    {/* Color Swatch Dot */}
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs shrink-0"
                      style={{ backgroundColor: palette.bg }}
                    />

                    <div>
                      <span className="text-xs font-medium text-zinc-800">{palette.name}</span>
                      <p className="text-[10px] text-zinc-500 leading-snug">{palette.description}</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono">
                    {palette.isDark ? 'Sombre' : 'Clair'}
                  </span>
                </div>

                {/* DYNAMIC UNFOLDED SUB-LIST UNDER SELECTED BASE COLOR */}
                {isSelected && palette.subOptions?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-zinc-200/60 pl-6 space-y-2 animate-in fade-in duration-150">
                    <p className="text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                      <RiContrastLine className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Nuances de texte & accents adaptées (Contraste garanti) :</span>
                    </p>

                    <div className="space-y-1.5">
                      {palette.subOptions.map((sub) => {
                        const isSubSelected = selectedSubId === sub.id;
                        return (
                          <div
                            key={sub.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubId(sub.id);
                            }}
                            className={`p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                              isSubSelected
                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                                : 'border-zinc-100 hover:border-zinc-200 bg-white text-zinc-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSubSelected
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-zinc-300 bg-white'
                                }`}
                              >
                                {isSubSelected && <RiCheckLine className="w-2 h-2" />}
                              </div>
                              <span className="text-[11px]">{sub.name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Swatch Mini Badge */}
                              <div
                                className="px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border border-black/10"
                                style={{ backgroundColor: palette.bg, color: sub.textPrimary }}
                              >
                                <span>Aa</span>
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: sub.accent }}
                                />
                              </div>

                              <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                                {sub.badge}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Option: Custom Color */}
          <div
            onClick={handleSelectCustom}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isCustomMode
                ? 'border-zinc-900 bg-zinc-50 shadow-xs'
                : 'border-zinc-100 hover:border-zinc-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isCustomMode
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-300 bg-white'
                  }`}
                >
                  {isCustomMode && <RiCheckLine className="w-2.5 h-2.5" />}
                </div>

                <div
                  className="w-4 h-4 rounded-full border border-zinc-300 shrink-0"
                  style={{ backgroundColor: customBg }}
                />

                <div>
                  <span className="text-xs font-medium text-zinc-800">Ajouter une autre couleur personnalisée</span>
                  <p className="text-[10px] text-zinc-500">Définissez votre propre hexadécimal avec contraste calculé</p>
                </div>
              </div>

              <span className="text-[10px] text-zinc-400 font-mono">Personnalisé</span>
            </div>

            {/* DYNAMIC CUSTOM COLOR PICKER */}
            {isCustomMode && (
              <div className="mt-3 pt-3 border-t border-zinc-200/60 pl-6 space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-medium block mb-1">
                      Couleur d'arrière-plan :
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-7 h-7 rounded border border-zinc-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={customBg}
                        onChange={(e) => setCustomBg(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono rounded border border-zinc-200 bg-white text-zinc-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-500 font-medium block mb-1">
                      Couleur d'accentuation :
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-7 h-7 rounded border border-zinc-200 cursor-pointer p-0"
                      />
                      <input
                        type="text"
                        value={customAccent}
                        onChange={(e) => setCustomAccent(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-mono rounded border border-zinc-200 bg-white text-zinc-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Contrast Harmony Options for Custom */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-zinc-700 flex items-center gap-1.5">
                    <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contraste texte calculé automatiquement :</span>
                  </p>
                  {generateCustomSubPalettes(customBg).map((sub) => {
                    const isSelected = customSubId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomSubId(sub.id);
                        }}
                        className={`p-2 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                            : 'border-zinc-100 hover:border-zinc-200 bg-white text-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-zinc-300 bg-white'
                            }`}
                          >
                            {isSelected && <RiCheckLine className="w-2 h-2" />}
                          </div>
                          <span className="text-[11px]">{sub.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border border-black/10"
                            style={{ backgroundColor: customBg, color: sub.textPrimary }}
                          >
                            <span>Aa</span>
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: customAccent }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Live Mini Preview */}
      {activeBase && activeSub && (
        <div className="p-3 rounded-xl border border-zinc-200/80 space-y-2 bg-zinc-50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Aperçu en Direct :
            </span>
            <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
              <RiShieldCheckLine className="w-3 h-3" />
              <span>Contraste Sécurisé</span>
            </span>
          </div>

          <div
            className="p-3 rounded-lg border transition-colors shadow-xs"
            style={{
              backgroundColor: activeBase.bg,
              borderColor: activeSub.border || 'rgba(0,0,0,0.1)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold truncate"
                style={{ color: activeSub.textPrimary }}
              >
                {detectedRole || 'Portfolio Professionnel'}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: isCustomMode ? customAccent : activeSub.accent,
                  color: activeBase.isDark ? '#000000' : '#ffffff',
                }}
              >
                Disponible
              </span>
            </div>
            <p
              className="text-[11px] line-clamp-2 leading-relaxed"
              style={{ color: activeSub.textSecondary }}
            >
              Building high-throughput scalable distributed architectures and reactive design systems.
            </p>
          </div>
        </div>
      )}

      {/* 3. Action Buttons */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-zinc-500 hover:text-zinc-800 underline transition-colors cursor-pointer py-1"
        >
          Ignorer et utiliser le thème par défaut
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-black text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <RiSparkling2Fill className="w-3.5 h-3.5 text-amber-400" />
          <span>Valider et Générer le Portfolio</span>
          <RiArrowRightLine className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
