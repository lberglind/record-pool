"use client"
import { useUserStore } from "@/models/useUserStore";
import LoginView from "@/views/login-view";

export default function LoginPresenter() {
  const authUrl = useUserStore((state) => state.slackAuthUrl);

  if (authUrl) {
    return <LoginView authUrl={authUrl} />;
  }

  return null;
}
