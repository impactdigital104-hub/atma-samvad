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
