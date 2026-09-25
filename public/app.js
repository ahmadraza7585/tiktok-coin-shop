// TikTok Coin Shop — frontend (single page, views switched by JS)
const $ = (id) => document.getElementById(id);

const state = {
  token: sessionStorage.getItem('tcs_token') || '',
  profile: null,   // searched TikTok profile
  bundle: null,    // selected coin bundle {coins, price}
  card: null,      // selected card name
};

const DEFAULT_BUNDLES = [
  { coins: 70, price: 0.99 },
  { coins: 350, price: 4.99 },
  { coins: 700, price: 9.99 },
  { coins: 1400, price: 19.99 },
  { coins: 3500, price: 49.99 },
  { coins: 7000, price: 99.99 },
];

const CARDS = [
  { id: 'master', name: 'MASTER', cls: 'master', number: '5421 •••• •••• 3456' },
  { id: 'visa', name: 'VISA', cls: 'visa', number: '4111 •••• •••• 1111' },
  { id: 'paypal', name: 'PAYPAL', cls: 'paypal', number: '6011 •••• •••• 0004' },
  { id: 'amex', name: 'AMEX', cls: 'amex', number: '3782 •••••• 10005' },
];

// ---------- helpers ----------
function show(viewId) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  $(viewId).classList.add('active');
  window.scrollTo(0, 0);
}
function fmt(n) {
  n = Number(n) || 0;
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
function getResult() {
  return localStorage.getItem('tcs_result') || 'Successful';
}
function getCustomBundles() {
  try { return JSON.parse(localStorage.getItem('tcs_custom_bundles') || '[]'); }
  catch { return []; }
}
function authHeaders() {
  return { Authorization: 'Bearer ' + state.token };
}

// ---------- drawers ----------
function openDrawer(which) {
  closeDrawers();
  $('drawer-overlay').classList.add('open');
  $('drawer-' + which).classList.add('open');
  if (which === 'customize') renderCustomList();
}
function closeDrawers() {
  $('drawer-overlay').classList.remove('open');
  document.querySelectorAll('.drawer').forEach((d) => d.classList.remove('open'));
}
document.querySelectorAll('input[name="result"]').forEach((r) => {
  if (r.value === getResult()) r.checked = true;
    r.addEventListener('change', () => localStorage.setItem('tcs_result', r.value));
});
// reason box (settings drawer) — saved, shown on receipt
const reasonInput = document.getElementById('reason-input');
if (reasonInput) {
  reasonInput.value = localStorage.getItem('tcs_reason') || '';
  reasonInput.addEventListener('input', () => localStorage.setItem('tcs_reason', reasonInput.value));
}

// ---------- customize bundles ----------
function addCustomBundle() {
  const coins = parseInt($('custom-coins').value, 10);
  const price = parseFloat($('custom-price').value);
  if (!coins || coins <= 0 || !(price > 0)) {
    alert('Coins aur price sahi likho');
    return;
  }
  const list = getCustomBundles();
  list.push({ coins, price, custom: true });
  localStorage.setItem('tcs_custom_bundles', JSON.stringify(list));
  $('custom-coins').value = '';
  $('custom-price').value = '';
  renderCustomList();
  renderBundles();
}
function removeCustomBundle(i) {
  const list = getCustomBundles();
  list.splice(i, 1);
  localStorage.setItem('tcs_custom_bundles', JSON.stringify(list));
  renderCustomList();
  renderBundles();
}
function renderCustomList() {
  const list = getCustomBundles();
  $('custom-list').innerHTML = list.length
    ? '<p class="drawer-label">Tumhare bundles</p>' + list.map((b, i) =>
        `<div class="custom-item"><span>🪙 ${b.coins} — $${Number(b.price).toFixed(2)}</span><button onclick="removeCustomBundle(${i})">✕</button></div>`
      ).join('')
    : '<p class="hint">Abhi koi custom bundle nahi hai.</p>';
}

// ---------- login ----------
async function doLogin() {
  $('login-error').textContent = '';
  const username = $('login-user').value.trim();
  const password = $('login-pass').value;
  try {
    const r = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const d = await r.json();
    if (d.ok) {
      state.token = d.token;
      sessionStorage.setItem('tcs_token', d.token);
      enterApp();
    } else {
      $('login-error').textContent = d.error || 'Login nahi hua';
    }
  } catch {
    $('login-error').textContent = 'Server se rabta nahi ho saka';
  }
}
function enterApp() {
  renderBundles();
  show('view-home');
}

// ---------- search ----------
async function searchProfile() {
  const q = $('search-input').value.trim();
  $('search-error').textContent = '';
  if (!q) { $('search-error').textContent = 'Username likho'; return; }
  $('search-error').textContent = 'Dhoond rahe hain…';
  try {
    const r = await fetch('/api/profile?username=' + encodeURIComponent(q), {
      headers: authHeaders(),
    });
    const d = await r.json();
    if (r.status === 401) { // session khatam
      sessionStorage.removeItem('tcs_token');
      state.token = '';
      show('view-login');
      return;
    }
    if (!d.ok) {
      $('search-error').textContent = d.error || 'Nahi mila';
      $('profile-card').classList.add('hidden');
      state.profile = null;
      return;
    }
    $('search-error').textContent = '';
    state.profile = d.profile;
    renderProfile(d.profile);
  } catch {
    $('search-error').textContent = 'Network masla, dobara try karo';
  }
}

function renderProfile(p) {
  const img = $('p-avatar');
  const fb = $('p-avatar-fallback');
  if (p.avatar) {
    img.style.display = '';
    fb.style.display = 'none';
    img.src = p.avatar;
  } else {
    img.style.display = 'none';
    fb.style.display = 'flex';
  }
  $('p-nickname').textContent = p.nickname || p.username;
  $('p-username').textContent = '@' + p.username;
  $('p-verified').classList.toggle('hidden', !p.verified);
  $('p-bio').textContent = p.bio || '';
  $('p-followers').textContent = fmt(p.followers);
  $('p-following').textContent = fmt(p.following);
  $('p-likes').textContent = fmt(p.likes);
  $('p-videos').textContent = fmt(p.videos);
  $('profile-card').classList.remove('hidden');
}

// ---------- bundles ----------
function renderBundles() {
  const all = DEFAULT_BUNDLES.concat(getCustomBundles());
  $('bundle-grid').innerHTML = all.map((b, i) => `
    <div class="bundle" onclick="selectBundle(${i})">
      <div class="coins">🪙</div>
      <div class="cnum">${b.coins}</div>
      <div class="price">$${Number(b.price).toFixed(2)}</div>
    </div>`).join('');
}
function selectBundle(i) {
  if (!state.profile) {
    alert('Pehle TikTok username search karo');
    return;
  }
  const all = DEFAULT_BUNDLES.concat(getCustomBundles());
  state.bundle = all[i];
  renderPayment();
  show('view-payment');
}
function goHome() {
  show('view-home');
}

// ---------- payment page ----------
function miniProfileHTML(p) {
  const av = p.avatar
    ? `<img src="${esc(p.avatar)}" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=&quot;mp-fallback&quot;>@</div>'">`
    : `<div class="mp-fallback">@</div>`;
  return `${av}<div>
      <div><b>${esc(p.nickname || p.username)}</b>${p.verified ? ' <span class="verified">✔</span>' : ''}</div>
      <div class="muted">@${esc(p.username)}</div>
    </div>`;
}
function renderPayment() {
  $('pay-profile').innerHTML = miniProfileHTML(state.profile);
  $('pay-summary').innerHTML =
    `🪙 <b>${state.bundle.coins}</b> coins — <b>$${Number(state.bundle.price).toFixed(2)}</b>`;
  $('card-grid').innerHTML = CARDS.map((c) => `
    <div class="pay-card ${c.cls}">
      <div class="brand">${c.name}</div>
      <div class="chip"></div>
      <div class="number">${c.number}</div>
      <div class="row"><span>HOLDER</span><span>TIKTOK COIN SHOP</span></div>
      <div class="amount">$${Number(state.bundle.price).toFixed(2)}</div>
      <button class="proceed" onclick="proceedCard('${c.name}')">Proceed</button>
    </div>`).join('');
}
function proceedCard(cardName) {
  state.card = cardName;
  show('view-sending');
  runSending();
}

// ---------- sending animation ----------
function runSending() {
  const p = state.profile;
  const av = $('s-avatar');
  if (p.avatar) { av.src = p.avatar; av.style.display = ''; }
  else { av.style.display = 'none'; }
  $('sending-text').textContent = `Sending ${state.bundle.coins} coins to @${p.username}…`;

  const layer = $('coin-layer');
  layer.innerHTML = '';
  const bar = $('send-bar');
  bar.style.width = '0';

  let n = 0;
  const total = 14;
  const iv = setInterval(() => {
    n++;
    const c = document.createElement('div');
    c.className = 'coin';
    c.textContent = '🪙';
    c.style.left = (20 + Math.random() * 60) + '%';
    c.style.animationDelay = (Math.random() * 0.4) + 's';
    layer.appendChild(c);
    setTimeout(() => c.remove(), 2200);
    bar.style.width = Math.round((n / total) * 100) + '%';
    if (n >= total) {
      clearInterval(iv);
      setTimeout(showReceipt, 900);
    }
  }, 180);
}

// ---------- receipt ----------
function showReceipt() {
  const result = getResult();
  const badge = $('r-status');
  const map = {
    'Successful': ['ok', '✔ Payment Successful'],
    'Failed': ['bad', '✘ Payment Failed'],
    'Card Blocked': ['warn', '⚠ Card Blocked'],
    'Unauthorized': ['bad', '⛔ Unauthorized'],
  };
  const [cls, label] = map[result] || map['Successful'];
  badge.className = 'r-status ' + cls;
  badge.textContent = label;

  $('r-profile').innerHTML = miniProfileHTML(state.profile);
  $('r-coins').textContent = '🪙 ' + state.bundle.coins;
  $('r-amount').textContent = '$' + Number(state.bundle.price).toFixed(2);
  $('r-card').textContent = state.card;
  $('r-order').textContent = 'TCS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    $('r-date').textContent = new Date().toLocaleString();
  const reason = localStorage.getItem('tcs_reason') || '';
  $('r-reason').textContent = reason || '—';
  show('view-receipt');
}

// ---------- boot ----------
if (state.token) {
  enterApp();
} else {
  show('view-login');
}
$('login-pass').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
$('search-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') searchProfile(); });
