// Basic client-side behavior: toggle password, validate, simulate submit
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('loginForm');
  const toggle = document.getElementById('togglePwd');
  const pwd = document.getElementById('password');
  const spotifyBtn = document.getElementById('spotifyBtn');

  toggle.addEventListener('click', ()=>{
    if(pwd.type === 'password'){ pwd.type = 'text'; toggle.textContent = 'Hide'; }
    else { pwd.type = 'password'; toggle.textContent = 'Show'; }
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value;
    if(!username || !password){ alert('Please enter username and password.'); return; }
    // Simulate a login request — replace with real API call
    console.log('Signing in', {username, password, remember: form.remember.checked});
    alert('Signed in (simulated). Next: wire up backend or OAuth.');
  });

  spotifyBtn.addEventListener('click', ()=>{
    alert('Spotify OAuth flow placeholder — implement server-side redirect.');
  });
});
