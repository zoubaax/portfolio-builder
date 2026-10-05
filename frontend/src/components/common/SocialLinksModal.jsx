import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiCloseLine,
  RiCheckLine,
  RiDeleteBin6Line,
  RiGlobalLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { getSocialIcon } from './BrandIcons';

export const AVAILABLE_PLATFORMS = [
  { id: 'github', name: 'GitHub', type: 'social', placeholder: 'ex: aminenahli ou https://github.com/...', prefix: 'https://github.com/' },
  { id: 'linkedin', name: 'LinkedIn', type: 'social', placeholder: 'ex: aminenahli ou URL du profil', prefix: 'https://linkedin.com/in/' },
  { id: 'x', name: 'X / Twitter', type: 'social', placeholder: 'ex: @aminenahli ou URL du profil', prefix: 'https://x.com/' },
  { id: 'whatsapp', name: 'WhatsApp', type: 'messaging', placeholder: 'ex: +212612345678 (avec indicatif)', prefix: 'https://wa.me/' },
  { id: 'email', name: 'Email', type: 'contact', placeholder: 'ex: contact@aminenahli.dev', prefix: 'mailto:' },
  { id: 'telegram', name: 'Telegram', type: 'messaging', placeholder: 'ex: aminenahli ou https://t.me/...', prefix: 'https://t.me/' },
  { id: 'instagram', name: 'Instagram', type: 'social', placeholder: 'ex: aminenahli ou URL du profil', prefix: 'https://instagram.com/' },
  { id: 'discord', name: 'Discord', type: 'messaging', placeholder: 'ex: pseudo ou discord.gg/invite', prefix: 'https://discord.gg/' },
  { id: 'phone', name: 'Téléphone', type: 'contact', placeholder: 'ex: +212 6 XX XX XX XX', prefix: 'tel:' },
  { id: 'youtube', name: 'YouTube', type: 'media', placeholder: 'ex: @chaine ou URL de la chaîne', prefix: 'https://youtube.com/' },
  { id: 'website', name: 'Site Web Personnel', type: 'web', placeholder: 'ex: https://monportfolio.dev', prefix: 'https://' },
];

export const SocialLinksModal = ({ isOpen, onClose, socials = [], onSave }) => {
  const { studioTheme } = usePortfolio();
  const isLight = studioTheme === 'light';

  const [activeSocials, setActiveSocials] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('github');
  const [inputVal, setInputVal] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      const list = Array.isArray(socials) ? [...socials] : [];
      setActiveSocials(list);
      if (list.length > 0) {
        setSelectedPlatform(list[0].platform || 'github');
        setInputVal(list[0].url || '');
        setEditingIndex(0);
      } else {
        setSelectedPlatform('github');
        setInputVal('');
        setEditingIndex(null);
      }
    }
  }, [isOpen, socials]);

  if (!isOpen) return null;

  const currentPlatformDef = AVAILABLE_PLATFORMS.find((p) => p.id === selectedPlatform) || AVAILABLE_PLATFORMS[0];

  // Helper to format clean link
  const formatUrl = (platformId, rawInput) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return '';

    // WhatsApp formatting
    if (platformId === 'whatsapp') {
      const digits = trimmed.replace(/[^0-9]/g, '');
      return `https://wa.me/${digits}`;
    }

    // Email formatting
    if (platformId === 'email' || platformId === 'mail') {
      if (trimmed.startsWith('mailto:')) return trimmed;
      return `mailto:${trimmed}`;
    }

    // Phone formatting
    if (platformId === 'phone' || platformId === 'tel') {
      if (trimmed.startsWith('tel:')) return trimmed;
      return `tel:${trimmed.replace(/\s+/g, '')}`;
    }

    // If already absolute URL, keep it
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Clean @ from handles
    const cleanHandle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    const def = AVAILABLE_PLATFORMS.find((p) => p.id === platformId);
    return def ? `${def.prefix}${cleanHandle}` : `https://${trimmed}`;
  };

  const livePreviewUrl = formatUrl(selectedPlatform, inputVal);

  const handleSelectPlatform = (platformId) => {
    setSelectedPlatform(platformId);
    const existingIdx = activeSocials.findIndex((s) => s.platform?.toLowerCase() === platformId.toLowerCase());
    if (existingIdx !== -1) {
      setEditingIndex(existingIdx);
      setInputVal(activeSocials[existingIdx].url || '');
    } else {
      setEditingIndex(null);
      setInputVal('');
    }
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const formatted = formatUrl(selectedPlatform, inputVal);
    const newEntry = { platform: selectedPlatform, url: formatted };

    if (editingIndex !== null && editingIndex >= 0) {
      const updated = [...activeSocials];
      updated[editingIndex] = newEntry;
      setActiveSocials(updated);
    } else {
      const existingIdx = activeSocials.findIndex((s) => s.platform?.toLowerCase() === selectedPlatform.toLowerCase());
      if (existingIdx !== -1) {
        const updated = [...activeSocials];
        updated[existingIdx] = newEntry;
        setActiveSocials(updated);
      } else {
        setActiveSocials([...activeSocials, newEntry]);
      }
    }

    setInputVal('');
    setEditingIndex(null);
  };

  const handleRemoveSocial = (idxToRemove, e) => {
    e?.stopPropagation();
    const updated = activeSocials.filter((_, idx) => idx !== idxToRemove);
    setActiveSocials(updated);
    if (editingIndex === idxToRemove) {
      setEditingIndex(null);
      setInputVal('');
    }
  };

  const handleApplyAll = () => {
    onSave(activeSocials);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-all font-sans ${
          isLight
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-900/10'
            : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/80'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
          isLight ? 'border-zinc-100 bg-zinc-50/70' : 'border-zinc-800 bg-zinc-950/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
            }`}>
              <RiGlobalLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-tight">Gérer vos contacts & réseaux</h3>
              <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Ajoutez vos profils professionnels (GitHub, LinkedIn, Email, WhatsApp, etc.)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="Fermer"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Active Links Bar */}
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Liens actifs ({activeSocials.length})
            </label>
            {activeSocials.length === 0 ? (
              <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                isLight ? 'border-zinc-200 text-zinc-400 bg-zinc-50/50' : 'border-zinc-800 text-zinc-500 bg-zinc-950/30'
              }`}>
                Aucun lien configuré. Sélectionnez une plateforme ci-dessous pour ajouter votre premier contact.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {activeSocials.map((s, idx) => {
                  const isSelected = editingIndex === idx || (editingIndex === null && selectedPlatform === s.platform);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedPlatform(s.platform);
                        setEditingIndex(idx);
                        setInputVal(s.url || '');
                      }}
                      className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                            : 'border-white bg-white text-zinc-900 shadow-xs'
                          : isLight
                            ? 'border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-700'
                            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span className="shrink-0">{getSocialIcon(s.platform, 'w-3.5 h-3.5')}</span>
                      <span className="capitalize">{s.platform}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSocial(idx, e)}
                        className="opacity-60 hover:opacity-100 hover:text-rose-400 transition-opacity ml-0.5 p-0.5 rounded cursor-pointer"
                        title="Retirer ce lien"
                      >
                        <RiCloseLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Platform Selector Grid */}
          <div>
            <label className={`block text-[11px] font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Sélectionner une plateforme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AVAILABLE_PLATFORMS.map((plat) => {
                const isSelected = selectedPlatform === plat.id;
                const isAlreadyAdded = activeSocials.some((s) => s.platform?.toLowerCase() === plat.id.toLowerCase());

                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => handleSelectPlatform(plat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'border-zinc-900 bg-zinc-100 text-zinc-900 font-semibold shadow-xs'
                          : 'border-zinc-500 bg-zinc-800 text-white font-semibold shadow-xs'
                        : isLight
                          ? 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-700'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected
                        ? isLight ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                        : isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {getSocialIcon(plat.id, 'w-3.5 h-3.5')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs block truncate leading-tight">
                        {plat.name}
                      </span>
                      {isAlreadyAdded && (
                        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                          <RiCheckLine className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                          <span>Ajouté</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link Configuration Form */}
          <form onSubmit={handleAddOrUpdate} className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-zinc-50/70 border-zinc-200' : 'bg-zinc-950/40 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-2">
                <span>{getSocialIcon(currentPlatformDef.id, 'w-4 h-4')}</span>
                <span>Configurer {currentPlatformDef.name}</span>
              </span>
              {editingIndex !== null && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Modification en cours
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <div>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={currentPlatformDef.placeholder}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-mono transition-all ${
                    isLight
                      ? 'bg-white focus:border-zinc-900 border-zinc-200 text-zinc-900'
                      : 'bg-zinc-900 focus:border-zinc-400 border-zinc-700 text-white'
                  }`}
                  autoFocus
                />
              </div>

              {/* Dynamic Live Link Preview */}
              {livePreviewUrl && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-80 truncate">
                  <span className="text-zinc-500">↳ Lien :</span>
                  <a
                    href={livePreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white truncate flex items-center gap-1"
                  >
                    <span>{livePreviewUrl}</span>
                    <RiExternalLinkLine className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                {editingIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(editingIndex)}
                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <RiDeleteBin6Line className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                ) : <span />}

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-black text-white'
                      : 'bg-white hover:bg-zinc-100 text-zinc-900'
                  }`}
                >
                  <RiCheckLine className="w-3.5 h-3.5" />
                  <span>{editingIndex !== null ? 'Enregistrer la modification' : 'Ajouter ce lien'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-5 py-3 border-t shrink-0 ${
          isLight ? 'border-zinc-100 bg-zinc-50/70' : 'border-zinc-800 bg-zinc-950/60'
        }`}>
          <span className={`text-xs ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
            {activeSocials.length} lien{activeSocials.length > 1 ? 's' : ''} configuré{activeSocials.length > 1 ? 's' : ''}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isLight ? 'text-zinc-600 hover:bg-zinc-200/70' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleApplyAll}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-zinc-900 hover:bg-black text-white'
                  : 'bg-white hover:bg-zinc-100 text-zinc-900'
              }`}
            >
              <RiCheckLine className="w-3.5 h-3.5" />
              <span>Appliquer au portfolio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
