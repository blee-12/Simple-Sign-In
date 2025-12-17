/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { io, Socket } from "socket.io-client";
import { EventCode } from "./EventCode";
import { ChatBox } from "./ChatBox";
import { CheckInForm } from "./CheckInForm";
import { StudentList } from "./StudentList";
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "../../../common/socketTypes";
import { Notification } from "./UI/Notification";
import { NonActiveEvent } from "./NonActiveEvent";
import { WEBSITE_URL } from "../lib/assets";

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
  const navigate = useNavigate();

  const hasAttemptedAutoJoin = useRef(false);

  const [socket, setSocket] = useState<EventSocket | null>(null);
  const [viewMode, setViewMode] = useState<
    "loading" | "creator" | "student_lobby" | "student_chat" | "not_active"
  >("loading");
  
  const [userEmail, setUserEmail] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [eventDetails, setEventDetails] = useState<EventDataState | null>(null);
  const [needCode, setNeedCode] = useState<boolean>(false);

  const [notification, setNotification] = useState<{
    msg: string;
    type: "error" | "success";
  } | null>(null);

  const showError = (msg: string) => setNotification({ msg, type: "error" });

  useEffect(() => {
    console.log("Initializing Socket...");
    const newSocket = io(WEBSITE_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on("not_active", () => {
      setIsActive(false);
      setViewMode("not_active");
    });

    newSocket.on("success_join", () => {
      setViewMode((prev) => (prev === "creator" ? "creator" : "student_chat"));
    });

    newSocket.on("error", (err) => {
      showError(`Connection failed: ${err}`);
    });

    newSocket.emit("is_active", id);

    return () => {
      newSocket.disconnect();
    };
  }, [id]); 


  useEffect(() => {
    if (!socket) return; 
    let isMounted = true;

    fetchEventData(id).then((result) => {
      if (!isMounted) return;

      if (result.userEmail) setUserEmail(result.userEmail);
      if (result.eventData) setEventDetails(result.eventData);
      setNeedCode(result.need_code);

      if (!isActive) return;

      if (result.role === "creator") {
        setViewMode("creator");
        socket.emit("join_creator", id);
      } 
      else if (result.role === "student_lobby") {
        
        const isAlreadyCheckedIn = result.eventData?.checked_in_users?.some(
            (u: any) => u.userID === result.userEmail
        );

        if (isAlreadyCheckedIn) {
            console.log("User already in DB. Rejoining session...");
            socket.emit("rejoin", id); 
        } 
        else if (!result.need_code && !hasAttemptedAutoJoin.current) {
          console.log("Auto-checking in...");
          hasAttemptedAutoJoin.current = true;
          socket.emit("check_in_no_code", id, result.userEmail);
        } 
        else {
          setViewMode("student_lobby");
        }

      } 
      else if (result.role === "no_event") {
        navigate("/");
      } 
      else if (result.role === "unauthed") {
        navigate("/signup");
      }
    });

    return () => { isMounted = false; };
  }, [id, socket, isActive, navigate]); 

  useEffect(() => {
    if (!socket) return;

    const handleNewCheckIn = (newCheckIn: any) => {
      setEventDetails((prev) => {
        if (!prev) return null;
        const exists = prev.checked_in_users.some(
          (user) => user.userID === newCheckIn.userID
        );
        if (exists) return prev;
        return {
          ...prev,
          checked_in_users: [...prev.checked_in_users, newCheckIn],
        };
      });
    };

    socket.on("user_checked_in", handleNewCheckIn);

    return () => {
      socket.off("user_checked_in", handleNewCheckIn);
    };
  }, [socket]);


  if (viewMode === "loading" || !socket)
    return <div className="p-10 text-center">Loading Event...</div>;

  if (!isActive) {
    return <NonActiveEvent eventName={eventDetails?.name || "Event"} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <Notification
          message={notification.msg}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {(viewMode === "student_lobby" || viewMode === "student_chat") &&
        eventDetails && (
          <div className="bg-white border-b border-gray-200 px-6 py-8 mb-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900">
                {eventDetails.name}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {eventDetails.description || "No description provided."}
              </p>
            </div>
          </div>
        )}

      <div className="flex-grow">
        {viewMode === "creator" && socket && (
          <div className="max-w-6xl mx-auto p-4 space-y-6">
            {needCode && (
              <EventCode socket={socket} eventId={id!} onError={showError} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventDetails && (
                <StudentList
                  attendingUsers={eventDetails.attending_users || []}
                  checkedInUsers={eventDetails.checked_in_users || []}
                  eventId={id}
                />
              )}

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8 md:mt-0 h-[600px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                  Live Class Chat
                </h3>
                <div className="flex-grow overflow-hidden relative">
                  <ChatBox
                    socket={socket}
                    eventId={id!}
                    userEmail={userEmail}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === "student_lobby" && socket && (
          <CheckInForm
            socket={socket}
            eventId={id!}
            userEmail={userEmail}
            onError={showError}
          />
        )}

        {viewMode === "student_chat" && socket && (
          <div className="max-w-2xl mx-auto py-4 px-4 h-[calc(100vh-200px)]">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Live Chat
            </h2>
            <ChatBox socket={socket} eventId={id!} userEmail={userEmail} />
          </div>
        )}
      </div>
    </div>
  );
};


async function fetchEventData(eventId?: string) {
  try {
    const session = await fetch(`${WEBSITE_URL}/users/me`, {
      credentials: "include",
    });
    if (!session.ok)
      return { role: "unauthed", eventData: null, userEmail: "" };

    const userData = await session.json();
    const userObj = userData.data || userData;

    const event = await fetch(`${WEBSITE_URL}/events/${eventId}`, {
      credentials: "include",
    });
    if (!event.ok) return { role: "no_event", eventData: null, userEmail: "" };

    const eventResponse = await event.json();
    const eventData = eventResponse.data || eventResponse;

    const need_code = eventData.requires_code;

    const userId = String(userObj._id || userObj.id || "");
    const creatorId = String(eventData.created_by || eventData.creatorId || "");

    let role = "student_lobby";
    if (userId && creatorId && userId === creatorId) {
      role = "creator";
    }

    return { role, need_code, eventData, userEmail: userObj.email || "" };
  } catch (e) {
    console.error(e);
    return { role: "student_lobby", eventData: null, userEmail: "" };
  }
}