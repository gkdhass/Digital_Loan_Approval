import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for animating numbers counting up
 * Used for dashboard stats, EMI amounts, loan amounts
 */
export const useCountUp = (end, duration = 1000, start = 0) => {
  const [count, setCount] = useState(start);
  const startTimeRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth animation
      const easeOutQuad = (t) => t * (2 - t);
      const currentCount = start + (end - start) * easeOutQuad(percentage);

      setCount(Math.floor(currentCount));

      if (percentage < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [end, duration, start]);

  return count;
};

export default useCountUp;
