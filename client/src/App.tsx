import { Route, Routes } from "react-router";
import "./App.css";
import { SignUp } from "./components/auth/SignUp";
import { LogIn } from "./components/auth/LogIn";
import Navbar from "./components/Navbar";
import { ContextWrapper } from "./components/ContextWrapper";

function App() {
  return (
    <ContextWrapper>
      <>
        {/* TODO replace false with session auth context */}
        <Navbar />
        <Routes>
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="/login" element={<LogIn />}></Route>
        </Routes>
      </>
    </ContextWrapper>
  );
}

export default App;
