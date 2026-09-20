import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RailLine Uncaught Error]:', error, errorInfo);
  }

  private handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Something unexpected occurred
            </h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              RailLine encountered an unexpected state. Your saved data is safe. Please retry or return to the home screen.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={this.handleGoHome}>
                <Home className="w-3.5 h-3.5 mr-1.5" />
                Home
              </Button>
              <Button variant="primary" size="sm" onClick={this.handleTryAgain}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
