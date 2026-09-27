const API = (new URLSearchParams(window.location.search).get('api') || window.location.origin).replace(/\/+$/, '');
function getHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const params = new URLSearchParams(window.location.search);
  const session = params.get('session');
  if (session) h['X-Admin-Session'] = session;
  return h;
}
async function api(path) {
  const r = await fetch(API + path, { headers: getHeaders() });
  return r.json();
}
async function load() {
  try {
    const data = await api('/api/admin/overview');
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
    const s = data.stats;
    document.getElementById('stats').innerHTML = `
      <div class="row"><span>Games</span><span class="val">${s.games}</span></div>
      <div class="row"><span>Wagered</span><span class="val">${s.wagered} ⭐</span></div>
      <div class="row"><span>Paid</span><span class="val">${s.paid} ⭐</span></div>
      <div class="row"><span>Net Profit</span><span class="val">${s.net_profit} ⭐</span></div>
      <div class="row"><span>RTP</span><span class="val">${s.rtp ? (s.rtp*100).toFixed(1)+'%' : 'N/A'}</span></div>
      <div class="row"><span>Users</span><span class="val">${s.users}</span></div>
      <div class="row"><span>Active Games</span><span class="val">${s.active_games}</span></div>
    `;
    let gh = '<table><tr><th>User</th><th>Bet</th><th>Crash</th><th>Payout</th><th>Status</th></tr>';
    (data.flights || []).forEach(g => {
      const cls = g.status === 'cashed' ? 'win' : 'lose';
      gh += `<tr><td>${g.username||g.user_id}</td><td>${g.bet}</td><td>${g.crash_point}x</td><td>${g.payout}</td><td class="${cls}">${g.status}</td></tr>`;
    });
    document.getElementById('games').innerHTML = gh + '</table>';
    const st = data.settings;
    let sh = '<table><tr><th>Key</th><th>Value</th></tr>';
    Object.entries(st).forEach(([k,v]) => { sh += `<tr><td>${k}</td><td>${v}</td></tr>`; });
    document.getElementById('settings').innerHTML = sh + '</table>';
  } catch(e) {
    document.getElementById('loading').textContent = 'Error loading data: ' + e.message;
  }
}
load();
