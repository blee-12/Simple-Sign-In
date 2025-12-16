import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title?: string;
}

export function SolidCard({ children, title }: AuthCardProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
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
