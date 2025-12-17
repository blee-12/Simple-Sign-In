
export interface ClientToServerEvents {
  join_creator: (eventId: string) => void;
  create_event: (eventName: string, callback: (eventId: string) => void) => void;
  check_in: (eventId: string, code: string, studentName: string) => void;
  send_message: (eventId: string, message: string) => void;
  is_active: (eventId: string) => void;
  check_in_no_code: (eventId: string, email: string) => void;
  rejoin: (eventId: string) => void;
}

export interface ServerToClientEvents {
  code_update: (code: string) => void; // only to event creator
  user_checked_in: (checkInData: { userID: string; timestamp: string }) => void
  chat_message: (sender: string, message: string) => void;
  error: (msg: string) => void;
  success_join: () => void;
  not_active: () => void;
  active: () => void;
}