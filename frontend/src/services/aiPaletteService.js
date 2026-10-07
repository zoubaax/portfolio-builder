/**
 * AI Color Palette Service
 * Calls the backend AI endpoint to dynamically analyze prompts and synthesize tailored,
 * accessible color palettes and adapted sub-options (text and accent colors).
 */

const API_BASE_URL = 'http://localhost:5050/api/v1';

export async function fetchAiSuggestedPalettes(promptText, getAuthHeadersFn) {
  try {
    const headers = getAuthHeadersFn ? await getAuthHeadersFn() : { 'Content-Type': 'application/json' };
    const response = await fetch(`${API_BASE_URL}/ai/suggest-palettes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: promptText }),
    });

    if (!response.ok) {
      throw new Error(`Palette suggestion API returned status ${response.status}`);
    }

    const json = await response.json();
    if (json.success && json.data) {
      return json.data;
    }
    throw new Error(json.error?.message || 'Invalid palette response');
  } catch (err) {
    console.warn('Backend palette API failed, using intelligent client-side generation:', err);
    return generateClientFallbackPalettes(promptText);
  }
}

/**
 * Client-side intelligent generator when offline
 */
export function generateClientFallbackPalettes(promptText = '') {
  const lower = promptText.toLowerCase();
  let role = 'Ingénieur & Développeur';
  if (lower.includes('devops') || lower.includes('cloud') || lower.includes('kubernetes')) {
    role = 'Ingénieur DevOps & Cloud';
  } else if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
    role = 'Designer UI/UX & Produit';
  } else if (lower.includes('data') || lower.includes('ai') || lower.includes('ia') || lower.includes('ml')) {
    role = 'Data Scientist & Ingénieur IA';
  } else if (lower.includes('security') || lower.includes('cyber') || lower.includes('sécurité')) {
    role = 'Expert Cybersécurité';
  } else if (lower.includes('frontend') || lower.includes('react')) {
    role = 'Développeur Frontend';
  } else if (lower.includes('backend') || lower.includes('node') || lower.includes('go')) {
    role = 'Développeur Backend';
  }

  return {
    detectedRole: role,
    questionMessage: `Pour concevoir un portfolio qui valorise au mieux votre profil de ${role}, quelle direction chromatique préférez-vous ? J'ai préparé ces harmonies adaptées à votre univers :`,
    palettes: [
      {
        id: 'palette-dark-tech',
        name: 'Noir Profond & Zinc Moderne',
        description: 'Ambiance technique haute précision, idéale pour mettre en valeur le code et l’architecture.',
        bg: '#09090b',
        surface: '#18181b',
        isDark: true,
        subOptions: [
          {
            id: 'sub-cyan',
            name: 'Texte Blanc Titane + Cyan Cyber',
            badge: 'Contraste Maximal (AAA)',
            textPrimary: '#f8fafc',
            textSecondary: '#94a3b8',
            accent: '#06b6d4',
            accentHover: '#0891b2',
            accentGlow: 'rgba(6, 182, 212, 0.25)',
            border: 'rgba(255, 255, 255, 0.08)',
          },
          {
            id: 'sub-emerald',
            name: 'Texte Blanc Pur + Vert Émeraude',
            badge: 'Haute Précision',
            textPrimary: '#ffffff',
            textSecondary: '#a1a1aa',
            accent: '#10b981',
            accentHover: '#059669',
            accentGlow: 'rgba(16, 185, 129, 0.25)',
            border: 'rgba(16, 185, 129, 0.2)',
          },
          {
            id: 'sub-violet',
            name: 'Texte Zinc Clair + Violet SaaS',
            badge: 'Tendance Produit',
            textPrimary: '#faf5ff',
            textSecondary: '#a1a1aa',
            accent: '#8b5cf6',
            accentHover: '#7c3aed',
            accentGlow: 'rgba(139, 92, 246, 0.25)',
            border: 'rgba(139, 92, 246, 0.2)',
          },
        ],
      },
      {
        id: 'palette-clean-light',
        name: 'Blanc Pur & Minimaliste',
        description: 'Clarté absolue, esprit éditorial et élégant avec une lisibilité maximale pour les recruteurs.',
        bg: '#ffffff',
        surface: '#f8fafc',
        isDark: false,
        subOptions: [
          {
            id: 'sub-slate-blue',
            name: 'Texte Noir Ardoise + Bleu Royal',
            badge: 'Haute Lisibilité (AAA)',
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            accent: '#2563eb',
            accentHover: '#1d4ed8',
            accentGlow: 'rgba(37, 99, 235, 0.15)',
            border: 'rgba(15, 23, 42, 0.08)',
          },
          {
            id: 'sub-monochrome',
            name: 'Texte Noir Profond + Anthracite Zinc',
            badge: 'Monochrome Pur',
            textPrimary: '#09090b',
            textSecondary: '#52525b',
            accent: '#18181b',
            accentHover: '#27272a',
            accentGlow: 'rgba(24, 24, 27, 0.1)',
            border: 'rgba(0, 0, 0, 0.08)',
          },
          {
            id: 'sub-forest',
            name: 'Texte Ardoise + Vert Forêt Luxueux',
            badge: 'Prestige & Sérénité',
            textPrimary: '#111827',
            textSecondary: '#4b5563',
            accent: '#059669',
            accentHover: '#047857',
            accentGlow: 'rgba(5, 150, 105, 0.15)',
            border: 'rgba(5, 150, 105, 0.15)',
          },
        ],
      },
      {
        id: 'palette-modern-yellow',
        name: 'Jaune Solaire & Ambre Moderne',
        description: 'Énergique, distinctif et mémorable avec un contraste sombre ultra-sécurisé.',
        bg: '#fef08a',
        surface: '#fffbeb',
        isDark: false,
        subOptions: [
          {
            id: 'sub-yellow-slate',
            name: 'Texte Noir Ardoise + Ambre Doré',
            badge: 'Fort Contraste Garanti (AAA)',
            textPrimary: '#0f172a',
            textSecondary: '#334155',
            accent: '#b45309',
            accentHover: '#92400e',
            accentGlow: 'rgba(180, 83, 9, 0.2)',
            border: 'rgba(0, 0, 0, 0.12)',
          },
          {
            id: 'sub-yellow-cobalt',
            name: 'Texte Noir Zinc + Bleu Cobalt',
            badge: 'Contraste Complémentaire',
            textPrimary: '#18181b',
            textSecondary: '#3f3f46',
            accent: '#1d4ed8',
            accentHover: '#1e40af',
            accentGlow: 'rgba(29, 78, 216, 0.2)',
            border: 'rgba(29, 78, 216, 0.2)',
          },
          {
            id: 'sub-yellow-ebony',
            name: 'Texte Brun Ébène + Orange Feu',
            badge: 'Harmonie Chaude',
            textPrimary: '#451a03',
            textSecondary: '#78350f',
            accent: '#ea580c',
            accentHover: '#c2410c',
            accentGlow: 'rgba(234, 88, 12, 0.2)',
            border: 'rgba(234, 88, 12, 0.2)',
          },
        ],
      },
      {
        id: 'palette-cyber-blue',
        name: 'Bleu Nuit / Cyber Cloud',
        description: 'Inspiré des consoles Cloud (AWS, Azure, GCP) et des métriques réseau haute performance.',
        bg: '#0a0f1d',
        surface: '#111827',
        isDark: true,
        subOptions: [
          {
            id: 'sub-ice-cyan',
            name: 'Texte Blanc Glacier + Cyan Électrique',
            badge: 'Cloud & Kubernetes',
            textPrimary: '#f0fdfa',
            textSecondary: '#94a3b8',
            accent: '#38bdf8',
            accentHover: '#0284c7',
            accentGlow: 'rgba(56, 189, 248, 0.25)',
            border: 'rgba(56, 189, 248, 0.2)',
          },
          {
            id: 'sub-stellar-gold',
            name: 'Texte Blanc Pur + Or Stellaire',
            badge: 'Prestige Cloud',
            textPrimary: '#ffffff',
            textSecondary: '#cbd5e1',
            accent: '#fbbf24',
            accentHover: '#f59e0b',
            accentGlow: 'rgba(251, 191, 36, 0.25)',
            border: 'rgba(251, 191, 36, 0.2)',
          },
        ],
      },
    ],
  };
}
