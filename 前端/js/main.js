
// main.js - Global Scripts & Auth Gatekeeper

// --- 1. AUTHENTICATION CHECK (Gatekeeper) ---
// Checks sessionStorage immediately. Redirects if not logged in.
(function checkAuth() {
    const path = window.location.pathname;
    const href = window.location.href;
    
    // Check if we are on the login page (or logout request)
    const isLoginPage = href.includes('login.html');
    
    // Manual Logout trigger
    if (href.includes('logout=true')) {
        sessionStorage.clear();
        localStorage.clear();
        if (!isLoginPage) {
            if (href.includes('/pages/')) window.location.href = 'login.html';
            else window.location.href = 'pages/login.html';
            return;
        }
    }

    // Check strict session status
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // If not logged in and NOT on login page -> HARD REDIRECT
    if (!isLoggedIn && !isLoginPage) {
        console.log('⛔ User not logged in. Redirecting...');
        
        // Hide body immediately to prevent content flash
        if (document.documentElement) {
            document.documentElement.style.display = 'none';
        }
        
        // Redirect based on current directory location
        if (href.includes('/pages/')) {
            window.location.href = 'login.html'; // In /pages/, go to login.html
        } else {
            window.location.href = 'pages/login.html'; // In root, go to pages/login.html
        }
        
        // Halt execution of remaining script
        throw new Error("Redirecting to login");
    } else {
        // If logged in, ensure page is visible
        if (document.documentElement) {
            document.documentElement.style.display = '';
        }
    }
})();


// --- 2. GLOBAL UTILITIES ---
const utils = {
    formatNumber: (number, decimals = 2) => {
        if (number === null || number === undefined) return '-';
        return Number(number).toFixed(decimals);
    },
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    showToast: (message, type = 'info') => {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed; 
            top: 30px; 
            right: 30px; 
            padding: 16px 28px;
            background: ${type === 'success' ? '#4a6b4a' : type === 'error' ? '#8b4747' : '#2c3e50'};
            color: white; 
            border-radius: 100px; 
            z-index: 9999;
            box-shadow: 0 15px 30px rgba(0,0,0,0.15); 
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
            animation: slideInRight 0.4s ease forwards;
        `;
        
        // Keyframes injection for animation
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.innerHTML = `@keyframes slideInRight { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:translateX(0); } }`;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};

// --- 3. PAGE INIT ---
const initPage = () => {
    // Reveal body if hidden (fallback)
    if (document.body) document.body.style.display = '';
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
            } else {
                navbar.classList.remove('scrolled');
                if (navbar.classList.contains('transparent')) {
                     navbar.style.background = 'transparent';
                     navbar.style.boxShadow = 'none';
                } else {
                     navbar.style.background = '';
                     navbar.style.boxShadow = '';
                }
            }
        });
    }
    
    // Clock
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        setInterval(() => {
            timeEl.textContent = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        }, 1000);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

window.utils = utils;
