import { LoginButton } from "@/components/login-button";

interface LoginViewProps {
  authUrl: string;
}

export const LoginView = ({ authUrl }: LoginViewProps) => {
  return (
    <LoginButton href={authUrl} />
  );
}
