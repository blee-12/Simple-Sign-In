import { useNavigate } from "react-router";
import { useGetContext } from "./helper";
import { useEffect } from "react";

export function useRequireFullUser(message: string) {
  const context = useGetContext();
  const { authState } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (authState !== "FullUser" && authState !== "loading") {
      const encodedMessage = encodeURIComponent(message);
      //delay until website can load profile/account info before navigating
      setTimeout(() => {
        if (authState === null || authState === "EmailOnly")
          navigate(`/login?message=${encodedMessage}`);
      }, 1500);
    }
  }, [authState, message, navigate]);
}
