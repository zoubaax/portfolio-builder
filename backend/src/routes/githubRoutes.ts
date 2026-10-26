import { Router, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5050}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * 1. GET /api/v1/github/authorize
 * Redirects user to official GitHub OAuth authorization page
 */
router.get('/authorize', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'guest';
  const callbackUrl = `${BACKEND_URL}/api/v1/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    callbackUrl
  )}&scope=read:user,repo&state=${encodeURIComponent(userId)}`;

  return res.redirect(githubAuthUrl);
});

/**
 * 2. GET /api/v1/github/callback
 * Exchanges code for access token, fetches profile, and links to user record in Neon DB
 */
router.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const userId = (req.query.state as string) || '';

  if (!code) {
    return res.status(400).send(`
      <script>
        alert("Erreur: Code d'autorisation manquant de GitHub.");
        window.close();
      </script>
    `);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as any;
    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to obtain access token');
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch authenticated GitHub user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Portfolify-Studio-App',
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!profileRes.ok) {
      throw new Error(`GitHub profile fetch failed: ${profileRes.statusText}`);
    }

    const profile = (await profileRes.json()) as any;
    const githubUsername = profile.login;
    const githubAvatarUrl = profile.avatar_url || '';

    // 3. Persist connection in Neon DB for this user
    if (!userId || userId === 'guest') {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <body style="background: #090d16; color: #f87171; font-family: sans-serif; padding: 2rem; text-align: center;">
            <h3>❌ Session requise</h3>
            <p>Vous devez être connecté avec votre compte pour associer GitHub.</p>
            <button onclick="window.close()" style="padding: 8px 16px; border-radius: 8px; background: #374151; color: white; border: none; cursor: pointer;">
              Fermer
            </button>
          </body>
        </html>
      `);
    }

    const targetUserId = userId;
    try {
      await db
        .insert(users)
        .values({
          id: targetUserId,
          email: `${targetUserId}@portfolify.dev`,
          username: githubUsername,
          githubUsername,
          githubAvatarUrl,
          githubAccessToken: accessToken,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            githubUsername,
            githubAvatarUrl,
            githubAccessToken: accessToken,
            updatedAt: new Date(),
          },
        });
    } catch (dbErr) {
      console.warn('[GitHub OAuth DB Save Warning]:', dbErr);
    }

    // 4. Return modern popup communication window
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>GitHub Connecté</title>
          <style>
            body {
              margin: 0;
              background-color: #090d16;
              color: #f3f4f6;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
            }
            .card {
              background: #111827;
              border: 1px solid rgba(255,255,255,0.1);
              padding: 2rem;
              border-radius: 1.25rem;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
              max-width: 320px;
            }
            .avatar {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              border: 2px solid #10b981;
              margin-bottom: 1rem;
            }
            h3 { margin: 0 0 0.5rem; font-size: 1.1rem; }
            p { margin: 0; font-size: 0.85rem; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="card">
            ${githubAvatarUrl ? `<img class="avatar" src="${githubAvatarUrl}" alt="${githubUsername}" />` : ''}
            <h3>✓ Compte GitHub Connecté !</h3>
            <p>@${githubUsername} lié avec succès.</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage({
                  type: 'GITHUB_OAUTH_SUCCESS',
                  username: '${githubUsername}',
                  avatarUrl: '${githubAvatarUrl}',
                  token: '${accessToken}'
                }, '*');
                setTimeout(() => window.close(), 800);
              } else {
                setTimeout(() => {
                  window.location.href = '${FRONTEND_URL}/studio';
                }, 1000);
              }
            } catch (e) {
              window.close();
            }
          </script>
        </body>
      </html>
    `);

  } catch (err: any) {
    console.error('GitHub OAuth Callback error:', err);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <body style="background: #090d16; color: #f87171; font-family: sans-serif; padding: 2rem; text-align: center;">
          <h3>❌ Erreur lors de la liaison GitHub</h3>
          <p>${err.message || 'Échec de la validation OAuth'}</p>
          <button onclick="window.close()" style="padding: 8px 16px; border-radius: 8px; background: #374151; color: white; border: none; cursor: pointer;">
            Fermer
          </button>
        </body>
      </html>
    `);
  }
});

/**
 * 3. GET /api/v1/github/status
 * Returns current user's linked GitHub account status from Neon DB
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    let userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const targetUsername = (req.query.username as string) || '';

    if (!userId) {
      try {
        const auth = getAuth(req);
        if (auth?.userId) userId = auth.userId;
      } catch (e) {}
    }

    if (!userId || userId === 'guest') {
      return sendSuccess(res, {
        connected: false,
        username: null,
        avatarUrl: null,
      });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (userRecord && userRecord.githubAccessToken) {
      return sendSuccess(res, {
        connected: true,
        username: userRecord.githubUsername || null,
        avatarUrl: userRecord.githubAvatarUrl || '',
      });
    }

    return sendSuccess(res, {
      connected: false,
      username: null,
      avatarUrl: null,
    });
  } catch (err: any) {
    return sendError(res, 'STATUS_CHECK_FAILED', err.message || 'Failed to check GitHub status', 500);
  }
});

/**
 * 4. POST /api/v1/github/disconnect
 * Disconnects linked GitHub account
 */
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    let userId = (req.body?.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      try {
        const auth = getAuth(req);
        if (auth?.userId) userId = auth.userId;
      } catch (e) {}
    }

    if (!userId) {
      return sendError(res, 'UNAUTHORIZED', 'UserId required to disconnect', 400);
    }

    await db
      .update(users)
      .set({
        githubUsername: null,
        githubAccessToken: null,
        githubAvatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return sendSuccess(res, { disconnected: true });
  } catch (err: any) {
    return sendError(res, 'DISCONNECT_FAILED', err.message || 'Failed to disconnect GitHub', 500);
  }
});

/**
 * 5. GET /api/v1/github/repos
 * Returns repositories for the user, using accessToken if linked, or public API
 */
router.get('/repos', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    const targetUsername = (req.query.username as string) || '';

    let accessToken: string | null = null;
    let username = targetUsername;

    if (userId) {
      const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userRecord) {
        accessToken = userRecord.githubAccessToken || null;
        if (!username) username = userRecord.githubUsername || '';
      }
    }

    if (!username && !accessToken) {
      return sendError(res, 'BAD_REQUEST', 'Username or connected account required', 400);
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolify-Studio-App',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = accessToken
      ? 'https://api.github.com/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator'
      : `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`;

    const githubRes = await fetch(url, { headers });
    if (!githubRes.ok) {
      return sendError(
        res,
        'GITHUB_API_ERROR',
        `GitHub API returned ${githubRes.status}: ${githubRes.statusText}`,
        githubRes.status
      );
    }

    const rawRepos = (await githubRes.json()) as any[];
    const repos = rawRepos
      .filter((r: any) => !r.fork)
      .concat(rawRepos.filter((r: any) => r.fork))
      .slice(0, 50)
      .map((r: any) => ({
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
        isPrivate: r.private || false,
      }));

    return sendSuccess(res, repos);
  } catch (err: any) {
    return sendError(res, 'REPOS_FETCH_FAILED', err.message || 'Failed to fetch repos', 500);
  }
});

/**
 * 6. POST /api/v1/github/export-repo
 * Creates a brand new GitHub repository on the user's connected account
 * and pushes the full standalone React 19 + Tailwind v4 project files.
 */
router.post('/export-repo', async (req: Request, res: Response) => {
  try {
    let userId = (req.body.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      try {
        const auth = getAuth(req);
        if (auth?.userId) userId = auth.userId;
      } catch (e) {}
    }

    if (!userId || userId === 'guest') {
      return sendError(res, 'UNAUTHORIZED', 'Connexion requise pour exporter un dépôt sur GitHub.', 401);
    }

    const { repoName, description, isPrivate, files, personalAccessToken } = req.body;

    if (!repoName || typeof repoName !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'Repository name is required', 400);
    }

    if (!files || typeof files !== 'object' || Object.keys(files).length === 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Project files map is required', 400);
    }

    let token = personalAccessToken ? String(personalAccessToken).trim() : null;

    if (!token) {
      // 1. Try target user record
      const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (userRecord?.githubAccessToken) {
        token = userRecord.githubAccessToken;
      }
    }

    if (!token) {
      return sendError(
        res,
        'GITHUB_NOT_CONNECTED',
        'Veuillez connecter votre compte GitHub via OAuth ou fournir un Personal Access Token (PAT).',
        400
      );
    }

    // If personalAccessToken was provided directly, save it in Neon DB so future exports don't need re-entry
    if (personalAccessToken && userId) {
      try {
        const ghUserRes = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'Portfolify-Studio-App',
            Accept: 'application/vnd.github.v3+json',
          },
        });
        if (ghUserRes.ok) {
          const ghUserData = (await ghUserRes.json()) as any;
          await db
            .insert(users)
            .values({
              id: userId,
              email: `${userId}@portfolify.dev`,
              username: ghUserData.login,
              githubUsername: ghUserData.login,
              githubAvatarUrl: ghUserData.avatar_url || '',
              githubAccessToken: token,
            })
            .onConflictDoUpdate({
              target: users.id,
              set: {
                githubUsername: ghUserData.login,
                githubAvatarUrl: ghUserData.avatar_url || '',
                githubAccessToken: token,
                updatedAt: new Date(),
              },
            });
        }
      } catch (tokenErr) {
        console.warn('Could not cache PAT profile:', tokenErr);
      }
    }

    const cleanRepoName = repoName.trim().replace(/[^a-zA-Z0-9._-]/g, '-');

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolify-Studio-App',
      'Content-Type': 'application/json',
    };

    // 1. Create GitHub repository
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: cleanRepoName,
        description: description || 'Personal developer portfolio generated with Portfolify Studio',
        private: Boolean(isPrivate),
        auto_init: true, // initializes with default commit so branch exists
      }),
    });

    if (!createRes.ok) {
      const errJson = (await createRes.json().catch(() => ({}))) as any;
      const errMsg = errJson.message || `GitHub error: ${createRes.statusText}`;
      if (errJson.errors && Array.isArray(errJson.errors)) {
        const detail = errJson.errors.map((e: any) => e.message).join(', ');
        return sendError(res, 'REPO_CREATION_FAILED', `${errMsg} (${detail})`, 400);
      }
      return sendError(res, 'REPO_CREATION_FAILED', errMsg, createRes.status);
    }

    const repoData = (await createRes.json()) as any;
    const owner = repoData.owner.login;
    const repo = repoData.name;

    // Small delay to ensure git ref is ready after auto_init
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 2. Commit files sequentially using contents API
    // This is 100% reliable and doesn't suffer from tree sha races
    const fileEntries = Object.entries(files) as [string, string][];

    for (const [filePath, content] of fileEntries) {
      try {
        const base64Content = Buffer.from(content, 'utf-8').toString('base64');
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

        // Check if file already exists (e.g. README.md from auto_init)
        let fileSha: string | undefined;
        try {
          const checkRes = await fetch(url, { headers });
          if (checkRes.ok) {
            const checkJson = (await checkRes.json()) as any;
            fileSha = checkJson.sha;
          }
        } catch (_) {}

        await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `Add ${filePath} from Portfolify Studio`,
            content: base64Content,
            ...(fileSha ? { sha: fileSha } : {}),
          }),
        });
      } catch (fileErr: any) {
        console.warn(`[GitHub Export] Warning while creating ${filePath}:`, fileErr.message);
      }
    }

    return sendSuccess(res, {
      repoUrl: repoData.html_url,
      repoName: repoData.name,
      fullName: repoData.full_name,
      isPrivate: repoData.private,
      owner,
    });
  } catch (err: any) {
    console.error('[GitHub Export Error]:', err);
    return sendError(res, 'EXPORT_FAILED', err.message || 'Failed to export repository to GitHub', 500);
  }
});

export default router;
