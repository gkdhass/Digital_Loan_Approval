/**
 * Spring Animation Presets
 * Consistent spring physics configurations across the app
 */

export const springPresets = {
  // Gentle spring - for subtle UI feedback
  gentle: {
    type: 'spring',
    stiffness: 260,
    damping: 20,
  },

  // Snappy spring - for buttons and interactive elements
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 17,
  },

  // Bouncy spring - for playful elements
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 10,
    mass: 0.8,
  },

  // Smooth spring - for page transitions
  smooth: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  },

  // Stiff spring - for quick, responsive feedback
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
};

// Common button interaction animations
export const buttonSpring = {
  whileHover: {
    scale: 1.03,
    transition: springPresets.snappy,
  },
  whileTap: {
    scale: 0.97,
    transition: springPresets.snappy,
  },
};

// Card hover animation
export const cardSpring = {
  whileHover: {
    y: -4,
    transition: springPresets.gentle,
  },
};

// Page transition variants with springs
export const pageTransitionSpring = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: springPresets.smooth,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: springPresets.smooth,
  },
};

// Modal/Dropdown spring animation
export const modalSpring = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springPresets.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: springPresets.gentle,
  },
};

// Stagger container for lists with spring
export const staggerContainerSpring = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Stagger item with spring
export const staggerItemSpring = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPresets.gentle,
  },
};

export default springPresets;
