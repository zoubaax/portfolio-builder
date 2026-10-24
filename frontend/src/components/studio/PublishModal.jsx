import React, { useState, useEffect } from 'react';
import {
  RiGlobalLine,
  RiCheckLine,
  RiFileCopyLine,
  RiExternalLinkLine,
  RiCloseLine,
  RiLoader4Line,
  RiSparkling2Fill,
  RiEditLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { getSubdomainUrl } from '../../utils/subdomain';

export const PublishModal = ({
  isOpen,
  onClose,
  currentSlug,
  isPublished,
  onPublish,
}) => {
  const [slug, setSlug] = useState(currentSlug || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSlug(currentSlug || '');
      setErrorMessage(null);
      setSaveSuccess(false);
    }
  }, [isOpen, currentSlug]);

  if (!isOpen) return null;

  const cleanSlug = (val) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-/, '');
  };

  const handleSlugChange = (e) => {
    setSlug(cleanSlug(e.target.value));
    setErrorMessage(null);
    setSaveSuccess(false);
  };

  const fullUrl = getSubdomainUrl(slug || 'portfolio');

  const handleSaveAndPublish = async () => {
    const finalSlug = slug.replace(/-+$/, '');
    if (!finalSlug || finalSlug.length < 3) {
      setErrorMessage('Le sous-domaine doit contenir au moins 3 caractères.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onPublish(finalSlug);
      setSlug(finalSlug);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Impossible de mettre à jour le sous-domaine.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <RiCloseLine className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-[#FF4500] text-white flex items-center justify-center shadow-md shadow-[#FF4500]/20">
            <RiGlobalLine className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900">
                {isPublished ? 'Portfolio Publié' : 'Publier votre Portfolio'}
              </h3>
              {isPublished && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En ligne
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Votre portfolio est accessible publiquement via votre sous-domaine dédié.
            </p>
          </div>
        </div>

        {/* Subdomain Input Card */}
        <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 mb-4">
          <label className="block text-xs font-semibold text-zinc-700 mb-2">
            Sous-domaine personnalisé
          </label>

          <div className="flex items-center rounded-xl bg-white border border-zinc-300 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all overflow-hidden shadow-xs">
            <span className="pl-3.5 pr-0.5 text-xs text-zinc-400 font-mono select-none">
              https://
            </span>
            <input
              type="text"
              value={slug}
              onChange={handleSlugChange}
              placeholder="mon-nom"
              maxLength={48}
              className="flex-1 py-2 px-1 text-xs text-zinc-900 font-mono font-medium outline-none bg-transparent"
            />
            <span className="pr-3.5 pl-0.5 text-xs font-semibold text-zinc-600 font-mono select-none">
              .portfolify.tech
            </span>
          </div>

          {/* Validation & Error Messages */}
          {errorMessage && (
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
              <span>⚠️</span> {errorMessage}
            </p>
          )}

          {saveSuccess && (
            <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1 animate-in fade-in">
              <RiCheckLine className="w-4 h-4" /> Sous-domaine mis à jour avec succès !
            </p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-200/60 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1">
              <RiShieldCheckLine className="w-3.5 h-3.5 text-emerald-600" />
              SSL Automatique & Cloudflare Edge Routing
            </span>
            <span className="font-mono text-zinc-400">
              {slug.length}/48 caractères
            </span>
          </div>
        </div>

        {/* Live URL Link & Quick Copy Preview */}
        <div className="p-3 rounded-xl bg-zinc-100/70 border border-zinc-200/80 mb-5 flex items-center justify-between gap-2">
          <div className="truncate font-mono text-xs text-zinc-700 select-all">
            {fullUrl}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Copier le lien"
            >
              {copied ? (
                <>
                  <RiCheckLine className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-600 font-semibold">Copié</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="text-[11px]">Copier</span>
                </>
              )}
            </button>

            <a
              href={fullUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 px-2.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span className="text-[11px]">Visiter</span>
              <RiExternalLinkLine className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-600 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving || !slug || slug.length < 3}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-[#FF4500] hover:from-orange-500 hover:to-[#ff5722] text-white text-xs font-bold transition-all shadow-md shadow-[#FF4500]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <RiLoader4Line className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <RiCheckLine className="w-4 h-4" />
                <span>{isPublished ? 'Mettre à jour le sous-domaine' : 'Publier maintenant'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
