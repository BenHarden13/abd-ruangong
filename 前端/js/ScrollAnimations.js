// ScrollAnimations.js - 为首页提供滚动触发动画效果

import useIntersectionObserver from './useIntersectionObserver.js';

/**
 * 初始化主页滚动动画
 */
function initHomePageScrollAnimations() {
  // 核心功能区卡片动画
  animateFeatureCards();
  
  // 系统状态指示灯动画
  animateStatusIndicators();
  
  // 三步流程动画
  animateProcessSteps();
}

/**
 * 为核心功能区卡片添加入场动画
 */
function animateFeatureCards() {
  const featureSection = document.querySelector('.features-section');
  if (!featureSection) return;
  
  // 为整个功能区添加观察器
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const cards = featureSection.querySelectorAll('.card');
      
      // 为每个卡片添加交错动画
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-fadeInUp');
        }, index * 200); // 每个卡片延迟200ms
      });
      
      // 一次性观察
      observer.unobserve(featureSection);
    }
  }, { threshold: 0.2 });
  
  observer.observe(featureSection);
}

/**
 * 为系统状态指示灯添加脉动动画
 */
function animateStatusIndicators() {
  const indicators = document.querySelectorAll('.status-indicator');
  
  indicators.forEach(indicator => {
    // 添加持续的脉动动画
    indicator.classList.add('animate-pulse');
  });
}

/**
 * 为三步流程添加缩放入场动画
 */
function animateProcessSteps() {
  const processSection = document.querySelector('.process-section');
  if (!processSection) return;
  
  // 为流程区添加观察器
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const steps = processSection.querySelectorAll('.process-step');
      
      // 为每个步骤添加交错的缩放动画
      steps.forEach((step, index) => {
        setTimeout(() => {
          step.classList.add('animate-scaleIn');
        }, index * 300); // 每个步骤延迟300ms
      });
      
      // 一次性观察
      observer.unobserve(processSection);
    }
  }, { threshold: 0.3 });
  
  observer.observe(processSection);
}

/**
 * React组件封装 - 滚动出现元素
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} React组件
 */
function ScrollRevealElement({ 
  children, 
  animation = 'fadeInUp', 
  threshold = 0.2, 
  delay = 0,
  ...props 
}) {
  // 使用自定义Hook检测元素可见性
  const [ref, isVisible] = useIntersectionObserver({ threshold });
  
  // 创建动画类名
  const animationClass = isVisible ? `animate-${animation}` : '';
  
  // 创建延迟样式
  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : {};
  
  return (
    <div 
      ref={ref} 
      className={`scroll-reveal ${animationClass}`} 
      style={delayStyle}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * React组件封装 - 滚动出现元素组
 * @param {Object} props - 组件属性
 * @returns {JSX.Element} React组件
 */
function ScrollRevealGroup({ 
  children, 
  animation = 'fadeInUp', 
  threshold = 0.2, 
  staggerDelay = 200,
  ...props 
}) {
  // 使用自定义Hook检测元素可见性
  const [ref, isVisible] = useIntersectionObserver({ threshold });
  
  // 为子元素克隆并添加动画属性
  const childrenWithAnimation = React.Children.map(children, (child, index) => {
    // 计算每个子元素的延迟
    const delay = index * staggerDelay;
    
    // 克隆子元素并添加动画属性
    return React.cloneElement(child, {
      className: `${child.props.className || ''} ${isVisible ? `animate-${animation}` : ''}`,
      style: {
        ...(child.props.style || {}),
        animationDelay: `${delay}ms`
      }
    });
  });
  
  return (
    <div ref={ref} className="scroll-reveal-group" {...props}>
      {childrenWithAnimation}
    </div>
  );
}

// 导出函数和组件
export {
  initHomePageScrollAnimations,
  ScrollRevealElement,
  ScrollRevealGroup
};