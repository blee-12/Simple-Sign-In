import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { type ClientToServerEvents, type ServerToClientEvents } from '../../../common/socketTypes.ts'; // Adjust path if needed

interface ChatProps {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  eventId: string;
  userEmail: string;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
}

export const ChatBox: React.FC<ChatProps> = ({ socket, eventId, userEmail }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // socket listner
  useEffect(() => {
    const handleMessage = (sender: string, message: string) => {
      const newMessage: Message = {
        id: Date.now().toString() + Math.random(),
        sender,
        text: message,
        isMe: sender === userEmail
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("chat_message", handleMessage);

    return () => {
      socket.off("chat_message", handleMessage);
    };
  }, [socket, userEmail]);

  // message sender
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit("send_message", eventId, inputText);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-2xl mx-auto border border-gray-200 rounded-xl bg-gray-50 shadow-sm overflow-hidden font-sans">
      
      <div className="bg-white p-4 border-b border-gray-200 font-semibold text-gray-700">
        Live Chat
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed relative break-words shadow-sm ${
              msg.isMe 
                ? 'self-end bg-blue-600 text-white rounded-br-none' 
                : 'self-start bg-white text-gray-800 border border-gray-200 rounded-bl-none'
            }`}
          >
            {!msg.isMe && (
              <span className="block text-xs text-gray-400 mb-1 font-medium">
                {msg.sender}
              </span>
            )}
            
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form 
        className="p-3 bg-white border-t border-gray-200 flex gap-2" 
        onSubmit={handleSend}
      >
        <input
          type="text"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!inputText.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};