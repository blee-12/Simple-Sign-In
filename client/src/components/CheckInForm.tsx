import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { type ClientToServerEvents, type ServerToClientEvents } from '../../../common/socketTypes';

interface CheckInProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  eventId: string;
  userEmail: string;
  onError: (msg: string) => void;
}

export const CheckInForm: React.FC<CheckInProps> = ({ socket, eventId, userEmail, onError }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // clear errors when the user starts typing again
  useEffect(() => {
    if (error) setError(null);
  }, [code, error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (code.length !== 4) {
      setError("Please enter the full 4-digit code.");
      setIsSubmitting(false);
      return;
    }

    const handleError = (msg: string) => {
        console.error("Socket Error:", msg);
        onError(msg); 
        setIsSubmitting(false);
    };

    socket.once("error", handleError);

    console.log(`Checking into event ${eventId} with code ${code}`);
    socket.emit("check_in", eventId, code, userEmail); 

    return () => {
      socket.off("error", handleError);
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        <div className="bg-blue-600 p-6 text-center">
          <h2 className="text-white text-2xl font-bold tracking-tight">
            Event Check-In
          </h2>
          <p className="text-blue-100 text-sm mt-2 opacity-90">
            Enter the rotating code on the screen
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div>
              <label 
                htmlFor="code" 
                className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center"
              >
                4-Digit Code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={4}
                autoFocus
                className="w-full text-center text-4xl font-mono font-bold tracking-[0.5em] py-4 border-b-2 border-gray-200 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-200"
                placeholder="0000"
                value={code}
                onChange={(e) => setCode(e.target.value.slice(0, 4))} 
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 animate-pulse">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-600 font-medium">
                  {error}
                </span>
              </div>
            )}


            <button
              type="submit"
              disabled={isSubmitting || code.length < 4}
              className={`
                w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg
                transition-all duration-200 transform
                ${isSubmitting || code.length < 4 
                  ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-blue-500/30'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking In...
                </span>
              ) : "Join Event"}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Event ID: <span className="font-mono text-gray-500">{eventId}</span>
          </p>
        </div>

      </div>
    </div>
  );
};