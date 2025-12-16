import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { WEBSITE_URL } from "../../lib/assets";
import { BlurCard } from "../BlurCard";
import { useRequireFullUser } from "../../lib/RequireFullUser";

import trashIcon from "../../assets/trash.svg";
import editIcon from "../../assets/edit.svg";

export interface Event {
  _id: string;
  created_by: string;
  name: string;
  time_start: string;
  time_end: string;
  attending_users: string[];
  checked_in_users: unknown[];
  code: string | null;
  description: string;
}

export function EventDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ _id: string; email: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useRequireFullUser("You must have an account to view your dashboard");

  useEffect(() => {
    async function fetchAll() {
      try {
        const profileRes = await fetch(`${WEBSITE_URL}/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (!profileRes.ok) throw new Error("Failed to load profile");
        const profileJson = await profileRes.json();
        setUser({
          _id: profileJson.data._id,
          email: profileJson.data.email,
        });

        const eventsRes = await fetch(`${WEBSITE_URL}/events`, {
          method: "GET",
          credentials: "include",
        });
        if (!eventsRes.ok) throw new Error("Failed to load events");
        const eventsJson = await eventsRes.json();
        setEvents(eventsJson.data ?? eventsJson);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [current, setCurrent] = useState<Event[]>([]);
  const [created, setCreated] = useState<Event[]>([]);
  const [attended, setAttended] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const nextUpcoming: Event[] = [];
    const nextCreated: Event[] = [];
    const nextAttended: Event[] = [];
    const currentlyRunning: Event[] = [];

    for (const e of events) {
      const start = new Date(e.time_start);
      const end = new Date(e.time_end);
      
      const isAttending = e.attending_users.includes(user.email);
      const isCreator = e.created_by === user._id;

      if (start > now && isAttending) nextUpcoming.push(e);
      if (isCreator) nextCreated.push(e);
      if (end < now && isAttending) {
        nextAttended.push(e);
      }
      if (start >= now && end <= now && isAttending) currentlyRunning.push(e)
    }

    setUpcoming(nextUpcoming);
    setCreated(nextCreated);
    setAttended(nextAttended);
    setCurrent(currentlyRunning);
    
  }, [events, user]);

  if (loading) {
    return (
      <BlurCard title="Dashboard">
        <p className="text-gray-500">Loading events…</p>
      </BlurCard>
    );
  }

  if (error) {
    return (
      <BlurCard title="Dashboard">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </BlurCard>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Event Dashboard</h1>
        <button
          onClick={() => navigate("/create/event")}
          className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:scale-105 hover:cursor-pointer"
        >
          + Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <BlurCard title="Events Running Now">
          <EventList 
          events={current}
          user={user}
          emptyText="Not registered for any running events" />
        </BlurCard>

        <BlurCard title="Upcoming Events">
          <EventList
            events={upcoming}
            user={user}
            emptyText="No upcoming events"
          />
        </BlurCard>

        <BlurCard title="Events You've Attended">
          <EventList
            events={attended}
            user={user}
            emptyText="No past attended events"
          />
        </BlurCard>

        <BlurCard title="Events You've Created">
          <EventList
            user={user}
            events={created}
            emptyText="You haven't created any events"
          />
        </BlurCard>
      </div>
    </div>
  );
}

function EventList({
  events,
  emptyText,
  user,
}: {
  events: Event[];
  emptyText: string;
  user: { _id: string; email: string } | null;
}) {
  if (events.length === 0) {
    return <p className="text-gray-500 text-sm">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event._id}
          className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:shadow-sm transition hover:scale-105"
        >
          <div className="flex justify-between items-start">
            <Link to={`/event/${event._id}`} className="flex-1 hover:underline">
              <div>
                <h3 className="font-semibold text-gray-800">{event.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(event.time_start).toLocaleString()} –{" "}
                  {new Date(event.time_end).toLocaleString()}
                </p>
              </div>

              {event.code && (
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {event.code}
                </span>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Description: {event.description}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Attendees: {event.attending_users.length}
              </p>
            </Link>

            {/* Only show if user is creator */}
            {user && event.created_by === user._id && (
              <div className="flex space-x-2 ml-4">
                <Link
                  to={`/event/edit/${event._id}`}
                  className="p-2 rounded hover:bg-gray-200 transition"
                >
                  <img src={editIcon} alt="Edit" className="w-5 h-5" />
                </Link>
                <Link
                  to={`/event/delete/${event._id}`}
                  className="p-2 rounded hover:bg-gray-200 transition"
                >
                  <img src={trashIcon} alt="Delete" className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
