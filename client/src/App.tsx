import { Route, Routes, useLocation } from "react-router";
import "./App.css";
import { SignUp } from "./components/auth/SignUp";
import { LogIn } from "./components/auth/LogIn";
import Navbar from "./components/Navbar";
import { ContextWrapper } from "./components/ContextWrapper";
import { Profile } from "./components/Profile";
import { Background } from "./components/Background";
import SignOut from "./components/auth/SignOut";
import { EventDashboard } from "./components/events/EventDashboard";
import CreateEvent from "./components/events/CreateEvent";
import { EventPage } from "./components/EventPage";
import EditEvent from "./components/events/EditEvent";
import DeleteEvent from "./components/events/DeleteEvent";
import ErrorPage from "./components/ErrorPage";

function App() {
  const location = useLocation();

  return (
    <ContextWrapper>
      <Background>
        <>
          {/* TODO replace false with session auth context */}
          <Navbar />
          <Routes>
            <Route path="/signup" element={<SignUp />}></Route>
            <Route path="/login" element={<LogIn />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/signout" element={<SignOut />}></Route>
            <Route path="/dashboard" element={<EventDashboard />}></Route>
            <Route path="/create/event" element={<CreateEvent />}></Route>
            <Route path="/event/edit/:id" element={<EditEvent />}></Route>
            <Route path="event/delete/:id" element={<DeleteEvent />}></Route>
            <Route path="/event/:id" element={<EventPage />}></Route>
            <Route
              path="*"
              element={
                <ErrorPage
                  code={404}
                  message={`Route not found: ${location.pathname}`}
                />
              }
            />
          </Routes>
        </>
      </Background>
    </ContextWrapper>
  );
}

export default App;
