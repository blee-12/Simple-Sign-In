import { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  validateAndTrimString,
  validateStartEndDates,
} from "../../../../common/validation";
import { WEBSITE_URL } from "../../lib/assets";
import { BlurCard } from "../BlurCard";
import { useRequireFullUser } from "../../lib/RequireFullUser";
import BackButton from "../UI/BackButton";

function toLocalDatetimeInput(isoString: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toISOString().slice(0, 16);
}

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    name: "",
    time_start: "",
    time_end: "",
    description: "",
  });

  useRequireFullUser("You must have an account to edit an event");

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

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
        console.log(data.time_end);
        setFormData({
          name: data.name || "",
          time_start: data.time_start
            ? toLocalDatetimeInput(data.time_start)
            : "",
          time_end: data.time_end ? toLocalDatetimeInput(data.time_end) : "",
          description: data.description || "",
        });
      } catch (err) {
        setErrors([err instanceof Error ? err.message : "Error loading event"]);
      }
    }
    fetchEvent();
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setSuccess(false);
  }

  async function handleEditEvent() {
    const newErrors: string[] = [];
    setSuccess(false);

    // Validate event name
    try {
      validateAndTrimString(formData.name, "Event Name", 5, 100);
    } catch (err) {
      newErrors.push(err instanceof Error ? err.message : "Invalid Event Name");
    }

    // Validate description
    try {
      validateAndTrimString(formData.description, "Event Description", 5, 200);
    } catch (err) {
      newErrors.push(
        err instanceof Error ? err.message : "Invalid Event Description"
      );
    }

    if (!formData.time_start) newErrors.push("Start time is required");
    if (!formData.time_end) newErrors.push("End time is required");

    try {
      validateStartEndDates(
        new Date(formData.time_start),
        new Date(formData.time_end)
      );
    } catch (err) {
      newErrors.push(err instanceof Error ? err.message : "Date Input Error");
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      try {
        const res = await fetch(`${WEBSITE_URL}/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            time_start: formData.time_start,
            time_end: formData.time_end,
            description: formData.description.trim(),
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Event update failed! Try again!");
        }

        const data = await res.json();
        console.log("Event updated:", data);

        setSuccess(true);
      } catch (err: unknown) {
        setErrors((prev) =>
          err instanceof Error
            ? prev.concat(err.message)
            : prev.concat("Unknown error when updating event. Try again!")
        );
      }
    }
  }

  return (
    <BlurCard title="Edit Event">
      <div className="pb-5">
        <BackButton />
      </div>
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Event Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="time_start"
            value={formData.time_start}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            name="time_end"
            value={formData.time_end}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter event description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
          />
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <p className="text-sm">Event updated successfully!</p>
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

        <button
          onClick={handleEditEvent}
          className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg transition hover:bg-blue-600 active:bg-blue-700 mt-6 hover:cursor-pointer hover:scale-105"
        >
          Update Event
        </button>
      </div>
    </BlurCard>
  );
}
