import React from 'react';

const Logo = ({ size = 'default', showText = true, className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-lg',
    xl: 'text-2xl',
  };

  const subtextSizeClasses = {
    small: 'text-[8px]',
    default: 'text-[10px]',
    large: 'text-xs',
    xl: 'text-sm',
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;
  const currentTextSize = textSizeClasses[size] || textSizeClasses.default;
  const currentSubtextSize = subtextSizeClasses[size] || subtextSizeClasses.default;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size === 'xl' ? '96' : size === 'large' ? '64' : size === 'small' ? '32' : '40'}
        height={size === 'xl' ? '96' : size === 'large' ? '64' : size === 'small' ? '32' : '40'}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={currentSize}
      >
        {/* Gradients */}
        <defs>
          {/* Dark mode gradient - Electric Blue to Aqua Teal */}
          <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2DD4BF" />
          </linearGradient>
          
          {/* Light mode gradient - Deep Trust Blue to Teal */}
          <linearGradient id="logoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#123B5D" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
          
          {/* Accent gradient - Digital Gold */}
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
        </defs>
        
        {/* Geometric hexagonal shield frame */}
        <g className="text-primary dark:text-primaryDark dark:filter dark:drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]">
          <path
            d="M48 8 L82 28 V52 L48 88 L14 52 V28 Z"
            stroke="url(#logoGradientLight)"
            strokeWidth="2"
            fill="none"
            className="dark:stroke-[url(#logoGradientDark)]"
          />
          {/* Inner hexagon for depth */}
          <path
            d="M48 16 L74 32 V48 L48 80 L22 48 V32 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
        </g>
        
        {/* Merged house + rupee symbol - continuous line design */}
        <g className="dark:filter dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
          {/* House roof that flows into rupee top stroke */}
          <path
            d="M28 36 L48 20 L68 36 V60 H28 V36"
            stroke="url(#logoGradientLight)"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
            className="dark:stroke-[url(#logoGradientDark)]"
          />
          
          {/* Rupee symbol integrated - top line continues from roof peak */}
          <path
            d="M36 32 H60 M36 38 H54 M36 44 L36 56 M36 44 H54 C57 44 58 46 58 48 C58 50 57 52 54 52 H36"
            stroke="url(#logoGradientLight)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="dark:stroke-[url(#logoGradientDark)]"
          />
          
          {/* Approval arrow/check mark integrated into rupee tail */}
          <path
            d="M38 56 L44 62 L58 48"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="dark:filter dark:drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]"
          />
        </g>
        
        {/* Small accent dots at hexagon corners */}
        <g className="text-accent dark:text-accentDark">
          <circle cx="48" cy="8" r="2" fill="currentColor" className="dark:filter dark:drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
          <circle cx="82" cy="28" r="2" fill="currentColor" className="dark:filter dark:drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
          <circle cx="82" cy="52" r="2" fill="currentColor" className="dark:filter dark:drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
          <circle cx="48" cy="88" r="2" fill="currentColor" className="dark:filter dark:drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
          <circle cx="14" cy="52" r="2" fill="currentColor" className="dark:filter dark:drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
          <circle cx="14" cy="28" r="2" fill="currentColor" className="dark:filter dark:drop-shadow-[0_0_4px_rgba(250,204,21,0.4)]" />
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col items-center mt-1">
          <span
            className={`font-bold text-foreground dark:text-foregroundDark ${currentTextSize} leading-tight font-logo`}
          >
            DIGITAL LOAN APPROVAL
          </span>
          <span
            className={`font-medium text-foregroundSecondary dark:text-foregroundSecondaryDark ${currentSubtextSize} leading-tight font-logo`}
          >
            SECURE YOUR HOME TODAY
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
