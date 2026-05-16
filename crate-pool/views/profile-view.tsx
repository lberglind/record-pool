import { UserStore } from "@/models/useUserStore";
import Image from "next/image";
import LogoutButton from "@/components/logout-button";

interface ProfileViewProps {
    userModel: UserStore;
    handleLogoutClick: () => void
}

export default function ProfileView({ userModel, handleLogoutClick }: ProfileViewProps) {

    return (
        <div className="flex flex-col gap-4 w-full mx-auto container">
            <p>Hi, {userModel.user?.email}!</p>
            <Image src={userModel.user?.avatar || "/default-avatar.png"} alt="Avatar" width={300} height={300} />
            <LogoutButton onLogout={handleLogoutClick} />
        </div>
    )
}