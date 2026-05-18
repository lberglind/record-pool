"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
