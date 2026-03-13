import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-center p-6">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-[#e8e9ed] mb-2">Something went wrong</h1>
          <p className="text-[#9ca3af] mb-6 max-w-xs">
            An unexpected error occurred. Refreshing the page should fix it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 text-[#e8e9ed] font-semibold hover:border-white/25 transition-colors"
          >
            Refresh page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
