import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ScamShield UI Exception]', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center p-6">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl p-8 max-w-lg w-full text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger)] flex items-center justify-center text-[var(--status-danger)] mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">
                UI Execution Interrupted
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                A client-side component encountered an unexpected state. Defensive sandboxing halted the rendering process to prevent inconsistent data visualization.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-left font-mono text-[11px] text-[var(--status-danger)] overflow-x-auto select-all">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={this.handleReset}
                icon={<RotateCcw className="w-4 h-4" />}
                className="w-full"
              >
                Reload Defense Environment
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
