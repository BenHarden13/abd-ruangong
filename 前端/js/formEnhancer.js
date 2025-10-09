// formEnhancer.js - 提升表单交互体验的JavaScript模块

/**
 * 增强表单输入框交互
 * @param {String} formSelector - 表单选择器
 */
function enhanceFormInputs(formSelector = 'form') {
  const form = document.querySelector(formSelector);
  if (!form) return;
  
  // 获取所有输入元素
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // 为每个输入框添加焦点和失焦事件
    input.addEventListener('focus', handleInputFocus);
    input.addEventListener('blur', handleInputBlur);
    
    // 初始化检查已有值的输入框
    if (input.value) {
      const label = findAssociatedLabel(input);
      if (label) {
        label.classList.add('active');
      }
    }
  });
}

/**
 * 处理输入框获得焦点事件
 * @param {Event} event - 焦点事件
 */
function handleInputFocus(event) {
  const input = event.target;
  const label = findAssociatedLabel(input);
  
  // 添加聚焦样式
  input.classList.add('input-focused');
  
  if (label) {
    label.classList.add('label-focused', 'active');
  }
  
  // 创建焦点指示器
  createFocusIndicator(input);
}

/**
 * 处理输入框失去焦点事件
 * @param {Event} event - 失焦事件
 */
function handleInputBlur(event) {
  const input = event.target;
  const label = findAssociatedLabel(input);
  
  // 移除聚焦样式
  input.classList.remove('input-focused');
  
  if (label) {
    label.classList.remove('label-focused');
    
    // 如果输入框没有值，移除active类
    if (!input.value) {
      label.classList.remove('active');
    }
  }
  
  // 移除焦点指示器
  removeFocusIndicator(input);
}

/**
 * 查找与输入框关联的标签元素
 * @param {HTMLElement} input - 输入框元素
 * @returns {HTMLElement|null} - 关联的标签元素
 */
function findAssociatedLabel(input) {
  // 通过id查找
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label;
  }
  
  // 查找最近的父级中的label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel;
  
  // 查找前一个兄弟元素
  let sibling = input.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'LABEL') return sibling;
    sibling = sibling.previousElementSibling;
  }
  
  return null;
}

/**
 * 创建焦点指示器
 * @param {HTMLElement} input - 输入框元素
 */
function createFocusIndicator(input) {
  // 移除现有的指示器
  removeFocusIndicator(input);
  
  // 创建新的指示器
  const indicator = document.createElement('div');
  indicator.className = 'focus-indicator';
  
  // 定位指示器
  const rect = input.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  indicator.style.position = 'absolute';
  indicator.style.left = `${rect.left + scrollLeft}px`;
  indicator.style.top = `${rect.bottom + scrollTop}px`;
  indicator.style.width = '0%';
  indicator.style.height = '2px';
  indicator.style.backgroundColor = 'var(--primary)';
  indicator.style.transition = 'width 0.3s ease';
  indicator.style.zIndex = '1000';
  
  document.body.appendChild(indicator);
  input.dataset.indicatorId = Date.now().toString();
  indicator.dataset.for = input.dataset.indicatorId;
  
  // 触发动画
  setTimeout(() => {
    indicator.style.width = '100%';
  }, 10);
}

/**
 * 移除焦点指示器
 * @param {HTMLElement} input - 输入框元素
 */
function removeFocusIndicator(input) {
  if (!input.dataset.indicatorId) return;
  
  const indicator = document.querySelector(`.focus-indicator[data-for="${input.dataset.indicatorId}"]`);
  if (indicator) {
    // 添加淡出动画
    indicator.style.opacity = '0';
    setTimeout(() => {
      indicator.remove();
    }, 300);
  }
}

/**
 * 增强提交按钮交互
 * @param {String} submitButtonSelector - 提交按钮选择器
 * @param {Function} onSubmit - 提交回调函数
 */
function enhanceSubmitButton(submitButtonSelector, onSubmit) {
  const button = document.querySelector(submitButtonSelector);
  if (!button) return;
  
  // 存储原始文本
  button.dataset.originalText = button.textContent;
  
  button.addEventListener('click', async function(event) {
    // 防止默认提交行为
    if (button.closest('form')) {
      event.preventDefault();
    }
    
    // 已经处于加载状态则不重复处理
    if (button.classList.contains('loading')) return;
    
    // 设置加载状态
    setButtonLoading(button);
    
    try {
      // 执行提交回调
      if (typeof onSubmit === 'function') {
        const result = await onSubmit();
        
        // 成功状态
        setButtonSuccess(button);
        
        // 延迟后恢复原始状态
        setTimeout(() => {
          resetButton(button);
        }, 2000);
        
        return result;
      }
    } catch (error) {
      // 错误状态
      setButtonError(button, error.message || '保存失败');
      
      // 添加抖动动画
      button.classList.add('shake-animation');
      setTimeout(() => {
        button.classList.remove('shake-animation');
        resetButton(button);
      }, 1000);
      
      console.error('表单提交错误:', error);
    }
  });
}

/**
 * 设置按钮加载状态
 * @param {HTMLElement} button - 按钮元素
 */
function setButtonLoading(button) {
  // 禁用按钮
  button.disabled = true;
  button.classList.add('loading');
  
  // 创建加载图标
  const spinner = document.createElement('span');
  spinner.className = 'button-spinner';
  spinner.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="32" stroke-dashoffset="32">
        <animateTransform 
          attributeName="transform" 
          type="rotate"
          values="0 12 12;360 12 12" 
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  `;
  
  // 更新按钮内容
  button.innerHTML = '';
  button.appendChild(spinner);
}

/**
 * 设置按钮成功状态
 * @param {HTMLElement} button - 按钮元素
 */
function setButtonSuccess(button) {
  button.innerHTML = '';
  
  // 创建成功图标
  const successIcon = document.createElement('span');
  successIcon.className = 'success-icon';
  successIcon.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
      <path 
        d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" 
        fill="currentColor"
      >
        <animate
          attributeName="opacity"
          values="0;1"
          dur="0.3s"
          fill="freeze"
        />
      </path>
    </svg>
  `;
  
  button.appendChild(successIcon);
  button.classList.remove('loading');
  button.classList.add('success');
}

/**
 * 设置按钮错误状态
 * @param {HTMLElement} button - 按钮元素
 * @param {String} message - 错误消息
 */
function setButtonError(button, message) {
  button.disabled = false;
  button.classList.remove('loading');
  button.classList.add('error');
  button.textContent = message || '错误';
}

/**
 * 重置按钮状态
 * @param {HTMLElement} button - 按钮元素
 */
function resetButton(button) {
  button.disabled = false;
  button.classList.remove('loading', 'success', 'error');
  button.textContent = button.dataset.originalText || '保存';
}

// 导出函数
export {
  enhanceFormInputs,
  enhanceSubmitButton
};