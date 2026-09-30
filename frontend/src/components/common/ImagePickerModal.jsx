import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiUploadCloud2Line,
  RiLink,
  RiCameraLine,
  RiCloseLine,
  RiCheckLine,
  RiImageLine,
  RiSparkling2Fill
} from 'react-icons/ri';
import { GithubIcon } from './BrandIcons';

export const ImagePickerModal = ({ isOpen, onClose, currentImage, onSave, title = "Change Image" }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-900/20'
            : 'bg-[#111726] border-white/10 text-white shadow-2xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/10 bg-[#0d1320]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <RiCameraLine className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">{title}</h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                Upload your real photo, import from GitHub, or paste a link
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-white/10 text-zinc-400'
            }`}
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>

        {/* Source Tabs */}
        <div className={`flex border-b p-2 gap-1.5 ${isLight ? 'border-slate-100 bg-slate-50/30' : 'border-white/5 bg-[#090d16]'}`}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RiUploadCloud2Line className="w-4 h-4" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'github'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Avatar</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'url'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-zinc-400 hover:text-white'
            }`}
          >
            <RiLink className="w-4 h-4" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/20 scale-[0.99]'
                  : isLight
                    ? 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                    : 'border-white/10 hover:border-indigo-500/50 bg-white/5 hover:bg-white/10'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl">
                  <RiUploadCloud2Line className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold mt-1">
                  Drag & drop your photo here, or <span className="text-indigo-600 underline">browse</span>
                </p>
                <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                  Supports PNG, JPG, WEBP, or SVG (Up to 10MB)
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GITHUB AVATAR */}
          {activeTab === 'github' && (
            <form onSubmit={handleGithubFetch} className="space-y-3">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Enter GitHub Username
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className={`absolute left-3 top-2.5 text-xs font-mono ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                    @
                  </span>
                  <input
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    placeholder="zoubaax"
                    className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border outline-none font-mono transition-all ${
                      isLight
                        ? 'bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 text-slate-800'
                        : 'bg-white/5 focus:bg-[#151d2e] border-white/10 focus:border-indigo-500 text-white'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!githubUser.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Fetch
                </button>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                Instantly imports your avatar from <code className="font-mono">github.com/{'{username}'}.png</code>
              </p>
            </form>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
                Paste Image Direct URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/... or your CDN URL"
                  className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-mono transition-all ${
                    isLight
                      ? 'bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 text-slate-800'
                      : 'bg-white/5 focus:bg-[#151d2e] border-white/10 focus:border-indigo-500 text-white'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Preview
                </button>
              </div>
            </form>
          )}

          {/* Live Preview Strip */}
          {previewUrl && (
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  onError={() => alert('Could not load image from this URL. Please check the link.')}
                  className="w-14 h-14 rounded-xl object-cover border border-white/20 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Selected Image Preview</span>
                  <span className={`text-[10px] block truncate font-mono mt-0.5 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                    {previewUrl.startsWith('data:') ? 'Local file uploaded' : previewUrl}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold shrink-0">
                <RiCheckLine className="w-4 h-4" />
                <span>Ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`flex items-center justify-end gap-2.5 px-6 py-4 border-t ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-white/10 bg-[#0d1320]'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              isLight ? 'text-slate-600 hover:bg-slate-200' : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!previewUrl}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <RiCheckLine className="w-4 h-4" />
            <span>Apply Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
