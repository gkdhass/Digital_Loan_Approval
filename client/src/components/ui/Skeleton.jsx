import { motion } from 'framer-motion';

const Skeleton = ({ 
  className = '', 
  variant = 'default',
  width,
  height,
  rounded = 'md'
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full'
  };

  const baseClasses = 'bg-surface dark:bg-surfaceDark animate-pulse';

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${roundedClasses[rounded]} ${className}`}
      style={style}
    >
      {/* Shimmer Effect */}
      <div className="relative overflow-hidden w-full h-full">
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['0%', '200%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>
    </motion.div>
  );
};

// Preset Skeleton Variants
export const SkeletonCard = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton width="48px" height="48px" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="80%" />
      </div>
    </div>
  </div>
);

export const SkeletonKPI = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton width="20px" height="20px" rounded="sm" />
        <Skeleton height="14px" width="100px" />
      </div>
      <Skeleton height="32px" width="120px" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={rowIndex}
        className="card"
      >
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="space-y-2">
              <Skeleton height="14px" width="60%" />
              <Skeleton height="18px" width="80%" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton width="48px" height="48px" rounded="lg" />
            <div className="flex-1 space-y-2">
              <Skeleton height="20px" width="200px" />
              <Skeleton height="16px" width="150px" />
            </div>
          </div>
          <Skeleton width="80px" height="28px" rounded="full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton height="12px" width="60%" />
              <Skeleton height="18px" width="80%" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ items = 6, columns = 3 }) => (
  <div className={`grid md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="card">
        <div className="flex items-start justify-between mb-4">
          <Skeleton width="56px" height="56px" rounded="lg" />
          <div className="text-right space-y-2">
            <Skeleton height="28px" width="60px" />
            <Skeleton height="12px" width="80px" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton height="24px" width="150px" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="90%" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="100%" />
        </div>
        <Skeleton height="44px" width="100%" rounded="lg" className="mt-6" />
      </div>
    ))}
  </div>
);

export default Skeleton;
