import { Link, NavLink } from "react-router";
import { User } from "lucide-react";
import { useContext } from "react";
import { AppContext } from "../lib/context";

export default function Navigation() {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error("Unable to get App Context!");
  }
  const { authState } = appContext;

  //check authState to verify that the user is authenticated
  const isAuthenticated = authState === "FullUser" || authState === "EmailOnly";

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            SimpleSignIn
          </Link>

          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`
              }
            >
              My Events
            </NavLink>

            <NavLink
              to={isAuthenticated ? "/logout" : "/login"}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isAuthenticated ? "Sign out" : "Sign in"}
            </NavLink>

            <NavLink
              to="/profile"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
