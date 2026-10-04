import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiHistoryLine,
  RiAddLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiCheckLine,
  RiChat1Line,
  RiTimeLine,
  RiArrowRightLine,
  RiExternalLinkLine,
  RiSearchLine,
  RiGlobalLine,
  RiSparklingFill
} from 'react-icons/ri';

export const ChatHistoryDrawer = () => {
  const {
    sessions,
    isLoadingSessions,
    isHistoryOpen,
    setIsHistoryOpen,
    portfolioId,
    loadPortfolioSession,
    createNewSession,
    deleteSession,
    renameSession,
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (!isHistoryOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title?.toLowerCase().includes(q);
    const slugMatch = s.subdomainSlug?.toLowerCase().includes(q);
    return titleMatch || slugMatch;
  });

  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title || '');
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      deleteSession(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 4000);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} j`;
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => setIsHistoryOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-95 bg-white h-full shadow-2xl flex flex-col z-10 border-r border-zinc-200 animate-in slide-in-from-left duration-200 font-sans text-zinc-900">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <RiHistoryLine className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-1.5">
                Historique des Chats
                <span className="text-[11px] font-normal text-zinc-400 font-mono">
                  ({sessions.length})
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500">Vos portfolios & conversations</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                createNewSession();
                setIsHistoryOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-all cursor-pointer"
              title="Nouvelle session"
            >
              <RiAddLine className="w-3.5 h-3.5" />
              <span>Nouveau</span>
            </button>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="p-1.5 rounded-lg hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              title="Fermer"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-zinc-100 bg-white">
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une session..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-zinc-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoadingSessions && sessions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400 text-xs">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
              <span>Chargement de vos sessions...</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-16 text-center px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <RiChat1Line className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-700">Aucune session trouvée</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {searchQuery ? 'Aucun résultat pour cette recherche' : 'Commencez par générer un portfolio pour créer une session'}
                </p>
              </div>
              <button
                onClick={() => {
                  createNewSession();
                  setIsHistoryOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <RiSparklingFill className="w-3.5 h-3.5 text-amber-500" />
                <span>Créer mon premier portfolio</span>
              </button>
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isActive = s.id === portfolioId;
              const msgCount = Array.isArray(s.chatHistory) ? s.chatHistory.length : 0;
              const isEditing = editingId === s.id;
              const isConfirmingDelete = confirmDeleteId === s.id;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (!isEditing) {
                      loadPortfolioSession(s.id);
                      setIsHistoryOpen(false);
                    }
                  }}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-md shadow-zinc-900/10'
                      : 'bg-white hover:bg-zinc-50 border-zinc-200/80 hover:border-zinc-300 text-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(e, s.id);
                              if (e.key === 'Escape') handleCancelRename(e);
                            }}
                            autoFocus
                            className="flex-1 px-2 py-1 text-xs bg-white text-zinc-900 border border-zinc-300 rounded focus:outline-hidden focus:border-zinc-900"
                          />
                          <button
                            onClick={(e) => handleSaveRename(e, s.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Valider"
                          >
                            <RiCheckLine className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                            title="Annuler"
                          >
                            <RiCloseLine className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                          )}
                          <h3
                            className={`text-xs font-semibold truncate ${
                              isActive ? 'text-white' : 'text-zinc-900'
                            }`}
                          >
                            {s.title || 'Portfolio sans titre'}
                          </h3>
                        </div>
                      )}

                      {/* Metadata Row */}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        <span
                          className={`flex items-center gap-1 ${
                            isActive ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          <RiTimeLine className="w-3 h-3" />
                          {formatDate(s.updatedAt)}
                        </span>

                        <span
                          className={`flex items-center gap-1 ${
                            isActive ? 'text-zinc-400' : 'text-zinc-500'
                          }`}
                        >
                          <RiChat1Line className="w-3 h-3" />
                          {msgCount} {msgCount > 1 ? 'messages' : 'msg'}
                        </span>

                        {s.isPublished && (
                          <span
                            className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                              isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            <RiGlobalLine className="w-2.5 h-2.5" />
                            Live
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu (Visible on hover or active) */}
                    <div
                      className={`flex items-center gap-0.5 shrink-0 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      } transition-opacity`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isEditing && (
                        <button
                          onClick={(e) => handleStartRename(e, s)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            isActive
                              ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                              : 'hover:bg-zinc-200/80 text-zinc-400 hover:text-zinc-700'
                          }`}
                          title="Renommer"
                        >
                          <RiEditLine className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={(e) => handleDelete(e, s.id)}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          isConfirmingDelete
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : isActive
                            ? 'hover:bg-zinc-800 text-zinc-300 hover:text-rose-400'
                            : 'hover:bg-rose-50 text-zinc-400 hover:text-rose-600'
                        }`}
                        title={isConfirmingDelete ? 'Cliquer pour confirmer la suppression' : 'Supprimer'}
                      >
                        {isConfirmingDelete ? (
                          <span className="text-[10px] font-semibold px-1">Confirmer ?</span>
                        ) : (
                          <RiDeleteBin6Line className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50/50 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Persistance PostgreSQL Neon active</span>
          </div>
          <span className="font-mono text-[10px]">Multi-Tenant Clerk</span>
        </div>

      </div>
    </div>
  );
};
