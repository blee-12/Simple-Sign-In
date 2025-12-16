import React from "react";

interface CheckedInUser {
  userID: string;
  timestamp: string;
}

interface StudentListProps {
  attendingUsers: string[];      
  checkedInUsers: CheckedInUser[]; 
}

export const StudentList: React.FC<StudentListProps> = ({ attendingUsers, checkedInUsers }) => {
  
  const isCheckedIn = (studentId: string) => {
    return checkedInUsers.some((checkIn) => checkIn.userID === studentId);
  };

  const handleEmailReminders = () => {
    const missing = attendingUsers.filter(id => !isCheckedIn(id));
    alert(`Sending reminder emails to ${missing.length} students... (Check console)`);
    console.log("Emailing reminders to:", missing);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">Class Roster</h3>
        <button 
            onClick={handleEmailReminders}
            className="text-sm bg-blue-100 text-blue-700 py-1 px-3 rounded hover:bg-blue-200 transition-colors"
        >
            Email Non-Attendees
        </button>
      </div>

      <div className="space-y-2">
        {attendingUsers.length === 0 ? (
            <p className="text-gray-400 italic">No students registered.</p>
        ) : (
            attendingUsers.map((studentId) => {
            const checkedIn = isCheckedIn(studentId);
            return (
                <div key={studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="flex flex-col">
                        <span className="font-mono text-xs text-gray-500">ID: {studentId}</span>
                        {/* If you populate names later, render them here */}
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
  );
};