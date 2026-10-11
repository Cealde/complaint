const loginForm = document.getElementById('login-f');
const userIDIn = document.getElementById('user-input');
const passwordIn = document.getElementById('password-input');
const messageContainer = document.getElementById('message');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); 
  
  const userid = userIDIn.value.trim();
  const password = passwordIn.value.trim();


  if(!userid || !password) return;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userid, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      messageContainer.textContent = data.error || "Login failed.";
      messageContainer.style.color = 'red';
    } else {
      const displayName = data.user.name || data.user.user_roll;
      const isAdmin = Boolean(data.user && data.user.is_admin);
      
      sessionStorage.setItem('username', displayName);
      sessionStorage.setItem('email', data.user.email || '');
      sessionStorage.setItem('phone', data.user.phone || '');
      sessionStorage.setItem('user_roll', data.user.user_roll);
      sessionStorage.setItem('is_admin', isAdmin ? 'true' : 'false');

      localStorage.setItem('user_roll', data.user.user_roll);
      localStorage.setItem('username', displayName);
      localStorage.setItem('email', data.user.email || '');
      localStorage.setItem('phone', data.user.phone || '');
      localStorage.setItem('is_admin', isAdmin ? 'true' : 'false');

      window.location.href="/";
    }
    
  } catch (error) {
    console.error("Error during login:", error);
    messageContainer.textContent = 'An error occurred connecting to the server.';
    messageContainer.style.color = 'red';
  }
});
