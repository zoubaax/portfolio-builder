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
        id: 'palette-clean-light',
        name: 'Blanc Pur & Minimaliste',
        description: 'Clarté absolue, esprit éditorial et élégant avec une lisibilité maximale.',
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
        ],
      },
      {
        id: 'palette-warm-cream',
        name: 'Crème Éditoriale & Ambre',
        description: 'Chaleureux, raffiné et élégant avec des touches ambrées modernes.',
        bg: '#fdfbf7',
        surface: '#ffffff',
        isDark: false,
        subOptions: [
          {
            id: 'sub-cream-amber',
            name: 'Texte Ébène + Ambre Doré',
            badge: 'Élégance Pure',
            textPrimary: '#1c1917',
            textSecondary: '#78716c',
            accent: '#d97706',
            accentHover: '#b45309',
            accentGlow: 'rgba(217, 119, 6, 0.15)',
            border: 'rgba(28, 25, 23, 0.08)',
          },
        ],
      },
      {
        id: 'palette-nordic-frost',
        name: 'Glace Nordique & Cyan',
        description: 'Ultra-propre et net, inspiré des interfaces cloud et tech modernes.',
        bg: '#f8fafc',
        surface: '#ffffff',
        isDark: false,
        subOptions: [
          {
            id: 'sub-nordic-cyan',
            name: 'Texte Ardoise + Cyan Moderne',
            badge: 'Tech & Net',
            textPrimary: '#0f172a',
            textSecondary: '#334155',
            accent: '#0284c7',
            accentHover: '#0369a1',
            accentGlow: 'rgba(2, 132, 199, 0.15)',
            border: 'rgba(15, 23, 42, 0.08)',
          },
        ],
      },
      {
        id: 'palette-sage-emerald',
        name: 'Sauge Douce & Émeraude',
        description: 'Nuances fraîches, modernes et équilibrées pour une ambiance apaisante.',
        bg: '#f0fdf4',
        surface: '#ffffff',
        isDark: false,
        subOptions: [
          {
            id: 'sub-sage-green',
            name: 'Texte Forêt + Émeraude Vivant',
            badge: 'Harmonie Nature',
            textPrimary: '#14532d',
            textSecondary: '#374151',
            accent: '#059669',
            accentHover: '#047857',
            accentGlow: 'rgba(5, 150, 105, 0.15)',
            border: 'rgba(20, 83, 45, 0.08)',
          },
        ],
      },
    ],
  };
}
