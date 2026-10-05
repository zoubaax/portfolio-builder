import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiUploadCloud2Line,
  RiLink,
  RiCameraLine,
  RiCloseLine,
  RiCheckLine,
} from 'react-icons/ri';
import { GithubIcon } from './BrandIcons';

export const ImagePickerModal = ({ isOpen, onClose, currentImage, onSave, title = "Changer l'image" }) => {
  const { studioTheme } = usePortfolio();
  const isLight = studioTheme === 'light';

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'github' | 'url'
  const [previewUrl, setPreviewUrl] = useState(currentImage || '');
  const [githubUser, setGithubUser] = useState('');
  const [urlInput, setUrlInput] = useState(currentImage || '');
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  // 1. Handle File Upload (Drag & Drop or File Browser)
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // 2. Handle GitHub Avatar Fetch
  const handleGithubFetch = (e) => {
    e.preventDefault();
    if (!githubUser.trim()) return;
    const ghUrl = `https://github.com/${githubUser.trim()}.png`;
    setPreviewUrl(ghUrl);
  };

  // 3. Handle URL Input
  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setPreviewUrl(urlInput.trim());
    }
  };

  // 4. Save and close
  const handleConfirm = () => {
    if (previewUrl) {
      onSave(previewUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-xl overflow-hidden transition-all font-sans ${
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
              <RiCameraLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
              <p className={`text-[11px] ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Importez un fichier local, votre avatar GitHub ou collez un lien direct
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

        {/* Source Tabs */}
        <div className={`flex border-b p-2 gap-1.5 ${isLight ? 'border-zinc-100 bg-zinc-50/40' : 'border-zinc-800 bg-zinc-950/40'}`}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'upload'
                ? isLight
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold'
                  : 'bg-zinc-800 text-white shadow-xs font-semibold'
                : isLight
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RiUploadCloud2Line className="w-3.5 h-3.5" />
            <span>Fichier local</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'github'
                ? isLight
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold'
                  : 'bg-zinc-800 text-white shadow-xs font-semibold'
                : isLight
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>Avatar GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'url'
                ? isLight
                  ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200 font-semibold'
                  : 'bg-zinc-800 text-white shadow-xs font-semibold'
                : isLight
                  ? 'text-zinc-600 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RiLink className="w-3.5 h-3.5" />
            <span>Lien URL</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-zinc-900 bg-zinc-100/50 dark:border-white dark:bg-zinc-800/50'
                  : isLight
                    ? 'border-zinc-200 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50'
                    : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/40 hover:bg-zinc-950/70'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                  isLight ? 'bg-zinc-100 text-zinc-700' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  <RiUploadCloud2Line className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold mt-1">
                  Glissez-déposez votre image ici, ou <span className="underline">parcourez vos fichiers</span>
                </p>
                <p className={`text-[11px] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Prend en charge PNG, JPG, WEBP ou SVG (jusqu'à 10 Mo)
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB AVATAR */}
          {activeTab === 'github' && (
            <form onSubmit={handleGithubFetch} className="space-y-3">
              <label className={`block text-xs font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                Nom d'utilisateur GitHub
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className={`absolute left-3 top-2 text-xs font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    @
                  </span>
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    placeholder="ex: aminenahli"
                    className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border outline-none font-mono transition-all ${
                      isLight
                        ? 'bg-white focus:border-zinc-900 border-zinc-200 text-zinc-900'
                        : 'bg-zinc-900 focus:border-zinc-400 border-zinc-700 text-white'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!githubUser.trim()}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-black text-white'
                      : 'bg-white hover:bg-zinc-100 text-zinc-900'
                  }`}
                >
                  Récupérer
                </button>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Importe directement l'avatar depuis <code className="font-mono">github.com/{'{pseudo}'}.png</code>
              </p>
            </form>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <label className={`block text-xs font-semibold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                URL directe de l'image
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... ou lien CDN"
                  className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none font-mono transition-all ${
                    isLight
                      ? 'bg-white focus:border-zinc-900 border-zinc-200 text-zinc-900'
                      : 'bg-zinc-900 focus:border-zinc-400 border-zinc-700 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
                    isLight
                      ? 'bg-zinc-900 hover:bg-black text-white'
                      : 'bg-white hover:bg-zinc-100 text-zinc-900'
                  }`}
                >
                  Aperçu
                </button>
              </div>
            </form>
          )}

          {/* Live Preview Strip */}
          {previewUrl && (
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3.5 ${
              isLight ? 'bg-zinc-50/80 border-zinc-200' : 'bg-zinc-950/60 border-zinc-800'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  onError={() => alert('Impossible de charger cette image. Vérifiez le lien.')}
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold block truncate">Image sélectionnée</span>
                  <span className={`text-[10px] block truncate font-mono mt-0.5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {previewUrl.startsWith('data:') ? 'Fichier local chargé' : previewUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-500 text-xs font-semibold shrink-0">
                <RiCheckLine className="w-3.5 h-3.5" />
                <span>Prête</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-end gap-2 px-5 py-3 border-t shrink-0 ${
          isLight ? 'border-zinc-100 bg-zinc-50/70' : 'border-zinc-800 bg-zinc-950/60'
        }`}>
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
            onClick={handleConfirm}
            disabled={!previewUrl}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-40 ${
              isLight
                ? 'bg-zinc-900 hover:bg-black text-white'
                : 'bg-white hover:bg-zinc-100 text-zinc-900'
            }`}
          >
            <RiCheckLine className="w-3.5 h-3.5" />
            <span>Appliquer l'image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
