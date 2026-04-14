import * as React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] p-6 text-white">
          <div className="max-w-md w-full bg-[#161B2D] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-[#00F5FF] mb-4">Connection Error</h2>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message.includes('permissions') 
                ? "Your Firebase Security Rules are blocking access. Please publish the rules in your Firebase Console."
                : "Could not connect to the security database. Please check your internet connection or Firebase configuration."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#00F5FF] text-[#0B0F1A] font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
