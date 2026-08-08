import { Component } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-surface to-surface flex items-center justify-center p-4">
          <div
            style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '3rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <AlertTriangle
                size={40}
                style={{ color: '#DC2626' }}
              />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                color: '#0F172A',
                marginBottom: '0.75rem',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                color: '#64748B',
                marginBottom: '0.5rem',
                lineHeight: '1.6',
              }}
            >
              An unexpected error occurred. Our team has been notified. You can
              try refreshing the page or going back to the home screen.
            </p>

            {/* Error detail (dev-friendly) */}
            {this.state.error && (
              <details
                style={{
                  marginTop: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                }}
              >
                <summary
                  style={{
                    fontWeight: '600',
                    color: '#475569',
                    fontSize: '0.875rem',
                    listStyle: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ▸ Error details
                </summary>
                <pre
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#DC2626',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    maxHeight: '150px',
                    overflow: 'auto',
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: '2px solid #E2E8F0',
                  background: 'white',
                  color: '#0F172A',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#94A3B8';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <Home size={18} />
                Go Home
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(5,150,105,0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(5,150,105,0.3)';
                }}
              >
                <RefreshCw size={18} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
