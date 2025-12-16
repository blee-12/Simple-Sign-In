//verify that a user is logged in and that they are a full user

import { LogIn } from "../components/auth/LogIn";
import { useGetContext } from "./helper";

//used for router that need a user to be a full user to access them
export function RequireFullUser({ message }: { message: string }) {
  const context = useGetContext();
  const { authState } = context;

  if (authState !== "FullUser") {
    return (
      <>
        <LogIn message={message}></LogIn>
      </>
    );
  }
}
