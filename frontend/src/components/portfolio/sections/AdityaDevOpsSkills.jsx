import React, { useState } from 'react';
import { Cloud, Brain, Server, ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

/**
 * Exact replica of Aditya Seth's interactive Skills section with 3D Flip Cards
 */
export const AdityaDevOpsSkills = ({ data, sectionId }) => {
  const { updateSectionField, isMobileViewport } = usePortfolio();
  const { heading, subheading, categories = [] } = data || {};

  // Default capabilities if categories are empty
  const defaultCards = [
    {
      title: 'Cloud Architecture & Multi-Cloud',
      icon: 'cloud',
      desc: 'Google Associate Cloud Engineer, Microsoft Azure, and Oracle Cloud certified. Architected multi-cloud production infrastructure.',
      skills: ['AWS', 'GCP', 'Azure', 'Terraform', 'Kubernetes']
    },
    {
      title: 'DevOps & GitOps Pipelines',
      icon: 'server',
      desc: 'End-to-end continuous delivery pipelines, ArgoCD GitOps sync, automated zero-downtime rollouts, and Helm packaging.',
      skills: ['Docker', 'Kubernetes', 'ArgoCD', 'GitHub Actions', 'Prometheus']
    },
    {
      title: 'AI / ML Infrastructure',
      icon: 'brain',
      desc: 'High-throughput inference microservices with FastAPI, Triton Inference Server, Ollama, and vector database embeddings.',
      skills: ['FastAPI', 'PyTorch', 'ONNX', 'ChromaDB', 'Ollama']
    },
    {
      title: 'Systems & Security Hardening',
      icon: 'shield',
      desc: 'Kernel-level tuning, eBPF network security, Kubernetes RBAC policies, CIS benchmarking, and container scanning.',
      skills: ['Linux / Bash', 'Trivy', 'eBPF', 'mTLS', 'Vault']
    }
  ];

  const cardsToRender = categories.length > 0
    ? categories.map((cat, i) => ({
        title: cat.name,
        icon: i % 4 === 0 ? 'cloud' : (i % 4 === 1 ? 'server' : (i % 4 === 2 ? 'brain' : 'shield')),
        desc: `Specialized expertise in ${cat.skills?.slice(0, 4).join(', ')} and production-grade architectures.`,
        skills: cat.skills || []
      }))
    : defaultCards;

  const renderIcon = (type) => {
    switch (type) {
      case 'cloud': return <Cloud className="w-8 h-8 text-sky-400" />;
      case 'server': return <Server className="w-8 h-8 text-sky-400" />;
      case 'brain': return <Brain className="w-8 h-8 text-sky-400" />;
      case 'shield': return <ShieldCheck className="w-8 h-8 text-sky-400" />;
      default: return <Cpu className="w-8 h-8 text-sky-400" />;
    }
  };

  return (
    <section id="skills" className={`${isMobileViewport ? 'py-12 px-4' : 'py-20 px-6 md:px-12'} max-w-6xl mx-auto`}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <EditableText
          as="span"
          value={subheading || "WHAT I DO"}
          onSave={(val) => updateSectionField(sectionId, 'subheading', val)}
          singleLine
          className="text-xs uppercase tracking-widest font-mono font-semibold block mb-2 text-sky-400"
        />
        <EditableText
          as="h2"
          value={heading || "Skills & Capabilities"}
          onSave={(val) => updateSectionField(sectionId, 'heading', val)}
          singleLine
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
          style={{ fontFamily: 'var(--theme-heading-font)' }}
        />
      </div>

      {/* Grid of Interactive 3D Flip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardsToRender.map((card, idx) => (
          <div key={idx} className="aditya-flip-container">
            <div className="aditya-flip-inner">
              {/* Front: Icon + Bold Title */}
              <div className="aditya-flip-front">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-4">
                  {renderIcon(card.icon)}
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {card.title}
                </h3>
                <span className="text-xs text-sky-400 font-mono mt-3 uppercase tracking-wider">
                  Hover to reveal →
                </span>
              </div>

              {/* Back: Detailed Architecture Description + Pills */}
              <div className="aditya-flip-back">
                <h4 className="text-sm font-bold text-white mb-2">{card.title}</h4>
                <p className="text-xs text-sky-100 font-light leading-relaxed mb-4">
                  {card.desc}
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {card.skills?.slice(0, 4).map((s, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-white bg-black/30 border border-white/20"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
