import { Route, Routes } from "react-router";
import "./App.css";
import { SignUp } from "./components/auth/SignUp";
import { LogIn } from "./components/auth/LogIn";
import Navbar from "./components/Navbar";
import { ContextWrapper } from "./components/ContextWrapper";
import { Profile } from "./components/Profile";
import { Background } from "./components/Background";
import SignOut from "./components/auth/SignOut";

function App() {
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
          </Routes>
        </>
      </Background>
    </ContextWrapper>
  );
}

export default App;
