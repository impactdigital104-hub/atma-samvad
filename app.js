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
