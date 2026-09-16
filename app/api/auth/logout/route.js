import { NextResponse } from "next/server";
import { destroySession, sameOrigin } from "@/lib/auth";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
