import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { io, Socket } from "socket.io-client";
import { EventCode } from "./EventCode";
import { ChatBox } from "./ChatBox";
import { CheckInForm } from "./CheckInForm";
import { type ClientToServerEvents, type ServerToClientEvents } from "../../../common/socketTypes";

type EventSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const EventPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const [socket, setSocket] = useState<EventSocket | null>(null);
  
  const [viewMode, setViewMode] = useState<"loading" | "creator" | "student_lobby" | "student_chat">("loading");
  const [userEmail, _] = useState<string>(""); 

  const navigate = useNavigate();

  useEffect(() => {
    let newSocket: EventSocket | null = null;
    let isMounted = true;

    // determine the user's role
    checkUserRole(id).then((role) => {
      if (!isMounted) return;
    
      switch (role) {
        case "creator": 
            setViewMode(role);
            break; 
        case "student_lobby":             
            setViewMode(role);
            break; 
        case "no_event": 
            navigate('/');
            break; 
        case "unauthed": 
            navigate('/signup');
            break; 
      }
    });

    // create the socket if we're authed.
    newSocket = io(`http://localhost:4000`, {
        withCredentials: true,
        autoConnect: true,
        reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    // wait for a successful join!
    newSocket.on("success_join", () => {
      if (viewMode !== "creator") {
        setViewMode("student_chat");
      }
    });

    return () => {
      isMounted = false;
      newSocket.disconnect();
    };
  }, [id]);

  if (viewMode === "loading" || !socket) return <div className="p-10 text-center">Loading Event...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {viewMode === "creator" && (
        <EventCode socket={socket} eventId={id!} />
      )}

      {viewMode === "student_lobby" && (
        <CheckInForm socket={socket} eventId={id!} />
      )}

      {viewMode === "student_chat" && (
        <div className="max-w-2xl mx-auto py-8 px-4">
           <h1 className="text-2xl font-bold mb-4 text-gray-800">Event Chat</h1>
           <ChatBox socket={socket} eventId={id!} userEmail={userEmail} />
        </div>
      )}
    </div>
  );
};

async function checkUserRole(eventId?: string) {
  try {
    const session = await fetch('http://localhost:4000/users/me',
      {
        credentials: 'include' 
      }
    );
    if (!session.ok) return "unauthed"; 
    const userData = await session.json();

    const event = await fetch(`http://localhost:4000/events/${eventId}`);
    if (!event.ok) return "no_event"
    const eventData = await event.json();

    const userId = String(userData._id || userData.id || "");
    const creatorId = String(eventData.created_by || eventData.creatorId || "");

    // if theres a match and both exist,
    if (userId && creatorId && userId === creatorId) {
        return "creator";
    }

    return "student_lobby";
    
  } catch (e) {
    console.error(e);
    return "student_lobby"; 
  }
}