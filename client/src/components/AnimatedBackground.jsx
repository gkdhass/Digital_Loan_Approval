import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Theme-specific colors and opacity
    const isDark = theme === 'dark';
    const colors = isDark 
      ? ['#38BDF8', '#2DD4BF', '#FACC15'] // Dark mode: Electric Blue, Aqua Teal, Digital Gold
      : ['#123B5D', '#0F766E', '#EAB308']; // Light mode: Deep Trust Blue, Teal, Digital Gold
    const opacityRange = isDark 
      ? [0.20, 0.10] // Dark mode: 10-20% opacity
      : [0.35, 0.20]; // Light mode: 20-35% opacity (higher for visibility on light background)
    const glowBlur = isDark ? 10 : 3; // Light mode has much softer glow

    // Create particles
    const createParticles = () => {
      const particles = [];
      const particleCount = 25;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3 - 0.2,
          opacity: Math.random() * (opacityRange[0] - opacityRange[1]) + opacityRange[1],
          type: Math.random() > 0.7 ? 'rupee' : 'star',
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      
      return particles;
    };

    particlesRef.current = createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        
        if (particle.type === 'rupee') {
          // Draw rupee symbol
          ctx.font = `${particle.size * 8}px Arial`;
          ctx.fillText('₹', particle.x, particle.y);
        } else {
          // Draw star/circle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect (much softer in light mode)
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = glowBlur;
          ctx.fill();
        }
        
        ctx.restore();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default AnimatedBackground;
