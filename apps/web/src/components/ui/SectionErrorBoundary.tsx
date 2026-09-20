import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  title?: string;
  fallbackTitle?: string;
  fallbackMessage?: string;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[SectionErrorBoundary Caught]:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className={`p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center space-y-3 ${
            this.props.className || ''
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            {this.props.title || this.props.fallbackTitle || 'Component Temporarily Unavailable'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm">
            {this.props.fallbackMessage ||
              'This widget encountered a temporary display issue. Rest of live tracking remains fully operational.'}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Widget</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
