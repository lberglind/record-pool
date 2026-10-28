"use client"
import { useUserStore } from "@/models/useUserStore";
import ProfileView from "@/views/profile-view";
import { useRouter } from "next/navigation";

export default function ProfilePresenter() {
  const userModel = useUserStore()
  const router = useRouter();
  const logout = useUserStore((state) => state.logout);

  function handleLogoutClick(): void {
    logout();
    router.push("/");
  }

  return (
    <ProfileView userModel={userModel} handleLogoutClick={handleLogoutClick} />
  )
}
