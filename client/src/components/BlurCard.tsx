import type { ReactNode } from "react";

interface BlurCard {
  children: ReactNode;
  title?: string;
}

export function BlurCard({ children, title }: BlurCard) {
  return (
    <div className="min-h-screen bg-none flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/60 p-8 rounded-xl shadow-xxl">
        {title && (
          <h1 className="text-3xl font-semibold text-center mb-8 text-gray-900">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
