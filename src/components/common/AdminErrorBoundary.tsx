'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-stone-950 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-7 h-7 text-amber-700" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif font-black text-lg sm:text-xl text-amber-950">
                {this.props.fallbackTitle || 'เกิดข้อผิดพลาดในการแสดงผลส่วนนี้'}
              </h3>
              <p className="text-xs text-stone-600 font-bold leading-relaxed">
                ระบบตรวจพบข้อผิดพลาดของข้อมูลหรือการประมวลผลรูปภาพ ข้อมูลหลักของท่านยังปลอดภัย
              </p>
              {this.state.error?.message && (
                <div className="mt-2 p-2.5 bg-stone-100 border border-stone-300 rounded-xl text-[11px] font-mono text-stone-800 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl border border-amber-500 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>ลองใหม่อีกครั้ง</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-900 font-black text-xs rounded-xl border border-stone-300 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-stone-600" />
                <span>รีโหลดหน้านี้</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
