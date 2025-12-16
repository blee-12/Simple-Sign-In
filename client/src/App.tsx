import { Route, Routes } from "react-router";
import "./App.css";
import { SignUp } from "./components/auth/SignUp";
import { LogIn } from "./components/auth/LogIn";
import { EventPage } from "./components/EventPage"

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/login" element={<LogIn />}></Route>
        <Route path="/event/:id" element={<EventPage />}></Route>
      </Routes>
    </>
  );
}

export default App;
