// CountUpEffect.js - 用于数字滚动动画的自定义React组件

import { useState, useEffect, useRef } from 'react';

/**
 * 平滑的数字滚动计数效果
 * @param {Object} props - 组件属性
 * @param {Number} props.end - 最终数值
 * @param {Number} props.start - 起始数值 (默认: 0)
 * @param {Number} props.duration - 动画持续时间 (毫秒, 默认: 2000)
 * @param {Number} props.decimals - 小数位数 (默认: 0)
 * @param {String} props.prefix - 前缀 (默认: '')
 * @param {String} props.suffix - 后缀 (默认: '')
 * @param {Function} props.formatter - 自定义格式化函数
 * @returns {JSX.Element} 包含动画数字的组件
 */
const CountUpEffect = ({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  formatter,
  className = '',
  ...restProps
}) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const timeStartRef = useRef(null);
  const requestRef = useRef(null);
  
  // 确保end是数字
  const endValue = Number(end) || 0;
  
  // 创建格式化函数
  const formatValue = (value) => {
    // 如果提供了自定义格式化函数，使用它
    if (formatter && typeof formatter === 'function') {
      return formatter(value);
    }
    
    // 默认格式化
    const formattedValue = decimals > 0
      ? value.toFixed(decimals)
      : Math.floor(value).toString();
      
    return `${prefix}${formattedValue}${suffix}`;
  };
  
  // 动画函数
  const animate = (timestamp) => {
    if (!timeStartRef.current) {
      timeStartRef.current = timestamp;
    }
    
    const elapsedTime = timestamp - timeStartRef.current;
    const progress = Math.min(elapsedTime / duration, 1);
    const easeProgress = easeOutQuart(progress); // 缓动函数
    const currentValue = start + (endValue - start) * easeProgress;
    
    countRef.current = currentValue;
    setCount(currentValue);
    
    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };
  
  // 缓动函数 - 平滑减速
  const easeOutQuart = (x) => {
    return 1 - Math.pow(1 - x, 4);
  };
  
  // 开始动画
  useEffect(() => {
    countRef.current = start;
    timeStartRef.current = null;
    
    // 使用requestAnimationFrame获得更流畅的动画
    requestRef.current = requestAnimationFrame(animate);
    
    // 清理函数
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [start, endValue, duration]);
  
  return (
    <span className={className} {...restProps}>
      {formatValue(count)}
    </span>
  );
};

export default CountUpEffect;