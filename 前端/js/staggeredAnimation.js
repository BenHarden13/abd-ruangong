/**
 * 交错动画工具 - 为食谱推荐页面提供平滑动画
 * 
 * 主要功能：
 * 1. 为列表项添加交错出现的动画效果
 * 2. 管理骨架屏的显示和隐藏
 * 3. 提供观察者接口以触发滚动动画
 */

// 交错动画控制器
const StaggeredAnimation = {
  /**
   * 初始化骨架屏
   */
  initSkeletons() {
    // 骨架屏已经在HTML中静态定义
    // 这个函数为可能的动态骨架屏创建预留
  },

  /**
   * 隐藏骨架屏并显示实际内容
   */
  hideSkeletons() {
    const skeletonGrid = document.getElementById('skeletonGrid');
    const recipesGrid = document.getElementById('recipesGrid');
    
    if (skeletonGrid) {
      skeletonGrid.style.display = 'none';
    }
    
    if (recipesGrid) {
      recipesGrid.style.display = 'grid';
    }
  },

  /**
   * 应用交错动画到卡片元素
   * @param {NodeList|Array} elements - 需要添加动画的元素集合
   * @param {Number} baseDelay - 基础延迟（毫秒）
   * @param {Number} staggerDelay - 每个元素之间的延迟增量（毫秒）
   */
  animateCards(elements, baseDelay = 100, staggerDelay = 80) {
    Array.from(elements).forEach((element, index) => {
      // 设置初始状态
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      // 计算延迟
      const delay = baseDelay + (index * staggerDelay);
      
      // 延迟后应用动画
      setTimeout(() => {
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);
    });
  },

  /**
   * 创建交叉观察者用于滚动触发动画
   * @param {String} selector - 要观察的元素选择器
   */
  createScrollObserver(selector = '.recipe-card') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // 当元素进入视口
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fadeInUp');
          // 停止观察已经触发动画的元素
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // 视口
      threshold: 0.1, // 当10%的元素可见时触发
      rootMargin: '0px 0px -50px 0px' // 底部边缘提前50px触发
    });

    // 获取所有匹配的元素并观察它们
    document.querySelectorAll(selector).forEach(card => {
      observer.observe(card);
    });

    return observer;
  },
  
  /**
   * 为食材和步骤列表添加交错动画
   * @param {HTMLElement} container - 列表容器元素
   * @param {Number} delay - 每项延迟（毫秒）
   */
  animateList(container, delay = 50) {
    if (!container) return;
    
    const items = container.querySelectorAll('li');
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-10px)';
      
      setTimeout(() => {
        item.style.transition = 'all 0.4s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, delay * index);
    });
  }
};

// 导出模块
window.StaggeredAnimation = StaggeredAnimation;