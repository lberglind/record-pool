import { LoginButton } from "@/components/login-button";

interface LoginViewProps {
  authUrl: string;
}

export default function LoginView({ authUrl }: LoginViewProps) {
  return (
    <LoginButton href={authUrl} />
  );
}
