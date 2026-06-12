import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <h3 className="text-base font-semibold">
            {this.props.fallbackTitle ?? "Something interrupted this view"}
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {this.props.fallbackDescription ??
              "We could not finish loading this section. Check your connection and try again."}
          </p>
          <button
            onClick={this.reset}
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="size-4" /> Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
