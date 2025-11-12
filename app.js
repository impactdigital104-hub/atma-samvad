/* FILE: app.js */
(function(){
console.log("Samvad MVP shell loaded");
const app = document.getElementById('app');
function route(){
const hash = location.hash || '#hub';
document.querySelectorAll('main section').forEach(s=>{
s.style.display = ("#"+s.id===hash)?'block':'none';
});
}
window.addEventListener('hashchange', route);
route();
})();
// --- Auth mini-wire ---
(function authMini() {
  const api = window.__samvad || {};
  if (!api.auth) return; // Firebase not ready yet

  const btn = document.getElementById('btnAuth');
  const badge = document.getElementById('badge');

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
    } catch (e) {
      alert(e.message);
    }
  });
})();
// --- Firestore: Samvad 3-day trial handler + badge ---
(function samvadTrial3Day() {
  function daysLeftUTC(startDate, durationDays = 3) {
    // normalize start to 00:00 UTC for day math
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
      // first time on Samvad → start trial
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
      return { tier: "trial", trialStartedAt: new Date() }; // temp value; next reload will have server ts
    }

    const data = snap.data() || {};
    // backfill if older doc had no trial field
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

        if (info.tier === "premium") {
          setBadge("Premium");
          return;
        }

        // trial
        const left = daysLeftUTC(info.trialStartedAt);
        if (left > 0) {
          setBadge(`Trial · ${left}d left`);
        } else {
          // trial ended but still not premium → show paywall indicator
          setBadge("Trial ended · Upgrade to continue");
          // (UI gates will read this state; we’ll wire paywall in a later baby step)
        }
      } catch (e) {
        console.error("samvad trial init failed:", e);
        setBadge(""); // fail silently in UI
      }
    });
  }

  // Wait until Firebase is exposed by index.html
  (function wait(tries = 0) {
    const api = window.__samvad;
    if (api && api.db && api.auth) return wire(api);
    if (tries > 20) return;
    setTimeout(() => wait(tries + 1), 300);
  })();
})();
// --- Gate: allow actions only if trial active or premium ---
(function samvadGate() {
  function showPaywall(show) {
    const m = document.getElementById('paywall');
    if (m) m.style.display = show ? 'block' : 'none';
  }

  // Reuse logic consistent with our trial handler
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

async function getSamvadStatus(api) {
  const user = api.auth.currentUser;
  if (!user) return { allowed: false, reason: 'signin' };

  const { getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
  const ref = api.doc(api.db, "samvad_users", user.uid);
  const snap = await getDoc(ref);

  // If no doc yet, treat as new trial (our init usually creates it)
  if (!snap.exists()) {
    return { allowed: true, tier: 'trial', daysLeft: 3 };
  }

  const data = snap.data() || {};

  // ✅ Normalize: if tier is "free", treat it exactly as "trial"
  const tier = (data.tier === 'free') ? 'trial' : (data.tier || 'trial');

  // If premium, always allowed
  if (tier === 'premium') {
    return { allowed: true, tier: 'premium' };
  }

  // Trial logic (3 days from trialStartedAt, UTC day math)
  const started = data.trialStartedAt
    ? (data.trialStartedAt.toDate ? data.trialStartedAt.toDate() : new Date(data.trialStartedAt.seconds * 1000))
    : new Date();

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

  const left = daysLeftUTC(started);
  return { allowed: left > 0, tier, daysLeft: left };
}
  function wire(api) {
    const askBtn = document.getElementById('btnAsk');
    const closeBtn = document.getElementById('btnClosePaywall');
    const upgradeBtn = document.getElementById('btnUpgrade');
    if (closeBtn) closeBtn.addEventListener('click', () => showPaywall(false));
    if (upgradeBtn) upgradeBtn.addEventListener('click', () => {
      // Placeholder: we will wire Razorpay later
      alert('Upgrade flow will appear here.');
      showPaywall(false);
    });

    if (askBtn) {
      askBtn.addEventListener('click', async () => {
        const apiRef = window.__samvad;
        if (!apiRef || !apiRef.auth || !apiRef.db) return alert('Please reload the page.');

        const status = await getSamvadStatus(apiRef);
        if (!status.allowed) {
          // If not signed in, auth block handles the button label—still show paywall copy for clarity
          showPaywall(true);
          return;
        }
        // Allowed path (trial active or premium)
        alert('✅ Allowed: this is where the Q&A API call will run.');
      });
    }
  }

  (function wait(tries = 0) {
    const api = window.__samvad;
    if (api && api.db && api.auth) return wire(api);
    if (tries > 20) return;
    setTimeout(() => wait(tries + 1), 300);
  })();
})();
