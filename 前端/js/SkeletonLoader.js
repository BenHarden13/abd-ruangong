// SkeletonLoader.js - 提供骨架屏和列表交错动画效果

/**
 * 创建骨架屏元素
 * @param {Object} options - 骨架屏选项
 * @param {Number} options.width - 宽度 (px或%)
 * @param {Number|String} options.height - 高度 (px或%)
 * @param {String} options.shape - 形状 ('rect'|'circle')
 * @param {String} options.className - 额外的CSS类名
 * @returns {HTMLElement} 骨架屏元素
 */
function createSkeletonElement(options = {}) {
  const {
    width = '100%',
    height = '20px',
    shape = 'rect',
    className = ''
  } = options;
  
  const element = document.createElement('div');
  element.className = `skeleton ${className}`;
  element.style.width = typeof width === 'number' ? `${width}px` : width;
  element.style.height = typeof height === 'number' ? `${height}px` : height;
  
  if (shape === 'circle') {
    element.style.borderRadius = '50%';
  } else {
    element.style.borderRadius = 'var(--border-radius-sm)';
  }
  
  return element;
}

/**
 * 创建食谱卡片骨架
 * @returns {HTMLElement} 骨架卡片容器
 */
function createRecipeCardSkeleton() {
  const card = document.createElement('div');
  card.className = 'card skeleton-card';
  
  // 图片占位符
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'card-img-wrapper';
  imageWrapper.style.width = '100%';
  imageWrapper.style.height = '180px';
  imageWrapper.appendChild(createSkeletonElement({ height: '100%' }));
  
  // 卡片内容
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  cardBody.style.padding = '1rem';
  
  // 标题
  const title = createSkeletonElement({ height: '24px', width: '80%' });
  title.style.marginBottom = '1rem';
  
  // 描述
  const descLine1 = createSkeletonElement({ height: '16px', width: '100%' });
  descLine1.style.marginBottom = '0.5rem';
  
  const descLine2 = createSkeletonElement({ height: '16px', width: '90%' });
  descLine2.style.marginBottom = '1rem';
  
  // 标签
  const tagsWrapper = document.createElement('div');
  tagsWrapper.className = 'flex-between';
  tagsWrapper.style.gap = '0.5rem';
  
  const tag1 = createSkeletonElement({ height: '20px', width: '60px' });
  const tag2 = createSkeletonElement({ height: '20px', width: '80px' });
  
  tagsWrapper.appendChild(tag1);
  tagsWrapper.appendChild(tag2);
  
  // 组装卡片
  cardBody.appendChild(title);
  cardBody.appendChild(descLine1);
  cardBody.appendChild(descLine2);
  cardBody.appendChild(tagsWrapper);
  
  card.appendChild(imageWrapper);
  card.appendChild(cardBody);
  
  return card;
}

/**
 * 生成多个骨架卡片
 * @param {Number} count - 需要生成的卡片数量
 * @param {String} containerSelector - 容器选择器
 */
function generateSkeletonCards(count = 6, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  // 清空容器
  container.innerHTML = '';
  
  // 创建骨架卡片
  for (let i = 0; i < count; i++) {
    const card = createRecipeCardSkeleton();
    container.appendChild(card);
  }
}

/**
 * 移除骨架屏
 * @param {String} containerSelector - 容器选择器
 */
function removeSkeletons(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  const skeletons = container.querySelectorAll('.skeleton-card');
  skeletons.forEach(skeleton => {
    skeleton.classList.add('fade-out');
    setTimeout(() => {
      skeleton.remove();
    }, 300);
  });
}

/**
 * 交错动画展示项目列表
 * @param {Array} items - 项目数据数组
 * @param {String} containerSelector - 容器选择器
 * @param {Function} renderItem - 项目渲染函数
 * @param {Number} staggerDelay - 间隔延迟(毫秒)
 */
function renderStaggeredList(items, containerSelector, renderItem, staggerDelay = 50) {
  const container = document.querySelector(containerSelector);
  if (!container || !items || !items.length) return;
  
  // 移除现有骨架屏
  removeSkeletons(containerSelector);
  
  // 创建文档片段以提高性能
  const fragment = document.createDocumentFragment();
  
  // 渲染每个项目
  items.forEach((item, index) => {
    const element = renderItem(item, index);
    
    // 添加初始透明度和变换
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `opacity 0.6s ease, transform 0.6s ease`;
    element.style.transitionDelay = `${index * staggerDelay}ms`;
    
    fragment.appendChild(element);
  });
  
  // 将所有元素一次性添加到DOM
  container.appendChild(fragment);
  
  // 触发布局重排后应用动画
  requestAnimationFrame(() => {
    const newItems = container.children;
    Array.from(newItems).forEach(item => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    });
  });
}

// 导出函数
export {
  createSkeletonElement,
  generateSkeletonCards,
  removeSkeletons,
  renderStaggeredList
};