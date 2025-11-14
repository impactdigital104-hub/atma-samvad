// FILE: app.js

// --- Guided Reading: 21 Days with Integral Yoga ---
// Data-only for now. UI and logic will be added later.
const integralYogaJourneyDays = [
  {
    day: 1,
    phase: "Foundations",
    title: "What is Integral Yoga?",
    work: "Sri Aurobindo — The Synthesis of Yoga",
    theme: "Aim of the yoga",
    excerpt:
      "[[Insert authentic passage explaining the aim of Integral Yoga — that it seeks to transform the whole being and life, not to escape the world.]]",
    reflectionHint:
      "Notice one place in your day where you feel pulled outward by habit. Quietly remember that yoga is about transforming life, not running away from it."
  },
  {
    day: 2,
    phase: "Foundations",
    title: "The Divine in Life, not Only Beyond",
    work: "Sri Aurobindo — The Life Divine or Essays on the Gita",
    theme: "Divine presence in the world",
    excerpt:
      "[[Insert passage that shows the Divine is present in all and seeks manifestation in life, not only in a distant heaven or nirvana.]]",
    reflectionHint:
      "As you move through your day, pick one ordinary situation and briefly try to see it as a place where the Divine is also present."
  },
  {
    day: 3,
    phase: "Foundations",
    title: "The Psychic Being",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "The soul-personality within",
    excerpt:
      "[[Insert passage describing the psychic being as the inner soul-personality that quietly guides towards truth, beauty and love for the Divine.]]",
    reflectionHint:
      "At some quiet moment, place your hand on your heart and simply ask within for guidance, without forcing any answer."
  },
  {
    day: 4,
    phase: "Foundations",
    title: "Aspiration",
    work: "Sri Aurobindo & The Mother — Letters and Talks",
    theme: "True aspiration vs restless desire",
    excerpt:
      "[[Insert passage clarifying aspiration as a steady, quiet upward movement of the being towards the Divine, not restless emotional wanting.]]",
    reflectionHint:
      "Today, when you feel a strong desire, pause and ask: is this a true aspiration or just a restless wanting?"
  },
  {
    day: 5,
    phase: "Foundations",
    title: "Rejection of Lower Movements",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "Handling undesirable movements",
    excerpt:
      "[[Insert passage on quietly rejecting falsehood, fear, anger, and other lower movements, without violent suppression or guilt.]]",
    reflectionHint:
      "If an unhelpful thought or emotion arises, simply see it, say ‘this is not what I choose’, and let it pass without self-hatred."
  },
  {
    day: 6,
    phase: "Foundations",
    title: "Surrender",
    work: "Sri Aurobindo — The Synthesis of Yoga / Letters on Yoga",
    theme: "True meaning of surrender",
    excerpt:
      "[[Insert passage explaining surrender as a conscious giving of oneself to the Divine, not passivity or bargaining for results.]]",
    reflectionHint:
      "Take one difficulty and, inwardly, offer it to the Divine with the simple attitude: ‘Do what is best through me.’"
  },
  {
    day: 7,
    phase: "Foundations",
    title: "The Aids to Sadhana",
    work: "Sri Aurobindo — The Synthesis of Yoga (The Four Aids)",
    theme: "Self, Guru, Shastra, Time",
    excerpt:
      "[[Insert passage summarising the aids of the inner being, the Guru, the teaching, and the working of Time and Grace.]]",
    reflectionHint:
      "Try to feel today how you are not alone in your effort — there is guidance, teaching, and a larger Force helping quietly."
  },
  {
    day: 8,
    phase: "Work & Life",
    title: "Work as Offering",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "Transforming work into sadhana",
    excerpt:
      "[[Insert passage on doing work as an offering to the Divine rather than for ego, ambition or fear.]]",
    reflectionHint:
      "Choose one task today — at home or work — and consciously offer it to the Divine before you begin."
  },
  {
    day: 9,
    phase: "Work & Life",
    title: "Equality in Success and Failure",
    work: "Sri Aurobindo — Essays on the Gita or Letters on Yoga",
    theme: "Inner equality",
    excerpt:
      "[[Insert passage explaining true samata: inner equality amidst success and failure, pleasure and pain.]]",
    reflectionHint:
      "When something today feels like a ‘success’ or ‘failure’, watch your reaction and quietly remember the deeper equality."
  },
  {
    day: 10,
    phase: "Work & Life",
    title: "Making the Home a Place of Sadhana",
    work: "The Mother — Talks / Questions and Answers",
    theme: "Atmosphere in the house",
    excerpt:
      "[[Insert passage about creating a conscious, peaceful, sincere atmosphere at home as part of yoga.]]",
    reflectionHint:
      "Notice the atmosphere in your home today. Is there one small thing you can do to make it more peaceful, sincere, or harmonious?"
  },
  {
    day: 11,
    phase: "Work & Life",
    title: "Relationships and Harmony",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "Human relations in yoga",
    excerpt:
      "[[Insert passage on dealing with frictions and misunderstandings, seeing others’ nature, and bringing goodwill into relationships.]]",
    reflectionHint:
      "In one relationship where there is strain, inwardly offer goodwill and ask for a truer understanding of the other person."
  },
  {
    day: 12,
    phase: "Work & Life",
    title: "Children and True Education",
    work: "The Mother — On Education / Questions and Answers",
    theme: "Soul-centered education",
    excerpt:
      "[[Insert passage on seeing the child as a soul in growth and the true aim of education beyond marks and performance.]]",
    reflectionHint:
      "If you have contact with a child today, try to look beyond behaviour and imagine the soul within that is growing."
  },
  {
    day: 13,
    phase: "Work & Life",
    title: "Anger and Emotional Disturbance",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "Dealing with vital storms",
    excerpt:
      "[[Insert passage about the nature of anger and vital disturbances and how to take a quieter, more conscious stand towards them.]]",
    reflectionHint:
      "If irritation or anger arises today, try to step back inwardly for a moment before speaking or acting."
  },
  {
    day: 14,
    phase: "Work & Life",
    title: "Quietude in Daily Activity",
    work: "Sri Aurobindo — Letters on Yoga / Questions and Answers",
    theme: "Inner quiet and recollection",
    excerpt:
      "[[Insert passage about cultivating inner quietude and remembrance even while remaining active in life.]]",
    reflectionHint:
      "Take one minute during your day simply to sit, breathe, and feel a quiet presence within, without forcing anything."
  },
  {
    day: 15,
    phase: "Difficulties & Faith",
    title: "Why Difficulties Come",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "Purpose of difficulties",
    excerpt:
      "[[Insert passage explaining that difficulties are part of the process of growth and purification, not punishments.]]",
    reflectionHint:
      "Look at one difficulty in your life and, just for a moment, consider that it may have a deeper purpose for your growth."
  },
  {
    day: 16,
    phase: "Difficulties & Faith",
    title: "Facing Fear",
    work: "Sri Aurobindo — Letters on Yoga / The Mother — Prayers and Meditations",
    theme: "Understanding and overcoming fear",
    excerpt:
      "[[Insert passage on the nature of fear and turning towards the Divine Presence as support and protection.]]",
    reflectionHint:
      "When you notice fear today, instead of only arguing with it, try a quiet call or remembrance of the Divine within."
  },
  {
    day: 17,
    phase: "Difficulties & Faith",
    title: "Depression and Discouragement",
    work: "Sri Aurobindo — Letters on Yoga",
    theme: "Walking through low states",
    excerpt:
      "[[Insert passage about recognising depression and discouragement, not identifying with them, and waiting with patience and faith.]]",
    reflectionHint:
      "If a low mood appears, see if you can say: ‘This is a weather passing through my nature; it is not my deepest self.’"
  },
  {
    day: 18,
    phase: "Difficulties & Faith",
    title: "Faith and Trust in the Mother",
    work: "Sri Aurobindo — Letters on Yoga / The Mother — Prayers and Meditations",
    theme: "Quiet, steady faith",
    excerpt:
      "[[Insert passage on the nature of true faith and trust, beyond emotional excitement and doubt.]]",
    reflectionHint:
      "Even if nothing special happens today, try to hold one quiet inner sentence of trust, in your own words, addressed to the Mother or the Divine."
  },
  {
    day: 19,
    phase: "Difficulties & Faith",
    title: "Perseverance and Long Patience",
    work: "Sri Aurobindo — The Synthesis of Yoga / Letters on Yoga",
    theme: "Long labour of the yoga",
    excerpt:
      "[[Insert passage about the long, patient nature of the work of transformation and the need for steady perseverance.]]",
    reflectionHint:
      "Think of one area where you feel slow progress. Instead of frustration, see if you can offer just a little more steady perseverance."
  },
  {
    day: 20,
    phase: "Difficulties & Faith",
    title: "The Joy of Progress",
    work: "The Mother — Talks / Sri Aurobindo — Letters on Yoga",
    theme: "True joy in inner growth",
    excerpt:
      "[[Insert passage on the quiet, deep joy that comes from inner progress, different from outer excitement and pleasure.]]",
    reflectionHint:
      "Notice any small inner movement today — a bit more patience, a slightly kinder response — and allow yourself to feel quietly happy about it."
  },
  {
    day: 21,
    phase: "Difficulties & Faith",
    title: "The Greater Evolutionary Vision",
    work: "Sri Aurobindo — The Life Divine / Savitri",
    theme: "Personal effort in a larger evolution",
    excerpt:
      "[[Insert passage that links personal transformation to the larger evolutionary movement and the supramental aim.]]",
    reflectionHint:
      "Take a moment to imagine that your sincere efforts, however small, are part of a much larger movement of consciousness on earth."
  }
];

// --- Basic router (hash-based) ---
(function router(){
  function route(){
    const hash = location.hash || '#hub';
    document.querySelectorAll('main section').forEach(s=>{
      s.style.display = ('#'+s.id===hash)?'block':'none';
    });
  }
  window.addEventListener('hashchange', route);
  route();
})();
// --- Guided Journey buttons (very simple wiring) ---
(function iyButtons(){
  function wire(){
    // Button on Sri Aurobindo home: "View journey"
    var btnOpen = document.getElementById('btnIy21');
    if (btnOpen) {
      btnOpen.addEventListener('click', function(){
        location.hash = '#iy-21';
      });
    }

    // Button on journey page: "Back to Sri Aurobindo Home"
    var btnBack = document.getElementById('btnIyBack');
    if (btnBack) {
      btnBack.addEventListener('click', function(){
        location.hash = '#aurobindo';
      });
    }

    // Button on journey page: "Mark Day 1 complete (placeholder)"
    var btnComplete = document.getElementById('btnIyComplete');
    if (btnComplete) {
      btnComplete.addEventListener('click', function(){
        alert('Later this will mark Day 1 as complete and move you forward in the journey.');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
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
      depth,            // "plain" | "scholar"
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

      // Show clear feedback on the button itself
      const originalLabel = btnCopy.textContent || "Copy answer";
      btnCopy.textContent = "Copied to clipboard";
      btnCopy.disabled = true;

      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        btnCopy.textContent = originalLabel;
        btnCopy.disabled = false;
      }, 1500);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
      // If copy fails, we just keep quiet for now.
    }
  });
})();
// --- 21 Days: render Day 1 on the journey page ---
(function setupIyDay1() {
  if (typeof integralYogaJourneyDays === "undefined") return;

  const day1 = integralYogaJourneyDays.find((d) => d.day === 1);
  if (!day1) return;

  const elHeading = document.getElementById("iyDayHeading");
  const elWork = document.getElementById("iyDayWork");
  const elTheme = document.getElementById("iyDayTheme");
  const elExcerpt = document.getElementById("iyDayExcerpt");
  const elReflection = document.getElementById("iyDayReflection");

  if (elHeading) {
    elHeading.textContent = `Day ${day1.day} · ${day1.phase} · ${day1.title}`;
  }
  if (elWork) {
    elWork.textContent = day1.work;
  }
  if (elTheme) {
    elTheme.textContent = day1.theme;
  }
  if (elExcerpt && day1.excerpt) {
    elExcerpt.textContent = day1.excerpt;
  }
  if (elReflection && day1.reflectionHint) {
    elReflection.textContent = day1.reflectionHint;
  }
})();
// --- Guided journey navigation: Sri Aurobindo <-> 21 Days with Integral Yoga ---
(function setupIyNavigation() {
  const secAuro = document.getElementById('aurobindo');
  const secIy = document.getElementById('iy-21');
  const btnView = document.getElementById('btnIy21');
  const btnBack = document.getElementById('btnIyBack');
  const btnComplete = document.getElementById('btnIyComplete');

  if (!secAuro || !secIy) return;

  function showAuro() {
    secAuro.style.display = 'block';
    secIy.style.display = 'none';
    if (location.hash !== '#aurobindo') {
      history.replaceState(null, '', '#aurobindo');
    }
    window.scrollTo(0, 0);
  }

  function showIy() {
    secAuro.style.display = 'none';
    secIy.style.display = 'block';
    if (location.hash !== '#iy-21') {
      history.replaceState(null, '', '#iy-21');
    }
    window.scrollTo(0, 0);
  }

  if (btnView) {
    btnView.addEventListener('click', (e) => {
      e.preventDefault();
      showIy();
    });
  }

  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      showAuro();
    });
  }

  if (btnComplete) {
    btnComplete.addEventListener('click', () => {
      alert('Mark Day 1 complete → placeholder. Later this will store progress.');
    });
  }

  function handleHash() {
    if (location.hash === '#iy-21') {
      showIy();
    } else {
      showAuro();
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash(); // run once on load
})();
