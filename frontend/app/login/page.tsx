import { API_URL } from "@/lib/api";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Login To Record Pool</h1>
      <a
        href={`${API_URL}/auth/slack`}
        className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
      >
        Login With Slack
      </a>
    </div>
  );
}
