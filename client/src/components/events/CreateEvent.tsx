import { useState } from "react";
import {
  validateAndTrimString,
  validateEmail,
  validateStartEndDates,
} from "../../../../common/validation";
import { validationWrapper } from "../../lib/helper";
import { WEBSITE_URL } from "../../lib/assets";
import { BlurCard } from "../BlurCard";
import { useRequireFullUser } from "../../lib/RequireFullUser";

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    name: "",
    time_start: "",
    time_end: "",
    attendeeEmails: "",
    requires_code: false,
    description: "",
  });

  useRequireFullUser("You must have an account to create an event");

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    const newValue =
      e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });
    setSuccess(false);
  }

  async function handleCreateEvent() {
    const newErrors: string[] = [];
    setSuccess(false);

    // Validate event name
    try {
      validateAndTrimString(formData.name, "Event Name", 5, 100);
    } catch (err) {
      newErrors.push(err instanceof Error ? err.message : "Invalid Event Name");
    }

    // Validate Event Description
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

    const emailList = formData.attendeeEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (emailList.length === 0) {
      newErrors.push("At least one attendee email is required");
    } else {
      emailList.forEach((email) => {
        validationWrapper(validateEmail, email, newErrors);
      });
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      try {
        const res = await fetch(`${WEBSITE_URL}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            time_start: formData.time_start,
            time_end: formData.time_end,
            attending_users: emailList,
            requires_code: formData.requires_code,
            description: formData.description.trim(),
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Event creation failed! Try again!");
        }

        const data = await res.json();
        console.log("Event created:", data);

        setSuccess(true);
        setFormData({
          name: "",
          time_start: "",
          time_end: "",
          attendeeEmails: "",
          requires_code: false,
          description: "",
        });
      } catch (err: unknown) {
        setErrors((prev) =>
          err instanceof Error
            ? prev.concat(err.message)
            : prev.concat("Unknown error when creating event. Try again!")
        );
      }
    }
  }

  return (
    <BlurCard title="Create Event">
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
            Attendee Emails
          </label>
          <textarea
            name="attendeeEmails"
            placeholder="Enter emails separated by commas"
            value={formData.attendeeEmails}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
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

        {/* Tailwind taken from: https://flowbite.com/docs/forms/toggle/ */}
        <label className="w-full inline-flex cursor-pointer p-4 bg-gray-50 border border-gray-300 rounded-lg shadow-sm items-center">
          <input
            type="checkbox"
            name="requires_code"
            checked={formData.requires_code}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div
            className="shrink-0 relative w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full 
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
                  peer-checked:bg-blue-600 peer-checked:after:translate-x-full"
          ></div>
          <div className="ml-3 select-none">
            <p className="text-sm font-medium text-gray-900">
              Require 4-digit Code
            </p>
            <p className="text-xs text-gray-500">
              Attendees must enter a random code that changes every 30 seconds
              to join
            </p>
          </div>
        </label>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <p className="text-sm">Event created successfully!</p>
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
          onClick={handleCreateEvent}
          className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg transition hover:bg-blue-600 active:bg-blue-700 mt-6 hover:cursor-pointer hover:scale-105"
        >
          Create Event
        </button>
      </div>
    </BlurCard>
  );
}
