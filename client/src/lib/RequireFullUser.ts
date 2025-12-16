import { useNavigate } from "react-router";
import { useGetContext } from "./helper";
import { useEffect } from "react";

export function useRequireFullUser(message: string) {
  const context = useGetContext();
  const { authState } = context;
  const navigate = useNavigate();

  useEffect(() => {
    if (authState !== "FullUser") {
      const encodedMessage = encodeURIComponent(message);
      navigate(`/login?message=${encodedMessage}`);
    }
  }, [authState, message, navigate]);
}
