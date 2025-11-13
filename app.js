// FILE: app.js

// --- Basic router (hash-based) ---
(function router(){
  const app = document.getElementById('app');
  function route(){
    const hash = location.hash || '#hub';
    document.querySelectorAll('main section').forEach(s=>{
      s.style.display = ('#'+s.id===hash)?'block':'none';
    });
  }
  window.addEventListener('hashchange', route);
  route();
})();

// --- Auth mini-wire (resilient) ---
(function authMini() {
  const btn = document.getElementById('btnAuth');
  const badge = document.getElementById('badge');

  function wire(api) {
    api.onAuthStateChanged(api.auth, (user) => {
      if (user) {
        btn.textContent = 'Sign out';
        badge.textContent = `Hi, ${user.displayName || user.email}`;
      } else {
        btn.textContent = 'Sign in';
        badge.textContent = '';
      }
    });

    btn.addEventListener('click', async () => {
      try {
        if (!api.auth.currentUser) {
          await api.signInWithPopup(api.auth, api.provider);
        } else {
          await api.signOut(api.auth);
        }
      } catch (e) { alert(e.message); }
    });
  }

  (function wait(tries=0){
    const api = window.__samvad;
    if (api && api.auth) return wire(api);
    if (tries>20) return;
    setTimeout(()=>wait(tries+1),300);
  })();
})();

// --- Trial (3-day) init + header badge ---
(function samvadTrial3Day() {
  function daysLeftUTC(startDate, durationDays = 3) {
    const startUTC = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    ));
    const endUTC = new Date(startUTC.getTime() + durationDays * 86400000);
    const now = new Date();
    const diffDays = Math.ceil((endUTC - now) / 86400000);
    return Math.max(0, diffDays);
  }
  function setBadge(text) {
    const badge = document.getElementById('badge');
    if (badge) badge.textContent = text || '';
  }
  async function upsertUserIfNeeded(api, user) {
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const ref = api.doc(api.db, "samvad_users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await api.setDoc(ref, {
        uid: user.uid,
        name: user.displayName || null,
        email: user.email || null,
        photoURL: user.photoURL || null,
        tier: "trial",
        trialStartedAt: api.serverTimestamp(),
        createdAt: api.serverTimestamp(),
        lastSeen: api.serverTimestamp()
      }, { merge: true });
      return { tier: "trial", trialStartedAt: new Date() };
    }
    const data = snap.data() || {};
    let changed = false;
    const update = { lastSeen: api.serverTimestamp() };
    if (!data.tier) { update.tier = "trial"; changed = true; }
    if (!data.trialStartedAt) { update.trialStartedAt = api.serverTimestamp(); changed = true; }
    if (changed) await api.setDoc(ref, update, { merge: true });
    return {
      tier: data.tier || "trial",
      trialStartedAt: data.trialStartedAt
        ? (data.trialStartedAt.toDate ? data.trialStartedAt.toDate() : new Date(data.trialStartedAt.seconds * 1000))
        : new Date()
    };
  }
  function wire(api) {
    api.onAuthStateChanged(api.auth, async (user) => {
      if (!user) { setBadge(''); return; }
      try {
        const info = await upsertUserIfNeeded(api, user);
        const tierNorm = (info.tier === 'free') ? 'trial' : info.tier;
        if (tierNorm === "premium") { setBadge("Premium"); return; }
        const left = daysLeftUTC(info.trialStartedAt);
        if (left > 0) setBadge(`Trial · ${left}d left`);
        else setBadge("Trial ended · Upgrade to continue");
      } catch (e) { console.error(e); setBadge(''); }
    });
  }
  (function wait(tries = 0) {
    const api = window.__samvad;
    if (api && api.db && api.auth) return wire(api);
    if (tries > 20) return;
    setTimeout(() => wait(tries + 1), 300);
  })();
})();

// --- Trial banner controller ---
(function trialBanner() {
  function daysLeftUTC(startDate, durationDays = 3) {
    const startUTC = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getMonth(), startDate.getDate()));
    const endUTC = new Date(startUTC.getTime() + durationDays * 86400000);
    const now = new Date();
    return Math.max(0, Math.ceil((endUTC - now) / 86400000));
  }
  async function fetchStatus(api) {
    const user = api.auth.currentUser;
    if (!user) return { tier: 'none' };
    const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const ref = api.doc(api.db, "samvad_users", user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { tier: 'trial', daysLeft: 3 };
    const d = snap.data() || {};
    const tier = (d.tier === 'free') ? 'trial' : (d.tier || 'trial');
    if (tier === 'premium') return { tier };
    const started = d.trialStartedAt
      ? (d.trialStartedAt.toDate ? d.trialStartedAt.toDate() : new Date(d.trialStartedAt.seconds * 1000))
      : new Date();
    return { tier, daysLeft: daysLeftUTC(started) };
  }
  function setBanner(tier, daysLeft) {
    const bar = document.getElementById('trialBanner');
    const txt = document.getElementById('trialText');
    if (!bar || !txt) return;
    if (tier === 'premium') { bar.style.display = 'none'; return; }
    if (tier === 'trial') {
      txt.textContent = `Full access trial — ${daysLeft} day${daysLeft===1?'':'s'} left`;
      bar.style.display = 'block';
      return;
    }
    txt.textContent = `Trial ended — Upgrade to continue`;
    bar.style.display = 'block';
  }
  function wire(api) {
    const upg = document.getElementById('trialUpgrade');
    if (upg) upg.addEventListener('click', () => { alert('Upgrade flow will appear here.'); });
    api.onAuthStateChanged(api.auth, async () => {
      try {
        const s = await fetchStatus(api);
        setBanner(s.tier, s.daysLeft || 0);
      } catch { /* silent */ }
    });
  }
  (function wait(tries=0){
    const api = window.__samvad;
    if (api && api.db && api.auth) return wire(api);
    if (tries>20) return;
    setTimeout(()=>wait(tries+1),300);
  })();
})();

// --- Gate + Paywall + Status helper (free => trial normalization) ---
(function samvadGate() {
  function showPaywall(show) {
    const m = document.getElementById('paywall');
    if (m) m.style.display = show ? 'block' : 'none';
  }

  async function getSamvadStatus(api) {
    const user = api.auth.currentUser;
    if (!user) return { allowed: false, reason: 'signin' };

    const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
    const ref = api.doc(api.db, "samvad_users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return { allowed: true, tier: 'trial', daysLeft: 3 };

    const data = snap.data() || {};
    const tier = (data.tier === 'free') ? 'trial' : (data.tier || 'trial');
    if (tier === 'premium') return { allowed: true, tier: 'premium' };

    function daysLeftUTC(startDate, durationDays = 3) {
      const startUTC = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate()
      ));
      const endUTC = new Date(startUTC.getTime() + durationDays * 86400000);
      const now = new Date();
      const diffDays = Math.ceil((endUTC - now) / 86400000);
      return Math.max(0, diffDays);
    }
    const started = data.trialStartedAt
      ? (data.trialStartedAt.toDate ? data.trialStartedAt.toDate() : new Date(data.trialStartedAt.seconds * 1000))
      : new Date();
    const left = daysLeftUTC(started);
    return { allowed: left > 0, tier, daysLeft: left };
  }

  function wire() {
    const closeBtn = document.getElementById('btnClosePaywall');
    const upgradeBtn = document.getElementById('btnUpgrade');
    if (closeBtn) closeBtn.addEventListener('click', () => showPaywall(false));
    if (upgradeBtn) upgradeBtn.addEventListener('click', () => {
      alert('Upgrade flow will appear here.');
      showPaywall(false);
    });
    // expose for Q&A module below
    window.__samvadGate = { getSamvadStatus, showPaywall };
  }

  (function wait(tries=0){
    const api = window.__samvad;
    if (api && api.db && api.auth) return wire();
    if (tries>20) return;
    setTimeout(()=>wait(tries+1),300);
  })();
})();

// --- Q&A: UI handler + API caller + history ---
(function qaModule(){
  const input = document.getElementById('qaInput');
  const askBtn = document.getElementById('btnAsk');
  const statusEl = document.getElementById('qaStatus');
  const out = document.getElementById('qaOutput');
  const sourcesEl = document.getElementById('qaSources');
  const historyWrap = document.getElementById('qaHistoryWrap');
  const historyEl = document.getElementById('qaHistory');

  function setStatus(msg){ if(statusEl) statusEl.textContent = msg || ''; }

  function getDepth(){
    const el = document.querySelector('input[name="depth"]:checked');
    return (el && el.value) || 'plain';
  }

  function renderAnswer(answer, sources){
    if (out) out.textContent = answer || '(no answer)';
    if (!sourcesEl) return;
    if (sources && sources.length){
      sourcesEl.innerHTML = 'Sources: ' + sources.map(s=>`<span>${s}</span>`).join(' · ');
    } else {
      sourcesEl.innerHTML = '';
    }
  }

  // Recent Q&A history renderer
    function renderHistory(entries){
    if (!historyEl || !historyWrap) return;

    // Always show the panel
    historyWrap.style.display = 'block';

    // If nothing to show yet, display a friendly placeholder
    if (!entries || !entries.length) {
      historyEl.innerHTML = `
        <div style="font-size:0.85rem;color:var(--muted);">
          Your recent questions will appear here as you ask them.
        </div>
      `;
      return;
    }

    // Otherwise render the list
    historyEl.innerHTML = entries.map(e => {
      const depthLabel = e.depth === 'scholar' ? 'In-depth' : 'Simple';
      const when = e.createdAt
        ? e.createdAt.toLocaleString()
        : '';
      const qRaw = e.question || '';
      const q = qRaw.length > 140 ? qRaw.slice(0,137) + '…' : qRaw;
      return `
        <div style="border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-top:8px;">
          <div style="color:var(--muted);font-size:0.8rem;margin-bottom:4px;">
            ${depthLabel}${when ? ' · ' + when : ''}
          </div>
          <div style="font-size:0.9rem;">Q: ${q}</div>
        </div>
      `;
    }).join('');
  }
  async function callSamvadQA(question, depth){
    // Envelope expected by your backend
    const payload = {
      mode: "samvad",
      guru: "aurobindo",
      action: "qa",
      depth,            // "plain" | "scholar" (Simple | In-depth)
      question
    };
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if (!res.ok){
      const txt = await res.text().catch(()=>String(res.status));
      throw new Error(`API ${res.status}: ${txt}`);
    }
    return res.json(); // { answer: string, sources?: string[] }
  }

  // Log each successful Q&A to Firestore
  async function logSamvadQA(api, question, depth, answer, sources){
    try {
      const user = api.auth.currentUser;
      if (!user) return; // only log for signed-in users

      const { addDoc, collection } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");

      await addDoc(collection(api.db, "samvad_qa"), {
        uid: user.uid,
        guru: "aurobindo",
        depth,               // "plain" | "scholar"
        question,
        answer,
        sources: sources || [],
        createdAt: api.serverTimestamp()
      });
    } catch (e) {
      console.error("logSamvadQA error:", e);
      // We silently ignore logging errors so they never block the UI.
    }
  }

  // Load recent Q&A from Firestore for the current user
   async function loadSamvadHistory(api, user){
    if (!historyEl || !historyWrap) return;
    try {
      const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const snap = await getDocs(collection(api.db, "samvad_qa"));

      const all = [];
      snap.forEach(doc => {
        const d = doc.data() || {};

        // TEMP: show all entries (we can re-add uid filter later)
        let createdAt = null;
        if (d.createdAt && d.createdAt.toDate) {
          createdAt = d.createdAt.toDate();
        }
        all.push({
          id: doc.id,
          question: d.question || '',
          answer: d.answer || '',
          depth: d.depth || 'plain',
          createdAt
        });
      });

      console.log('Samvad history docs found:', all.length);

      // Sort newest first and take last 5
      all.sort((a, b) => {
        const ta = a.createdAt ? a.createdAt.getTime() : 0;
        const tb = b.createdAt ? b.createdAt.getTime() : 0;
        return tb - ta;
      });

      const latest = all.slice(0, 5);
      renderHistory(latest);
    } catch (e) {
      console.error('loadSamvadHistory error:', e);
      // On error, just show the placeholder
      renderHistory([]);
    }
  }

  async function onAsk(){
    const api = window.__samvad;
    const gate = window.__samvadGate;
    if (!api || !gate) return alert('Please reload the page.');
    const q = (input && input.value || '').trim();
    if (!q) { input && input.focus(); return; }

    // Gate check: trial active or premium only
    const status = await gate.getSamvadStatus(api);
    if (!status.allowed) { gate.showPaywall(true); return; }

    try {
      setStatus('Thinking…');
      if (askBtn) askBtn.disabled = true;
      renderAnswer('', []);
      const depth = getDepth();

      // Call backend
      const data = await callSamvadQA(q, depth);

      // Render
      const answer = data.answer || '(no answer)';
      const sources = data.sources || [];
      renderAnswer(answer, sources);
      setStatus('');

      // Fire-and-forget log to Firestore
      if (window.__samvad && window.__samvad.auth) {
        logSamvadQA(window.__samvad, q, depth, answer, sources)
          .then(() => {
            // After logging, refresh history for this user
            const user = window.__samvad.auth.currentUser;
            if (user) loadSamvadHistory(window.__samvad, user);
          })
          .catch(()=>{ /* already logged in logSamvadQA */ });
      }

    } catch (e) {
      console.error(e);
      setStatus('Error. Is /api/chat configured on this domain?');
    } finally {
      if (askBtn) askBtn.disabled = false;
    }
  }

  function wire(){
    if (askBtn) askBtn.addEventListener('click', onAsk);

    // Also load history when user signs in / changes
    (function watchHistory(tries=0){
      const api = window.__samvad;
      if (!api || !api.auth) {
        if (tries > 20) return;
        return setTimeout(() => watchHistory(tries+1), 300);
      }
      api.onAuthStateChanged(api.auth, (user) => {
        if (user) {
          loadSamvadHistory(api, user);
        } else {
          renderHistory([]);
        }
      });
    })();
  }

  (function wait(tries=0){
    if (document.readyState === 'complete' || document.readyState === 'interactive') return wire();
    if (tries>20) return;
    setTimeout(()=>wait(tries+1),300);
  })();
})();
// --- Q&A: Copy answer helper ---
(() => {
  const btnCopy = document.getElementById("btnCopyAnswer");
  if (!btnCopy) return;

  const outputEl = document.getElementById("qaOutput");
  const statusEl = document.getElementById("qaStatus");

  let copyTimeout = null;

  btnCopy.addEventListener("click", async () => {
    if (!outputEl) return;

    const text = (outputEl.textContent || "").trim();
    if (!text) {
      // No answer yet; nothing to copy.
      return;
    }

    try {
      await navigator.clipboard.writeText(text);

      // Show a tiny "Copied!" feedback in the status area
      if (statusEl) {
        const original = statusEl.textContent || "";
        statusEl.textContent = "Copied!";
        if (copyTimeout) clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => {
          statusEl.textContent = original;
        }, 1500);
      }
    } catch (e) {
      console.error("Clipboard copy failed:", e);
      // Silent fail is fine; we don't want to scare the user.
    }
  });
})();
