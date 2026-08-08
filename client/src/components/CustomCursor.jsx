import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const trailRef = useRef([]);
  const { theme } = useTheme();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isInput, setIsInput] = useState(false);
  const [isPointerDevice, setIsPointerDevice] = useState(false);

  // Check if device has fine pointer (mouse) and add body class
  useEffect(() => {
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    setIsPointerDevice(hasPointer);
    
    if (hasPointer) {
      document.body.classList.add('custom-cursor-active');
    }
    
    return () => {
      if (hasPointer) {
        document.body.classList.remove('custom-cursor-active');
      }
    };
  }, []);

  // Track mouse position
  useEffect(() => {
    if (!isPointerDevice) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerDevice]);

  // Detect hoverable elements
  useEffect(() => {
    if (!isPointerDevice) return;

    const handleMouseOver = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer');
      
      const isInputField = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('select');

      setIsHovering(isClickable);
      setIsInput(isInputField);
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, [isPointerDevice]);

  // Smooth cursor animation
  useEffect(() => {
    if (!isPointerDevice || !cursorRef.current) return;

    const cursor = cursorRef.current;
    let currentX = position.x;
    let currentY = position.y;
    const lerpFactor = 0.15;

    const animate = () => {
      currentX += (position.x - currentX) * lerpFactor;
      currentY += (position.y - currentY) * lerpFactor;

      cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      
      requestAnimationFrame(animate);
    };

    animate();
  }, [position, isPointerDevice]);

  // Trail effect
  useEffect(() => {
    if (!isPointerDevice) return;

    const trailLength = 4;
    const trailInterval = setInterval(() => {
      const trail = document.createElement('div');
      trail.className = 'fixed rounded-full pointer-events-none z-[9998]';
      trail.style.width = isInput ? '2px' : isHovering ? '8px' : '4px';
      trail.style.height = isInput ? '20px' : isHovering ? '8px' : '4px';
      
      // Theme colors
      const isDark = theme === 'dark';
      const baseColor = isDark ? '#38BDF8' : '#123B5D';
      const accentColor = isDark ? '#FACC15' : '#EAB308';
      
      trail.style.backgroundColor = isHovering ? accentColor : baseColor;
      trail.style.left = `${position.x}px`;
      trail.style.top = `${position.y}px`;
      trail.style.opacity = '0.6';
      trail.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      
      document.body.appendChild(trail);
      
      // Fade out and remove
      setTimeout(() => {
        trail.style.opacity = '0';
        trail.style.transform = 'scale(0)';
      }, 50);
      
      setTimeout(() => {
        trail.remove();
      }, 350);
    }, 50);

    return () => clearInterval(trailInterval);
  }, [position, isHovering, isInput, theme, isPointerDevice]);

  if (!isPointerDevice) return null;

  const isDark = theme === 'dark';
  const baseColor = isDark ? '#38BDF8' : '#123B5D';
  const accentColor = isDark ? '#FACC15' : '#EAB308';
  const glowColor = isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(18, 59, 93, 0.3)';

  return (
    <>
      {/* Main cursor */}
      <div
        ref={cursorRef}
        className="fixed pointer-events-none z-[9999] transition-all duration-150 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {isInput ? (
          // Input field: vertical beam
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-sm"
            style={{
              width: '2px',
              height: '20px',
              backgroundColor: baseColor,
              boxShadow: `0 0 8px ${glowColor}`,
            }}
          />
        ) : isHovering ? (
          // Hover state: larger ring with rupee symbol
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full"
            style={{
              width: '32px',
              height: '32px',
              border: `2px solid ${accentColor}`,
              backgroundColor: `${accentColor}15`,
              boxShadow: `0 0 12px ${glowColor}`,
            }}
          >
            <span
              style={{
                color: accentColor,
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              ₹
            </span>
          </div>
        ) : (
          // Default: glowing dot
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: '12px',
              height: '12px',
              border: `2px solid ${baseColor}`,
              backgroundColor: `${baseColor}20`,
              boxShadow: `0 0 10px ${glowColor}`,
            }}
          />
        )}
      </div>
    </>
  );
};

export default CustomCursor;
