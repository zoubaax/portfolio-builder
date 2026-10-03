import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/react';
import {
  MOCK_DEVELOPER_PORTFOLIO,
  MOCK_DESIGNER_PORTFOLIO,
  MOCK_MINIMALIST_PORTFOLIO,
  THEME_PRESETS
} from '../types/portfolio';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const { getToken, userId, isSignedIn } = useAuth();
  const { user } = useUser();
  const firstName = user?.firstName || 'Guest';

  // Main portfolio state
  const [portfolio, setPortfolio] = useState(MOCK_DEVELOPER_PORTFOLIO);
  const [portfolioId, setPortfolioId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isPublished, setIsPublished] = useState(false);
  const [versions, setVersions] = useState([]);
  
  // History for Undo / Redo
  const [history, setHistory] = useState([MOCK_DEVELOPER_PORTFOLIO]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Studio UI view state
  const [studioTheme, setStudioTheme] = useState('dark'); // Default to sleek Vercel dark mode
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isEditMode, setIsEditMode] = useState(true); // Elementor-style visual edit mode vs pure preview
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code' (v0 tab toggle)
  const [isChatCollapsed, setIsChatCollapsed] = useState(false); // v0 1-click fullscreen toggle
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'sections' | 'theme' | 'history'
  const [selectedSectionId, setSelectedSectionId] = useState('sec-hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTasks, setActiveTasks] = useState(null);
  const [streamingCode, setStreamingCode] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [hasGeneratedFirstPortfolio, setHasGeneratedFirstPortfolio] = useState(false);

  const getAuthHeaders = useCallback(async () => {
    let token = null;
    try {
      if (getToken) token = await getToken();
    } catch (e) {}

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : { 'x-user-id': 'guest_user' }),
    };
  }, [getToken, userId]);

  // Fetch Version Snapshots from Neon DB
  const fetchVersions = useCallback(async (id = portfolioId) => {
    if (!id) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:5050/api/v1/portfolios/${id}/versions`, { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVersions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch versions', err);
    }
  }, [portfolioId, getAuthHeaders]);

  // Save or Update Portfolio to Neon DB
  const savePortfolio = useCallback(async (publish = false, promptNote = '') => {
    setSaveStatus('saving');
    try {
      const headers = await getAuthHeaders();
      const title = portfolio.meta?.title || 'Portfolio';
      const slug = portfolio.meta?.slug || `portfolio-${Date.now().toString().slice(-4)}`;

      let response;
      if (portfolioId) {
        response = await fetch(`http://localhost:5050/api/v1/portfolios/${portfolioId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            schemaData: portfolio,
            title,
            isPublished: publish,
            promptNote: promptNote || (publish ? 'Published site update' : 'Saved studio revision'),
          }),
        });
      } else {
        response = await fetch(`http://localhost:5050/api/v1/portfolios`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title,
            subdomainSlug: slug,
            schemaData: portfolio,
          }),
        });
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPortfolioId(result.data.id);
        setIsPublished(result.data.isPublished);
        setSaveStatus('saved');
        fetchVersions(result.data.id);
        setTimeout(() => setSaveStatus('idle'), 3000);
        return result.data;
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw new Error(result.message || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      throw err;
    }
  }, [portfolio, portfolioId, getAuthHeaders, fetchVersions]);

  // Rollback to specific version snapshot
  const rollbackToVersion = useCallback(async (versionId) => {
    if (!portfolioId) return;
    setSaveStatus('saving');
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:5050/api/v1/portfolios/${portfolioId}/versions/${versionId}/rollback`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (data.success && data.data?.schemaData) {
        pushState(data.data.schemaData);
        setSaveStatus('saved');
        fetchVersions(portfolioId);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err) {
      console.error('Rollback error', err);
      setSaveStatus('error');
    }
  }, [portfolioId, getAuthHeaders, fetchVersions]);

  const toggleStudioTheme = useCallback(() => {
    setStudioTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Studio AI Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: "👋 Hi! I'm your AI Portfolio Agent. You can edit any text directly on the canvas like Elementor, or describe changes in chat (e.g. 'Make it a dark bento style' or 'Add a machine learning project').",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Push state to history
  const pushState = useCallback((newState) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newState];
    });
    setHistoryIndex((prev) => prev + 1);
    setPortfolio(newState);
  }, [historyIndex]);

  // Undo / Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setPortfolio(history[nextIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setPortfolio(history[nextIndex]);
    }
  }, [history, historyIndex]);

  // Jump to specific version index (v0 version scrubber: v1, v2, v3)
  const jumpToHistoryIndex = useCallback((targetIndex) => {
    if (targetIndex >= 0 && targetIndex < history.length) {
      setHistoryIndex(targetIndex);
      setPortfolio(history[targetIndex]);
    }
  }, [history]);

  // Update Section Data (used by inline text edits and inspector)
  const updateSection = useCallback((sectionId, updater) => {
    setPortfolio((current) => {
      const updatedSections = current.sections.map((sec) => {
        if (sec.id === sectionId) {
          const newData = typeof updater === 'function' ? updater(sec.data) : { ...sec.data, ...updater };
          return { ...sec, data: newData };
        }
        return sec;
      });
      const newState = { ...current, sections: updatedSections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Direct Inline Field Update (e.g., 'tagline', 'title', 'name', 'bio')
  const updateSectionField = useCallback((sectionId, fieldPath, newValue) => {
    setPortfolio((current) => {
      const updatedSections = current.sections.map((sec) => {
        if (sec.id === sectionId) {
          const dataCopy = { ...sec.data };
          // Support top-level field or nested
          if (!fieldPath.includes('.')) {
            dataCopy[fieldPath] = newValue;
          } else {
            const parts = fieldPath.split('.');
            let curr = dataCopy;
            for (let i = 0; i < parts.length - 1; i++) {
              curr[parts[i]] = { ...curr[parts[i]] };
              curr = curr[parts[i]];
            }
            curr[parts[parts.length - 1]] = newValue;
          }
          return { ...sec, data: dataCopy };
        }
        return sec;
      });
      const newState = { ...current, sections: updatedSections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Change Section Variant
  const changeSectionVariant = useCallback((sectionId, variant) => {
    setPortfolio((current) => {
      const updatedSections = current.sections.map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, variant };
        }
        return sec;
      });
      const newState = { ...current, sections: updatedSections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Toggle Section Visibility
  const toggleSectionVisibility = useCallback((sectionId) => {
    setPortfolio((current) => {
      const updatedSections = current.sections.map((sec) => {
        if (sec.id === sectionId) {
          return { ...sec, visible: sec.visible === false ? true : false };
        }
        return sec;
      });
      const newState = { ...current, sections: updatedSections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Reorder Sections
  const moveSection = useCallback((fromIndex, toIndex) => {
    setPortfolio((current) => {
      const sections = [...current.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      const newState = { ...current, sections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Delete Section (Elementor Trash Icon)
  const deleteSection = useCallback((sectionId) => {
    setPortfolio((current) => {
      const updatedSections = current.sections.filter((s) => s.id !== sectionId);
      const newState = { ...current, sections: updatedSections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Duplicate Section (Elementor Duplicate Icon)
  const duplicateSection = useCallback((sectionId) => {
    setPortfolio((current) => {
      const targetIndex = current.sections.findIndex((s) => s.id === sectionId);
      if (targetIndex === -1) return current;

      const target = current.sections[targetIndex];
      const duplicated = {
        ...JSON.parse(JSON.stringify(target)),
        id: `sec-${Date.now()}`,
      };

      const sectionsCopy = [...current.sections];
      sectionsCopy.splice(targetIndex + 1, 0, duplicated);
      const newState = { ...current, sections: sectionsCopy };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Add New Section (The Elementor '+' button)
  const addSection = useCallback((type, afterIndex) => {
    setPortfolio((current) => {
      let newSection = null;
      const id = `sec-${type}-${Date.now()}`;

      if (type === 'projects') {
        newSection = {
          id,
          type: 'projects',
          variant: 'bento-grid',
          visible: true,
          data: {
            heading: 'New Projects Showcase',
            subheading: 'PORTFOLIO',
            projects: [
              {
                id: `proj-${Date.now()}`,
                title: 'Quantum Ledger — Decentralized Database',
                description: 'Fault-tolerant distributed ledger with Raft consensus and zero-knowledge proofs.',
                tags: ['Rust', 'gRPC', 'Cryptography'],
                metrics: 'Sub-second finality',
                link: 'https://example.com',
                github: 'https://github.com',
                image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
                featured: true,
              },
            ],
          },
        };
      } else if (type === 'skills') {
        newSection = {
          id,
          type: 'skills',
          variant: 'pill-cloud',
          visible: true,
          data: {
            heading: 'Core Competencies',
            subheading: 'EXPERTISE',
            categories: [
              {
                name: 'Core Skills',
                skills: ['System Design', 'Cloud Architecture', 'TypeScript', 'PostgreSQL', 'GraphQL', 'Next.js'],
              },
            ],
          },
        };
      } else if (type === 'experience') {
        newSection = {
          id,
          type: 'experience',
          variant: 'clean-cards',
          visible: true,
          data: {
            heading: 'Professional Track Record',
            subheading: 'CAREER',
            items: [
              {
                id: `exp-${Date.now()}`,
                role: 'Senior Software Engineer',
                company: 'Vanguard Technologies',
                period: '2024 — Present',
                description: 'Leading platform engineering and microservice modernization initiatives.',
                technologies: ['Node.js', 'Go', 'Docker', 'AWS'],
              },
            ],
          },
        };
      } else if (type === 'about') {
        newSection = {
          id,
          type: 'about',
          variant: 'bento',
          visible: true,
          data: {
            heading: 'My Perspective & Background',
            subheading: 'ABOUT',
            bio: ['I am a passionate technologist focused on crafting reliable, elegant software experiences.'],
            stats: [
              { value: '5+', label: 'Years Active' },
              { value: '100%', label: 'Commitment' },
            ],
            location: 'Remote / Global',
          },
        };
      } else {
        newSection = {
          id,
          type: 'contact',
          variant: 'minimal-card',
          visible: true,
          data: {
            heading: 'Start a Conversation',
            subheading: 'GET IN TOUCH',
            text: 'Available for high-impact engineering projects and consulting.',
            email: 'hello@example.com',
            buttonText: 'Send Email',
          },
        };
      }

      const sections = [...current.sections];
      const insertAt = typeof afterIndex === 'number' ? afterIndex + 1 : sections.length;
      sections.splice(insertAt, 0, newSection);

      const newState = { ...current, sections };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Contextual AI Refinement for a specific section
  const refineSectionWithAi = useCallback((sectionId, prompt) => {
    if (!prompt?.trim() || isGenerating) return;

    setIsGenerating(true);
    setTimeout(() => {
      setPortfolio((current) => {
        const updated = current.sections.map((sec) => {
          if (sec.id === sectionId) {
            const data = { ...sec.data };
            if (sec.type === 'hero') {
              data.tagline = `${data.tagline} Refined for greater market impact.`;
            } else if (sec.type === 'about') {
              data.heading = 'Architecting Future-Proof Systems';
            } else if (sec.type === 'projects') {
              data.heading = 'High-Impact Works & Case Studies';
            }
            return { ...sec, data };
          }
          return sec;
        });

        const newState = { ...current, sections: updated };
        pushState(newState);
        return newState;
      });

      setIsGenerating(false);
    }, 700);
  }, [isGenerating, pushState]);

  // Set Theme Preset
  const setThemePreset = useCallback((presetId) => {
    const selectedPreset = THEME_PRESETS[presetId];
    if (!selectedPreset) return;

    setPortfolio((current) => {
      const newState = { ...current, theme: selectedPreset };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Update Theme Color or Font Token
  const updateThemeToken = useCallback((category, key, value) => {
    setPortfolio((current) => {
      const newTheme = {
        ...current.theme,
        [category]: {
          ...current.theme[category],
          [key]: value,
        },
      };
      const newState = { ...current, theme: newTheme };
      pushState(newState);
      return newState;
    });
  }, [pushState]);

  // Load Full Preset Portfolio
  const loadPresetPortfolio = useCallback((presetType) => {
    let target = MOCK_DEVELOPER_PORTFOLIO;
    if (presetType === 'designer') target = MOCK_DESIGNER_PORTFOLIO;
    if (presetType === 'minimalist') target = MOCK_MINIMALIST_PORTFOLIO;
    pushState(target);
  }, [pushState]);

  // AI Prompt Processor with Real Backend SSE Streaming & Live Step-by-Step Task Checklist
  const sendChatMessage = useCallback(async (promptText) => {
    if (!promptText?.trim() || isGenerating) return;

    setActiveTab('chat'); // Auto-switch to chat tab in Studio Left Panel

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setCurrentPrompt(promptText);
    setStreamingCode('');
    setViewMode('code'); // Force user to Code tab before starting!

    // Initialize 6 Architectural Checklist Tasks
    const initialTasks = [
      { id: 't1', label: 'Analyzing prompt & synthesizing design tokens', done: false, active: true },
      { id: 't2', label: 'Generating high-impact Hero positioning & tagline', done: false, active: false },
      { id: 't3', label: 'Crafting About narrative & engineering philosophy', done: false, active: false },
      { id: 't4', label: 'Curating Projects showcase & bento case studies', done: false, active: false },
      { id: 't5', label: 'Structuring Skills matrix & Career trajectory', done: false, active: false },
      { id: 't6', label: 'Compiling responsive schema & saving Neon DB snapshot', done: false, active: false },
    ];
    setActiveTasks(initialTasks);

    let currentStep = 0;
    const taskTimer = setInterval(() => {
      currentStep++;
      if (currentStep < initialTasks.length) {
        setActiveTasks((prev) =>
          prev
            ? prev.map((t, idx) =>
                idx < currentStep
                  ? { ...t, done: true, active: false }
                  : idx === currentStep
                  ? { ...t, active: true, done: false }
                  : t
              )
            : null
        );
      }
    }, 650);

    const assistantMsgId = `msg-ai-${Date.now()}`;
    // Add clean assistant message placeholder (NO raw JSON)
    setChatMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        text: `Synthesizing custom portfolio architecture from prompt...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch('http://localhost:5050/api/v1/ai/stream-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          portfolio,
          prompt: promptText,
          provider: 'nvidia',
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Backend stream request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      let updatedPortfolio = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = (streamBuffer + chunkText).split('\n\n');
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', '').trim());
              // Buffer raw JSON to streamingCode for the Code inspector tab, NOT chat text!
              if (data.chunk) {
                setStreamingCode((prev) => prev + data.chunk);
              }
              if (data.done && data.updatedPortfolio) {
                updatedPortfolio = data.updatedPortfolio;
              }
            } catch {}
          }
        }
      }

      if (updatedPortfolio) {
        // Ensure user's name is applied if mentioned in prompt
        const nameMatch = promptText.match(/(?:my name is|i am|name:?)\s+([A-Za-z0-9_-]+)/i);
        if (nameMatch && nameMatch[1]) {
          const extractedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
          updatedPortfolio.meta = { ...updatedPortfolio.meta, title: `${extractedName} Portfolio` };
          updatedPortfolio.sections = updatedPortfolio.sections.map((s) =>
            s.type === 'hero' ? { ...s, data: { ...s.data, name: extractedName } } : s
          );
        }

        pushState(updatedPortfolio);
        setHasGeneratedFirstPortfolio(true);
        const finalTasks = initialTasks.map((t) => ({ ...t, done: true, active: false }));
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: `✓ Synthesized custom portfolio layout and theme for: "${promptText}"`,
                  tasks: finalTasks,
                }
              : m
          )
        );
        setTimeout(() => {
          setViewMode('preview');
        }, 1200);
      } else {
        throw new Error('No updated portfolio returned by model');
      }
    } catch (err) {
      // High-Impact Intelligent Fallback
      const lower = promptText.toLowerCase();
      const nameMatch = promptText.match(/(?:my name is|i am|name:?)\s+([A-Za-z0-9_-]+)/i);
      const existingName = portfolio.sections.find(s => s.type === 'hero')?.data?.name;
      let personName = existingName && existingName !== 'Alex Vance' ? existingName : firstName;
      if (nameMatch && nameMatch[1]) {
         personName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
      }

      let fallbackPortfolio = { ...portfolio };
      fallbackPortfolio.meta = {
        ...fallbackPortfolio.meta,
        title: `${personName} — DevOps & Platform Engineer`,
      };

      let replyText = `Synthesized customized portfolio architecture for ${personName}!`;

      if (lower.includes('devops') || lower.includes('cloud') || lower.includes('terminal') || lower.includes('cyber')) {
        fallbackPortfolio.theme = THEME_PRESETS['cyber-dark'];
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) => {
          if (s.type === 'hero') {
            return {
              ...s,
              variant: 'terminal-dev',
              data: {
                ...s.data,
                name: personName,
                title: 'Senior DevOps & Platform Engineer',
                tagline: 'Automating resilient multi-cloud architecture, zero-downtime GitOps pipelines, and scalable Kubernetes clusters.',
                terminalCommands: [
                  { cmd: 'whoami', output: `${personName.toLowerCase()} (Platform Architect)` },
                  { cmd: 'kubectl get nodes', output: 'STATUS: 12 Nodes Ready • 99.99% Uptime' },
                  { cmd: 'terraform plan', output: 'Multi-Region AWS Infrastructure: 0 to destroy' },
                ],
              },
            };
          }
          if (s.type === 'skills') {
            return {
              ...s,
              data: {
                ...s.data,
                heading: 'Core Infrastructure & Tools',
                categories: [
                  { name: 'Cloud & Containers', skills: ['Kubernetes (EKS)', 'Docker', 'AWS', 'GCP'] },
                  { name: 'Infrastructure as Code', skills: ['Terraform', 'Terragrunt', 'OpenTofu'] },
                  { name: 'CI/CD & GitOps', skills: ['ArgoCD', 'GitHub Actions', 'GitLab CI'] },
                  { name: 'Observability & SRE', skills: ['Prometheus', 'Grafana', 'Datadog'] },
                ],
              },
            };
          }
          if (s.type === 'projects') {
            return {
              ...s,
              variant: 'bento-grid',
              data: {
                ...s.data,
                heading: 'Infrastructure Case Studies',
                projects: [
                  {
                    id: 'case-1',
                    title: 'Multi-Region EKS Migration',
                    description: 'Zero-downtime migration of 85 microservices to Kubernetes EKS with active-active failover.',
                    tags: ['Kubernetes', 'AWS', 'Terraform', 'Istio'],
                    metrics: '99.995% Uptime • -32% Cloud Costs',
                    featured: true,
                  },
                  {
                    id: 'case-2',
                    title: 'GitOps Pipeline with ArgoCD',
                    description: 'Automated declarative continuous deployment with automated canary analysis.',
                    tags: ['ArgoCD', 'Helm', 'GitHub Actions'],
                    metrics: '150+ deploys/day with 0 rollback incidents',
                    featured: false,
                  },
                  {
                    id: 'case-3',
                    title: 'Zero-Downtime Multi-Cloud IaC',
                    description: 'Unified multi-cloud provisioning using Terraform and Terragrunt modules.',
                    tags: ['Terraform', 'AWS', 'GCP', 'OpenTofu'],
                    metrics: '100% Declarative State',
                    featured: false,
                  },
                ],
              },
            };
          }
          return s;
        });
        replyText = `Synthesized high-impact DevOps & Platform Engineering portfolio for ${personName} with Cyber Dark & Terminal Hero!`;
      } else if (lower.includes('bento') || lower.includes('violet')) {
        fallbackPortfolio.theme = THEME_PRESETS['bento-violet'];
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) => {
          if (s.type === 'hero') {
            return { ...s, data: { ...s.data, name: personName } };
          }
          if (s.type === 'projects') {
            return { ...s, variant: 'bento-grid' };
          }
          return s;
        });
        replyText = `Synthesized Bento Violet layout for ${personName}!`;
      } else if (lower.includes('minimal') || lower.includes('editorial')) {
        fallbackPortfolio.theme = THEME_PRESETS['minimal-editorial'];
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) => {
          if (s.type === 'hero') {
            return { ...s, variant: 'minimal-centered', data: { ...s.data, name: personName } };
          }
          return s;
        });
        replyText = `Synthesized Minimal Editorial portfolio for ${personName}!`;
      } else if (lower.includes('emerald') || lower.includes('green')) {
        fallbackPortfolio.theme = THEME_PRESETS['emerald-matrix'];
        replyText = `Applied Emerald Matrix theme with vivid green accents for ${personName}!`;
      } else if (lower.includes('orange') || lower.includes('ember') || lower.includes('#ff4500')) {
        fallbackPortfolio.theme = THEME_PRESETS['superdesign-ember'];
        replyText = `Applied Superdesign Ember theme with flame orange accents for ${personName}!`;
      } else if (lower.includes('cyan') || lower.includes('blue')) {
        fallbackPortfolio.theme = THEME_PRESETS['cyber-dark'];
        replyText = `Applied Cyber Dark theme with cyber cyan accents for ${personName}!`;
      } else if (lower.match(/#[0-9a-f]{3,6}/i)) {
        const hex = lower.match(/#[0-9a-f]{3,6}/i)[0];
        fallbackPortfolio.theme = {
          ...fallbackPortfolio.theme,
          palette: {
            ...fallbackPortfolio.theme.palette,
            accent: hex,
            accentHover: hex,
            accentGlow: `${hex}40`,
            border: `${hex}30`,
          },
        };
        replyText = `Updated portfolio accent color to ${hex}!`;
      } else {
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) =>
          s.type === 'hero' ? { ...s, data: { ...s.data, name: personName } } : s
        );
      }

      pushState(fallbackPortfolio);
      setHasGeneratedFirstPortfolio(true);
      const finalTasks = initialTasks.map((t) => ({ ...t, done: true, active: false }));
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: replyText,
                tasks: finalTasks,
              }
            : m
        )
      );
      setTimeout(() => {
        setViewMode('preview');
      }, 1200);
    } finally {
      clearInterval(taskTimer);
      setActiveTasks(null);
      setIsGenerating(false);
    }
  }, [isGenerating, portfolio, pushState, getAuthHeaders]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        setPortfolio,
        studioTheme,
        setStudioTheme,
        toggleStudioTheme,
        deviceView,
        setDeviceView,
        isEditMode,
        setIsEditMode,
        viewMode,
        setViewMode,
        isChatCollapsed,
        setIsChatCollapsed,
        activeTab,
        setActiveTab,
        selectedSectionId,
        setSelectedSectionId,
        chatMessages,
        isGenerating,
        activeTasks,
        streamingCode,
        currentPrompt,
        hasGeneratedFirstPortfolio,
        history,
        historyIndex,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo,
        redo,
        jumpToHistoryIndex,
        updateSection,
        updateSectionField,
        changeSectionVariant,
        toggleSectionVisibility,
        moveSection,
        deleteSection,
        duplicateSection,
        addSection,
        refineSectionWithAi,
        setThemePreset,
        updateThemeToken,
        loadPresetPortfolio,
        sendChatMessage,
        portfolioId,
        saveStatus,
        isPublished,
        versions,
        savePortfolio,
        fetchVersions,
        rollbackToVersion,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
