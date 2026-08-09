import RouteErrorBoundary from './RouteErrorBoundary';
import { useLocation } from 'react-router-dom';

/**
 * Higher-order component to wrap routes with error boundaries
 * @param {Component} Component - The route component to wrap
 * @param {string} routeName - Human-readable name of the route
 * @param {string} fallbackPath - Path to redirect on error (default: /dashboard)
 */
const withRouteErrorBoundary = (Component, routeName, fallbackPath = '/dashboard') => {
  return function WrappedComponent(props) {
    const location = useLocation();
    
    return (
      <RouteErrorBoundary 
        routeName={routeName} 
        fallbackPath={fallbackPath}
        location={location}
      >
        <Component {...props} />
      </RouteErrorBoundary>
    );
  };
};

export default withRouteErrorBoundary;
