import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiCloseLine,
  RiCheckLine,
  RiAddLine,
  RiDeleteBin6Line,
  RiGlobalLine,
  RiExternalLinkLine,
  RiSparkling2Fill,
  RiArrowRightLine
} from 'react-icons/ri';
import { getSocialIcon } from './BrandIcons';

export const AVAILABLE_PLATFORMS = [
  { id: 'github', name: 'GitHub', type: 'social', placeholder: 'e.g. aminenahli or https://github.com/...', prefix: 'https://github.com/' },
  { id: 'linkedin', name: 'LinkedIn', type: 'social', placeholder: 'e.g. aminenahli or profile URL', prefix: 'https://linkedin.com/in/' },
  { id: 'x', name: 'X / Twitter', type: 'social', placeholder: 'e.g. @aminenahli or profile URL', prefix: 'https://x.com/' },
  { id: 'whatsapp', name: 'WhatsApp', type: 'messaging', placeholder: 'e.g. +212612345678 (with country code)', prefix: 'https://wa.me/' },
  { id: 'email', name: 'Email', type: 'contact', placeholder: 'e.g. contact@aminenahli.dev', prefix: 'mailto:' },
  { id: 'telegram', name: 'Telegram', type: 'messaging', placeholder: 'e.g. aminenahli or https://t.me/...', prefix: 'https://t.me/' },
  { id: 'instagram', name: 'Instagram', type: 'social', placeholder: 'e.g. aminenahli or profile URL', prefix: 'https://instagram.com/' },
  { id: 'discord', name: 'Discord', type: 'messaging', placeholder: 'e.g. username or discord.gg/invite', prefix: 'https://discord.gg/' },
  { id: 'phone', name: 'Phone', type: 'contact', placeholder: 'e.g. +212 6 XX XX XX XX', prefix: 'tel:' },
  { id: 'youtube', name: 'YouTube', type: 'media', placeholder: 'e.g. @channel or channel URL', prefix: 'https://youtube.com/' },
  { id: 'website', name: 'Custom Website', type: 'web', placeholder: 'e.g. https://myportfolio.dev', prefix: 'https://' },
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
      setActiveSocials(Array.isArray(socials) ? [...socials] : []);
      setSelectedPlatform('github');
      setInputVal('');
      setEditingIndex(null);
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
    // If this platform is already in activeSocials, pre-fill its value
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
      // If already exists, replace; else append
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-900/20'
            : 'bg-[#10141f] border-white/10 text-white shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/10 bg-[#0b0e17]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <RiGlobalLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Manage Contacts & Socials</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                Add GitHub, WhatsApp, LinkedIn, Email, or custom links to your hero
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Active Links Bar */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Active Profile Links ({activeSocials.length})
            </label>
            {activeSocials.length === 0 ? (
              <div className={`p-4 rounded-2xl border border-dashed text-center text-xs ${
                isLight ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-white/10 text-zinc-500 bg-white/2'
              }`}>
                No links added yet. Pick a platform below to connect your profile!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
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
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/10 text-teal-400 shadow-sm'
                          : isLight
                            ? 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                            : 'border-white/10 hover:border-white/20 bg-white/5 text-zinc-200'
                      }`}
                    >
                      <span className="shrink-0">{getSocialIcon(s.platform, 'w-3.5 h-3.5')}</span>
                      <span className="capitalize">{s.platform}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveSocial(idx, e)}
                        className="opacity-60 hover:opacity-100 hover:text-rose-400 transition-opacity ml-1 p-0.5 rounded cursor-pointer"
                        title="Remove link"
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
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Select Platform
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
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500/15 shadow-sm shadow-teal-500/10 scale-[1.02]'
                        : isLight
                          ? 'border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          : 'border-white/5 hover:border-white/15 bg-white/3 hover:bg-white/7 text-zinc-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-teal-500 text-black font-bold'
                        : isLight ? 'bg-white shadow-xs text-slate-700' : 'bg-white/10 text-white'
                    }`}>
                      {getSocialIcon(plat.id, 'w-3.5 h-3.5')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-teal-400 font-bold' : ''}`}>
                        {plat.name}
                      </span>
                      {isAlreadyAdded && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <RiCheckLine className="w-3 h-3" /> Connected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link Configuration Form */}
          <form onSubmit={handleAddOrUpdate} className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/3 border-white/10'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold flex items-center gap-2">
                <span>{getSocialIcon(currentPlatformDef.id, 'w-4 h-4 text-teal-400')}</span>
                <span>Configure {currentPlatformDef.name}</span>
              </span>
              {editingIndex !== null && (
                <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  Editing Existing Link
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={currentPlatformDef.placeholder}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none font-mono transition-all ${
                    isLight
                      ? 'bg-white focus:border-teal-500 border-slate-200 text-slate-800'
                      : 'bg-black/30 focus:border-teal-500 border-white/10 text-white'
                  }`}
                  autoFocus
                />
              </div>

              {/* Dynamic Live Link Preview */}
              {livePreviewUrl && (
                <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-80 truncate">
                  <span className="text-teal-400">↳ Link:</span>
                  <a
                    href={livePreviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-zinc-300 hover:text-white truncate flex items-center gap-1"
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
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <RiDeleteBin6Line className="w-3.5 h-3.5" />
                    <span>Delete Link</span>
                  </button>
                ) : <span />}

                <button
                  type="submit"
                  disabled={!inputVal.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-30 text-black text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  <RiCheckLine className="w-4 h-4" />
                  <span>{editingIndex !== null ? 'Update Link' : 'Add to Portfolio'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t shrink-0 ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/10 bg-[#0b0e17]'
        }`}>
          <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
            {activeSocials.length} contact link{activeSocials.length > 1 ? 's' : ''} configured
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyAll}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-black shadow-md shadow-teal-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <RiCheckLine className="w-4 h-4" />
              <span>Apply to Portfolio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
