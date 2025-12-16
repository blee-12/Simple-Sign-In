import React, { useState, useEffect } from "react"; // Added useEffect
import { WEBSITE_URL } from "../lib/assets";

interface CheckedInUser {
  userID: string;
  timestamp: string;
}

interface StudentListProps {
  attendingUsers: string[];      
  checkedInUsers: CheckedInUser[]; 
  eventId: string
}

export const StudentList: React.FC<StudentListProps> = ({ attendingUsers, checkedInUsers, eventId }) => {
  const [attendeesList, setAttendeesList] = useState<string[]>(attendingUsers);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  useEffect(() => {
    setAttendeesList(attendingUsers);
  }, [attendingUsers]);

  const isCheckedIn = (studentId: string) => {
    return checkedInUsers.some((checkIn) => checkIn.userID === studentId);
  };

  const handleEmailReminders = () => {
    const missing = attendeesList.filter(id => !isCheckedIn(id));
    alert(`Sending reminder emails to ${missing.length} students... (Check console)`);
    console.log("Emailing reminders to:", missing);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail) return;

    const cleanEmail = newStudentEmail.trim();

    const response = await fetch(`${WEBSITE_URL}/events/${eventId}/register`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' 
        },
        credentials: 'include',
        body: JSON.stringify([cleanEmail])
      }
    )

    if (!response) {
        // do nothing.
    } else {
        setAttendeesList((prev) => [...prev, cleanEmail]);
    }

    setNewStudentEmail("");
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Class Roster</h3>
          
          <div className="flex gap-2">
            <button 
                onClick={() => setIsModalOpen(true)}
                className="text-sm bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
                + Register Student
            </button>

            <button 
                onClick={handleEmailReminders}
                className="text-sm bg-blue-100 text-blue-700 py-1 px-3 rounded hover:bg-blue-200 transition-colors"
            >
                Email Non-Attendees
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {attendeesList.length === 0 ? (
              <p className="text-gray-400 italic">No students registered.</p>
          ) : (
              attendeesList.map((studentId, index) => {
              const checkedIn = isCheckedIn(studentId);
              return (
                  <div key={`${studentId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                      <div className="flex flex-col">
                          <span className="font-mono text-xs text-gray-500">ID: {studentId}</span>
                          <span className="text-gray-800 font-medium">Student</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          {checkedIn ? (
                              <span className="flex items-center text-green-600 text-sm font-bold bg-green-100 px-2 py-1 rounded-full">
                                  ✓ Present
                              </span>
                          ) : (
                              <span className="text-gray-400 text-sm font-medium">
                                  Absent
                              </span>
                          )}
                      </div>
                  </div>
              );
              })
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Manually Register Student</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="student@university.edu"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};