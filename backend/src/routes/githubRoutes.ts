import { Router, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liFOZBhSyz3JttwM';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '714d79169732186226347f1a9e849599616fffb7';
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
    if (userId && userId !== 'guest') {
      await db
        .insert(users)
        .values({
          id: userId,
          email: `${userId}@clerk.user`,
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
                  avatarUrl: '${githubAvatarUrl}'
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
    if (!userId) {
      try {
        const auth = getAuth(req);
        if (auth?.userId) userId = auth.userId;
      } catch (e) {}
    }

    if (!userId) {
      return sendSuccess(res, { connected: false, username: null, avatarUrl: null });
    }

    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (userRecord && userRecord.githubUsername) {
      return sendSuccess(res, {
        connected: true,
        username: userRecord.githubUsername,
        avatarUrl: userRecord.githubAvatarUrl,
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

export default router;
