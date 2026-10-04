/**
 * Portfolio Schema Definitions and Theme Presets
 * Serves as the single source of truth for the AI Generator, Live Preview, and Exporter.
 */

export const THEME_PRESETS = {
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
};

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

/**
 * Creates a clean, unpolluted fresh portfolio template with strictly empty projects.
 * Guaranteed deep clone with no shared references across sessions.
 */
export const createFreshPortfolio = (userName = 'Mon Portfolio') => ({
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
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
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
