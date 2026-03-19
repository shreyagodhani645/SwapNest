import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#f9fafb',
          padding: '2rem',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '3rem',
            maxWidth: '600px',
            width: '100%',
            border: '1px solid #fee2e2',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            textAlign: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem',
            }}>⚠️</div>
            <h1 style={{ color: '#dc2626', fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Something Went Wrong
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              The app encountered an error. Check the browser console for details.
            </p>
            <pre style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.75rem',
              textAlign: 'left',
              fontSize: '0.75rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              marginBottom: '1.5rem',
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#6C63FF',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.75rem 2rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
