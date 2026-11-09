import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.warn('[ErrorBoundary] Caught render exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050D12] text-slate-100 flex items-center justify-center p-6 text-center font-vazirmatn">
          <div className="max-w-md p-8 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">
              ✓
            </div>
            <h1 className="text-xl font-bold text-white mb-2">کارخانه کپسول و سیلندر گاز مایع ام گاز</h1>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              ارتباط با سرور به‌روزرسانی شد. لطفاً برای بارگذاری مجدد، دکمه زیر را لمس کنید:
            </p>
            <button
              type="button"
              onClick={() => {
                try {
                  window.location.reload();
                } catch {
                  window.location.href = '/';
                }
              }}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg transition-all"
            >
              بارگذاری مجدد سایت (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
