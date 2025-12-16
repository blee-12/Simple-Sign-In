import { useNavigate } from "react-router";
import { useGetContext } from "./helper";
import { useEffect } from "react";

export function RedirectIfLoggedIn() {
  const context = useGetContext();
  const { authState } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (authState === "FullUser") {
      navigate(`/dashboard`);
    }
  }, [authState, navigate]);
}
