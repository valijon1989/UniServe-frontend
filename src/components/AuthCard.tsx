import React from "react";

export function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string; }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="gradient-border rounded-2xl bg-slate-950/80 p-[1px] shadow-xl shadow-black/50">
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/95 to-black/95 p-6">
            <h1 className="mb-1 text-xl font-semibold text-slate-50">
              {title}
            </h1>
            <p className="mb-5 text-sm text-slate-400">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
