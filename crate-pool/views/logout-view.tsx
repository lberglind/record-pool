import LogoutButton from "@/components/logout-button";

interface LogoutViewProps {
    onLogout: () => void
}

export default function LogoutView({ onLogout }: LogoutViewProps) {
    return (
        <LogoutButton onLogout={onLogout} />
    );
}