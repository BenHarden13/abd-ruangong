// main.js - Global Scripts & Auth Gatekeeper

// --- 1. AUTHENTICATION CHECK (Gatekeeper) ---
// This runs immediately to protect pages
(function checkAuth() {
    // Check if we are currently on the login page to prevent redirect loops
    const isLoginPage = window.location.href.includes('login.html');
    
    // Check authentication status from localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // If not logged in and NOT already on the login page, redirect to login
    if (!isLoggedIn && !isLoginPage) {
        console.log('⛔ User not logged in. Redirecting to Login...');
        
        // Determine correct path to login.html based on current location
        // Check if we are in a sub-folder like '/pages/'
        const isInSubFolder = window.location.href.includes('/pages/');
        
        if (isInSubFolder) {
            // Go up one level
            window.location.href = '../login.html';
        } else {
            // In root
            window.location.href = 'login.html';
        }
    }
})();


// --- 2. GLOBAL UTILITIES ---
const utils = {
    // Format numbers safely
    formatNumber: (number, decimals = 2) => {
        if (number === null || number === undefined) return '-';
        return Number(number).toFixed(decimals);
    },
    
    // Format dates
    formatDate: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    
    // Debounce function for performance (e.g. search inputs)
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    
    // Throttle function for performance (e.g. scroll events)
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Toast Notification System
    showToast: (message, type = 'info') => {
        // Remove existing toasts to keep UI clean
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // High-end Toast Styles
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
            animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            letter-spacing: 0.5px;
        `;
        
        // Inject Keyframes if needed
        if (!document.getElementById('toast-keyframes')) {
            const style = document.createElement('style');
            style.id = 'toast-keyframes';
            style.innerHTML = `
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};


// --- 3. PAGE INITIALIZATION ---
const initPage = () => {
    handleNavbarScroll();
    initAnimations();
    initHomeClock();
};

// Navbar Scroll Effect (Glass Morphism on Scroll)
const handleNavbarScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', utils.throttle(() => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
            // Dynamic styles for scrolled state if CSS class isn't enough
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)';
            navbar.style.paddingTop = '1rem'; // Reset padding
        } else {
            navbar.classList.remove('scrolled');
            // Reset to transparent/default
            // We check if it's the home page transparent nav
            if (navbar.classList.contains('transparent')) {
                 navbar.style.background = 'transparent';
                 navbar.style.boxShadow = 'none';
                 navbar.style.paddingTop = '2rem';
            } else {
                 // Inner pages default
                 navbar.style.background = '';
                 navbar.style.boxShadow = '';
            }
        }
    }, 100));
};

// Scroll Animations (Intersection Observer)
const initAnimations = () => {
    const elements = document.querySelectorAll('.animate-fadeInUp, .animate-scaleIn, .animate-fadeIn');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Manually trigger if CSS animation needs help
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => {
        observer.observe(el);
    });
};

// Homepage Clock
const initHomeClock = () => {
    const timeEl = document.getElementById('currentTime');
    if (!timeEl) return;
    
    const updateTime = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    updateTime();
    setInterval(updateTime, 1000);
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

// Export utils to window so other scripts can use them
window.utils = utils;