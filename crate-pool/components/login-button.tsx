import { LogIn } from "lucide-react"
import { buttonVariants } from "./ui/button"

interface Props {
  href: string;
  label?: string;
}

export const LoginButton = ({ href, label = "Login with Slack" }: Props) => {
  return (
    <a href={href} className={buttonVariants({ variant: "secondary" })}>
      {label}
      <LogIn />
    </a>
  );
}

