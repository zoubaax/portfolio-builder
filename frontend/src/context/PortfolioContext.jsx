import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/react';
import {
  MOCK_DEVELOPER_PORTFOLIO,
  MOCK_DESIGNER_PORTFOLIO,
  MOCK_MINIMALIST_PORTFOLIO,
  THEME_PRESETS
} from '../types/portfolio';

const DEFAULT_WELCOME_MESSAGE = {
  id: 'msg-welcome',
  role: 'assistant',
  text: "👋 Hi! I'm your AI Portfolio Agent. You can describe what you need in chat (e.g. 'Senior DevOps Engineer with terminal hero and dark cyber theme') or customize your layout directly.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

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

  // Chat & Multi-session management state
  const [chatMessages, setChatMessages] = useState([DEFAULT_WELCOME_MESSAGE]);
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  // Fetch All User Sessions (Chat & Portfolio History)
  const fetchUserSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('http://localhost:5050/api/v1/portfolios', { headers });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user sessions', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [getAuthHeaders]);

  // Auto-sync sessions when auth is ready
  useEffect(() => {
    if (isSignedIn) {
      fetchUserSessions();
    }
  }, [isSignedIn, fetchUserSessions]);

  // Load a specific portfolio & chat session from Neon DB
  const loadPortfolioSession = useCallback(async (id) => {
    if (!id) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:5050/api/v1/portfolios/${id}`, { headers });
      const data = await res.json();
      if (data.success && data.data) {
        const item = data.data;
        setPortfolioId(item.id);
        if (item.schemaData) {
          setPortfolio(item.schemaData);
          setHistory([item.schemaData]);
          setHistoryIndex(0);
        }
        setIsPublished(!!item.isPublished);

        if (Array.isArray(item.chatHistory) && item.chatHistory.length > 0) {
          setChatMessages(item.chatHistory);
        } else {
          setChatMessages([
            {
              id: `msg-welcome-${item.id}`,
              role: 'assistant',
              text: `📂 Session "${item.title || 'Portfolio'}" chargée avec succès. Vous pouvez continuer à personnaliser votre portfolio ici.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
        setHasGeneratedFirstPortfolio(true);
        fetchVersions(item.id);
        setIsHistoryOpen(false);
        window.history.replaceState(null, '', `/studio/${item.id}`);
        return item;
      }
    } catch (err) {
      console.error('Failed to load portfolio session', err);
    }
  }, [getAuthHeaders, fetchVersions]);

  // Start a fresh, clean chat session
  const createNewSession = useCallback(() => {
    setPortfolioId(null);
    setPortfolio(MOCK_DEVELOPER_PORTFOLIO);
    setHistory([MOCK_DEVELOPER_PORTFOLIO]);
    setHistoryIndex(0);
    setChatMessages([DEFAULT_WELCOME_MESSAGE]);
    setHasGeneratedFirstPortfolio(false);
    setVersions([]);
    setIsHistoryOpen(false);
    window.history.replaceState(null, '', '/studio');
  }, []);

  // Delete a session
  const deleteSession = useCallback(async (id) => {
    if (!id) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:5050/api/v1/portfolios/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (portfolioId === id) {
          createNewSession();
        }
      }
    } catch (err) {
      console.error('Failed to delete session', err);
    }
  }, [portfolioId, getAuthHeaders, createNewSession]);

  // Rename a session
  const renameSession = useCallback(async (id, newTitle) => {
    if (!id || !newTitle?.trim()) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`http://localhost:5050/api/v1/portfolios/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s))
        );
        if (portfolioId === id) {
          setPortfolio((prev) => ({
            ...prev,
            meta: { ...prev.meta, title: newTitle.trim() },
          }));
        }
      }
    } catch (err) {
      console.error('Failed to rename session', err);
    }
  }, [portfolioId, getAuthHeaders]);

  // Auto-Persist Session (Persists schema & chatHistory seamlessly on AI generations)
  const persistSession = useCallback(async (currentPortfolio, currentChat, promptNote) => {
    try {
      const headers = await getAuthHeaders();
      const title = currentPortfolio.meta?.title || 'Portfolio';
      const rawSlug = currentPortfolio.meta?.slug || `port-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const cleanSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 48) || `port-${Date.now().toString().slice(-6)}`;

      if (portfolioId) {
        await fetch(`http://localhost:5050/api/v1/portfolios/${portfolioId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            schemaData: currentPortfolio,
            chatHistory: currentChat,
            title,
            promptNote: promptNote || 'AI Prompt Update',
          }),
        });
        fetchVersions(portfolioId);
        fetchUserSessions();
      } else {
        const res = await fetch(`http://localhost:5050/api/v1/portfolios`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title,
            subdomainSlug: cleanSlug,
            schemaData: currentPortfolio,
            chatHistory: currentChat,
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.id) {
          const newId = data.data.id;
          setPortfolioId(newId);
          window.history.replaceState(null, '', `/studio/${newId}`);
          fetchVersions(newId);
          fetchUserSessions();
        }
      }
    } catch (err) {
      console.error('Auto-persist session error:', err);
    }
  }, [portfolioId, getAuthHeaders, fetchVersions, fetchUserSessions]);

  // Save or Update Portfolio to Neon DB
  const savePortfolio = useCallback(async (publish = false, promptNote = '') => {
    setSaveStatus('saving');
    try {
      const headers = await getAuthHeaders();
      const title = portfolio.meta?.title || 'Portfolio';
      const rawSlug = portfolio.meta?.slug || `port-${Date.now().toString().slice(-4)}`;
      const cleanSlug = rawSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 48) || `port-${Date.now().toString().slice(-6)}`;

      let response;
      if (portfolioId) {
        response = await fetch(`http://localhost:5050/api/v1/portfolios/${portfolioId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            schemaData: portfolio,
            chatHistory: chatMessages,
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
            subdomainSlug: cleanSlug,
            schemaData: portfolio,
            chatHistory: chatMessages,
          }),
        });
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPortfolioId(result.data.id);
        setIsPublished(result.data.isPublished);
        setSaveStatus('saved');
        window.history.replaceState(null, '', `/studio/${result.data.id}`);
        fetchVersions(result.data.id);
        fetchUserSessions();
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
  }, [portfolio, portfolioId, chatMessages, getAuthHeaders, fetchVersions, fetchUserSessions]);

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

      const processLine = (line) => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) return;
        const jsonStr = trimmed.replace(/^data:\s*/, '');
        try {
          const data = JSON.parse(jsonStr);
          if (data.error) {
            throw new Error(data.error);
          }
          if (data.chunk) {
            setStreamingCode((prev) => prev + data.chunk);
          }
          if (data.done && data.updatedPortfolio) {
            updatedPortfolio = data.updatedPortfolio;
          }
        } catch (e) {
          if (trimmed.includes('"error"')) {
            throw e;
          }
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        streamBuffer += chunkText;

        const lines = streamBuffer.split('\n');
        // The last line might be incomplete, preserve it in streamBuffer
        streamBuffer = lines.pop() ?? '';

        for (const line of lines) {
          processLine(line);
        }
      }

      // Flush any remaining line in buffer when stream ends
      if (streamBuffer.trim()) {
        processLine(streamBuffer);
      }

      if (updatedPortfolio) {
        // Ensure user's name is applied if mentioned in prompt
        const nameMatch = promptText.match(/(?:my name is|i am|name:?)\s+([A-Za-z0-9_-]+)/i);
        if (nameMatch && nameMatch[1]) {
          const extractedName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
          updatedPortfolio.meta = { ...updatedPortfolio.meta, title: `${extractedName} Portfolio` };
          if (updatedPortfolio.sections) {
            updatedPortfolio.sections = updatedPortfolio.sections.map((s) =>
              s.type === 'hero' ? { ...s, data: { ...s.data, name: extractedName } } : s
            );
          }
        }

        pushState(updatedPortfolio);
        const isFirstGen = !hasGeneratedFirstPortfolio;
        setHasGeneratedFirstPortfolio(true);
        const finalTasks = initialTasks.map((t) => ({ ...t, done: true, active: false }));
        let finalMessages = [];
        setChatMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: `✓ Architecture et design du portfolio générés avec succès pour : "${promptText}"`,
                  tasks: finalTasks,
                }
              : m
          );

          if (isFirstGen) {
            updated.push({
              id: `msg-followup-${Date.now()}`,
              role: 'assistant',
              text: `🎉 Votre portfolio a été généré avec succès !\n\n💡 Prochaine étape recommandée : Le nouvel onglet [ 🐙 Projets ] vient d'apparaître dans la barre supérieure. Connectez votre GitHub, sélectionnez vos dépôts et générez des mockups IA (FLUX.1-schnell) pour personnaliser votre section projets.`,
              action: 'open_projects',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }

          finalMessages = updated;
          return updated;
        });

        // Persist session schema & chat history to Neon DB
        persistSession(updatedPortfolio, finalMessages, promptText);

        setTimeout(() => {
          setViewMode('preview');
        }, 1200);
      } else {
        throw new Error('No updated portfolio returned by model');
      }
    } catch (err) {
      console.error('Portfolio generation error:', err);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: `❌ Error: ${err.message || 'Generation failed'}. Please try again.`,
                tasks: initialTasks.map(t => ({ ...t, active: false, done: false }))
              }
            : m
        )
      );
      setIsGenerating(false);
      // High-Impact Intelligent Fallback (only for network crashes or complete LLM failures)
      const lower = promptText.toLowerCase();
      const nameMatch = promptText.match(/(?:my name is|i am|name:?)\s+([A-Za-z0-9_-]+)/i);
      const existingName = portfolio.sections?.find(s => s.type === 'hero')?.data?.name;
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
      let finalFallbackMessages = [];
      setChatMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: replyText,
                tasks: finalTasks,
              }
            : m
        );
        finalFallbackMessages = updated;
        return updated;
      });

      // Persist fallback session schema & chat history to Neon DB
      persistSession(fallbackPortfolio, finalFallbackMessages, promptText);

      setTimeout(() => {
        setViewMode('preview');
      }, 1200);
    } finally {
      clearInterval(taskTimer);
      setActiveTasks(null);
      setIsGenerating(false);
    }
  }, [isGenerating, portfolio, pushState, getAuthHeaders, persistSession, hasGeneratedFirstPortfolio, firstName]);

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
        sessions,
        isLoadingSessions,
        isHistoryOpen,
        setIsHistoryOpen,
        fetchUserSessions,
        loadPortfolioSession,
        createNewSession,
        deleteSession,
        renameSession,
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
        sendMessage: sendChatMessage,
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
