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
// --- Firestore: create/patch samvad_users doc on sign-in ---
(function fsUserDoc() {
  function wire(api) {
    api.onAuthStateChanged(api.auth, async (user) => {
      if (!user) return;
      try {
        const ref = api.doc(api.db, "samvad_users", user.uid);
        await api.setDoc(ref, {
          uid: user.uid,
          name: user.displayName || null,
          email: user.email || null,
          photoURL: user.photoURL || null,
          tier: "free",                 // default; will flip to 'premium' after payment
          lastSeen: api.serverTimestamp(),
          createdAt: api.serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("samvad_users write failed:", e);
        alert("Could not save profile (samvad). Please check Firestore rules/console.");
      }
    });
  }

  // Wait until Firebase is exposed by index.html
  (function wait(tries = 0) {
    const api = window.__samvad;
    if (api && api.db && api.auth) return wire(api);
    if (tries > 20) return; // stop after ~6s
    setTimeout(() => wait(tries + 1), 300);
  })();
})();

