"use client"
import { useUserStore } from "@/models/useUserStore";
import LoginView from "@/views/login-view";
import { useEffect } from "react";

export default function LoginPresenter() {
  const fetchUser = useUserStore((s) => s.fetchUser);
  const user = useUserStore((s) => s.user);
  const authUrl = useUserStore((s) => s.slackAuthUrl);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  if (user) {
    return null
  }
  return <LoginView authUrl={authUrl} />;
}
