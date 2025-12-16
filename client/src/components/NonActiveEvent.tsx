import React from "react";

interface NonActiveProps {
  eventName: string;
}

export const NonActiveEvent: React.FC<NonActiveProps> = ({ eventName }) => {

    // nah we can just have them refresh the page tbh.

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
            
            {/* Visual Icon */}
            <div className="mx-auto h-24 w-24 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 text-indigo-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </div>

            {/* Main Content */}
            <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                Not quite ready yet
            </h2>
            <p className="mt-2 text-lg text-gray-600">
                <span className="font-semibold text-gray-800">{eventName}</span> hasn't started just yet. 
                Hang tight, we are setting things up!
            </p>
            </div>

            {/* Action Button */}
            <div className="mt-8">
            <button
                onClick={handleRefresh}
                type="button"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
                <svg 
                    className="-ml-1 mr-3 h-5 w-5" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Check for updates
            </button>
            
            <p className="mt-4 text-sm text-gray-400">
                Is this taking longer than expected? Contact the event organizer.
            </p>
            </div>
        </div>
        </div>
    );
};
