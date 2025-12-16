import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WEBSITE_URL } from "../../lib/assets";
import { BlurCard } from "../BlurCard";
import { useRequireFullUser } from "../../lib/RequireFullUser";

export interface Event {
  _id: string;
  created_by: string;
  name: string;
  time_start: string;
  time_end: string;
  attending_users: string[];
  checked_in_users: unknown[];
  code: string | null;
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
  const [created, setCreated] = useState<Event[]>([]);
  const [attended, setAttended] = useState<Event[]>([]);

  useEffect(() => {
    if (!user) return;

    const now = new Date();
    const nextUpcoming: Event[] = [];
    const nextCreated: Event[] = [];
    const nextAttended: Event[] = [];

    for (const e of events) {
      const start = new Date(e.time_start);
      const end = new Date(e.time_end);

      if (start > now) nextUpcoming.push(e);
      if (e.created_by === user._id) nextCreated.push(e);
      if (end < now && e.attending_users.includes(user.email)) {
        nextAttended.push(e);
      }
    }

    setUpcoming(nextUpcoming);
    setCreated(nextCreated);
    setAttended(nextAttended);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BlurCard title="Upcoming Events">
          <EventList events={upcoming} emptyText="No upcoming events" />
        </BlurCard>

        <BlurCard title="Events You've Attended">
          <EventList events={attended} emptyText="No past attended events" />
        </BlurCard>

        <BlurCard title="Events You've Created">
          <EventList
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
}: {
  events: Event[];
  emptyText: string;
}) {
  if (events.length === 0) {
    return <p className="text-gray-500 text-sm">{emptyText}</p>;
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event._id}
          className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex justify-between items-start">
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
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Attendees: {event.attending_users.length}
          </p>
        </li>
      ))}
    </ul>
  );
}
