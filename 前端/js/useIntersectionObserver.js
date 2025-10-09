// useIntersectionObserver.js - 用于触发滚动动画的自定义React Hook

import { useState, useEffect, useRef } from 'react';

/**
 * 使用Intersection Observer API检测元素是否可见
 * @param {Object} options - Intersection Observer选项
 * @param {Number} options.threshold - 元素可见比例阈值 (0-1)
 * @param {String} options.rootMargin - 根边距 (CSS格式, 例如 "10px 20px")
 * @param {Boolean} options.triggerOnce - 是否只触发一次 (默认: true)
 * @returns {Array} [ref, isVisible, entry] - 引用对象, 可见性状态, 和观察条目
 */
function useIntersectionObserver({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
} = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);
  const observerRef = useRef(null);
  
  useEffect(() => {
    // 确保 IntersectionObserver API 可用
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true); // 降级处理
      return;
    }
    
    // 清理之前的observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
        
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // 如果只需要触发一次，则取消观察
          if (triggerOnce && elementRef.current) {
            observerRef.current.unobserve(elementRef.current);
          }
        } else if (!triggerOnce) {
          // 如果需要持续监听，则在元素离开视口时重置状态
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    
    // 开始观察目标元素
    const currentElement = elementRef.current;
    if (currentElement) {
      observerRef.current.observe(currentElement);
    }
    
    // 清理函数
    return () => {
      if (observerRef.current && currentElement) {
        observerRef.current.unobserve(currentElement);
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce]);
  
  return [elementRef, isVisible, entry];
}

export default useIntersectionObserver;