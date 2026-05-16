"use client"
import { useUserStore } from "@/models/useUserStore";
import ProfileView from "@/views/profile-view";
import { useRouter } from "next/navigation";

export default function ProfilePresenter() {
    const userModel = useUserStore()
    const router = useRouter();
    
    function handleLogoutClick(): void {
        router.push("/logout");
    }

    return (
        <ProfileView userModel={userModel} handleLogoutClick={handleLogoutClick} />
    )
}