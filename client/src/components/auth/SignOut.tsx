import { useNavigate } from "react-router";
import { useGetContext } from "../../lib/helper";
import { SolidCard } from "./SolidCard";
import { useEffect, useState } from "react";
import { WEBSITE_URL } from "../../lib/assets";

type SignOutState = "inProgress" | "complete" | "error";

export default function SignOut() {
  const { authState } = useGetContext();
  const navigate = useNavigate();
  const [isSignedOut, setSignedOut] = useState<SignOutState>("inProgress");

  async function handleSignout() {
    try {
      const res = await fetch(`${WEBSITE_URL}/signout`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        setSignedOut("error");
        return;
      }
      setSignedOut("complete");
    } catch {
      setSignedOut("error");
    }
  }

  // If user is already logged out redirect to /login
  if (authState === null) {
    navigate("/login");
  }

  useEffect(() => {
    handleSignout();
  }, []);

  return (
    <SolidCard title="Sign Out">
      <div className="space-y-4">
        {isSignedOut === "inProgress" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
            <p className="text-sm">You are being signed out...</p>
          </div>
        )}

        {isSignedOut === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="text-sm">
              There was an error signing out! Reload the page and try again.
            </p>
          </div>
        )}

        {isSignedOut === "complete" && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            <p className="text-sm">You are now successfully signed out!</p>
          </div>
        )}

        {isSignedOut === "complete" && (
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-500 text-white font-medium py-3 rounded-lg transition hover:bg-blue-600 active:bg-blue-700 mt-6 hover:cursor-pointer hover:scale-105"
          >
            Go Home
          </button>
        )}
      </div>
    </SolidCard>
  );
}
