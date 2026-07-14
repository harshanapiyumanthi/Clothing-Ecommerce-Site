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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-color)] px-4 text-center space-y-6">
          <div className="w-16 h-16 border border-gold rounded-full flex items-center justify-center text-gold text-2xl font-serif">
            !
          </div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest text-[var(--text-color)]">
            Something Went Wrong
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            We encountered an unexpected error. Please return home or contact our concierge support if this persists.
          </p>
          <button
            onClick={this.handleReset}
            className="px-8 py-3 bg-gold hover:bg-black text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
