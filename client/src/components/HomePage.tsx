import { Link } from "react-router";

function InfoCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="bg-white/60 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/80">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Simple Sign In
          </h1>
          <p className="text-gray-600">
            Making attendance tracking simple and effortless
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InfoCard title="Our Mission">
            <p className="text-gray-700 leading-relaxed">
              Our Mission at Simple Sign In is to make it easy to take
              attendance. We're designed for teachers, students, event
              organizers, anyone who needs to keep track of a large number of
              people. Current solutions require navigating clunky UI, or
              creating accounts. Simple Sign In just requires event attendees to
              use their email.
            </p>
          </InfoCard>

          <InfoCard title="How to Get Started as an Event Organizer">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Create an Account
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Event organizers are required to create an account to create
                  events. Once you've signed up you can head to your event
                  dashboard and create an event.
                </p>
              </div>
            </div>
          </InfoCard>
        </div>

        <div className="mb-6">
          <InfoCard title="How to Attend as an Event Attendee">
            <p className="text-gray-700 leading-relaxed">
              If you already have an account simply sign in, and you'll see the
              event. If not no worries! Ask the event organizer to send an email
              and you can check in with the link that arrives.
            </p>
          </InfoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard title="Get Started">
            <div className="text-center py-4">
              <p className="text-gray-700 mb-4">
                Create an account to make and manage events
              </p>
              <Link to="/signup">
                <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:cursor-pointer hover:scale-105">
                  Create Account
                </button>
              </Link>
            </div>
          </InfoCard>

          <InfoCard title="Already Registered?">
            <div className="text-center py-4">
              <p className="text-gray-700 mb-4">
                Login to view your meetings and check in
              </p>
              <Link to="/login">
                <button className="bg-white text-gray-700 font-semibold px-6 py-3 rounded-lg shadow-sm transition-all hover:bg-gray-50 hover:shadow-md hover:cursor-pointer hover:scale-105 border border-gray-300">
                  Login
                </button>
              </Link>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
}
