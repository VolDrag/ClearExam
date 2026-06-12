import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./auth-context";

export function useRequireAuth() {
  const { ready, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth", replace: true });
  }, [ready, user, navigate]);
  return { ready, user, authed: !!user };
}
