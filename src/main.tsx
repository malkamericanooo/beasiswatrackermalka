import { Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error in React App:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      const keys = ["beasiswa_universities", "beasiswa_goals", "beasiswa_cv", "beasiswa_documents", "beasiswa_reminders", "beasiswa_offline_queue"];
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <p className="eyebrow text-urgent">Recovery mode</p>
            <h1 className="mt-2 text-2xl">Something failed to render</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Reload first. If it keeps happening, clearing the local cache will
              re-fetch your data from Supabase.
            </p>

            <pre className="mt-4 panel p-3 overflow-auto max-h-36 text-2xs font-mono text-urgent whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-4 rounded-sm border border-border text-sm hover:bg-accent transition-colors"
              >
                Reload
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-4 rounded-sm bg-destructive text-destructive-foreground text-sm hover:opacity-90 transition-opacity"
              >
                Clear local cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
