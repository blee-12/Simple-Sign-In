import { useState, useEffect } from "react";
import {
  validateEmail,
  validateFirstName,
  validateLastName,
} from "../../../common/validation";
import { useGetContext, validationWrapper } from "../lib/helper";
import { WEBSITE_URL } from "../lib/assets";
import { BlurCard } from "./BlurCard";

type ThemeColors = "blue" | "purple" | "green" | "red" | "orange" | "yellow";

const themeColorClasses: Record<ThemeColors, string> = {
  blue: "bg-blue-500 hover:bg-blue-600 ring-blue-500",
  purple: "bg-purple-500 hover:bg-purple-600 ring-purple-500",
  green: "bg-green-500 hover:bg-green-600 ring-green-500",
  red: "bg-red-500 hover:bg-red-600 ring-red-500",
  orange: "bg-orange-500 hover:bg-orange-600 ring-orange-500",
  yellow: "bg-yellow-500 hover:bg-yellow-600 ring-yellow-500",
};

export function Profile() {
  const context = useGetContext();
  const { setTheme, theme } = context;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    theme: theme as ThemeColors,
    password: "", // new field
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Fetch profile on first render
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${WEBSITE_URL}/profile`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const json = await res.json();
        const data = json.data;
        console.log("Profile Data", data);
        setFormData((prev) => ({
          ...prev,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
        }));
      } catch (err) {
        console.log("Profile GET Error:", err);
      }
    }
    fetchProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  }

  function handleThemeSelect(color: ThemeColors) {
    setFormData({ ...formData, theme: color });
    setTheme(color);
    setSuccess(false);
  }

  async function handleUpdateProfile() {
    const newErrors: string[] = [];
    setSuccess(false);

    const first_name = validationWrapper(
      validateFirstName,
      formData.firstName,
      newErrors
    );
    const last_name = validationWrapper(
      validateLastName,
      formData.lastName,
      newErrors
    );
    const email = validationWrapper(validateEmail, formData.email, newErrors);

    setErrors(newErrors);

    if (newErrors.length === 0) {
      try {
        const res = await fetch(`${WEBSITE_URL}/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name,
            last_name,
            email,
            theme: formData.theme,
            ...(formData.password ? { password: formData.password } : {}),
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Update failed! Try again!");
        }

        const data = await res.json();
        console.log("Profile updated:", data);
        setSuccess(true);
        setFormData((prev) => ({ ...prev, password: "" }));
      } catch (err: unknown) {
        setErrors((prev) => {
          if (err instanceof Error) {
            return prev.concat(err.message);
          } else {
            return prev.concat(
              "Unknown error when updating profile. Try again!"
            );
          }
        });
      }
    }
  }

  return (
    <BlurCard title="Profile Settings">
      <div className="space-y-4">
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          readOnly
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />

        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Theme Color
          </label>
          <div className="grid grid-cols-6 gap-3">
            {(Object.keys(themeColorClasses) as ThemeColors[]).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleThemeSelect(color)}
                className={`w-12 h-12 rounded-lg transition-all ${
                  themeColorClasses[color].split(" ")[0]
                } ${
                  formData.theme === color
                    ? `ring-4 ${
                        themeColorClasses[color].split(" ")[2]
                      } scale-110`
                    : "hover:scale-105"
                }`}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Selected:{" "}
            {formData.theme.charAt(0).toUpperCase() + formData.theme.slice(1)}
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <p className="text-sm">Profile updated successfully!</p>
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
          onClick={handleUpdateProfile}
          className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg transition hover:bg-blue-600 active:bg-blue-700 mt-6 hover:cursor-pointer hover:scale-105"
        >
          Update Profile
        </button>
      </div>
    </BlurCard>
  );
}
