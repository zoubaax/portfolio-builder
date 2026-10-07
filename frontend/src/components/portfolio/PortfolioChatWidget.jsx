import React, { useState, useRef, useEffect } from 'react';
import {
  RiCloseLine,
  RiSendPlane2Fill,
  RiSparklingFill,
  RiLoader4Line,
  RiUser3Line
} from 'react-icons/ri';
import { askPortfolioAi } from '../../services/portfolioAiChatService';

// WCAG relative luminance calculation for contrast
function getLuminance(hex) {
  if (!hex || typeof hex !== 'string') return 0.5;
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

export const PortfolioChatWidget = ({ portfolio, isAbsolute = false }) => {
  const botConfig = portfolio?.aiChatbot || {};
  const isEnabled = botConfig.enabled !== false;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: botConfig.welcomeMessage || `Bonjour ! Je suis l'assistant IA officiel de ce portfolio. Posez-moi vos questions sur mes projets, mes compétences ou mon parcours.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const heroSection = portfolio?.sections?.find(s => s.type === 'hero');
  const developerName = heroSection?.data?.name || portfolio?.meta?.title || 'le développeur';
  
  // Dynamic Theme Extraction
  const theme = portfolio?.theme || {};
  const palette = theme?.palette || {};
  const typography = theme?.typography || {};

  // 1. Base Colors
  const rawBg = palette.bg || '#ffffff';
  const rawSurface = palette.surface || (getLuminance(rawBg) > 0.45 ? '#f8fafc' : '#111827');
  const rawAccent = palette.accent || '#6366f1';

  // Determine light vs dark background of the portfolio
  const isLight = getLuminance(rawBg) > 0.45;

  // 2. Guaranteed high-contrast tokens matching the portfolio palette
  const modalBg = isLight ? '#ffffff' : (rawSurface || '#111827');
  const headerBg = isLight ? '#f1f5f9' : '#1e293b';
  const chatBubbleAiBg = isLight ? '#f8fafc' : '#1e293b';
  const textPrimary = isLight ? '#0f172a' : '#f8fafc';
  const textSecondary = isLight ? '#475569' : '#94a3b8';
  const border = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.14)';
  const inputBg = isLight ? '#ffffff' : '#0f172a';
  const chipBg = isLight ? '#f1f5f9' : '#1e293b';

  // User chat bubble text color (always contrast against accent)
  const userTextOnAccent = getLuminance(rawAccent) > 0.45 ? '#0f172a' : '#ffffff';

  const headingFont = typography.headingFont || 'inherit';
  const bodyFont = typography.bodyFont || 'inherit';
  const radius = typography.radius || '1rem';

  const quickQuestions = [
    "Quelles sont tes compétences clés ?",
    "Présente-moi ton meilleur projet",
    "Quel est ton parcours ?",
    "Comment te contacter ?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (questionToSend) => {
    const text = questionToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await askPortfolioAi(portfolio, messages, text.trim());
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "Désolé, une petite erreur est survenue lors de la communication avec l'IA. N'hésitez pas à me contacter par email !"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // If chatbot is disabled in settings, do not render it
  if (!isEnabled) {
    return null;
  }

  // Determine badge to display
  const currentModel = botConfig.model || 'gpt-4o-mini';
  const displayBadge = currentModel.includes('/')
    ? currentModel.split('/')[1]
    : (currentModel.length > 14 ? currentModel.slice(0, 12) + '..' : currentModel);

  return (
    <div 
      className={`${isAbsolute ? 'absolute' : 'fixed'} bottom-4 right-4 z-40 flex flex-col items-end select-none print:hidden pointer-events-none`}
      style={{ fontFamily: bodyFont }}
    >
      {/* 1. Trigger Button: Nested Inside Portfolio & Styled with Portfolio Theme */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 shadow-2xl transition-all duration-200 hover:scale-[1.04] active:scale-[0.96] cursor-pointer"
          style={{
            backgroundColor: modalBg,
            color: textPrimary,
            border: `1.5px solid ${border}`,
            borderRadius: radius,
            boxShadow: `0 12px 30px -6px rgba(0, 0, 0, 0.25), 0 0 16px -2px ${rawAccent}40`
          }}
          aria-label="Discuter avec l'IA du portfolio"
        >
          {/* Accent-colored Icon Container */}
          <div 
            className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-xs"
            style={{
              backgroundColor: rawAccent,
              color: userTextOnAccent
            }}
          >
            <RiSparklingFill className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold tracking-tight whitespace-nowrap" style={{ fontFamily: headingFont }}>
              Discuter avec l'IA
            </span>
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
              style={{ backgroundColor: rawAccent }}
            />
          </div>

          <span 
            className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold"
            style={{
              backgroundColor: chipBg,
              color: textSecondary,
              border: `1px solid ${border}`
            }}
          >
            {displayBadge}
          </span>
        </button>
      )}

      {/* 2. Chat Modal: Ultra-clean contrast, perfectly legible text */}
      {isOpen && (
        <div 
          className="pointer-events-auto w-[calc(100vw-2rem)] sm:w-90 md:w-96 max-w-[calc(100%-1rem)] h-120 max-h-[calc(100%-1rem)] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{
            backgroundColor: modalBg,
            color: textPrimary,
            border: `1.5px solid ${border}`,
            borderRadius: radius,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 25px -5px ${rawAccent}33`
          }}
        >
          {/* Header */}
          <div 
            className="h-13 px-4 flex items-center justify-between shrink-0"
            style={{
              borderBottom: `1.5px solid ${border}`,
              backgroundColor: headerBg
            }}
          >
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                style={{
                  backgroundColor: rawAccent,
                  color: userTextOnAccent
                }}
              >
                <RiSparklingFill className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold tracking-tight truncate" style={{ fontFamily: headingFont }}>
                  {developerName}
                </span>
                <span className="text-[11px] opacity-40 font-mono">/</span>
                <span className="text-[11px] font-mono opacity-80 font-medium">assistant</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span 
                className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: `${rawAccent}20`,
                  color: rawAccent,
                  border: `1px solid ${rawAccent}44`
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: rawAccent }} />
                actif
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-all hover:opacity-70 cursor-pointer"
                style={{ color: textSecondary }}
                aria-label="Fermer le chat"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs leading-relaxed">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                      style={{ 
                        backgroundColor: rawAccent, 
                        color: userTextOnAccent 
                      }}
                    >
                      <RiSparklingFill className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className="max-w-[85%] px-3.5 py-2.5 text-xs leading-relaxed font-normal shadow-xs"
                    style={{
                      borderRadius: '0.75rem',
                      backgroundColor: isUser ? rawAccent : chatBubbleAiBg,
                      color: isUser ? userTextOnAccent : textPrimary,
                      border: isUser ? 'none' : `1.5px solid ${border}`,
                    }}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
                      style={{
                        backgroundColor: headerBg,
                        color: textSecondary,
                        border: `1px solid ${border}`
                      }}
                    >
                      <RiUser3Line className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 justify-start items-center">
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: rawAccent, color: userTextOnAccent }}
                >
                  <RiSparklingFill className="w-3.5 h-3.5" />
                </div>
                <div 
                  className="px-3.5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs"
                  style={{
                    backgroundColor: chatBubbleAiBg,
                    border: `1.5px solid ${border}`,
                    color: textSecondary
                  }}
                >
                  <RiLoader4Line className="w-3.5 h-3.5 animate-spin" style={{ color: rawAccent }} />
                  <span className="text-[11px] font-mono">En train de répondre...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (Chips) */}
          {messages.length <= 2 && (
            <div 
              className="px-3.5 pb-2.5 pt-2 border-t"
              style={{
                borderColor: border,
                backgroundColor: headerBg
              }}
            >
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="text-[11px] text-left px-2.5 py-1 transition-all cursor-pointer disabled:opacity-50 hover:opacity-80 font-medium"
                    style={{
                      borderRadius: '0.5rem',
                      backgroundColor: modalBg,
                      color: textPrimary,
                      border: `1px solid ${border}`
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t flex items-center gap-2 shrink-0"
            style={{
              borderColor: border,
              backgroundColor: headerBg
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Poser une question sur ${developerName}...`}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 text-xs outline-none transition-all shadow-inner"
              style={{
                borderRadius: '0.625rem',
                backgroundColor: inputBg,
                color: textPrimary,
                border: `1.5px solid ${border}`
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8.5 h-8.5 flex items-center justify-center shrink-0 transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
              style={{
                borderRadius: '0.625rem',
                backgroundColor: rawAccent,
                color: userTextOnAccent
              }}
              aria-label="Envoyer"
            >
              <RiSendPlane2Fill className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
