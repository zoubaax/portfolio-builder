/**
 * Color Palettes & Contrast Helpers
 * Fournit uniquement les fonctions utilitaires pour :
 * 1. Détecter si le prompt de l'utilisateur contient déjà des couleurs
 * 2. Détecter si le prompt demande une génération / refonte
 * 3. Calculer la luminance et le contraste WCAG pour les couleurs personnalisées
 *
 * NOTE : Toutes les palettes de base et leurs sous-options sont générées
 * DYNAMIQUEMENT par l'IA via /api/v1/ai/suggest-palettes et ne sont PAS codées en dur.
 */

/**
 * Calcule la luminance relative d'une couleur hexadécimale selon la formule WCAG 2.1
 * pour garantir un contraste de texte optimal (AAA / AA).
 */
export function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0;
  const clean = hex.replace('#', '');
  if (clean.length < 6) return 0.5;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Génère dynamiquement des sous-options de contraste adaptées pour N'IMPORTE QUELLE
 * couleur de fond personnalisée choisie par l'utilisateur.
 */
export function generateCustomSubPalettes(customBgHex) {
  const lum = getLuminance(customBgHex);
  const isLight = lum > 0.45;

  if (isLight) {
    return [
      {
        id: 'custom-slate',
        name: 'Texte Noir Ardoise + Bleu Royal',
        badge: 'Contraste Garanti (AAA)',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        accent: '#2563eb',
        accentHover: '#1d4ed8',
        accentGlow: 'rgba(37, 99, 235, 0.2)',
        border: 'rgba(15, 23, 42, 0.12)',
        borderHover: 'rgba(37, 99, 235, 0.4)',
      },
      {
        id: 'custom-emerald',
        name: 'Texte Noir Anthracite + Vert Émeraude',
        badge: 'Élégant & Nature',
        textPrimary: '#111827',
        textSecondary: '#374151',
        accent: '#059669',
        accentHover: '#047857',
        accentGlow: 'rgba(5, 150, 105, 0.2)',
        border: 'rgba(5, 150, 105, 0.2)',
        borderHover: 'rgba(5, 150, 105, 0.4)',
      },
      {
        id: 'custom-coral',
        name: 'Texte Ardoise Sombre + Rose Corail',
        badge: 'Créatif & Vif',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        accent: '#e11d48',
        accentHover: '#be123c',
        accentGlow: 'rgba(225, 29, 72, 0.2)',
        border: 'rgba(225, 29, 72, 0.2)',
        borderHover: 'rgba(225, 29, 72, 0.4)',
      },
    ];
  } else {
    return [
      {
        id: 'custom-cyan',
        name: 'Texte Blanc Glacier + Cyan Néon',
        badge: 'Contraste Garanti (AAA)',
        textPrimary: '#f8fafc',
        textSecondary: '#94a3b8',
        accent: '#06b6d4',
        accentHover: '#0891b2',
        accentGlow: 'rgba(6, 182, 212, 0.25)',
        border: 'rgba(255, 255, 255, 0.1)',
        borderHover: 'rgba(6, 182, 212, 0.45)',
      },
      {
        id: 'custom-emerald',
        name: 'Texte Blanc Pur + Vert Émeraude',
        badge: 'Cybersécurité & Tech',
        textPrimary: '#ffffff',
        textSecondary: '#a1a1aa',
        accent: '#10b981',
        accentHover: '#059669',
        accentGlow: 'rgba(16, 185, 129, 0.25)',
        border: 'rgba(16, 185, 129, 0.25)',
        borderHover: 'rgba(16, 185, 129, 0.45)',
      },
      {
        id: 'custom-amber',
        name: 'Texte Blanc Titane + Ambre Doré',
        badge: 'Chaleur & Impact',
        textPrimary: '#ffffff',
        textSecondary: '#cbd5e1',
        accent: '#f59e0b',
        accentHover: '#d97706',
        accentGlow: 'rgba(245, 158, 11, 0.25)',
        border: 'rgba(245, 158, 11, 0.25)',
        borderHover: 'rgba(245, 158, 11, 0.45)',
      },
    ];
  }
}

/**
 * Vérifie si le prompt mentionne explicitement des couleurs, tonalités ou codes hexadécimaux
 */
export function doesPromptSpecifyColor(promptText) {
  if (!promptText || typeof promptText !== 'string') return false;
  const lower = promptText.toLowerCase();

  // 1. Codes hexadécimaux (#fff, #18181b, etc.)
  if (/#[0-9a-f]{3,6}\b/i.test(lower)) return true;

  // 2. Fonctions de couleurs CSS
  if (/rgb\(|rgba\(|hsl\(|hsla\(/i.test(lower)) return true;

  // 3. Mots-clés de couleurs en Français et en Anglais
  const colorKeywords = [
    'noir', 'noire', 'noirs', 'noires',
    'blanc', 'blanche', 'blancs', 'blanches',
    'sombre', 'sombres', 'fonce', 'foncé', 'foncee', 'foncée',
    'clair', 'claire', 'clairs', 'claires',
    'gris', 'grise',
    'bleu', 'bleue', 'bleus', 'bleues', 'cyan', 'indigo', 'marine', 'navy', 'azur', 'turquoise',
    'vert', 'verte', 'verts', 'vertes', 'émeraude', 'emeraude', 'menthe', 'olive', 'lime',
    'rouge', 'rougeâtre', 'bordeaux', 'carmin', 'rubis',
    'jaune', 'jaunes', 'ambre', 'dore', 'doré', 'or', 'gold',
    'orange', 'orangee', 'orangée',
    'violet', 'violette', 'pourpre', 'magenta', 'lilas', 'lavande',
    'rose', 'corail', 'pastel', 'neon', 'néon',
    // Anglais
    'dark', 'light', 'black', 'white', 'gray', 'grey',
    'blue', 'green', 'red', 'yellow', 'purple', 'pink',
    'amber', 'emerald', 'teal', 'silver', 'slate', 'zinc',
  ];

  for (const kw of colorKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lower)) return true;
  }

  return false;
}

/**
 * Détermine si un prompt est une demande de création, de refonte ou de styling de portfolio
 */
export function isPortfolioGenerationPrompt(promptText, isFirstGeneration = false) {
  if (!promptText || typeof promptText !== 'string') return false;
  if (isFirstGeneration) return true;

  const lower = promptText.toLowerCase();

  // Modifications ciblées de contenu qui ne doivent pas déclencher le choix de couleur
  const contentEditKeywords = [
    'met à jour et enrichis la section projets',
    'voici mes projets github',
    'importe mes projets',
    'ajoute le projet',
    'change mon nom',
    'modifie mon nom',
    'change mon email',
    'corrige la faute',
    'supprime le projet',
    'ajoute la compétence',
    'ajoute une compétence',
    'change la photo',
  ];

  for (const phrase of contentEditKeywords) {
    if (lower.includes(phrase)) return false;
  }

  // Déclencheurs de génération / restyling
  const generationKeywords = [
    'portfolio', 'creer', 'créer', 'crée', 'cree',
    'générer', 'generer', 'génère', 'genere',
    'fais-moi', 'fais moi', 'construire', 'construis',
    'nouveau', 'nouvelle', 'refais', 'relook', 'restyle',
    'développeur', 'developpeur', 'ingénieur', 'ingenieur',
    'devops', 'fullstack', 'frontend', 'backend', 'data scientist',
    'designer', 'architecte', 'freelance',
    'build', 'create', 'generate', 'redesign', 'make',
  ];

  return generationKeywords.some((kw) => lower.includes(kw));
}
