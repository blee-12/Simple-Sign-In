import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { WEBSITE_URL } from "../lib/assets"; 

export const JoinEvent = () => {
  const { token } = useParams(); // matches the token id in the API/DB
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const performJoin = async () => {
      try {
        const response = await fetch(`${WEBSITE_URL}/events/join/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to join event");
        }

        if (!isMounted) return;

        navigate(`/event/${result._id}`); 

      } catch (err: any) {
        if (isMounted) setError(err.message);
      }
    };

    if (token) {
      performJoin();
    }
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-red-600 text-xl font-bold mb-2">Join Failed</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Verifying Ticket...</h2>
        <p className="text-gray-500">Please wait while we check you in.</p>
      </div>
    </div>
  );
};