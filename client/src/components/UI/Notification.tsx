import React, { useEffect } from "react";

interface NotificationProps {
  message: string;
  type?: "error" | "success" | "info";
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type = "error", onClose }) => {
  
  // auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  // styles based on type
  const styles = {
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${styles[type]} transition-all duration-300 animate-in slide-in-from-bottom-5`}>
      
      <span className="text-lg font-bold">
        {type === "error" && "!"}
        {type === "success" && "✓"}
        {type === "info" && "i"}
      </span>

      <p className="text-sm font-medium pr-2">{message}</p>

      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity p-1">
        ✕
      </button>
    </div>
  );
};