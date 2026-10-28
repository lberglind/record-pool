import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "./ui/button";

export default function LoginButton({ href }: { href: string }) {
  return (
    <Button variant="outline">
      <Link href={href} className="flex items-center gap-2">
        Login with Slack
        <LogIn />
      </Link>
    </Button>
  );
}