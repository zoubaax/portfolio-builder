/**
 * Prompt Semantic Analyzer
 * Intelligently extracts role/domain, tech stack, focus priority, and template suggestions
 * to avoid asking redundant onboarding questions when the user already provided them.
 */

export const detectRoleFromPrompt = (promptText) => {
  if (!promptText || typeof promptText !== 'string') {
    return { detected: false, roleId: null, roleLabel: null, suggestedTemplate: null };
  }

  const text = promptText.toLowerCase();

  // 1. DevOps & Cloud & Infrastructure
  if (/\b(devops|sre|cloud\s*(?:architect|engineer)?|kubernetes|k8s|docker|terraform|helm|argocd|aws|azure|gcp|platform\s*engineer|infrastructure|ci\/cd|pipeline)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'devops',
      roleLabel: 'Ingénieur DevOps & Cloud Architect',
      suggestedTemplate: 'devops-architect',
      keywords: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD']
    };
  }

  // 2. Terminal CLI & Systems & Security
  if (/\b(terminal|cli|bash|linux|kernel|sysadmin|cyber|security|hacker|pentest|infosec|low-level|systems\s*engineer)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'terminal',
      roleLabel: 'Ingénieur Systèmes & Sécurité',
      suggestedTemplate: 'terminal-hacker',
      keywords: ['Linux', 'Bash', 'Kernel', 'Security', 'Rust']
    };
  }

  // 3. AI / Machine Learning & Data
  if (/\b(ia|ai|machine\s*learning|deep\s*learning|data\s*scientist|data\s*engineer|llm|nlp|pytorch|tensorflow|computer\s*vision|rag|genai|ollama)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'ai',
      roleLabel: 'Data Scientist & Ingénieur IA',
      suggestedTemplate: 'bento-violet',
      keywords: ['PyTorch', 'Python', 'FastAPI', 'LLMs', 'VectorDB']
    };
  }

  // 4. Frontend Engineering
  if (/\b(frontend|front-end|react|vue|angular|next\.?js|svelte|ui\s*engineer|tailwind|css|html5|web\s*designer)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'frontend',
      roleLabel: 'Ingénieur Frontend (React)',
      suggestedTemplate: 'cyber-slate',
      keywords: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Vite']
    };
  }

  // 5. Backend Engineering
  if (/\b(backend|back-end|node|express|django|fastapi|spring|golang|rust|microservices|api|database|sql|postgresql|mongodb)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'backend',
      roleLabel: 'Développeur Backend & Cloud',
      suggestedTemplate: 'devops-architect',
      keywords: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'Microservices']
    };
  }

  // 6. UI/UX & Product Design
  if (/\b(designer|ui\/ux|ux|ui|product\s*designer|figma|motion\s*design|ergonome|design\s*system)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'designer',
      roleLabel: 'Designer UI/UX & Produit',
      suggestedTemplate: 'editorial-ivory',
      keywords: ['Figma', 'Design Systems', 'UI/UX', 'Prototyping', 'Accessibility']
    };
  }

  // 7. Full-Stack Developer
  if (/\b(fullstack|full-stack|mern|mean|software\s*engineer|développeur\s*web|ingénieur\s*logiciel|développeur)\b/i.test(text)) {
    return {
      detected: true,
      roleId: 'fullstack',
      roleLabel: 'Développeur Full-Stack',
      suggestedTemplate: 'bento-violet',
      keywords: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker']
    };
  }

  return { detected: false, roleId: null, roleLabel: null, suggestedTemplate: null };
};

export const detectFocusFromPrompt = (promptText) => {
  if (!promptText || typeof promptText !== 'string') {
    return { detected: false, focusId: null, focusLabel: null };
  }

  const text = promptText.toLowerCase();

  if (/\b(projets?|projects?|réalisations?|code|github|showcase|portfolio|travaux)\b/i.test(text)) {
    return {
      detected: true,
      focusId: 'projects',
      focusLabel: 'Projets GitHub & Réalisations'
    };
  }

  if (/\b(compétences?|skills?|stack|technologies?|architecture|outils|tools)\b/i.test(text)) {
    return {
      detected: true,
      focusId: 'skills',
      focusLabel: 'Compétences & Stack Technique'
    };
  }

  if (/\b(expérience|parcours|carrière|timeline|cv|track\s*record|antécédents)\b/i.test(text)) {
    return {
      detected: true,
      focusId: 'experience',
      focusLabel: 'Expérience & Parcours Pro'
    };
  }

  return { detected: false, focusId: null, focusLabel: null };
};
