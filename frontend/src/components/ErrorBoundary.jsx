// src/components/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">

          {/* Animated error icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <span className="text-3xl"></span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            The application encountered an unexpected error.
            Your exam progress is saved — refresh the page to continue.
          </p>

          {/* Error details — collapsible */}
          {this.state.error && (
            <details className="mb-6 text-left bg-white/5 border border-white/10 rounded-xl p-4">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300 transition">
                Technical details
              </summary>
              <pre className="mt-2 text-xs text-red-400 overflow-auto max-h-32 whitespace-pre-wrap">
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-medium text-sm transition touch-manipulation"
            >
              Refresh Page
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = "/"; }}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition touch-manipulation"
            >
              Go Home
            </button>
          </div>

        </div>
      </div>
    );
  }
}