"use client"

import { useUserStore } from "@/models/useUserStore"
import { CallbackView } from "@/views/callback-view";
import { useRouter } from "next/navigation";
import { useEffect } from "react"

export default function CallbackPresenter() {
  const router = useRouter();
  const fetchUser = useUserStore((state) => state.fetchUser);
  const user = useUserStore((state) => state.user);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router]);

  return (
    <CallbackView />
  )
}
