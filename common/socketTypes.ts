
export interface ClientToServerEvents {
  create_event: (eventName: string, callback: (eventId: string) => void) => void;
  check_in: (eventId: string, code: string, studentName: string) => void;
  send_message: (eventId: string, message: string) => void;
}

export interface ServerToClientEvents {
  code_update: (code: string) => void; // only to event creator
  student_checked_in: (studentName: string) => void;
  chat_message: (sender: string, message: string) => void;
  error: (msg: string) => void;
  success_join: () => void;
}