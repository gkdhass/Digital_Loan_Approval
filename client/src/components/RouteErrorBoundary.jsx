import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Route-level Error Boundary
 * Catches errors in individual route components without crashing the entire app.
 * Provides navigation options to recover without full page reload.
 */
class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prevState) => ({ 
      errorInfo,
      errorCount: prevState.errorCount + 1 
    }));
    
    console.error(`[RouteErrorBoundary] Error in route ${this.props.routeName || 'unknown'}:`, error, errorInfo);
    
    // Log to error tracking service (e.g., Sentry) in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service
      console.error('Production error:', { 
        route: this.props.routeName,
        error: error.toString(),
        stack: errorInfo.componentStack 
      });
    }
  }

  componentDidUpdate(prevProps) {
    // Reset error state when route changes
    if (this.props.location !== prevProps.location && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      const { routeName, fallbackPath = '/dashboard' } = this.props;
      const showDetails = import.meta.env.DEV || this.state.errorCount > 2;

      return (
        <div className="min-h-[calc(100vh-5rem)] bg-background dark:bg-backgroundDark flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl w-full p-8 text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-errorBadge dark:bg-errorBadgeDark rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="h-10 w-10 text-error dark:text-errorDark" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-3"
            >
              Oops! Something went wrong
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-foregroundSecondary dark:text-foregroundSecondaryDark mb-2"
            >
              {routeName ? `There was a problem loading the ${routeName} page.` : 'An unexpected error occurred on this page.'}
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark mb-6"
            >
              Don't worry, the rest of the app is still working. You can go back or try again.
            </motion.p>

            {/* Error Details (collapsible, shown in dev mode or after multiple errors) */}
            {showDetails && this.state.error && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-6 text-left bg-errorBadge dark:bg-errorBadgeDark/30 border border-errorBorder dark:border-errorBorderDark rounded-xl p-4"
              >
                <summary className="font-semibold text-errorText dark:text-errorTextDark text-sm cursor-pointer select-none">
                  ▸ Error details {import.meta.env.DEV && '(dev mode)'}
                </summary>
                <pre className="mt-3 text-xs text-error dark:text-errorDark font-mono whitespace-pre-wrap break-words max-h-48 overflow-auto">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </motion.details>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <button
                onClick={this.handleGoBack}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                Go Back
              </button>

              <button
                onClick={this.handleReset}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              <Link
                to={fallbackPath}
                className="btn-primary flex items-center justify-center gap-2"
              >
                Return to {fallbackPath === '/dashboard' ? 'Dashboard' : 'Home'}
              </Link>
            </motion.div>

            {/* Help Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-xs text-foregroundMuted dark:text-foregroundMutedDark"
            >
              If this problem persists, please contact support with the error details above.
            </motion.p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RouteErrorBoundary;
