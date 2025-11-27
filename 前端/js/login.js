// Login Logic

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');

    // Clear any previous sessions on login page load
    localStorage.removeItem('isLoggedIn');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Validation Logic
        if (username.length < 8) {
            showError('Username must be at least 8 characters.');
            return;
        }

        if (password.length === 0) {
            showError('Please enter your password.');
            return;
        }

        // Mock Login Success
        performLogin(username);
    });

    function showError(msg) {
        errorDiv.textContent = msg;
        errorDiv.style.opacity = '1';
        
        // Shake animation on the card
        const card = document.querySelector('.login-card');
        card.style.animation = 'none';
        card.offsetHeight; /* trigger reflow */
        card.style.animation = 'shake 0.4s linear';
    }

    function performLogin(user) {
        // 1. Set Auth Flag
        localStorage.setItem('isLoggedIn', 'true');
        
        // 2. Save User ID for the dashboard to use
        localStorage.setItem('currentUserId', user);
        
        // 3. Redirect to Home
        const btn = document.querySelector('.btn-login');
        btn.innerHTML = 'Signing in...';
        btn.style.opacity = '0.8';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    }
});

// Add shake keyframes dynamically
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}`;
document.head.appendChild(style);