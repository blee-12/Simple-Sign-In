import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { WEBSITE_URL } from "../../lib/assets";
import { BlurCard } from "../BlurCard";
import { useRequireFullUser } from "../../lib/RequireFullUser";
import BackButton from "../UI/BackButton";

export default function DeleteEvent() {
  const { id } = useParams<{ id: string }>();

  const [eventData, setEventData] = useState<{
    name: string;
    time_start: string;
    time_end: string;
    description: string;
  } | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useRequireFullUser("You must have an account to delete an event");

  // Load existing event data
  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`${WEBSITE_URL}/events/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch event data");
        let data = await res.json();
        data = data?.data;
        setEventData({
          name: data.name || "",
          time_start: data.time_start || "",
          time_end: data.time_end || "",
          description: data.description || "",
        });
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Error loading event"]);
      }
    }
    fetchEvent();
  }, [id]);

  async function handleDeleteEvent() {
    setErrors([]);
    setSuccess(false);

    try {
      const res = await fetch(`${WEBSITE_URL}/events/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Event deletion failed! Try again!");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setErrors((prev) =>
        err instanceof Error
          ? prev.concat(err.message)
          : prev.concat("Unknown error when deleting event. Try again!")
      );
    }
  }

  return (
    <BlurCard title="Delete Event">
      <div className="pb-5">
        <BackButton />
      </div>
      <div className="space-y-4">
        {!eventData && errors.length === 0 && (
          <p className="text-gray-600">Loading event details...</p>
        )}

        {eventData && (
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">
              {eventData.name}
            </p>
            <p className="text-sm text-gray-600">
              Start: {new Date(eventData.time_start).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              End: {new Date(eventData.time_end).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">{eventData.description}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <p className="text-sm">Event deleted successfully!</p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <ul className="space-y-1">
              {errors.map((err, idx) => (
                <li key={idx} className="text-sm">
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!success && eventData && (
          <>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full bg-red-500 text-white font-medium py-3 rounded-lg transition hover:bg-red-600 active:bg-red-700 mt-6 hover:cursor-pointer hover:scale-105"
              >
                Confirm Delete
              </button>
            ) : (
              <button
                onClick={handleDeleteEvent}
                className="w-full bg-red-700 text-white font-medium py-3 rounded-lg transition hover:bg-red-800 active:bg-red-900 mt-6 hover:cursor-pointer hover:scale-105"
              >
                Permanently Delete Event
              </button>
            )}
          </>
        )}
      </div>
    </BlurCard>
  );
}
