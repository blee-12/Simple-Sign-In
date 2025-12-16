import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { io, Socket } from "socket.io-client";
import { EventCode } from "./EventCode";
import { ChatBox } from "./ChatBox";
import { CheckInForm } from "./CheckInForm";
import { StudentList } from "./StudentList";
import { type ClientToServerEvents, type ServerToClientEvents } from "../../../common/socketTypes";
import { Notification } from "./UI/Notification";
import { NonActiveEvent } from "./NonActiveEvent";

type EventSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface EventDataState {
    name: string;
    description?: string;
    attending_users: string[];
    checked_in_users: any[];
    [key: string]: any;
}

export const EventPage = () => {
  const { id = "" } = useParams(); 
  const [socket, setSocket] = useState<EventSocket | null>(null);
  
  const [viewMode, setViewMode] = useState<"loading" | "creator" | "student_lobby" | "student_chat" | "not_active">("loading");
  const [userEmail, setUserEmail] = useState<string>(""); 

  const [eventDetails, setEventDetails] = useState<EventDataState | null>(null);

  const [notification, setNotification] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const showError = (msg: string) => setNotification({ msg, type: "error" });
  const showSuccess = (msg: string) => setNotification({ msg, type: "success" });

  const navigate = useNavigate();

  useEffect(() => {
    let newSocket: EventSocket | null = null;
    let isMounted = true;

    // determine the user's role
    fetchEventData(id).then((result) => {
      if (!isMounted) return;

      if (result.userEmail) {
        setUserEmail(result.userEmail);
      }

      // update the event data state if we found an event
      if (result.eventData) {
        setEventDetails(result.eventData);
      }
    
      switch (result.role) {
        case "creator": 
            setViewMode("creator");
            break; 
        case "student_lobby":             
            setViewMode("student_lobby");
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

    // check if the event is active.
    newSocket.on("not_active", () => {
      setViewMode("not_active");
    })

    newSocket.emit("is_active", id);

    // wait for a successful join!
    newSocket.on("success_join", () => {
      if (viewMode !== "creator") {
        setViewMode("student_chat");
      }
      showSuccess(`Connection successful!`);
    });

    newSocket.on("error", (err) => {
      showError(`Connection failed: ${err}`);
    })

    return () => {
      isMounted = false;
      newSocket.disconnect();
    };
  }, [id, navigate]);

  if (viewMode === "loading" || !socket) return <div className="p-10 text-center">Loading Event...</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {notification && (
        <Notification 
            message={notification.msg} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
        />
      )}

       {(viewMode === "student_lobby" || viewMode === "student_chat") && eventDetails && (
        <div className="bg-white border-b border-gray-200 px-6 py-8 mb-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900">{eventDetails.name}</h1>
                <p className="text-gray-600 mt-2 text-lg">
                    {eventDetails.description || "No description provided."}
                </p>
            </div>
        </div>
      )}
      
      <div className="flex-grow">
        {viewMode === "creator" && (
            <div className="max-w-6xl mx-auto p-4 space-y-6">                
                
                <EventCode socket={socket} eventId={id!} onError={showError} />               
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {eventDetails && (
                        <StudentList 
                            attendingUsers={eventDetails.attending_users || []}
                            checkedInUsers={eventDetails.checked_in_users || []}
                            eventId={id}
                        />
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8 md:mt-0 h-[600px] flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Live Class Chat</h3>
                        <div className="flex-grow overflow-hidden relative">
                              <ChatBox socket={socket} eventId={id!} userEmail={userEmail} />
                        </div>
                    </div>

                </div>
            </div>
        )}

        {viewMode === "student_lobby" && (
            <CheckInForm socket={socket} eventId={id!} userEmail={userEmail} onError={showError}/>
        )}

        {viewMode === "student_chat" && (
            <div className="max-w-2xl mx-auto py-4 px-4 h-[calc(100vh-200px)]">
                <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Live Chat</h2>
                <ChatBox socket={socket} eventId={id!} userEmail={userEmail} />
            </div>
        )}

        {viewMode === "not_active" && eventDetails && (
          <NonActiveEvent eventName={eventDetails.name}/>
        )}
      </div>
    </div>
  );
};

async function fetchEventData(eventId?: string) {
  try {
    const session = await fetch('http://localhost:4000/users/me', { credentials: 'include' });
    if (!session.ok) return { role: "unauthed", eventData: null, userEmail: "" }; 
    
    const userData = await session.json(); 
    const userObj = userData.data || userData; 

    const event = await fetch(`http://localhost:4000/events/${eventId}`, { credentials: 'include' });
    if (!event.ok) return { role: "no_event", eventData: null, userEmail: "" };
    
    const eventResponse = await event.json();
    const eventData = eventResponse.data || eventResponse; 

    const userId = String(userObj._id || userObj.id || "");
    const creatorId = String(eventData.created_by || eventData.creatorId || "");

    let role = "student_lobby";
    if (userId && creatorId && userId === creatorId) {
        role = "creator";
    }

    return { role, eventData, userEmail: userObj.email || "" };
    
  } catch (e) {
    console.error(e);
    return { role: "student_lobby", eventData: null, userEmail: "" }; 
  }
}