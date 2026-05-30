// ─────────────────────────────────────────────
//  app.js  —  Main application logic
// ─────────────────────────────────────────────

import { searchFoods } from './foods.js';
import {
  supabase,
  signIn, signUp, signOut, getSession,
  saveProfile, loadProfile,
  logFood, getLogsForDate, deleteLog,
  getWeeklySummary,
} from './db.js';

// ── State ─────────────────────────────────────

let state = {
  currentDate: todayStr(),       // "YYYY-MM-DD"
  logs: [],                      // food_logs rows for currentDate
  targets: { cal: 0, pro: 0, car: 0, fat: 0 },
  selectedFood: null,
  currentView: 'dashboard',
};

// ── Helpers ───────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function round1(n) { return Math.round(n * 10) / 10; }
function roundInt(n) { return Math.round(n); }

function pct(val, target) {
  if (!target) return 0;
  return Math.min(Math.round((val / target) * 100), 100);
}

// ── Toast ─────────────────────────────────────

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ── Auth ──────────────────────────────────────

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function initAuth() {
  const session = await getSession();
  if (session) {
    onSignedIn(session.user);
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) onSignedIn(session.user);
    else onSignedOut();
  });

  // Auth tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
      document.getElementById('auth-error').textContent = '';
    });
  });

  document.getElementById('btn-login').addEventListener('click', async () => {
    const btn = document.getElementById('btn-login');
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    if (!email || !pass) return;
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    try {
      await signIn(email, pass);
    } catch (e) {
      document.getElementById('auth-error').textContent = e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
  });

  document.getElementById('btn-signup').addEventListener('click', async () => {
    const btn = document.getElementById('btn-signup');
    const email = document.getElementById('signup-email').value.trim();
    const pass  = document.getElementById('signup-password').value;
    if (!email || !pass) return;
    btn.disabled = true;
    btn.textContent = 'Creating account…';
    try {
      await signUp(email, pass);
      document.getElementById('auth-error').style.color = 'var(--cal)';
      document.getElementById('auth-error').textContent = 'Account created! Check your email to confirm.';
    } catch (e) {
      document.getElementById('auth-error').style.color = 'var(--fat)';
      document.getElementById('auth-error').textContent = e.message;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create account';
    }
  });

  document.getElementById('btn-signout').addEventListener('click', async () => {
    await signOut();
  });
}

async function onSignedIn(user) {
  document.getElementById('sidebar-user-email').textContent = user.email;
  showScreen('app-screen');
  const profile = await loadProfile();
  if (profile && profile.cal_target) {
    state.targets = {
      cal: profile.cal_target,
      pro: profile.pro_target,
      car: profile.car_target,
      fat: profile.fat_target,
    };
    populateProfileFields(profile);
    showTargetsDisplay(profile);
  }
  await refreshLogs();
  updateDashboard();
}

function onSignedOut() {
  showScreen('auth-screen');
  state.logs = [];
  state.targets = { cal: 0, pro: 0, car: 0, fat: 0 };
}

// ── Navigation ────────────────────────────────

function initNav() {
  document.querySelectorAll('.nav-item, .link-btn[data-view]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchView(link.dataset.view);
      // close mobile sidebar
      document.querySelector('.sidebar').classList.remove('open');
    });
  });

  document.getElementById('burger').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('open');
  });

  document.getElementById('prev-day').addEventListener('click', () => {
    const d = new Date(state.currentDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    state.currentDate = d.toISOString().split('T')[0];
    refreshLogs().then(updateDashboard);
  });

  document.getElementById('next-day').addEventListener('click', () => {
    const d = new Date(state.currentDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const next = d.toISOString().split('T')[0];
    if (next > todayStr()) return;
    state.currentDate = next;
    refreshLogs().then(updateDashboard);
  });
}

async function switchView(view) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');
  state.currentView = view;

  if (view === 'history') await renderHistory();
}

// ── Data ──────────────────────────────────────

async function refreshLogs() {
  state.logs = await getLogsForDate(state.currentDate);
  renderLogTable();
}

// ── Totals ────────────────────────────────────

function getTotals() {
  return state.logs.reduce(
    (acc, r) => ({
      cal: acc.cal + Number(r.cal),
      pro: acc.pro + Number(r.pro),
      car: acc.car + Number(r.car),
      fat: acc.fat + Number(r.fat),
    }),
    { cal: 0, pro: 0, car: 0, fat: 0 }
  );
}

// ── Dashboard ─────────────────────────────────

function updateDashboard() {
  const t = getTotals();
  const g = state.targets;

  // Date labels
  document.getElementById('dashboard-date').textContent = formatDate(state.currentDate);
  document.getElementById('log-date').textContent = formatDate(state.currentDate);

  // Calorie ring
  const CIRCUMFERENCE = 2 * Math.PI * 80; // r=80
  const ringEl = document.getElementById('ring-cal');
  const calPct = g.cal ? Math.min(t.cal / g.cal, 1) : 0;
  ringEl.style.strokeDasharray  = CIRCUMFERENCE;
  ringEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - calPct);
  ringEl.style.stroke = t.cal > g.cal ? 'var(--fat)' : 'var(--cal)';

  document.getElementById('ring-val-cal').textContent = roundInt(t.cal);
  document.getElementById('ring-target-cal').textContent = `/ ${g.cal} goal`;

  // Macro cards
  setMacro('pro', t.pro, g.pro);
  setMacro('car', t.car, g.car);
  setMacro('fat', t.fat, g.fat);

  // Remaining
  setText('rem-cal', g.cal ? `${Math.max(0, roundInt(g.cal - t.cal))} kcal` : '—');
  setText('rem-pro', g.pro ? `${Math.max(0, round1(g.pro - t.pro))} g` : '—');
  setText('rem-car', g.car ? `${Math.max(0, round1(g.car - t.car))} g` : '—');
  setText('rem-fat', g.fat ? `${Math.max(0, round1(g.fat - t.fat))} g` : '—');

  // Log table on dashboard
  renderDashboardLogTable();
}

function setMacro(key, val, target) {
  setText('mc-' + key, round1(val));
  setText('mt-' + key, `/ ${target} g`);
  const fill = document.getElementById('mb-' + key);
  fill.style.width = pct(val, target) + '%';
  fill.style.background = val > target ? 'var(--fat)' : '';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Log table ─────────────────────────────────

function buildTableRows(logs, containerId, allowDelete) {
  const tbody = document.getElementById(containerId);
  if (!logs.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Nothing logged yet</td></tr>`;
    return;
  }
  tbody.innerHTML = logs.map(row => `
    <tr>
      <td>${row.food_name}</td>
      <td>${row.quantity_g}g</td>
      <td>${roundInt(row.cal)}</td>
      <td style="color:var(--pro)">${round1(row.pro)}g</td>
      <td style="color:var(--car)">${round1(row.car)}g</td>
      <td style="color:var(--fat)">${round1(row.fat)}g</td>
      <td>${allowDelete
        ? `<button class="del-row-btn" data-id="${row.id}" title="Remove">×</button>`
        : ''}</td>
    </tr>
  `).join('');

  if (allowDelete) {
    tbody.querySelectorAll('.del-row-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await deleteLog(Number(btn.dataset.id));
        await refreshLogs();
        updateDashboard();
        toast('Entry removed', 'error');
      });
    });
  }
}

function renderDashboardLogTable() {
  buildTableRows(state.logs, 'dashboard-log-body', false);
}

function renderLogTable() {
  buildTableRows(state.logs, 'log-full-body', true);

  const t = getTotals();
  const el = document.getElementById('log-totals');
  if (el) {
    el.textContent = state.logs.length
      ? `Total: ${roundInt(t.cal)} kcal · P ${round1(t.pro)}g · C ${round1(t.car)}g · F ${round1(t.fat)}g`
      : '';
  }
}

// ── Food search & add ─────────────────────────

function initFoodSearch() {
  const input  = document.getElementById('food-search');
  const box    = document.getElementById('suggestions-box');
  const qtyIn  = document.getElementById('food-qty');
  const addBtn = document.getElementById('btn-add-food');

  input.addEventListener('input', () => {
    const results = searchFoods(input.value);
    if (!results.length || !input.value.trim()) {
      box.classList.remove('open');
      box.innerHTML = '';
      return;
    }
    box.innerHTML = results.map(f => `
      <div class="sug-item" data-idx="${f.id}">
        <div class="sug-name">${f.name}</div>
        <div class="sug-macros">
          ${f.cal} kcal &nbsp;·&nbsp;
          <span class="m-pro">P ${f.pro}g</span> &nbsp;·&nbsp;
          <span class="m-car">C ${f.car}g</span> &nbsp;·&nbsp;
          <span class="m-fat">F ${f.fat}g</span>
          <span style="font-size:10px;color:var(--text-3)"> per 100g</span>
        </div>
      </div>
    `).join('');

    box.querySelectorAll('.sug-item').forEach((el, i) => {
      el.addEventListener('click', () => {
        state.selectedFood = results[i];
        input.value = results[i].name;
        box.classList.remove('open');
        updatePreview();
      });
    });
    box.classList.add('open');
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !box.contains(e.target)) {
      box.classList.remove('open');
    }
  });

  // Keyboard: Enter selects first
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const first = box.querySelector('.sug-item');
      if (first) first.click();
    }
  });

  qtyIn.addEventListener('input', updatePreview);

  addBtn.addEventListener('click', async () => {
    if (!state.selectedFood) {
      toast('Select a food from the list first', 'error');
      return;
    }
    const qty = parseFloat(qtyIn.value) || 100;
    const scale = qty / 100;
    const f = state.selectedFood;

    addBtn.disabled = true;
    addBtn.textContent = 'Adding…';

    try {
      await logFood({
        date:   state.currentDate,
        foodId: f.id,
        name:   f.name,
        qty,
        cal: round1(f.cal * scale),
        pro: round1(f.pro * scale),
        car: round1(f.car * scale),
        fat: round1(f.fat * scale),
      });

      state.selectedFood = null;
      input.value = '';
      qtyIn.value = '100';
      document.getElementById('food-preview').style.display = 'none';

      await refreshLogs();
      updateDashboard();
      toast(`${f.name} added ✓`, 'success');
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    } finally {
      addBtn.disabled = false;
      addBtn.textContent = '+ Add';
    }
  });
}

function updatePreview() {
  const f = state.selectedFood;
  const preview = document.getElementById('food-preview');
  if (!f) { preview.style.display = 'none'; return; }
  const qty   = parseFloat(document.getElementById('food-qty').value) || 100;
  const scale = qty / 100;

  document.getElementById('preview-name').textContent = `${f.name} · ${qty}g`;
  document.getElementById('preview-macros').textContent =
    `${roundInt(f.cal * scale)} kcal  ·  Protein ${round1(f.pro * scale)}g  ·  Carbs ${round1(f.car * scale)}g  ·  Fat ${round1(f.fat * scale)}g`;
  preview.style.display = 'block';
}

// ── Profile & macro calculator ─────────────────

function initProfile() {
  document.getElementById('btn-save-profile').addEventListener('click', async () => {
    const w   = parseFloat(document.getElementById('p-weight').value);
    const h   = parseFloat(document.getElementById('p-height').value);
    const age = parseFloat(document.getElementById('p-age').value);
    const sex = document.getElementById('p-sex').value;
    const act = parseFloat(document.getElementById('p-activity').value);
    const goal= document.getElementById('p-goal').value;

    if (!w || !h || !age) { toast('Fill in all fields', 'error'); return; }

    // Mifflin-St Jeor BMR
    const bmr = sex === 'male'
      ? 10*w + 6.25*h - 5*age + 5
      : 10*w + 6.25*h - 5*age - 161;

    const tdee = bmr * act;
    let cal = tdee;
    if (goal === 'gain')  cal = tdee + 300;
    if (goal === 'lose')  cal = tdee - 500;
    cal = roundInt(cal);

    // Macros
    const pro = roundInt(w * 2);              // 2g/kg
    const fat = roundInt((cal * 0.25) / 9);  // 25% of cals from fat
    const car = roundInt((cal - pro*4 - fat*9) / 4);

    const profile = {
      weight_kg: w, height_cm: h, age, sex,
      activity_factor: act, goal,
      cal_target: cal, pro_target: pro, car_target: car, fat_target: fat,
    };

    const btn = document.getElementById('btn-save-profile');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    try {
      await saveProfile(profile);
      state.targets = { cal, pro, car, fat };
      showTargetsDisplay({ ...profile, bmr: roundInt(bmr), tdee: roundInt(tdee) });
      updateDashboard();
      toast('Targets saved ✓', 'success');
    } catch (e) {
      toast('Error: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Calculate & save targets';
    }
  });
}

function populateProfileFields(p) {
  if (p.weight_kg)        document.getElementById('p-weight').value   = p.weight_kg;
  if (p.height_cm)        document.getElementById('p-height').value   = p.height_cm;
  if (p.age)              document.getElementById('p-age').value      = p.age;
  if (p.sex)              document.getElementById('p-sex').value      = p.sex;
  if (p.activity_factor)  document.getElementById('p-activity').value = p.activity_factor;
  if (p.goal)             document.getElementById('p-goal').value     = p.goal;
}

function showTargetsDisplay(p) {
  const w   = p.weight_kg || 70;
  const h   = p.height_cm || 175;
  const age = p.age || 22;
  const sex = p.sex || 'male';
  const act = p.activity_factor || 1.55;

  const bmr = p.bmr || roundInt(
    sex === 'male'
      ? 10*w + 6.25*h - 5*age + 5
      : 10*w + 6.25*h - 5*age - 161
  );
  const tdee = p.tdee || roundInt(bmr * act);

  document.getElementById('t-bmr').textContent  = bmr;
  document.getElementById('t-tdee').textContent = tdee;
  document.getElementById('t-cal').textContent  = p.cal_target;
  document.getElementById('t-pro').textContent  = p.pro_target;
  document.getElementById('t-car').textContent  = p.car_target;
  document.getElementById('t-fat').textContent  = p.fat_target;
  document.getElementById('targets-display').style.display = 'block';
}

// ── History ───────────────────────────────────

async function renderHistory() {
  const summary = await getWeeklySummary();
  const dates   = Object.keys(summary).sort();

  // Table
  const tbody = document.getElementById('history-body');
  if (!dates.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="5">No data yet — start logging!</td></tr>`;
    document.getElementById('bar-chart').innerHTML = '';
    return;
  }

  tbody.innerHTML = dates.map(d => {
    const r = summary[d];
    return `
      <tr>
        <td>${formatDate(d)}</td>
        <td>${roundInt(r.cal)}</td>
        <td style="color:var(--pro)">${round1(r.pro)}g</td>
        <td style="color:var(--car)">${round1(r.car)}g</td>
        <td style="color:var(--fat)">${round1(r.fat)}g</td>
      </tr>
    `;
  }).join('');

  // Bar chart
  const maxCal = Math.max(...dates.map(d => summary[d].cal), state.targets.cal || 1);
  const maxPro = Math.max(...dates.map(d => summary[d].pro), state.targets.pro || 1);
  const chartEl = document.getElementById('bar-chart');

  chartEl.innerHTML = dates.map(d => {
    const r     = summary[d];
    const calH  = Math.round((r.cal / maxCal) * 130);
    const proH  = Math.round((r.pro / maxPro) * 130);
    const label = new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return `
      <div class="bar-group">
        <div class="bar-pair">
          <div class="bar bar-cal" style="height:${calH}px" title="${roundInt(r.cal)} kcal"></div>
          <div class="bar bar-pro" style="height:${proH}px" title="${round1(r.pro)}g protein"></div>
        </div>
        <div class="bar-date">${label}</div>
      </div>
    `;
  }).join('');
}

// ── Boot ──────────────────────────────────────

async function boot() {
  await initAuth();
  initNav();
  initFoodSearch();
  initProfile();
  updateDashboard();
}

boot();
