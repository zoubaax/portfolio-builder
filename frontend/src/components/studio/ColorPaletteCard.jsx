import React from 'react';
import {
  RiPaletteLine,
  RiCheckLine,
  RiUser3Line,
  RiFocus2Line,
  RiSparkling2Line,
  RiBrainLine,
  RiCodeSSlashLine,
  RiLayoutMasonryLine,
  RiServerLine,
  RiPaintBrushLine,
  RiGitRepositoryLine,
  RiStackLine,
  RiLineChartLine,
  RiCompass3Line,
} from 'react-icons/ri';

/**
 * Resolves option icons to modern, lightweight React Icons (Zero raw emojis)
 */
export const getOptionReactIcon = (opt) => {
  if (!opt) return null;
  if (React.isValidElement(opt.icon)) return opt.icon;

  const key = (opt.iconKey || opt.id || opt.icon || '').toString().toLowerCase();

  switch (key) {
    // Role step options
    case 'ai':
    case '🧠':
    case 'brain':
    case 'data':
      return <RiBrainLine className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
    case 'fullstack':
    case '💻':
    case 'code':
    case 'dev':
      return <RiCodeSSlashLine className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    case 'frontend':
    case '⚡':
    case 'react':
      return <RiLayoutMasonryLine className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    case 'backend':
    case '☁️':
    case 'cloud':
    case 'server':
      return <RiServerLine className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    case 'designer':
    case '🎨':
    case 'design':
    case 'ui':
      return <RiPaintBrushLine className="w-3.5 h-3.5 text-pink-600 shrink-0" />;

    // Focus step options
    case 'projects':
    case '🚀':
    case 'github':
    case 'repo':
      return <RiGitRepositoryLine className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    case 'skills':
    case 'tech':
    case 'stack':
      return <RiStackLine className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
    case 'experience':
    case '📈':
    case 'career':
      return <RiLineChartLine className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    case 'balanced':
    case '✨':
    case 'overview':
      return <RiCompass3Line className="w-3.5 h-3.5 text-violet-600 shrink-0" />;

    default:
      return <RiSparkling2Line className="w-3.5 h-3.5 text-zinc-500 shrink-0" />;
  }
};

/**
 * 4 Curated 100% Light, High-Contrast Palettes (Zero Dark Colors)
 */
export const CLEAN_LIGHT_PALETTES = [
  {
    id: 'palette-clean-light',
    name: 'Blanc Pur & Minimaliste',
    nameEn: 'Pure Minimalist White',
    desc: 'Clarté absolue, esprit éditorial moderne et lisibilité maximale.',
    descEn: 'Ultra-crisp editorial clarity with royal sapphire accents.',
    bg: '#ffffff',
    surface: '#f8fafc',
    isDark: false,
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#2563eb',
    dotColor: '#2563eb',
    ringColor: '#dbeafe',
  },
  {
    id: 'palette-warm-cream',
    name: 'Crème Éditoriale & Ambre',
    nameEn: 'Warm Cream & Amber',
    desc: 'Ambiance chaleureuse, raffinée et élégante avec touches dorées.',
    descEn: 'Warm, refined luxury with golden amber highlights.',
    bg: '#fdfbf7',
    surface: '#ffffff',
    isDark: false,
    textPrimary: '#1c1917',
    textSecondary: '#78716c',
    accent: '#d97706',
    dotColor: '#d97706',
    ringColor: '#fef3c7',
  },
  {
    id: 'palette-nordic-frost',
    name: 'Glace Nordique & Cyan',
    nameEn: 'Nordic Frost & Cyan',
    desc: 'Ultra-propre, moderne et net, inspiré des interfaces cloud tech.',
    descEn: 'Clean high-precision slate with electric sky cyan accents.',
    bg: '#f8fafc',
    surface: '#ffffff',
    isDark: false,
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    accent: '#0284c7',
    dotColor: '#0284c7',
    ringColor: '#e0f2fe',
  },
  {
    id: 'palette-sage-emerald',
    name: 'Sauge Douce & Émeraude',
    nameEn: 'Soft Sage & Emerald',
    desc: 'Nuances végétales fraîches, apaisantes et équilibrées.',
    descEn: 'Fresh, organic and modern with vibrant emerald accents.',
    bg: '#f0fdf4',
    surface: '#ffffff',
    isDark: false,
    textPrimary: '#14532d',
    textSecondary: '#374151',
    accent: '#059669',
    dotColor: '#059669',
    ringColor: '#dcfce7',
  },
];

export const ColorPaletteCard = ({
  messageId,
  originalPrompt = '',
  detectedRole,
  questionMessage,
  step = 1,
  stepType = 'color',
  options = null,
  isResolved = false,
  selectedPaletteData = null,
  selectedOption = null,
  onSelectOption,
  onConfirm,
  onSkip,
}) => {
  const isEn = Boolean(
    originalPrompt &&
      /^(i want|create|build|make|portfolio|design|show)/i.test(originalPrompt.trim())
  );

  // 1. Resolved State: Compact, Clean Confirmation Badge
  if (isResolved) {
    const title =
      selectedOption ||
      selectedPaletteData?.baseName ||
      selectedPaletteData?.name ||
      (isEn ? 'Preference saved' : 'Préférence validée');

    return (
      <div className="mt-2 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs animate-in fade-in duration-150">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shrink-0 font-bold">
            <RiCheckLine className="w-3 h-3" />
          </div>
          <span className="font-medium text-zinc-900 text-xs">
            {isEn ? 'Selected: ' : 'Choisi : '}
            <span className="font-semibold text-zinc-950">{title}</span>
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          ✓ {isEn ? 'Confirmed' : 'Validé'}
        </span>
      </div>
    );
  }

  // 2. Interactive Step 1: Color & Style Selection (100% Light, Clean, No Dark Colors)
  if (step === 1 || stepType === 'color') {
    const list = CLEAN_LIGHT_PALETTES;

    const handleSelectPalette = (palette) => {
      const resolved = {
        baseId: palette.id,
        baseName: isEn ? palette.nameEn : palette.name,
        name: isEn ? palette.nameEn : palette.name,
        subName: 'Standard Light',
        bg: palette.bg,
        surface: palette.surface,
        isDark: false,
        textPrimary: palette.textPrimary,
        textSecondary: palette.textSecondary,
        accent: palette.accent,
        accentHover: palette.accent,
        accentGlow: `${palette.accent}33`,
        border: 'rgba(0, 0, 0, 0.08)',
      };

      if (onSelectOption) {
        onSelectOption({
          ...resolved,
          title: isEn ? palette.nameEn : palette.name,
        });
      } else if (onConfirm) {
        onConfirm(resolved);
      }
    };

    return (
      <div className="mt-2.5 p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3 text-zinc-900 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
            <RiPaletteLine className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-zinc-900 leading-tight">
              {isEn ? 'Visual Style & Palette' : 'Style Visuel & Harmonie de Couleurs'}
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              {isEn
                ? 'Choose a clean, light palette for your portfolio:'
                : 'Sélectionnez une ambiance lumineuse et épurée (1 clic) :'}
            </p>
          </div>
        </div>

        {/* 4 Clean Light Options (Zero Dark Colors, Single Click) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {list.map((pal) => (
            <button
              key={pal.id}
              type="button"
              onClick={() => handleSelectPalette(pal)}
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50/80 transition-all text-left flex items-start gap-2.5 group cursor-pointer shadow-2xs active:scale-[0.99]"
            >
              {/* Swatch indicator */}
              <div
                className="w-5 h-5 rounded-full border border-black/10 shrink-0 mt-0.5 flex items-center justify-center shadow-xs"
                style={{ backgroundColor: pal.bg }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: pal.dotColor }}
                />
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-800 group-hover:text-black">
                    {isEn ? pal.nameEn : pal.name}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: pal.accent }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug line-clamp-1 mt-0.5">
                  {isEn ? pal.descEn : pal.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Interactive Step 2 (Role) or Step 3 (Focus) or Generic Options
  const stepIcons = {
    role: <RiUser3Line className="w-3.5 h-3.5" />,
    focus: <RiFocus2Line className="w-3.5 h-3.5" />,
    default: <RiSparkling2Line className="w-3.5 h-3.5" />,
  };

  const currentIcon = stepIcons[stepType] || stepIcons.default;
  const currentOptions = options || [];

  return (
    <div className="mt-2.5 p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3 text-zinc-900 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
          {currentIcon}
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-zinc-900 leading-tight">
            {questionMessage || (isEn ? 'Please choose an option:' : 'Veuillez choisir une option :')}
          </h4>
        </div>
      </div>

      {/* Clean Option Chips / Buttons with React Icons (Zero Emojis) */}
      <div className="flex flex-wrap gap-2 pt-1">
        {currentOptions.map((opt, idx) => {
          const label = typeof opt === 'string' ? opt : opt.label || opt.name;
          const iconElement = typeof opt === 'object' ? getOptionReactIcon(opt) : null;

          return (
            <button
              key={opt?.id || idx}
              type="button"
              onClick={() => onSelectOption && onSelectOption(opt)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-50 hover:bg-zinc-100 text-zinc-800 hover:text-black border border-zinc-200 hover:border-zinc-400 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
            >
              {iconElement}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
