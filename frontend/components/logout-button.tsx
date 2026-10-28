import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
    onLogout: () => void | Promise<void>;
}

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
    return (
        <Button variant="destructive" className="max-w-xs"  onClick={onLogout}>
            Logout
        </Button>
    );
}
