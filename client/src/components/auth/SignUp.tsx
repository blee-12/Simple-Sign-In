import { useState } from "react";
import {
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePassword,
} from "../../lib/validation";
import { validationWrapper } from "../../lib/helper";
import { WEBSITE_URL } from "../../lib/assets";
import { useNavigate } from "react-router";
import { AuthCard } from "./AuthCard";

export function SignUp() {
  const navigate = useNavigate();

  //state for form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  //array of errors
  const [errors, setErrors] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  //called when user hits the signup button
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: string[] = [];

    //validate all information
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
    const password = validationWrapper(
      validatePassword,
      formData.password,
      newErrors
    );

    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords must match!");
    }

    setErrors(newErrors);

    //if there are no errors connect the server and request to login
    if (newErrors.length === 0) {
      try {
        const res = await fetch(`${WEBSITE_URL}/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name,
            last_name,
            email,
            password,
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Signup failed! Try again!");
        }

        const data = await res.json();
        console.log("Signup complete:", data);
        navigate("/dashboard");
      } catch (err: unknown) {
        setErrors((prev) => {
          if (err instanceof Error) {
            return prev.concat(err.message);
          } else {
            return prev.concat("Unknown error when signing up. Try again!");
          }
        });
      }
    }
  }

  return (
    <AuthCard title="Sign Up">
      <form onSubmit={handleSignUp} className="space-y-4">
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
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
        />

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
          type="submit"
          className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg transition hover:bg-blue-600 active:bg-blue-700 mt-6 hover:cursor-pointer   hover:scale-105"
        >
          Sign Up
        </button>
      </form>
    </AuthCard>
  );
}
