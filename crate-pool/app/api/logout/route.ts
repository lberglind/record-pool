import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true });
    // Delete the session cookie
    res.cookies.set({ name: "session", value: "", path: "/", maxAge: 0 });
    return res;
  } catch (err) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
