import JSZip from 'jszip';

/**
 * Compiles a dynamic PortfolioSchema into a standalone, production-ready
 * React 19 + Tailwind CSS v4 + Vite project files map.
 */
export function generateProjectFiles(portfolio) {
  const meta = portfolio?.meta || {};
  const theme = portfolio?.theme || {};
  const palette = theme?.palette || {};
  const sections = portfolio?.sections || [];

  const heroSec = sections.find((s) => s.type === 'hero');
  const aboutSec = sections.find((s) => s.type === 'about');
  const projectsSec = sections.find((s) => s.type === 'projects');
  const skillsSec = sections.find((s) => s.type === 'skills');
  const contactSec = sections.find((s) => s.type === 'contact');

  const title = meta.title || 'My Developer Portfolio';
  const description = meta.description || 'Personal professional portfolio showcase.';

  const files = {};

  // 1. package.json
  files['package.json'] = JSON.stringify(
    {
      name: (meta.slug || 'my-portfolio').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'react-icons': '^5.4.0',
        'lucide-react': '^0.468.0',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.4',
        '@tailwindcss/vite': '^4.0.0',
        tailwindcss: '^4.0.0',
        vite: '^6.0.0',
      },
    },
    null,
    2
  );

  // 2. vite.config.js
  files['vite.config.js'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

  // 3. index.html
  files['index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

  // 4. src/index.css with theme CSS variables derived from portfolio
  files['src/index.css'] = `@import "tailwindcss";

:root {
  --theme-bg: ${palette.bg || '#0f1117'};
  --theme-surface: ${palette.surface || '#161922'};
  --theme-text-primary: ${palette.textPrimary || '#f3f4f6'};
  --theme-text-secondary: ${palette.textSecondary || '#9ca3af'};
  --theme-accent: ${palette.accent || '#3b82f6'};
  --theme-accent-hover: ${palette.accentHover || palette.accent || '#2563eb'};
  --theme-accent-glow: ${palette.accentGlow || 'rgba(59, 130, 246, 0.25)'};
  --theme-border: ${palette.border || 'rgba(255, 255, 255, 0.08)'};
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--theme-bg);
  color: var(--theme-text-primary);
  min-height: 100vh;
}

html {
  scroll-behavior: smooth;
}
`;

  // 5. src/main.jsx
  files['src/main.jsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  // 6. src/App.jsx
  files['src/App.jsx'] = `import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Projects } from './components/Projects';
import { Skills } from './components/Skills';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text-primary)] flex flex-col font-sans selection:bg-[var(--theme-accent)] selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
`;

  // 7. src/components/Navbar.jsx
  const heroName = heroSec?.data?.name || 'Portfolio';
  files['src/components/Navbar.jsx'] = `import React, { useState } from 'react';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--theme-border)] bg-[var(--theme-bg)]/80">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="font-bold text-base tracking-tight hover:text-[var(--theme-accent)] transition-colors">
          ${escapeJsString(heroName)}
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--theme-text-secondary)]">
          <a href="#about" className="hover:text-[var(--theme-text-primary)] transition-colors">About</a>
          <a href="#projects" className="hover:text-[var(--theme-text-primary)] transition-colors">Projects</a>
          <a href="#skills" className="hover:text-[var(--theme-text-primary)] transition-colors">Skills</a>
          <a href="#contact" className="hover:text-[var(--theme-text-primary)] transition-colors">Contact</a>
        </nav>

        <a
          href="#contact"
          className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--theme-accent)] text-white hover:opacity-90 transition-opacity"
        >
          Get in Touch
        </a>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-[var(--theme-text-primary)]"
          aria-label="Toggle menu"
        >
          {isOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenuLine className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-[var(--theme-border)] bg-[var(--theme-surface)] px-6 py-4 space-y-3 text-sm">
          <a href="#about" onClick={() => setIsOpen(false)} className="block py-1">About</a>
          <a href="#projects" onClick={() => setIsOpen(false)} className="block py-1">Projects</a>
          <a href="#skills" onClick={() => setIsOpen(false)} className="block py-1">Skills</a>
          <a href="#contact" onClick={() => setIsOpen(false)} className="block py-1">Contact</a>
        </div>
      )}
    </header>
  );
};
`;

  // 8. src/components/Hero.jsx
  const heroData = heroSec?.data || {};
  files['src/components/Hero.jsx'] = `import React from 'react';
import { RiArrowRightUpLine } from 'react-icons/ri';

export const Hero = () => {
  return (
    <section id="hero" className="py-20 md:py-28 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          ${
            heroData.badge
              ? `<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--theme-border)] bg-[var(--theme-surface)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>${escapeJsString(heroData.badge)}</span>
          </div>`
              : ''
          }
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Hi, I'm <span style={{ color: 'var(--theme-accent)' }}>${escapeJsString(heroData.name || 'Alex')}</span>
          </h1>
          <p className="text-lg md:text-xl font-medium text-[var(--theme-text-primary)]">
            ${escapeJsString(heroData.title || 'Full-Stack Developer')}
          </p>
          <p className="text-base text-[var(--theme-text-secondary)] leading-relaxed max-w-xl">
            ${escapeJsString(heroData.tagline || 'Building high-performance software systems and modern web applications.')}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-[var(--theme-accent)] text-white hover:opacity-90 transition-all shadow-md"
            >
              <span>${escapeJsString(heroData.primaryCta?.text || 'Explore Work')}</span>
              <RiArrowRightUpLine className="w-4 h-4" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-border)] transition-colors"
            >
              <span>${escapeJsString(heroData.secondaryCta?.text || 'Contact Me')}</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="relative group w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border border-[var(--theme-border)] p-2 bg-[var(--theme-surface)] shadow-2xl">
            <img
              src="${escapeJsString(heroData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')}"
              alt="${escapeJsString(heroData.name || 'Portrait')}"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
`;

  // 9. src/components/About.jsx
  const aboutData = aboutSec?.data || {};
  const bioParagraphs = Array.isArray(aboutData.bio) ? aboutData.bio : [aboutData.bio || ''];
  const statsList = Array.isArray(aboutData.stats) ? aboutData.stats : [];
  files['src/components/About.jsx'] = `import React from 'react';

export const About = () => {
  return (
    <section id="about" className="py-20 px-6 max-w-6xl mx-auto border-t border-[var(--theme-border)]">
      <div className="space-y-4 mb-12">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--theme-accent)]">
          ${escapeJsString(aboutData.subheading || 'ABOUT ME')}
        </span>
        <h2 className="text-3xl font-bold tracking-tight">
          ${escapeJsString(aboutData.heading || 'Background & Philosophy')}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4 text-[var(--theme-text-secondary)] leading-relaxed text-base">
          ${bioParagraphs
            .map((p) => `<p>${escapeJsString(p)}</p>`)
            .join('\n          ')}
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          ${statsList
            .map(
              (st) => `<div className="p-5 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)]">
            <div className="text-3xl font-extrabold text-[var(--theme-accent)] mb-1">${escapeJsString(st.value)}</div>
            <div className="text-xs font-medium text-[var(--theme-text-secondary)]">${escapeJsString(st.label)}</div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>
  );
};
`;

  // 10. src/components/Projects.jsx
  const projectsData = projectsSec?.data || {};
  const projectList = Array.isArray(projectsData.projects) ? projectsData.projects : [];
  files['src/components/Projects.jsx'] = `import React from 'react';
import { RiGithubLine, RiExternalLinkLine } from 'react-icons/ri';

const projects = ${JSON.stringify(projectList, null, 2)};

export const Projects = () => {
  return (
    <section id="projects" className="py-20 px-6 max-w-6xl mx-auto border-t border-[var(--theme-border)]">
      <div className="space-y-4 mb-12">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--theme-accent)]">
          PORTFOLIO SHOWCASE
        </span>
        <h2 className="text-3xl font-bold tracking-tight">
          ${escapeJsString(projectsData.heading || 'Featured Projects')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, idx) => (
          <div
            key={proj.id || idx}
            className="group rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] overflow-hidden flex flex-col hover:border-[var(--theme-accent)] transition-all shadow-sm hover:shadow-lg"
          >
            {proj.image && (
              <div className="h-44 w-full overflow-hidden bg-black/10">
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-[var(--theme-text-secondary)] line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text-secondary)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-[var(--theme-border)]">
                  {proj.github && (
                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] flex items-center gap-1 transition-colors"
                    >
                      <RiGithubLine className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[var(--theme-accent)] hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>Live Demo</span>
                      <RiExternalLinkLine className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
`;

  // 11. src/components/Skills.jsx
  const skillsData = skillsSec?.data || {};
  const skillsCategories = Array.isArray(skillsData.categories) ? skillsData.categories : [];
  files['src/components/Skills.jsx'] = `import React from 'react';

const categories = ${JSON.stringify(skillsCategories, null, 2)};

export const Skills = () => {
  return (
    <section id="skills" className="py-20 px-6 max-w-6xl mx-auto border-t border-[var(--theme-border)]">
      <div className="space-y-4 mb-12">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--theme-accent)]">
          TECH STACK & ARCHITECTURE
        </span>
        <h2 className="text-3xl font-bold tracking-tight">
          ${escapeJsString(skillsData.heading || 'Skills & Expertise')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-4"
          >
            <h3 className="text-sm font-bold tracking-tight text-[var(--theme-text-primary)]">
              {cat.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(cat.skills) &&
                cat.skills.map((skill, sIdx) => {
                  const name = typeof skill === 'string' ? skill : skill.name;
                  return (
                    <span
                      key={sIdx}
                      className="px-3 py-1 rounded-xl text-xs font-medium border border-[var(--theme-border)] bg-[var(--theme-bg)] text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)] transition-colors"
                    >
                      {name}
                    </span>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
`;

  // 12. src/components/Contact.jsx
  const contactData = contactSec?.data || {};
  const socials = Array.isArray(heroData.socials) ? heroData.socials : [];
  files['src/components/Contact.jsx'] = `import React from 'react';
import { RiMailLine, RiSendPlaneLine } from 'react-icons/ri';

const socials = ${JSON.stringify(socials, null, 2)};

export const Contact = () => {
  return (
    <section id="contact" className="py-20 px-6 max-w-4xl mx-auto border-t border-[var(--theme-border)] text-center">
      <div className="space-y-4 mb-8">
        <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[var(--theme-accent)]">
          CONNECT
        </span>
        <h2 className="text-3xl font-bold tracking-tight">
          ${escapeJsString(contactData.heading || "Let's Build Something Great Together")}
        </h2>
        <p className="text-sm text-[var(--theme-text-secondary)] max-w-md mx-auto">
          ${escapeJsString(contactData.subheading || 'Feel free to reach out for collaborations, high-impact roles, or project inquiries.')}
        </p>
      </div>

      <div className="inline-flex flex-col sm:flex-row items-center gap-4 justify-center">
        ${
          contactData.email
            ? `<a
          href="mailto:${escapeJsString(contactData.email)}"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--theme-accent)] text-white hover:opacity-90 transition-all shadow-md"
        >
          <RiMailLine className="w-4 h-4" />
          <span>${escapeJsString(contactData.email)}</span>
        </a>`
            : ''
        }
        <div className="flex items-center gap-3">
          {socials.map((soc, idx) => (
            <a
              key={idx}
              href={soc.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-border)] text-xs font-semibold capitalize transition-colors"
            >
              {soc.platform}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
`;

  // 13. src/components/Footer.jsx
  files['src/components/Footer.jsx'] = `import React from 'react';

export const Footer = () => {
  return (
    <footer className="py-8 px-6 border-t border-[var(--theme-border)] text-center text-xs text-[var(--theme-text-secondary)] font-mono">
      <p>© {new Date().getFullYear()} ${escapeJsString(heroName)}. Built with Portfolify Studio.</p>
    </footer>
  );
};
`;

  // 14. README.md
  files['README.md'] = `# ${title}

${description}

Generated with **[Portfolify](https://portfolify.dev)** — The AI-Powered Developer Portfolio Studio.

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org) (v18+) installed.

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
\`\`\`

## 🛠 Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** React Icons (\`react-icons/ri\`)
`;

  return files;
}

/**
 * Packs the generated files into a ZIP archive and triggers a browser download.
 */
export async function downloadProjectZip(portfolio) {
  const files = generateProjectFiles(portfolio);
  const zip = new JSZip();

  // Populate files in zip
  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${(portfolio?.meta?.slug || 'portfolio').toLowerCase().replace(/[^a-z0-9-]/g, '-')}-source.zip`;

  // Trigger native browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return filename;
}

// Helpers
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJsString(str = '') {
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
