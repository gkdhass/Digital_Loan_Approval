import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
          >
            <div className="h-6 bg-gray-200 rounded-lg w-2/3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
            </div>
          </motion.div>
        );

      case 'stat':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3"
          >
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </motion.div>
        );

      case 'table':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-100 flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
              </div>
            ))}
          </motion.div>
        );

      default:
        return (
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        );
    }
  };

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

// Named exports for specific skeleton types
export const SkeletonTable = ({ rows = 5 }) => (
  <SkeletonLoader type="table" count={1} />
);

export const SkeletonStat = ({ count = 1 }) => (
  <SkeletonLoader type="stat" count={count} />
);

export default SkeletonLoader;
