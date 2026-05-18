"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/models/useUserStore";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

export default function LogoutPresenter() {
  const router = useRouter();
  const userModel = useUserStore()

  useEffect(() => {
    userModel.logout().then(() => {
      router.push("/");
    });
  }, [userModel.logout, router]);

  return (
    <Item>
      <ItemMedia variant="icon">
        <Spinner />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Signing you out...</ItemTitle>
      </ItemContent>
    </Item>
  );
}
