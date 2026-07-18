"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-linen-canvas p-8 text-center">
            <h1 className="text-heading-lg font-semibold text-midnight-ink">Something went wrong</h1>
            <p className="text-body text-slate-custom">
              An unexpected error occurred. Please reload the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-buttons bg-primary px-4 py-2 text-body font-medium text-white"
            >
              Reload
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
