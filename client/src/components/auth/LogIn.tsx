import { useState } from "react";
import { validateEmail, validatePassword } from "../../../../common/validation";
import { useLoginState, validationWrapper } from "../../lib/helper";
import { WEBSITE_URL } from "../../lib/assets";
import { Link, useNavigate, useSearchParams } from "react-router";
import { SolidCard } from "./SolidCard";

export function LogIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const setLoginState = useLoginState();

  //state for form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //array of errors
  const [errors, setErrors] = useState<string[]>([]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  //called when user hits the login button
  async function handleLogIn(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: string[] = [];

    //validate all information
    const email = validationWrapper(validateEmail, formData.email, newErrors);
    const password = validationWrapper(
      validatePassword,
      formData.password,
      newErrors
    );

    setErrors(newErrors);

    console.log("Errors: ", newErrors);

    //if there are no errors connect the server and request to login
    if (newErrors.length === 0) {
      try {
        const res = await fetch(`${WEBSITE_URL}/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Login failed! Try again!");
        }

        const data = await res.json();
        console.log("Login complete:", data);
        setLoginState("FullUser");
        navigate("/dashboard");
      } catch (err: unknown) {
        setErrors((prev) => {
          if (err instanceof Error) {
            return prev.concat(err.message);
          } else {
            return prev.concat("Unknown error when logging in. Try again!");
          }
        });
      }
    }
  }

  return (
    <SolidCard title="Log In">
      <form onSubmit={handleLogIn} className="space-y-4">
        {message !== "undefined" && message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}
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
          className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg transition hover:bg-blue-600 active:bg-blue-700 mt-6 hover:cursor-pointer hover:scale-105"
        >
          Log In
        </button>

        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            Sign Up!
          </Link>
        </p>
      </form>
    </SolidCard>
  );
}
