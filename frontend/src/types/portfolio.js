/**
 * Portfolio Schema Definitions and Theme Presets
 * Serves as the single source of truth for the AI Generator, Live Preview, and Exporter.
 */

export const THEME_PRESETS = {
  'galactic-noir': {
    id: 'galactic-noir',
    name: 'Galactic Noir',
    description: 'A sleek, futuristic design with a cosmic touch.',
    palette: {
          "bg": "rgb(10, 10, 10)",
          "surface": "rgba(17, 17, 17, 0.5)",
          "surfaceHover": "#1f2937",
          "surfaceCard": "rgba(17, 17, 17, 0.5)",
          "textPrimary": "rgb(255, 255, 255)",
          "textSecondary": "rgb(255, 255, 255)",
          "accent": "rgba(0, 0, 0, 0)",
          "accentHover": "#00b4d8",
          "accentGlow": "rgba(0, 217, 255, 0.25)",
          "border": "1px solid rgba(255, 255, 255, 0.14)",
          "borderHover": "rgba(255,255,255,0.2)"
    },
    typography: {
          "headingFont": "Comfortaa, cursive",
          "bodyFont": "Comfortaa, \"Comfortaa Fallback\"",
          "monoFont": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
          "radius": "16px"
    }
  },

  'modern-fullstack': {
    id: 'modern-fullstack',
    name: 'modern fullstack',
    description: 'A sleek and innovative portfolio design with a focus on creativity and modern aesthetics.',
    palette: {
          "bg": "#000000",
          "surface": "#1a1a1a",
          "surfaceHover": "#333333",
          "surfaceCard": "#262626",
          "textPrimary": "#ffffff",
          "textSecondary": "#b3b3b3",
          "accent": "#ff69b4",
          "accentHover": "#ff85c1",
          "accentGlow": "rgba(255, 105, 180, 0.5)",
          "border": "rgba(255, 255, 255, 0.1)",
          "borderHover": "rgba(255, 255, 255, 0.2)"
    },
    typography: {
          "headingFont": "'Outfit', sans-serif",
          "bodyFont": "'Inter', sans-serif",
          "monoFont": "'JetBrains Mono', monospace",
          "radius": "1rem"
    }
  },

  'cyber-dark': {
    id: 'cyber-dark',
    name: 'Cyber Slate',
    description: 'Modern developer aesthetic with deep dark tones and indigo glow',
    palette: {
      bg: '#0a0e17',
      surface: '#111827',
      surfaceHover: '#1f2937',
      surfaceCard: 'rgba(17, 24, 39, 0.75)',
      textPrimary: '#f9fafb',
      textSecondary: '#9ca3af',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      accentGlow: 'rgba(99, 102, 241, 0.25)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(99, 102, 241, 0.4)',
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '0.875rem', // 14px rounded
    },
  },
  'bento-violet': {
    id: 'bento-violet',
    name: 'Bento Violet',
    description: 'High-contrast modern SaaS vibe with purple gradients and bento borders',
    palette: {
      bg: '#070709',
      surface: '#121118',
      surfaceHover: '#1a1924',
      surfaceCard: 'rgba(18, 17, 24, 0.85)',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
      accent: '#a855f7',
      accentHover: '#9333ea',
      accentGlow: 'rgba(168, 85, 247, 0.25)',
      border: 'rgba(168, 85, 247, 0.15)',
      borderHover: 'rgba(168, 85, 247, 0.4)',
    },
    typography: {
      headingFont: "'Space Grotesk', sans-serif",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '1.25rem', // 20px rounded
    },
  },
  'minimal-editorial': {
    id: 'minimal-editorial',
    name: 'Editorial Ivory',
    description: 'Warm, refined light design with luxury typography and crisp borders',
    palette: {
      bg: '#fbf9f5',
      surface: '#ffffff',
      surfaceHover: '#f5f2eb',
      surfaceCard: 'rgba(255, 255, 255, 0.95)',
      textPrimary: '#141413',
      textSecondary: '#666560',
      accent: '#18181b',
      accentHover: '#27272a',
      accentGlow: 'rgba(24, 24, 27, 0.1)',
      border: 'rgba(0, 0, 0, 0.08)',
      borderHover: 'rgba(0, 0, 0, 0.2)',
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '0.5rem', // 8px rounded
    },
  },
  'nordic-teal': {
    id: 'nordic-teal',
    name: 'Nordic Clean',
    description: 'Crisp minimalist light slate with fresh emerald & teal accents',
    palette: {
      bg: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      surfaceCard: 'rgba(30, 41, 59, 0.8)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#14b8a6',
      accentHover: '#0d9488',
      accentGlow: 'rgba(20, 184, 166, 0.25)',
      border: 'rgba(255, 255, 255, 0.07)',
      borderHover: 'rgba(20, 184, 166, 0.4)',
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '1rem',
    },
  },
  'superdesign-ember': {
    id: 'superdesign-ember',
    name: 'Superdesign Ember',
    description: 'Obsidian luxury dark with intense flame orange accents',
    palette: {
      bg: '#050507',
      surface: '#0f0f13',
      surfaceHover: '#181820',
      surfaceCard: 'rgba(15, 15, 19, 0.85)',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
      accent: '#FF4500',
      accentHover: '#ff5722',
      accentGlow: 'rgba(255, 69, 0, 0.3)',
      border: 'rgba(255, 69, 0, 0.25)',
      borderHover: 'rgba(255, 69, 0, 0.5)',
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '1rem',
    },
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    description: 'Deep cybersecurity black with vivid emerald green glow',
    palette: {
      bg: '#050a07',
      surface: '#0d1712',
      surfaceHover: '#13241b',
      surfaceCard: 'rgba(13, 23, 18, 0.85)',
      textPrimary: '#f0fdf4',
      textSecondary: '#86efac',
      accent: '#10b981',
      accentHover: '#059669',
      accentGlow: 'rgba(16, 185, 129, 0.3)',
      border: 'rgba(16, 185, 129, 0.25)',
      borderHover: 'rgba(16, 185, 129, 0.5)',
    },
    typography: {
      headingFont: "'JetBrains Mono', monospace",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '0.75rem',
    },
  },
  'devops-architect': {
    id: 'devops-architect',
    name: 'DevOps Architect',
    description: 'Style sombre haute fidélité pour architectes cloud et ingénieurs infrastructure',
    palette: {
      bg: '#0a0d14',
      surface: '#121723',
      surfaceHover: '#1a2234',
      surfaceCard: 'rgba(18, 23, 35, 0.85)',
      textPrimary: '#f8fafc',
      textSecondary: '#94a3b8',
      accent: '#38bdf8',
      accentHover: '#0284c7',
      accentGlow: 'rgba(56, 189, 248, 0.3)',
      border: 'rgba(255, 255, 255, 0.08)',
      borderHover: 'rgba(56, 189, 248, 0.4)',
    },
    typography: {
      headingFont: "'Outfit', sans-serif",
      bodyFont: "'Inter', sans-serif",
      monoFont: "'JetBrains Mono', monospace",
      radius: '0.75rem',
    },
  },
};

export const GLOBAL_TEMPLATES = [
  {
      "id": "galactic-noir",
      "name": "Galactic Noir",
      "category": "Innovant & Cr\u00e9atif",
      "description": "A sleek, futuristic design with a cosmic touch.",
      "themeId": "galactic-noir",
      "badges": [
          "Dark Mode",
          "Futuristic",
          "Minimalist",
          "Responsive"
      ],
      "previewColors": [
          "rgb(10, 10, 10)",
          "rgb(255, 255, 255)",
          "rgba(0, 0, 0, 0)"
      ],
      "sectionVariants": {
          "hero": "galactic-noir",
          "about": "galactic-noir",
          "skills": "galactic-noir",
          "projects": "galactic-noir",
          "experience": "galactic-noir",
          "contact": "minimal-card"
      }
  },
  {
    id: 'modern-fullstack',
    name: 'Modern Fullstack (Mannan)',
    category: 'Innovant & Créatif',
    description: 'Design épuré et contemporain inspiré de mannan.io avec cartes douces et accents rose/magenta vibrants.',
    themeId: 'modern-fullstack',
    badges: ['Fullstack Layout', 'Pink Glow Accent', 'Card Glow', 'Clean Typography'],
    previewColors: ['#000000', '#1a1a1a', '#ff69b4'],
    sectionVariants: {
      hero: 'modern-fullstack',
      about: 'modern-fullstack',
      skills: 'modern-fullstack',
      projects: 'modern-fullstack',
      experience: 'modern-fullstack',
      contact: 'minimal-card'
    }
  },
  {
    id: 'devops-architect',
    name: 'DevOps & Cloud Architect',
    category: 'DevOps & Cloud',
    description: 'Réplique exacte du portfolio d’Aditya Seth avec animations néon, typewriter, cartes 3D flip et double-colonne carrière.',
    themeId: 'devops-architect',
    badges: ['Typewriter Hero', '4 Stat Cards', '3D Flip Skills', 'Lightbar Projects'],
    previewColors: ['#0a0d14', '#191919', '#38bdf8'],
    sectionVariants: {
      hero: 'devops-architect',
      about: 'devops-architect',
      skills: 'devops-architect',
      projects: 'devops-architect',
      experience: 'devops-architect',
      contact: 'minimal-card'
    }
  },
  {
    id: 'terminal-hacker',
    name: 'Terminal CLI & Systems Hacker',
    category: 'Terminal & CLI',
    description: 'Interface terminal bash interactive avec console Linux, typographie monospace et look cyber-sécurité.',
    themeId: 'emerald-matrix',
    badges: ['Interactive Terminal', 'Live Bash Output', 'Monospace Font', 'Matrix Glow'],
    previewColors: ['#050a07', '#0d1712', '#10b981'],
    sectionVariants: {
      hero: 'terminal-dev',
      about: 'classic-story',
      skills: 'pill-cloud',
      projects: 'bento-grid',
      experience: 'clean-cards',
      contact: 'minimal-card'
    }
  },
  {
    id: 'bento-violet',
    name: 'Bento Violet SaaS & AI',
    category: 'Fullstack & SaaS',
    description: 'Design ultra-moderne inspiré des interfaces SaaS de pointe avec grilles bento haute densité et lueur violette.',
    themeId: 'bento-violet',
    badges: ['Bento Grid UI', 'Purple Glow', 'Space Grotesk', 'Rounded Bento Cards'],
    previewColors: ['#070709', '#121118', '#a855f7'],
    sectionVariants: {
      hero: 'split-portrait',
      about: 'bento',
      skills: 'category-cards',
      projects: 'bento-grid',
      experience: 'timeline',
      contact: 'split-box'
    }
  },
  {
    id: 'cyber-slate',
    name: 'Cyber Slate Fullstack',
    category: 'Fullstack & SaaS',
    description: 'Esthétique développeur moderne avec arrière-plans ardoise sombre et touches indigo élégantes.',
    themeId: 'cyber-dark',
    badges: ['Split Portrait', 'Category Cards', 'Timeline Journey', 'Indigo Accents'],
    previewColors: ['#0a0e17', '#111827', '#6366f1'],
    sectionVariants: {
      hero: 'split-portrait',
      about: 'bento',
      skills: 'category-cards',
      projects: 'bento-grid',
      experience: 'timeline',
      contact: 'minimal-card'
    }
  },
  {
    id: 'superdesign-ember',
    name: 'Superdesign Ember Lead',
    category: 'Minimalist & Luxe',
    description: 'Look obsidienne haute intensité avec des contrastes flamboyants orange vif pour profils lead & architectes.',
    themeId: 'superdesign-ember',
    badges: ['Flame Orange Glow', 'High Contrast UI', 'Bento Projects', 'Clean Architecture'],
    previewColors: ['#050507', '#0f0f13', '#FF4500'],
    sectionVariants: {
      hero: 'minimal-centered',
      about: 'bento',
      skills: 'pill-cloud',
      projects: 'card-grid',
      experience: 'clean-cards',
      contact: 'minimal-card'
    }
  },
  {
    id: 'editorial-ivory',
    name: 'Editorial Ivory Minimalist',
    category: 'Minimalist & Luxe',
    description: 'Design épuré et raffiné sur fond clair ivoire avec typographie Playfair Display pour créatifs et consultants.',
    themeId: 'minimal-editorial',
    badges: ['Serif Typography', 'Light Luxury Theme', 'Classic Story', 'Minimalist List'],
    previewColors: ['#fbf9f5', '#ffffff', '#18181b'],
    sectionVariants: {
      hero: 'minimal-centered',
      about: 'classic-story',
      skills: 'pill-cloud',
      projects: 'minimal-list',
      experience: 'clean-cards',
      contact: 'split-box'
    }
  }
];

export const MOCK_DEVELOPER_PORTFOLIO = {
  meta: {
    title: 'Alex Vance — Senior Full-Stack & AI Engineer',
    slug: 'alexvance',
    description: 'Building high-throughput distributed systems and intelligent interfaces.',
  },
  theme: THEME_PRESETS['cyber-dark'],
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      variant: 'split-portrait', // 'split-portrait' | 'terminal-dev' | 'minimal-centered'
      visible: true,
      data: {
        badge: 'Available for high-impact roles & consulting',
        name: 'Alex Vance',
        title: 'Senior Full-Stack & AI Engineer',
        tagline: 'Crafting resilient distributed backends and reactive, high-polish user experiences.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
        primaryCta: { text: 'View Selected Projects', link: '#projects' },
        secondaryCta: { text: 'Get in Touch', link: '#contact' },
        socials: [
          { platform: 'github', url: 'https://github.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'twitter', url: 'https://x.com' },
        ],
      },
    },
    {
      id: 'sec-about',
      type: 'about',
      variant: 'bento', // 'bento' | 'classic-story'
      visible: true,
      data: {
        heading: 'Engineering Philosophy',
        subheading: 'ABOUT ME',
        bio: [
          'Over the last 7 years, I have architected cloud infrastructure, real-time analytics engines, and modern web applications scaled to millions of daily requests.',
          'I believe that outstanding software requires both uncompromising system reliability and deeply intuitive interface craft.',
        ],
        stats: [
          { value: '7+', label: 'Years Experience' },
          { value: '45M+', label: 'Monthly API Calls' },
          { value: '99.99%', label: 'Uptime Maintained' },
          { value: '14', label: 'Open Source Packages' },
        ],
        location: 'San Francisco, CA (or Remote)',
      },
    },
    {
      id: 'sec-projects',
      type: 'projects',
      variant: 'bento-grid', // 'bento-grid' | 'card-grid' | 'minimal-list'
      visible: true,
      data: {
        heading: 'Featured Work',
        subheading: 'PORTFOLIO',
        projects: [],
      },
    },
    {
      id: 'sec-skills',
      type: 'skills',
      variant: 'category-cards', // 'category-cards' | 'pill-cloud'
      visible: true,
      data: {
        heading: 'Technical Stack',
        subheading: 'CAPABILITIES',
        categories: [
          {
            name: 'Frontend & UI Craft',
            skills: ['React 19', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'WebSockets'],
          },
          {
            name: 'Backend & Distributed Systems',
            skills: ['Node.js / Express', 'Go', 'Rust', 'PostgreSQL / Neon', 'Redis', 'Kafka', 'GraphQL'],
          },
          {
            name: 'AI & Data Engineering',
            skills: ['LangChain', 'Llama 3.3', 'Groq API', 'Vector Embeddings', 'Drizzle ORM', 'Python'],
          },
          {
            name: 'DevOps & Infrastructure',
            skills: ['Docker', 'Kubernetes', 'AWS', 'Cloudflare Workers', 'CI/CD Pipelines', 'Vercel'],
          },
        ],
      },
    },
    {
      id: 'sec-experience',
      type: 'experience',
      variant: 'timeline', // 'timeline' | 'clean-cards'
      visible: true,
      data: {
        heading: 'Career Journey',
        subheading: 'EXPERIENCE',
        items: [
          {
            id: 'exp-1',
            role: 'Lead Full-Stack Architect',
            company: 'HyperScale Labs',
            period: '2023 — Present',
            description: 'Leading a team of 8 engineers building real-time collaboration engines and AI coding workflows. Reduced API latency by 42%.',
            technologies: ['TypeScript', 'Go', 'React', 'PostgreSQL', 'Docker'],
          },
          {
            id: 'exp-2',
            role: 'Senior Software Engineer',
            company: 'Veloce Data',
            period: '2020 — 2023',
            description: 'Architected edge caching layer and public API gateway serving 50M+ monthly requests with 99.99% availability.',
            technologies: ['Node.js', 'Redis', 'AWS Lambda', 'GraphQL'],
          },
          {
            id: 'exp-3',
            role: 'Software Engineer',
            company: 'Nexus Creative',
            period: '2018 — 2020',
            description: 'Developed modern web dashboards and dynamic design systems for enterprise clients.',
            technologies: ['React', 'CSS Modules', 'REST APIs'],
          },
        ],
      },
    },
    {
      id: 'sec-contact',
      type: 'contact',
      variant: 'minimal-card', // 'minimal-card' | 'split-box'
      visible: true,
      data: {
        heading: "Let's build something remarkable",
        subheading: 'GET IN TOUCH',
        text: 'Always interested in talking about high-throughput infrastructure, AI tooling, or ambitious contract projects.',
        email: 'alex.vance@example.dev',
        location: 'San Francisco, CA (PST)',
        buttonText: 'Say Hello',
      },
    },
  ],
};

export const MOCK_DESIGNER_PORTFOLIO = {
  meta: {
    title: 'Elena Rostova — Product & Visual Systems Designer',
    slug: 'elenarostova',
    description: 'Crafting thoughtful digital interfaces, design systems, and product experiences.',
  },
  theme: THEME_PRESETS['bento-violet'],
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      variant: 'split-portrait',
      visible: true,
      data: {
        badge: 'Open for Select Advisory & Design Roles',
        name: 'Elena Rostova',
        title: 'Product & Design Systems Lead',
        tagline: 'Bridging human emotion and technical precision to create products people truly love using.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
        primaryCta: { text: 'Explore Case Studies', link: '#projects' },
        secondaryCta: { text: 'Read Philosophy', link: '#about' },
        socials: [
          { platform: 'twitter', url: 'https://x.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'github', url: 'https://github.com' },
        ],
      },
    },
    {
      id: 'sec-about',
      type: 'about',
      variant: 'bento',
      visible: true,
      data: {
        heading: 'Form Follows Empathy',
        subheading: 'DESIGN PRINCIPLES',
        bio: [
          'Design is not merely aesthetic decoration — it is how an application thinks, speaks, and reduces cognitive load for human beings.',
          'Over 6+ years at fintech and consumer tech companies, I have built design systems used by over 300 engineers and loved by 2M users.',
        ],
        stats: [
          { value: '6+', label: 'Years Experience' },
          { value: '2.4M', label: 'Users Reached' },
          { value: '3', label: 'Design Awards' },
          { value: '180+', label: 'System Components' },
        ],
        location: 'New York, NY',
      },
    },
    {
      id: 'sec-projects',
      type: 'projects',
      variant: 'bento-grid',
      visible: true,
      data: {
        heading: 'Selected Case Studies',
        subheading: 'PORTFOLIO',
        projects: [],
      },
    },
    {
      id: 'sec-skills',
      type: 'skills',
      variant: 'pill-cloud',
      visible: true,
      data: {
        heading: 'Skills & Toolkit',
        subheading: 'EXPERTISE',
        categories: [
          {
            name: 'Core Skills',
            skills: ['Design Systems', 'User Research', 'Information Architecture', 'Interaction Design', 'Micro-Animations', 'Rapid Prototyping', 'Accessibility (WCAG 2.1)'],
          },
        ],
      },
    },
    {
      id: 'sec-contact',
      type: 'contact',
      variant: 'minimal-card',
      visible: true,
      data: {
        heading: 'Have a project in mind?',
        subheading: 'LET’S TALK',
        text: 'Available for freelance design consulting, design system audits, and advisory work.',
        email: 'elena@rostova.design',
        location: 'New York, NY (EST)',
        buttonText: 'Send an Inquiry',
      },
    },
  ],
};

export const MOCK_MINIMALIST_PORTFOLIO = {
  meta: {
    title: 'Julian Croft — Systems Thinker & Engineer',
    slug: 'juliancroft',
    description: 'Writing software with clarity, restraint, and longevity.',
  },
  theme: THEME_PRESETS['minimal-editorial'],
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      variant: 'minimal-centered',
      visible: true,
      data: {
        badge: 'Crafting software since 2016',
        name: 'Julian Croft',
        title: 'Software Artisan & Essayist',
        tagline: 'I write minimal, performant software and think about software sustainability and digital typography.',
        avatar: '',
        primaryCta: { text: 'Read Essays & Code', link: '#projects' },
        secondaryCta: { text: 'Contact', link: '#contact' },
        socials: [
          { platform: 'github', url: 'https://github.com' },
          { platform: 'twitter', url: 'https://x.com' },
        ],
      },
    },
    {
      id: 'sec-projects',
      type: 'projects',
      variant: 'minimal-list',
      visible: true,
      data: {
        heading: 'Selected Works',
        subheading: 'ARCHIVE',
        projects: [],
      },
    },
    {
      id: 'sec-contact',
      type: 'contact',
      variant: 'minimal-card',
      visible: true,
      data: {
        heading: 'Send a Letter',
        subheading: 'CORRESPONDENCE',
        text: 'The best way to reach me is directly by email.',
        email: 'julian@croft.xyz',
        location: 'Oxford, UK',
        buttonText: 'Email Julian',
      },
    },
  ],
};

export const MOCK_DEVOPS_PORTFOLIO = {
  meta: {
    title: 'Alex Morgan — Cloud Architect & DevOps Engineer',
    slug: 'devops-architect',
    description: 'Designing scalable Kubernetes infrastructures, automated CI/CD pipelines, and high-throughput systems.',
  },
  theme: THEME_PRESETS['devops-architect'],
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      variant: 'devops-architect',
      visible: true,
      data: {
        badge: 'Open for Cloud Architecture & DevOps Consulting',
        name: 'Alex Morgan',
        title: 'Cloud Architect & DevOps Engineer',
        tagline: 'Designing scalable Kubernetes infrastructures, automated CI/CD pipelines, and high-throughput systems.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
        primaryCta: { text: 'View Selected Projects', link: '#projects' },
        secondaryCta: { text: 'Get in Touch', link: '#contact' },
        socials: [
          { platform: 'github', url: 'https://github.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
          { platform: 'twitter', url: 'https://x.com' },
        ],
      },
    },
    {
      id: 'sec-about',
      type: 'about',
      variant: 'devops-architect',
      visible: true,
      data: {
        heading: 'Platform Engineering & Resilience',
        subheading: 'ABOUT ME',
        bio: [
          'Over the last 6 years, I have engineered multi-region cloud infrastructures and automated deployment pipelines scaled for high availability.',
          'Passionate about infrastructure as code, developer experience, and zero-downtime reliability.'
        ],
        stats: [
          { value: '6+', label: 'Years Experience' },
          { value: '99.99%', label: 'Uptime Guaranteed' },
          { value: '40+', label: 'K8s Microservices' },
          { value: '150+', label: 'Automated Pipelines' }
        ],
        location: 'Remote / Worldwide'
      },
    },
    {
      id: 'sec-projects',
      type: 'projects',
      variant: 'devops-architect',
      visible: true,
      data: {
        heading: 'Infrastructure Projects',
        subheading: 'PORTFOLIO',
        projects: [
          {
            id: 'proj-shieldk8s',
            title: 'ShieldK8s — Kubernetes Security Dashboard',
            description: 'Architected automated security auditing engine for production clusters with eBPF runtime monitoring, CIS benchmarks, and Slack alerting.',
            image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
            tags: ['Kubernetes', 'Go', 'eBPF', 'Prometheus', 'Helm'],
            githubUrl: 'https://github.com/example/shieldk8s',
            liveUrl: 'https://shieldk8s.io'
          },
          {
            id: 'proj-fastinference',
            title: 'FastInference — High-Throughput LLM Gateway',
            description: 'Low-latency GPU model serving proxy with streaming response caching, dynamic batching, and semantic routing across vLLM and Ollama instances.',
            image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            tags: ['Python', 'FastAPI', 'vLLM', 'Redis', 'Docker'],
            githubUrl: 'https://github.com/example/fastinference',
            liveUrl: 'https://fastinference.dev'
          },
          {
            id: 'proj-argoflow',
            title: 'ArgoFlow — Multi-Region GitOps Orchestrator',
            description: 'Declarative continuous deployment pipeline managing 120+ microservices across AWS EKS and GCP GKE with automated canary rollbacks.',
            image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
            tags: ['ArgoCD', 'Terraform', 'AWS', 'GCP', 'GitHub Actions'],
            githubUrl: 'https://github.com/example/argoflow',
            liveUrl: 'https://argoflow.cloud'
          }
        ],
      },
    },
    {
      id: 'sec-skills',
      type: 'skills',
      variant: 'devops-architect',
      visible: true,
      data: {
        heading: 'Technical Capabilities',
        subheading: 'STACK',
        categories: [
          {
            name: 'Cloud & Orchestration',
            skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Helm', 'ArgoCD']
          },
          {
            name: 'CI/CD & Observability',
            skills: ['GitHub Actions', 'GitLab CI', 'Prometheus', 'Grafana', 'Datadog', 'OpenTelemetry']
          },
          {
            name: 'Backend & Systems',
            skills: ['Go', 'Python', 'Linux / Bash', 'PostgreSQL', 'Redis', 'Kafka']
          }
        ]
      },
    },
    {
      id: 'sec-experience',
      type: 'experience',
      variant: 'devops-architect',
      visible: true,
      data: {
        heading: 'Career Journey',
        subheading: 'EXPERIENCE',
        items: [
          {
            id: 'exp-1',
            role: 'Lead Cloud Infrastructure Engineer',
            company: 'KubeCloud Labs',
            period: '2023 — Present',
            description: 'Architected resilient multi-tenant Kubernetes platform running 80+ microservices with zero downtime deployments.',
            technologies: ['Kubernetes', 'Terraform', 'AWS', 'GitOps']
          },
          {
            id: 'exp-2',
            role: 'Senior DevOps Engineer',
            company: 'StreamScale Systems',
            period: '2021 — 2023',
            description: 'Implemented automated GitOps workflows and unified telemetry reducing incident resolution time by 55%.',
            technologies: ['Docker', 'GitHub Actions', 'Prometheus', 'Python']
          }
        ]
      },
    },
    {
      id: 'sec-contact',
      type: 'contact',
      variant: 'minimal-card',
      visible: true,
      data: {
        heading: "Let's build resilient infrastructure together",
        subheading: 'GET IN TOUCH',
        text: 'Always open to discuss cloud migrations, platform architecture, or consulting opportunities.',
        email: 'alex.morgan@cloudops.dev',
        location: 'Remote / Worldwide',
        buttonText: 'Initiate Contact'
      },
    },
  ],
};

export const TEMPLATE_MOCKS = {
  'galactic-noir': {
      "meta": {
          "title": "Galactic Noir Portfolio",
          "slug": "galactic-noir",
          "description": "A sleek, futuristic design with a cosmic touch."
      },
      "theme": {
          "id": "galactic-noir",
          "palette": {
              "bg": "rgb(10, 10, 10)",
              "surface": "rgba(17, 17, 17, 0.5)",
              "surfaceHover": "#1f2937",
              "surfaceCard": "rgba(17, 17, 17, 0.5)",
              "textPrimary": "rgb(255, 255, 255)",
              "textSecondary": "rgb(255, 255, 255)",
              "accent": "rgba(0, 0, 0, 0)",
              "accentHover": "#00b4d8",
              "accentGlow": "rgba(0, 217, 255, 0.25)",
              "border": "1px solid rgba(255, 255, 255, 0.14)",
              "borderHover": "rgba(255,255,255,0.2)"
          },
          "typography": {
              "headingFont": "Comfortaa, cursive",
              "bodyFont": "Comfortaa, \"Comfortaa Fallback\"",
              "monoFont": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
              "radius": "16px"
          }
      },
      "sections": [
          {
              "id": "sec-hero",
              "type": "hero",
              "variant": "galactic-noir",
              "visible": true,
              "data": {
                  "name": "Developer Name",
                  "title": "Software Engineer",
                  "tagline": "Building intelligent systems with clean code.",
                  "badge": "Open to Work",
                  "primaryCta": {
                      "text": "Explore Works",
                      "url": "#projects"
                  }
              }
          },
          {
              "id": "sec-about",
              "type": "about",
              "variant": "galactic-noir",
              "visible": true,
              "data": {
                  "heading": "About Me",
                  "subheading": "WHO I AM",
                  "bio": [
                      "Passionate engineer focusing on robust full-stack architecture."
                  ],
                  "stats": [
                      {
                          "value": "5+",
                          "label": "Years Exp"
                      }
                  ]
              }
          },
          {
              "id": "sec-skills",
              "type": "skills",
              "variant": "galactic-noir",
              "visible": true,
              "data": {
                  "heading": "Skills & Stack",
                  "categories": [
                      {
                          "name": "Core Stack",
                          "skills": [
                              "React",
                              "TypeScript",
                              "Node.js",
                              "Python"
                          ]
                      }
                  ]
              }
          },
          {
              "id": "sec-projects",
              "type": "projects",
              "variant": "galactic-noir",
              "visible": true,
              "data": {
                  "heading": "Featured Works",
                  "items": [
                      {
                          "title": "Project Alpha",
                          "description": "High performance scalable web application.",
                          "tags": [
                              "React",
                              "Tailwind"
                          ],
                          "demoUrl": "#"
                      }
                  ]
              }
          },
          {
              "id": "sec-experience",
              "type": "experience",
              "variant": "galactic-noir",
              "visible": true,
              "data": {
                  "heading": "Experience",
                  "items": [
                      {
                          "role": "Lead Engineer",
                          "company": "Tech Corp",
                          "period": "2023 - Present",
                          "description": "Architecture & delivery."
                      }
                  ]
              }
          },
          {
              "id": "sec-contact",
              "type": "contact",
              "variant": "minimal-card",
              "visible": true,
              "data": {
                  "email": "hello@example.com",
                  "heading": "Get In Touch"
              }
          }
      ]
  },
  'modern-fullstack': {
    meta: {
      title: 'Abdul Mannan — Senior Full-Stack Engineer',
      slug: 'modern-fullstack',
      description: 'Senior frontend and full-stack engineer building modern web applications.'
    },
    theme: THEME_PRESETS['modern-fullstack'],
    sections: [
      {
        id: 'sec-hero',
        type: 'hero',
        variant: 'modern-fullstack',
        visible: true,
        data: {
          name: 'Abdul Mannan',
          title: 'Senior Frontend & Full-Stack Engineer',
          tagline: 'Designing accessible, lightning-fast web applications with modern design systems.',
          primaryCta: { text: 'View Works', url: '#projects' }
        }
      },
      {
        id: 'sec-about',
        type: 'about',
        variant: 'modern-fullstack',
        visible: true,
        data: {
          heading: 'About Me',
          subheading: 'ENGINEERING & DESIGN',
          bio: [
            'Over the past 6+ years, I have architected and built robust web platforms for startups and enterprise teams.',
            'Deeply invested in user experience, interaction details, and modern JavaScript tooling.'
          ],
          stats: [
            { value: '6+', label: 'Years Experience' },
            { value: '25+', label: 'Shipped Products' }
          ]
        }
      },
      {
        id: 'sec-skills',
        type: 'skills',
        variant: 'modern-fullstack',
        visible: true,
        data: {
          heading: 'Tech Stack & Tools',
          categories: [
            { name: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux'] },
            { name: 'Backend & Cloud', skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'] }
          ]
        }
      },
      {
        id: 'sec-projects',
        type: 'projects',
        variant: 'modern-fullstack',
        visible: true,
        data: {
          heading: 'Selected Works',
          items: [
            { title: 'Interactive Analytics Platform', description: 'Real-time telemetry dashboard with dynamic chart widgets and low-latency metrics.', tags: ['React', 'D3.js', 'WebSockets'], demoUrl: '#' },
            { title: 'NextGen Design System', description: 'Comprehensive component library with full dark mode, automated tests, and WCAG AA compliance.', tags: ['Tailwind CSS', 'TypeScript', 'Storybook'], demoUrl: '#' }
          ]
        }
      },
      {
        id: 'sec-experience',
        type: 'experience',
        variant: 'modern-fullstack',
        visible: true,
        data: {
          heading: 'Career Journey',
          items: [
            { role: 'Staff Frontend Engineer', company: 'Cloud Scale Inc.', period: '2023 - Present', description: 'Leading frontend architecture, core web vitals optimization, and developer ergonomics.' },
            { role: 'Full Stack Engineer', company: 'Digital Agency', period: '2020 - 2023', description: 'Delivered high-performance e-commerce and SaaS web apps.' }
          ]
        }
      },
      {
        id: 'sec-contact',
        type: 'contact',
        variant: 'minimal-card',
        visible: true,
        data: {
          heading: 'Get In Touch',
          subheading: 'CONNECT',
          text: 'Interested in working together or have an inquiry? Reach out anytime.',
          email: 'mannan@example.com',
          buttonText: 'Send Email'
        }
      }
    ]
  },
  'devops-architect': MOCK_DEVOPS_PORTFOLIO,
  'terminal-hacker': {
    meta: {
      title: "David 'Cipher' Ross — Systems & Cloud Security",
      slug: 'cipher-systems',
      description: 'Linux kernel developer, infrastructure hacker, and platform security researcher.',
    },
    theme: THEME_PRESETS['emerald-matrix'],
    sections: [
      {
        id: 'sec-hero',
        type: 'hero',
        variant: 'terminal-dev',
        visible: true,
        data: {
          badge: 'Kernel & Systems Security Specialist',
          name: "David 'Cipher' Ross",
          title: 'Staff Systems & Infrastructure Engineer',
          tagline: 'Compiling high-performance kernels, dissecting distributed protocols, and orchestrating bare-metal clusters.',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&h=400&q=80',
          primaryCta: { text: 'Execute: cat projects.log', link: '#projects' },
          secondaryCta: { text: 'ssh contact@cipher.sh', link: '#contact' },
          socials: [
            { platform: 'github', url: 'https://github.com' },
            { platform: 'twitter', url: 'https://x.com' },
          ],
        },
      },
      {
        id: 'sec-about',
        type: 'about',
        variant: 'classic-story',
        visible: true,
        data: {
          heading: 'Systems Thinking & Low-Level Craft',
          subheading: 'ROOT LEVEL',
          bio: [
            'Deeply focused on Linux internals, eBPF security observability, and distributed consensus algorithms.',
            'When not optimizing compiler flags or profiling memory allocations, I contribute to open-source security primitives.'
          ],
          stats: [
            { value: '8+', label: 'Years in Systems' },
            { value: '45+', label: 'Kernel Patches' },
            { value: '99.999%', label: 'Cluster Uptime' },
          ],
          location: 'Berlin / Remote',
        },
      },
      {
        id: 'sec-projects',
        type: 'projects',
        variant: 'bento-grid',
        visible: true,
        data: {
          heading: 'Mission-Critical Deployments',
          subheading: 'SYSTEMS WORK',
          projects: [
            {
              id: 'p-1',
              title: 'eBPF-TraceGuard — Kernel Observability',
              description: 'Zero-overhead packet analyzer intercepting raw syscalls at socket layer to detect anomalous container behavior.',
              image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
              tags: ['C', 'eBPF', 'Linux', 'Rust', 'Grafana'],
              githubUrl: 'https://github.com/example/traceguard',
              liveUrl: 'https://traceguard.dev'
            },
            {
              id: 'p-2',
              title: 'RaftKV — Distributed Consensus Store',
              description: 'Ultra-low latency key-value engine with Raft leader election, WAL log compaction, and snapshotting.',
              image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
              tags: ['Rust', 'Raft', 'Async-IO', 'gRPC'],
              githubUrl: 'https://github.com/example/raftkv',
              liveUrl: 'https://raftkv.io'
            }
          ],
        },
      },
      {
        id: 'sec-skills',
        type: 'skills',
        variant: 'pill-cloud',
        visible: true,
        data: {
          heading: 'Stack & Low-Level Tooling',
          subheading: 'ARSENAL',
          categories: [
            {
              name: 'Core Systems',
              skills: ['Rust', 'C/C++', 'Linux Kernel', 'eBPF', 'Go', 'Assembly x86_64', 'Docker']
            }
          ],
        },
      },
      {
        id: 'sec-experience',
        type: 'experience',
        variant: 'clean-cards',
        visible: true,
        data: {
          heading: 'Career Record',
          subheading: 'TRACK RECORD',
          items: [
            {
              id: 'e-1',
              role: 'Principal Security & Infrastructure Engineer',
              company: 'CoreMatrix Security',
              period: '2022 — Present',
              description: 'Designed kernel-level workload isolation securing over 12,000 production container instances.',
            }
          ],
        },
      },
      {
        id: 'sec-contact',
        type: 'contact',
        variant: 'minimal-card',
        visible: true,
        data: {
          heading: 'Initiate Secure Transmission',
          subheading: 'CONNECT',
          text: 'Available for technical consultations, distributed systems reviews, and infrastructure hardening.',
          email: 'cipher@systems.dev',
          location: 'Encrypted / Worldwide',
          buttonText: 'Dispatch Message'
        },
      },
    ],
  },
  'bento-violet': {
    ...MOCK_DEVELOPER_PORTFOLIO,
    meta: {
      title: 'Sophia Chen — AI Product & SaaS Engineer',
      slug: 'sophia-chen',
      description: 'Building intelligent SaaS products, generative UI flows, and reactive web applications.',
    },
    theme: THEME_PRESETS['bento-violet'],
    sections: MOCK_DEVELOPER_PORTFOLIO.sections.map(s => {
      if (s.type === 'hero') return { ...s, variant: 'split-portrait' };
      if (s.type === 'about') return { ...s, variant: 'bento' };
      if (s.type === 'projects') return { ...s, variant: 'bento-grid' };
      if (s.type === 'skills') return { ...s, variant: 'category-cards' };
      if (s.type === 'experience') return { ...s, variant: 'timeline' };
      return s;
    })
  },
  'cyber-slate': MOCK_DEVELOPER_PORTFOLIO,
  'superdesign-ember': {
    ...MOCK_DEVELOPER_PORTFOLIO,
    meta: {
      title: 'Marcus Sterling — Staff Platform Architect',
      slug: 'marcus-sterling',
      description: 'Obsidian luxury systems design and high-velocity cloud architecture.',
    },
    theme: THEME_PRESETS['superdesign-ember'],
    sections: MOCK_DEVELOPER_PORTFOLIO.sections.map(s => {
      if (s.type === 'hero') return { ...s, variant: 'minimal-centered' };
      if (s.type === 'about') return { ...s, variant: 'bento' };
      if (s.type === 'projects') return { ...s, variant: 'card-grid' };
      if (s.type === 'skills') return { ...s, variant: 'pill-cloud' };
      if (s.type === 'experience') return { ...s, variant: 'clean-cards' };
      return s;
    })
  },
  'editorial-ivory': MOCK_MINIMALIST_PORTFOLIO,
};


/**
 * Creates a clean, unpolluted fresh portfolio template with strictly empty projects.
 * Guaranteed deep clone with no shared references across sessions.
 */
export const createFreshPortfolio = (userName = 'Mon Portfolio', defaultAvatar = null) => ({
  meta: {
    title: `${userName} — Portfolio`,
    slug: `portfolio-${Date.now().toString(36)}`,
    description: 'Portfolio professionnel et vitrine de projets.',
  },
  theme: THEME_PRESETS['cyber-dark'],
  sections: [
    {
      id: 'sec-hero',
      type: 'hero',
      variant: 'split-portrait',
      visible: true,
      data: {
        badge: 'Disponible pour missions & opportunités',
        name: userName || 'Développeur',
        title: 'Ingénieur Logiciel & Cloud',
        tagline: 'Passionné par la conception de solutions logicielles modernes, performantes et scalables.',
        avatar: defaultAvatar || '',
        primaryCta: { text: 'Voir mes Projets', link: '#projects' },
        secondaryCta: { text: 'Me Contacter', link: '#contact' },
        socials: [
          { platform: 'github', url: 'https://github.com' },
          { platform: 'linkedin', url: 'https://linkedin.com' },
        ],
      },
    },
    {
      id: 'sec-about',
      type: 'about',
      variant: 'bento',
      visible: true,
      data: {
        heading: 'À Propos de Moi',
        subheading: 'PARCOURS & VISION',
        bio: [
          'Développeur passionné par les technologies modernes et les architectures cloud.',
          'Je crée des applications robustes avec une attention particulière à la qualité du code et à l’expérience utilisateur.'
        ],
        stats: [
          { value: '3+', label: "Années d'expérience" },
          { value: '100%', label: 'Engagement' },
        ],
        location: 'Maroc',
      },
    },
    {
      id: 'sec-projects',
      type: 'projects',
      variant: 'bento-grid',
      visible: true,
      data: {
        heading: 'Projets Sélectionnés',
        subheading: 'PORTFOLIO',
        projects: [], // STRICTLY EMPTY - User chooses which GitHub repos to import!
      },
    },
    {
      id: 'sec-skills',
      type: 'skills',
      variant: 'category-cards',
      visible: true,
      data: {
        heading: 'Compétences & Technologies',
        subheading: 'STACK TECHNIQUE',
        categories: [
          {
            name: 'Frontend',
            skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'],
          },
          {
            name: 'Backend & Cloud',
            skills: ['Node.js', 'Express', 'Docker', 'Git', 'Linux'],
          },
        ],
      },
    },
    {
      id: 'sec-experience',
      type: 'experience',
      variant: 'timeline',
      visible: true,
      data: {
        heading: 'Expériences & Formations',
        subheading: 'PARCOURS',
        items: [],
      },
    },
    {
      id: 'sec-contact',
      type: 'contact',
      variant: 'minimal-card',
      visible: true,
      data: {
        heading: 'Me Contacter',
        subheading: 'CONTACT',
        text: 'N’hésitez pas à m’écrire pour toute opportunité, collaboration ou échange technique.',
        email: 'contact@example.com',
        location: 'Maroc',
        buttonText: 'Envoyer un Message',
      },
    },
  ],
});
