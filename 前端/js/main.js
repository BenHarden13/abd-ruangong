// 全局工具函数
const utils = {
    // 格式化数字
    formatNumber: (number, decimals = 2) => {
        return Number(number).toFixed(decimals);
    },

    // 日期格式化
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // 防抖函数
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle: (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 生成随机ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    // 显示Toast消息
    showToast: (message, type = 'info', duration = 3000) => {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// 导航栏滚动效果
const handleNavbarScroll = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const toggleNavbarBackground = utils.throttle(() => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 100);

    window.addEventListener('scroll', toggleNavbarBackground);
};

// 动画效果
const initAnimations = () => {
    const animatedElements = document.querySelectorAll('.animated, .fade-in-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
};

// 主页搜索功能
const initHomeSearch = () => {
    const searchForm = document.getElementById('homeSearchForm');
    const searchInput = document.getElementById('homeSearchInput');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `pages/results.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
};

// 快速开始按钮
const initQuickStart = () => {
    const quickStartBtns = document.querySelectorAll('.quick-start-btn, .cta-btn');
    
    quickStartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // 检查是否有用户档案
            const userId = localStorage.getItem('currentUserId');
            if (userId) {
                window.location.href = 'pages/dashboard.html';
            } else {
                window.location.href = 'pages/profile.html';
            }
        });
    });
};

// 特性卡片悬停效果
const initFeatureCards = () => {
    const featureCards = document.querySelectorAll('.feature-card, .feature-box');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
};

// 统计数字动画
const animateStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                stat.textContent = target;
                clearInterval(timer);
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 16);
    });
};

// 初始化移动端菜单
const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // 点击菜单项后关闭菜单
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
};

// 页面加载进度条
const showLoadingProgress = () => {
    const progressBar = document.createElement('div');
    progressBar.id = 'loadingProgress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 3px;
        background: linear-gradient(90deg, #4CAF50, #8BC34A);
        z-index: 99999;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) {
            clearInterval(interval);
        }
        progressBar.style.width = Math.min(progress, 90) + '%';
    }, 200);
    
    window.addEventListener('load', () => {
        clearInterval(interval);
        progressBar.style.width = '100%';
        setTimeout(() => progressBar.remove(), 500);
    });
};

// 初始化页面
const initPage = () => {
    // 显示加载进度
    showLoadingProgress();
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPageFeatures();
        });
    } else {
        initPageFeatures();
    }
};

// 初始化页面功能
const initPageFeatures = () => {
    handleNavbarScroll();
    initAnimations();
    initHomeSearch();
    initQuickStart();
    initFeatureCards();
    initMobileMenu();
    
    // 如果有统计数字，延迟执行动画
    setTimeout(() => {
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateStats();
                        observer.disconnect();
                    }
                });
            });
            observer.observe(statsSection);
        }
    }, 100);

    console.log('✅ DietHub 前端初始化完成');
    
    // 检查用户登录状态
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
        console.log(`👤 当前用户: ${userId}`);
    }
};

// 导出工具函数和初始化函数
window.utils = utils;
window.initPage = initPage;

// 自动初始化
initPage();
