import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { WEBSITE_URL } from "../../lib/assets";
import TrashIconUrl from "../../assets/trash.svg";
import EditIconUrl from "../../assets/edit.svg";

// icons
const TrashIcon = () => (
  <img
    src={TrashIconUrl}
    alt="Back"
    className="w-5 h-5 hover:cursor-pointer hover:scale-105"
  />
);

const EditIcon = () => (
  <img
    src={EditIconUrl}
    alt="Edit"
    className="w-5 h-5 hover:cursor-pointer hover:scale-105"
  ></img>
);

function DashboardCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="bg-white/60 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/80">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

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

interface Filters {
  minAttendees: number;
  maxAttendees: number;
  dateRange:
    | "all"
    | "past-week"
    | "past-month"
    | "past-year"
    | "next-week"
    | "next-month";
  searchTerm: string;
}

export function EventDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ _id: string; email: string } | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const [filters, setFilters] = useState<Filters>({
    minAttendees: 0,
    maxAttendees: 999999,
    dateRange: "all",
    searchTerm: "",
  });

  const [upcoming, setUpcoming] = useState<Event[]>([]);
  const [current, setCurrent] = useState<Event[]>([]);
  const [created, setCreated] = useState<Event[]>([]);
  const [attended, setAttended] = useState<Event[]>([]);

  const applyFilters = (eventList: Event[]) => {
    return eventList.filter((e) => {
      if (e.attending_users.length < filters.minAttendees) return false;
      if (e.attending_users.length > filters.maxAttendees) return false;

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const matchesName = e.name?.toLowerCase().includes(term);
        const matchesDesc = e.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc) return false;
      }

      if (filters.dateRange !== "all") {
        const now = new Date();
        const eventDate = new Date(e.time_start);
        const daysDiff = Math.floor(
          (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        switch (filters.dateRange) {
          case "past-week":
            if (daysDiff < 0 || daysDiff > 7) return false;
            break;
          case "past-month":
            if (daysDiff < 0 || daysDiff > 30) return false;
            break;
          case "past-year":
            if (daysDiff < 0 || daysDiff > 365) return false;
            break;
          case "next-week":
            if (daysDiff > 0 || daysDiff < -7) return false;
            break;
          case "next-month":
            if (daysDiff > 0 || daysDiff < -30) return false;
            break;
        }
      }

      return true;
    });
  };

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

      if (isCreator) nextCreated.push(e);
      if (isAttending) {
        if (start > now) {
          nextUpcoming.push(e);
        } else if (end < now) {
          nextAttended.push(e);
        } else {
          currentlyRunning.push(e);
        }
      }
    }

    setUpcoming(applyFilters(nextUpcoming));
    setCreated(applyFilters(nextCreated));
    setCurrent(applyFilters(currentlyRunning));

    setAttended(applyFilters(nextAttended));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, user, filters]);

  const resetFilters = () => {
    setFilters({
      minAttendees: 0,
      maxAttendees: 999999,
      dateRange: "all",
      searchTerm: "",
    });
  };

  const hasActiveFilters =
    filters.minAttendees > 0 ||
    filters.maxAttendees < 999999 ||
    filters.dateRange !== "all" ||
    filters.searchTerm !== "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardCard title="Dashboard">
            <div className="text-center py-8">
              <p className="text-gray-500">Loading events…</p>
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardCard title="Dashboard">
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Dashboard</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all hover:shadow-md hover:cursor-pointer hover:scale-105 ${
                hasActiveFilters
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            <button
              onClick={() => navigate("/create/event")}
              className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:cursor-pointer hover:scale-105"
            >
              + Create Event
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="mb-8">
            <DashboardCard title="Filters">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Search Events
                  </label>
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    placeholder="Search by name or description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Min Attendees
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minAttendees}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minAttendees: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={
                      filters.maxAttendees === 999999
                        ? ""
                        : filters.maxAttendees
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxAttendees: parseInt(e.target.value) || 999999,
                      })
                    }
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        dateRange: e.target.value as Filters["dateRange"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="past-week">Past Week</option>
                    <option value="past-month">Past Month</option>
                    <option value="past-year">Past Year</option>
                    <option value="next-week">Next Week</option>
                    <option value="next-month">Next Month</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition text-sm ${
                      hasActiveFilters
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </DashboardCard>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <DashboardCard title="Events Running Now">
            <EventList
              events={current}
              user={user}
              emptyText="Not registered for any running events"
            />
          </DashboardCard>

          <DashboardCard title="Upcoming Events">
            <EventList
              events={upcoming}
              user={user}
              emptyText="No upcoming events"
            />
          </DashboardCard>

          <DashboardCard title="Past Events">
            <EventList
              events={attended}
              user={user}
              emptyText="No past attended events"
            />
          </DashboardCard>

          <DashboardCard title="Events You've Created">
            <EventList
              user={user}
              events={created}
              emptyText="You haven't created any events"
            />
          </DashboardCard>
        </div>
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
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li
          key={event._id}
          className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {event.name}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(event.time_start).toLocaleString()} –{" "}
                {new Date(event.time_end).toLocaleString()}
              </p>

              {event.code && (
                <span className="inline-block text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-2">
                  {event.code}
                </span>
              )}

              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {event.description}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {event.attending_users.length} attendee
                {event.attending_users.length !== 1 ? "s" : ""}
              </p>
            </div>

            {user && event.created_by === user._id && (
              <div className="flex gap-1 flex-shrink-0">
                <button className="p-2 rounded hover:bg-gray-200 transition text-gray-600 hover:text-blue-600">
                  <EditIcon />
                </button>
                <button className="p-2 rounded hover:bg-gray-200 transition text-gray-600 hover:text-red-600">
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
