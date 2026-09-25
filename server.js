// TikTok Coin Shop — tiny Express server (Node >= 18, only dep: express)
//
// What it does:
//   1. Serves the static frontend from ./public
//   2. GET  /api/profile?username=...  -> server-side TikTok profile lookup
//      (fetches the public profile page with browser-like headers and
//      parses the __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON blob)
//   3. POST /api/login                 -> entry gate; checks credentials
//      against COIN_USER / COIN_PASS env vars and returns a session token

const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Login config: set these as env vars on your host (e.g. Render) ----
const COIN_USER = process.env.COIN_USER || 'admin';
const COIN_PASS = process.env.COIN_PASS || 'coinshop123';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- tiny in-memory session store ----------
const sessions = new Map(); // token -> createdAt

function newToken() {
  const t = crypto.randomBytes(24).toString('hex');
  sessions.set(t, Date.now());
  return t;
}

function sha256(s) {
  return crypto.createHash('sha256').update(String(s)).digest();
}

// Timing-safe compare so passwords can't be guessed byte-by-byte.
function safeEqual(a, b) {
  const ha = sha256(a);
  const hb = sha256(b);
  return ha.length === hb.length && crypto.timingSafeEqual(ha, hb);
}

// ---------- login ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (
    typeof username === 'string' &&
    typeof password === 'string' &&
    safeEqual(username, COIN_USER) &&
    safeEqual(password, COIN_PASS)
  ) {
    return res.json({ ok: true, token: newToken() });
  }
  return res.status(401).json({ ok: false, error: 'Ghalat username ya password' });
});

function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (token && sessions.has(token)) return next();
  return res.status(401).json({ ok: false, error: 'Login required' });
}

// ---------- TikTok profile lookup ----------
function extractUsername(input) {
  const s = String(input || '').trim();
  if (!s) return null;
  // Accept a full link like https://www.tiktok.com/@someuser/...
  const m = s.match(/tiktok\.com\/@([\w.\-~]+)/i);
  if (m) return m[1];
  // ...or "@someuser" / "someuser"
  return s.replace(/^@/, '').split(/[/?#\s]/)[0] || null;
}

const TIKTOK_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://www.tiktok.com/',
};

// Pulls avatar / nickname / bio / verified / stats out of TikTok's
// embedded JSON blob. Returns null when the page has no profile data.
function parseProfile(html) {
  const m = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!m) return null;
  let data;
  try {
    data = JSON.parse(m[1]);
  } catch {
    return null;
  }
  const scope = data && data.__DEFAULT_SCOPE__;
  const detail = scope && scope['webapp.user-detail'];
  const info = detail && detail.userInfo;
  if (!info || !info.user) return null;
  const u = info.user;
  const st = info.stats || {};
  return {
    username: u.uniqueId,
    nickname: u.nickname,
    avatar: u.avatarLarger || u.avatarMedium || u.avatarThumb || '',
    bio: u.signature || '',
    verified: !!u.verified,
    followers: st.followerCount || 0,
    following: st.followingCount || 0,
    likes: st.heartCount || 0,
    videos: st.videoCount || 0,
  };
}

app.get('/api/profile', requireAuth, async (req, res) => {
  const username = extractUsername(req.query.username);
  if (!username) {
    return res.status(400).json({ ok: false, error: 'Username likho' });
  }
  try {
    const r = await fetch(
      'https://www.tiktok.com/@' + encodeURIComponent(username) + '?lang=en',
      { headers: TIKTOK_HEADERS }
    );
    if (r.status === 404) {
      return res.status(404).json({ ok: false, error: 'User nahi mila' });
    }
    if (!r.ok) {
      return res
        .status(502)
        .json({ ok: false, error: 'TikTok ne request rok di, thodi der baad try karo' });
    }
    const html = await r.text();
    const profile = parseProfile(html);
    if (!profile) {
      return res.status(502).json({ ok: false, error: 'Profile parh nahi sakay' });
    }
    return res.json({ ok: true, profile });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Network masla, dobara try karo' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('TikTok Coin Shop chal raha hai: http://localhost:' + PORT);
});
