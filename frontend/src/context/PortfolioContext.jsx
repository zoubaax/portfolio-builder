import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  MOCK_DEVELOPER_PORTFOLIO,
  MOCK_DESIGNER_PORTFOLIO,
  MOCK_MINIMALIST_PORTFOLIO,
  THEME_PRESETS
} from '../types/portfolio';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  // Main portfolio state
  const [portfolio, setPortfolio] = useState(MOCK_DEVELOPER_PORTFOLIO);
  
  // History for Undo / Redo
  const [history, setHistory] = useState([MOCK_DEVELOPER_PORTFOLIO]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Studio UI view state
  const [studioTheme, setStudioTheme] = useState('light'); // 'light' | 'dark' SaaS Studio theme
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isEditMode, setIsEditMode] = useState(true); // Elementor-style visual edit mode vs pure preview
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'sections' | 'theme'
  const [selectedSectionId, setSelectedSectionId] = useState('sec-hero');
  const [isGenerating, setIsGenerating] = useState(false);

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

  // AI Prompt Processor
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

    setTimeout(() => {
      const lower = promptText.toLowerCase();
      let replyText = "I've reviewed your request and updated your portfolio accordingly!";
      let updatedPortfolio = { ...portfolio };

      if (lower.includes('bento') || lower.includes('violet') || lower.includes('purple')) {
        updatedPortfolio.theme = THEME_PRESETS['bento-violet'];
        updatedPortfolio.sections = updatedPortfolio.sections.map(s => 
          s.type === 'projects' ? { ...s, variant: 'bento-grid' } : s
        );
        replyText = "Switched your theme to Bento Violet and styled projects into a high-contrast bento layout.";
      } else if (lower.includes('minimal') || lower.includes('editorial') || lower.includes('light') || lower.includes('white')) {
        updatedPortfolio.theme = THEME_PRESETS['minimal-editorial'];
        updatedPortfolio.sections = updatedPortfolio.sections.map(s => {
          if (s.type === 'hero') return { ...s, variant: 'minimal-centered' };
          if (s.type === 'projects') return { ...s, variant: 'minimal-list' };
          return s;
        });
        replyText = "Applied the refined Minimal Editorial theme with serif typography and clean list views.";
      } else if (lower.includes('terminal') || lower.includes('cyber') || lower.includes('developer') || lower.includes('dark')) {
        updatedPortfolio.theme = THEME_PRESETS['cyber-dark'];
        updatedPortfolio.sections = updatedPortfolio.sections.map(s => {
          if (s.type === 'hero') return { ...s, variant: 'terminal-dev' };
          return s;
        });
        replyText = "Activated Cyber Slate with the interactive developer terminal hero!";
      } else if (lower.includes('senior') || lower.includes('impact') || lower.includes('bio')) {
        updatedPortfolio.sections = updatedPortfolio.sections.map(s => {
          if (s.type === 'hero') {
            return {
              ...s,
              data: {
                ...s.data,
                title: 'Principal Software Architect & Systems Strategist',
                tagline: 'Leading mission-critical distributed architectures, high-performance computing, and resilient cloud systems at global scale.',
                badge: 'Advising high-growth engineering teams',
              },
            };
          }
          return s;
        });
        replyText = "Elevated your executive positioning: revised your title to Principal Architect and sharpened your impact statement.";
      } else if (lower.includes('add project') || lower.includes('new project')) {
        updatedPortfolio.sections = updatedPortfolio.sections.map(s => {
          if (s.type === 'projects') {
            const newProj = {
              id: `proj-${Date.now()}`,
              title: 'Nexus Engine — Autonomous Workflow Orchestrator',
              description: 'Event-driven distributed task orchestrator processing 100k+ parallel background executions.',
              tags: ['Go', 'Kafka', 'PostgreSQL', 'Docker'],
              metrics: 'Zero-latency sync',
              github: 'https://github.com',
              link: 'https://nexus-engine.io',
              image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
              featured: true,
            };
            return {
              ...s,
              data: {
                ...s.data,
                projects: [newProj, ...(s.data.projects || [])],
              },
            };
          }
          return s;
        });
        replyText = "Added a new featured project: 'Nexus Engine — Autonomous Workflow Orchestrator' with metrics and tech tags.";
      } else {
        replyText = `Got it! I refined your portfolio based on '${promptText}'. You can preview and edit it directly on the canvas.`;
      }

      pushState(updatedPortfolio);

      const aiMsg = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 800);
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
