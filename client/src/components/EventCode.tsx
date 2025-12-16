import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { type ClientToServerEvents, type ServerToClientEvents } from '../../../common/socketTypes';

interface AdminDisplayProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  eventId: string;
}

export const EventCode: React.FC<AdminDisplayProps> = ({ socket, eventId }) => {
  const [currentCode, setCurrentCode] = useState<string>("----");
  const [timeLeft, setTimeLeft] = useState<number>(30); // Assuming 30s rotation

  useEffect(() => {
    socket.emit("join_creator", eventId);

    const handleCodeUpdate = (newCode: string) => {
      setCurrentCode(newCode);
      setTimeLeft(30); 
    };
    
    const handleError = (msg: string) => {
        console.error("Socket Error:", msg);
        alert(`Server Error: ${msg}`); // Rude but effective for debugging
    };

    socket.on("code_update", handleCodeUpdate);
    socket.on("error", handleError);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      socket.off("code_update", handleCodeUpdate);
      clearInterval(timer);
    };
  }, [socket, eventId]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-xl border-4 border-blue-100 max-w-lg mx-auto mt-10">
      
      <h2 className="text-gray-500 text-lg uppercase tracking-widest font-bold mb-4">
        Join Code
      </h2>

      {/* The Code Display */}
      <div className="bg-gray-900 text-white font-mono text-8xl py-8 px-12 rounded-xl tracking-[1rem] shadow-inner mb-6 relative overflow-hidden">
        {currentCode}
        
        {/* Shine effect (optional flair) */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Progress Bar / Timer */}
      <div className="w-full max-w-xs flex flex-col gap-2">
        <div className="flex justify-between text-xs font-semibold text-gray-400">
          <span>Expires in</span>
          <span>{timeLeft}s</span>
        </div>
        
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 30) * 100}%` }}
          />
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-400 text-center">
        Go to <strong>yoursite.com/checkin</strong> and enter this code.
      </p>
    </div>
  );
};