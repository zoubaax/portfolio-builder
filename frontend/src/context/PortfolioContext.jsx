import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import {
  MOCK_DEVELOPER_PORTFOLIO,
  MOCK_DESIGNER_PORTFOLIO,
  MOCK_MINIMALIST_PORTFOLIO,
  THEME_PRESETS
} from '../types/portfolio';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const { getToken, userId, isSignedIn } = useAuth();

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
  const [studioTheme, setStudioTheme] = useState('light'); // 'light' | 'dark' SaaS Studio theme
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isEditMode, setIsEditMode] = useState(true); // Elementor-style visual edit mode vs pure preview
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'sections' | 'theme' | 'history'
  const [selectedSectionId, setSelectedSectionId] = useState('sec-hero');
  const [isGenerating, setIsGenerating] = useState(false);

  const getAuthHeaders = useCallback(async () => {
    let token = null;
    try {
      if (getToken) token = await getToken();
    } catch (e) {}

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(userId ? { 'x-user-id': userId } : { 'x-user-id': 'dev_user_zoubaa' }),
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

  // AI Prompt Processor with Real Backend SSE Streaming
  const sendChatMessage = useCallback(async (promptText) => {
    if (!promptText?.trim() || isGenerating) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    const assistantMsgId = `msg-ai-${Date.now()}`;
    // Add placeholder assistant message for live streaming
    setChatMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        text: '',
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
          provider: 'groq',
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
              if (data.chunk) {
                setChatMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, text: m.text + data.chunk } : m))
                );
              }
              if (data.done && data.updatedPortfolio) {
                updatedPortfolio = data.updatedPortfolio;
              }
            } catch {}
          }
        }
      }

      if (updatedPortfolio) {
        pushState(updatedPortfolio);
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, text: `✓ Updated portfolio to match: "${promptText}"` }
              : m
          )
        );
      }
    } catch (err) {
      // Graceful fallback to local rule engine if network drops
      const lower = promptText.toLowerCase();
      let replyText = `Updated portfolio for: "${promptText}"`;
      let fallbackPortfolio = { ...portfolio };

      if (lower.includes('bento') || lower.includes('violet')) {
        fallbackPortfolio.theme = THEME_PRESETS['bento-violet'];
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) =>
          s.type === 'projects' ? { ...s, variant: 'bento-grid' } : s
        );
        replyText = "Switched to Bento Violet theme!";
      } else if (lower.includes('minimal') || lower.includes('editorial')) {
        fallbackPortfolio.theme = THEME_PRESETS['minimal-editorial'];
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) =>
          s.type === 'hero' ? { ...s, variant: 'minimal-centered' } : s
        );
        replyText = "Applied Minimal Editorial theme!";
      } else if (lower.includes('terminal') || lower.includes('cyber')) {
        fallbackPortfolio.theme = THEME_PRESETS['cyber-dark'];
        fallbackPortfolio.sections = fallbackPortfolio.sections.map((s) =>
          s.type === 'hero' ? { ...s, variant: 'terminal-dev' } : s
        );
        replyText = "Activated Cyber Slate with terminal hero!";
      }

      pushState(fallbackPortfolio);
      setChatMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, text: replyText } : m))
      );
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, portfolio, pushState]);

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
        activeTab,
        setActiveTab,
        selectedSectionId,
        setSelectedSectionId,
        chatMessages,
        isGenerating,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
        undo,
        redo,
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
