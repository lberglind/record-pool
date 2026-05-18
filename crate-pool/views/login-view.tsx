import  LoginButton  from "@/components/login-button";

interface LoginViewProps {
  authUrl: string;
}

export default function LoginView({ authUrl }: LoginViewProps) {
  return (
    <div className="flex w-full min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4">
      <h2 className="text-4xl font-bold mb-4">Welcome to Crate Pool</h2>
      <p>Please log in with your Slack account to continue.</p>
      <LoginButton href={authUrl} />
    </div>
  );
}
