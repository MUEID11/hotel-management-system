import { Component } from 'react';
import Button from './Button.jsx';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <span className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-amber-100 text-amber-700 font-serif font-bold text-xl">
              GH
            </span>
            <h1 className="mt-4 font-serif text-2xl font-semibold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              An unexpected error occurred while rendering this page.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 max-h-32 overflow-auto rounded bg-slate-100 p-2 text-left text-xs text-rose-600">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => window.location.reload()}>Reload page</Button>
              <Button variant="secondary" onClick={this.handleReset}>
                Return to home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
