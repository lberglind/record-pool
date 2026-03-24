"use client"
import { useUserStore } from "@/models/useUserStore";
import { LoginView } from "@/views/login-view";
import { useEffect } from "react";

export default function LoginPresenter() {
  const authUrl = useUserStore((state) => state.slackAuthUrl);
  const user = useUserStore((s) => s.user);
  const me = useUserStore((s) => s.fetchUser);
  useEffect(() => {
    me();
  }, [me]);
  if (!user) {
    return (
      <LoginView authUrl={authUrl} />
    )
  }
}
