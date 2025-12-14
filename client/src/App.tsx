import { Route, Routes } from "react-router";
import "./App.css";
import { SignUp } from "./components/auth/SignUp";
import { LogIn } from "./components/auth/LogIn";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
    {/* TODO replace false with session auth context */}
    <Navbar isAuthenticated={false} />
      <Routes>
        <Route path="/signup" element={<SignUp />}></Route>
        <Route path="/login" element={<LogIn />}></Route>
      </Routes>
    </>
  );
}

export default App;
