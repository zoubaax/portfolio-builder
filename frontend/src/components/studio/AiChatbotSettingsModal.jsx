import React, { useState } from 'react';
import {
  RiCloseLine,
  RiRobot2Line,
  RiCheckLine,
  RiKey2Line,
  RiCpuLine,
  RiInformationLine,
  RiSparklingFill
} from 'react-icons/ri';

const PROVIDER_OPTIONS = [
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    desc: 'Le plus précis et conversationnel (Recommandé)',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Ultra-rapide, économique)' },
      { id: 'gpt-4o', label: 'GPT-4o (Raisonnement avancé)' },
    ],
    placeholder: 'sk-proj-... (Laissez vide pour utiliser la clé par défaut)',
    badge: 'Populaire',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    desc: 'Large fenêtre de contexte et rapidité exceptionnelle',
    models: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Ultra-rapide)' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Haute précision)' },
    ],
    placeholder: 'AIzaSy... (Clé API Google AI Studio)',
    badge: 'Google',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'groq',
    name: 'Groq (LPU Inference)',
    desc: 'Vitesse de génération fulgurante à latence quasi-nulle',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
    ],
    placeholder: 'gsk_... (Clé API Groq)',
    badge: 'Ultra Fast',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    desc: 'Modèles open source optimisés sur GPUs NVIDIA',
    models: [
      { id: 'meta/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 11B Vision Instruct' },
      { id: 'meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B Instruct' },
    ],
    placeholder: 'nvapi-... (Clé API NVIDIA NIM)',
    badge: 'NVIDIA',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];

export const AiChatbotSettingsModal = ({ isOpen, onClose, portfolio, onSave }) => {
  if (!isOpen) return null;

  const currentConfig = portfolio?.aiChatbot || {};

  const [enabled, setEnabled] = useState(currentConfig.enabled !== false);
  const [provider, setProvider] = useState(currentConfig.provider || 'openai');
  const [model, setModel] = useState(currentConfig.model || 'gpt-4o-mini');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedProviderData = PROVIDER_OPTIONS.find((p) => p.id === provider) || PROVIDER_OPTIONS[0];

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    const pData = PROVIDER_OPTIONS.find((p) => p.id === newProvider);
    if (pData && pData.models.length > 0) {
      setModel(pData.models[0].id);
    }
  };

  const handleSave = () => {
    const updatedChatbotConfig = {
      enabled,
      provider,
      model,
      apiKey: apiKey.trim(),
    };

    onSave(updatedChatbotConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 px-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/70 flex items-center justify-center text-zinc-200">
              <RiRobot2Line className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Assistant IA du Portfolio
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  BYOK
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Configurez le modèle et le comportement de votre jumeau numérique
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Toggle: Enable / Disable Chatbot on Portfolio */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
            <div>
              <p className="text-xs font-semibold text-zinc-200">
                Activer le Chatbot sur le Portfolio
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Affiche le bouton interactif "Discuter avec l'IA" aux recruteurs et visiteurs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enabled ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {enabled && (
            <>
              {/* 2. Provider Selection (OpenAI, Gemini, Groq, NVIDIA) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Fournisseur d'Intelligence Artificielle (Provider)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDER_OPTIONS.map((opt) => {
                    const isSelected = provider === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleProviderChange(opt.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-zinc-900 border-emerald-500/60 shadow-xs ring-1 ring-emerald-500/40'
                            : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-zinc-200">
                            {opt.name}
                          </span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-2">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Model Selector */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <RiCpuLine className="w-3.5 h-3.5 text-zinc-400" />
                  Modèle LLM spécifique
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-600 transition-colors"
                >
                  {selectedProviderData.models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Custom API Key (BYOK) */}
              <div>
                <label className="text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <RiKey2Line className="w-3.5 h-3.5 text-zinc-400" />
                    Votre Clé API {selectedProviderData.name} (Optionnelle)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    BYOK Sécurisé
                  </span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={selectedProviderData.placeholder}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5 flex items-center gap-1">
                  <RiInformationLine className="w-3 h-3 text-zinc-400 shrink-0" />
                  Si vous laissez ce champ vide, le serveur utilisera la clé système configurée par défaut.
                </p>
              </div>
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="h-14 px-5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm active:scale-95'
            }`}
          >
            {savedSuccess ? (
              <>
                <RiCheckLine className="w-4 h-4" />
                <span>Enregistré !</span>
              </>
            ) : (
              <>
                <RiSparklingFill className="w-3.5 h-3.5 text-zinc-900" />
                <span>Enregistrer la configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
