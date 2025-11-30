// ========================================
// Modern Design - Interactive Features
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initScrollAnimations();
    initSystemStatus();
    initSmoothScroll();
});

// ========================================
// Mobile Menu Toggle
// ========================================
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    
    if (toggle && menu) {
        toggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = toggle.querySelectorAll('span');
            if (toggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                const spans = toggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
        
        // Close menu when clicking a link
        const navLinks = menu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menu.classList.remove('active');
                toggle.classList.remove('active');
                const spans = toggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });
    }
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all elements with reveal class
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
    
    // Add reveal class to sections
    const sections = document.querySelectorAll('.features, .system-status');
    sections.forEach(section => {
        section.classList.add('reveal');
        observer.observe(section);
    });
    
    // Animate feature cards with stagger
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.classList.add('reveal');
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Animate status items with stagger
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach((item, index) => {
        item.classList.add('reveal');
        item.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(item);
    });
}

// ========================================
// System Status Check
// ========================================
async function initSystemStatus() {
    const backendStatusText = document.getElementById('backend-status-text');
    const backendStatusIndicator = document.getElementById('backend-status-indicator');
    const storageStatusText = document.getElementById('storage-status-text');
    const storageStatusIndicator = document.getElementById('storage-status-indicator');
    
    if (!backendStatusText || !backendStatusIndicator) return;
    
    try {
        // Check if API is available
        if (window.API && window.API.healthProfile) {
            // Try to fetch data from backend
            const response = await fetch('http://localhost:8080/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            if (response.ok) {
                backendStatusText.textContent = '连接正常';
                backendStatusIndicator.className = 'status-indicator status-success';
                storageStatusText.textContent = '后端数据库';
                storageStatusIndicator.className = 'status-indicator status-success';
            } else {
                throw new Error('Backend not responding');
            }
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.warn('后端服务不可用，使用本地存储模式:', error.message);
        backendStatusText.textContent = '连接失败';
        backendStatusIndicator.className = 'status-indicator status-error';
        storageStatusText.textContent = '本地存储';
        storageStatusIndicator.className = 'status-indicator status-warning';
    }
    
    // Check localStorage availability
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        if (storageStatusText.textContent === '本地存储' || storageStatusText.textContent === '本地存储可用') {
            storageStatusText.textContent = '本地存储可用';
            storageStatusIndicator.className = 'status-indicator status-success';
        }
    } catch (e) {
        console.error('本地存储不可用:', e);
        storageStatusText.textContent = '存储不可用';
        storageStatusIndicator.className = 'status-indicator status-error';
    }
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 72; // Account for navbar height
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Navbar Scroll Effect
// ========================================
let lastScroll = 0;
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// ========================================
// Card Hover Effect Enhancement
// ========================================
document.querySelectorAll('.feature-card, .status-item').forEach(card => {
    card.addEventListener('mouseenter', function(e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        card.style.transform = `translateY(-8px) rotateX(${-deltaY * 5}deg) rotateY(${deltaX * 5}deg)`;
    });
    
    card.addEventListener('mouseleave', function() {
        card.style.transform = '';
    });
});

// ========================================
// Utility Functions
// ========================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Export functions for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMobileMenu,
        initScrollAnimations,
        initSystemStatus,
        initSmoothScroll
    };
}
