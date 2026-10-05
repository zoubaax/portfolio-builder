/**
 * GitHub API service for fetching public repositories and project metadata
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

/**
 * Clean GitHub input to extract username
 * Supports: "amine", "https://github.com/amine", "github.com/amine"
 */
export function parseGitHubUsername(input = '') {
  if (!input) return '';
  const trimmed = input.trim();
  // If full URL
  const match = trimmed.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/i);
  if (match && match[1]) {
    return match[1];
  }
  // If clean username
  return trimmed.replace(/^@/, '').split('/')[0];
}

/**
 * Fetch repositories for a GitHub user (using OAuth token if available, fallback to public API)
 */
export async function fetchUserRepos(username, userId = '') {
  const cleanUser = parseGitHubUsername(username);

  // 1. Try backend endpoint first (uses OAuth access token if linked for 5000 req/hr & private repos)
  if (userId || cleanUser) {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (cleanUser) params.append('username', cleanUser);

      const bRes = await fetch(`${API_BASE_URL}/api/v1/github/repos?${params.toString()}`);
      if (bRes.ok) {
        const json = await bRes.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Backend repos endpoint fallback to direct GitHub API:', e.message);
    }
  }

  if (!cleanUser) throw new Error('Nom d\'utilisateur GitHub introuvable');

  const url = `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=100`;
  
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Utilisateur GitHub "${cleanUser}" introuvable.`);
    }
    if (res.status === 403) {
      throw new Error(`Limite d'appels GitHub API atteinte. Réessayez dans quelques instants.`);
    }
    throw new Error(`Erreur GitHub (${res.status}): ${res.statusText}`);
  }

  const repos = await res.json();
  
  // Format repos
  return repos
    .filter(r => !r.fork) // prioritize original work, keep forks if few
    .concat(repos.filter(r => r.fork))
    .slice(0, 50)
    .map(r => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner?.login,
      description: r.description || 'Projet open-source sans description.',
      language: r.language || 'Code',
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      url: r.html_url,
      homepage: r.homepage || '',
      topics: r.topics || [],
      updatedAt: r.updated_at,
    }));
}

/**
 * Fetch README content snippet for a repository
 */
export async function fetchRepoReadme(owner, repo) {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    let res = await fetch(url);
    if (!res.ok) {
      // Try master branch
      res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
    }
    if (res.ok) {
      const text = await res.text();
      // Strip HTML tags, markdown badges, raw URLs, and code blocks to extract clean textual overview
      const cleanText = text
        .replace(/<[^>]*>/g, ' ') // Strip all HTML tags (div, p, img, a, span)
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove markdown images
        .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, '') // Remove linked badges
        .replace(/\[.*?\]\(.*?\)/g, '$1') // Convert markdown links to plain text
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`.*?`/g, '') // Remove inline code
        .replace(/https?:\/\/[^\s]+/g, '') // Remove raw URLs
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();
      return cleanText.slice(0, 3500);
    }
  } catch (e) {
    console.warn(`README not fetched for ${repo}:`, e.message);
  }
  return '';
}

/**
 * Synthesizes a clean, high-impact title, description, tags, and metric from repository README using LLM
 */
export async function summarizeProjectAi({ name, owner, language, topics = [], rawDescription = '', readmeContent = '' }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/ai/summarize-project`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        owner,
        language,
        topics,
        rawDescription,
        readmeContent,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn(`Failed to synthesize AI summary for ${name}:`, err.message);
  }

  // Graceful fallback
  const cleanTitle = name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: cleanTitle,
    description: rawDescription || 'Projet open-source certifié GitHub.',
    tags: [language, ...topics].filter(Boolean).slice(0, 4),
    metrics: 'Architecture Modulaire • Open-Source',
  };
}

/**
 * Calls backend to generate AI image for a project via FLUX.1-schnell
 */
export async function generateProjectImageAi({ title, description, tags = [], currentImageUrl, prompt }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/ai/generate-project-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      description,
      tags,
      currentImageUrl,
      prompt,
    }),
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const msg =
      errorJson.message ||
      (typeof errorJson.error === 'object' ? errorJson.error?.message : errorJson.error) ||
      `Erreur du serveur IA (${res.status})`;
    throw new Error(msg);
  }

  const json = await res.json();
  if (!json.success || !json.data?.imageUrl) {
    const msg =
      json.message ||
      (typeof json.error === 'object' ? json.error?.message : json.error) ||
      "L'IA n'a retourné aucune image valide.";
    throw new Error(msg);
  }

  return json.data.imageUrl;
}
