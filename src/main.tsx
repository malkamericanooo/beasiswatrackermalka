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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-lg font-bold text-slate-100">System Recovery Mode</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected render error occurred. Click below to clear temporary browser cache and reload your data.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left overflow-auto max-h-32 text-[10px] font-mono text-rose-300">
              {this.state.error?.toString()}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Reset Local Cache
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
