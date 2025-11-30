
// Login & Auth Logic

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    
    // Toggle Links
    const showRegisterBtn = document.getElementById('showRegister');
    const showForgotBtn = document.getElementById('showForgot');
    const showLoginBtns = document.querySelectorAll('.showLogin');

    // --- CRITICAL: CLEAR SESSION ---
    // When we land on login page, force clear session to ensure clean state
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUserId');
    localStorage.removeItem('isLoggedIn'); // Clear legacy if exists
    console.log('Session cleared on login page load.');

    // --- NAVIGATION LOGIC ---
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(registerForm);
        });
    }

    if (showForgotBtn) {
        showForgotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(forgotForm);
        });
    }

    showLoginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(loginForm);
        });
    });

    function switchView(targetForm) {
        // Hide all forms
        if(loginForm) loginForm.style.display = 'none';
        if(registerForm) registerForm.style.display = 'none';
        if(forgotForm) forgotForm.style.display = 'none';
        
        // Reset errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.success-message').forEach(el => el.style.display = 'none');

        // Show target
        if(targetForm) targetForm.style.display = 'block';
    }

    // --- LOGIN LOGIC ---
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const errorDiv = document.getElementById('loginError');
            
            if (username.length < 8) {
                showError(errorDiv, 'Username must be at least 8 characters.');
                return;
            }
            if (password.length === 0) {
                showError(errorDiv, 'Please enter your password.');
                return;
            }

            performLogin(username, document.querySelector('#loginForm .btn-login'));
        });
    }

    // --- REGISTER LOGIC ---
    if(registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value.trim();
            const contact = document.getElementById('reg-contact').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const errorDiv = document.getElementById('registerError');

            if (username.length < 8) {
                showError(errorDiv, 'Username must be at least 8 characters.');
                return;
            }
            if (!contact.includes('@') && contact.length < 10) {
                showError(errorDiv, 'Enter a valid email or phone number.');
                return;
            }
            if (password.length < 6) {
                showError(errorDiv, 'Password is too short (min 6 chars).');
                return;
            }

            // Mock Registration Success
            const btn = document.querySelector('#registerForm .btn-login');
            btn.innerHTML = 'Creating Account...';
            btn.style.opacity = '0.8';

            setTimeout(() => {
                // Auto login after register
                performLogin(username, btn);
            }, 1500);
        });
    }

    // --- FORGOT PASSWORD LOGIC ---
    if(forgotForm) {
        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const contact = document.getElementById('forgot-contact').value.trim();
            const errorDiv = document.getElementById('forgotError');
            const successDiv = document.getElementById('forgotSuccess');

            if (!contact) {
                showError(errorDiv, 'Please enter your email or phone.');
                return;
            }

            // Mock Send
            const btn = document.querySelector('#forgotForm .btn-login');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                successDiv.style.display = 'block';
                successDiv.textContent = `Reset link sent to ${contact}`;
                document.getElementById('forgot-contact').value = '';
            }, 1500);
        });
    }

    // --- HELPERS ---
    function showError(element, msg) {
        if(element) {
            element.textContent = msg;
            element.style.opacity = '1';
        }
        
        const card = document.querySelector('.login-card');
        if(card) {
            // Trigger shake animation
            card.style.animation = 'none';
            card.offsetHeight; /* trigger reflow */
            card.style.animation = 'shake 0.4s linear';
        }
    }

    function performLogin(user, btnElement) {
        console.log('Logging in user:', user);
        
        // 1. Set State to SESSION STORAGE
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUserId', user);
        
        // 2. UI Feedback
        if(btnElement) {
            btnElement.innerHTML = 'Signing in...';
            btnElement.style.opacity = '0.8';
            btnElement.disabled = true;
        }
        
        // 3. Redirect
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 800);
    }
});

// Add shake keyframes dynamically for UX
if (!document.getElementById('shake-keyframes')) {
    const style = document.createElement('style');
    style.id = 'shake-keyframes';
    style.innerHTML = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }`;
    document.head.appendChild(style);
}
