import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "./options";
import { isAllowedUser } from "./config";

export async function requirePageSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAllowedUser(session.user.email)) {
    redirect("/login");
  }
  return session;
}

export async function requireApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAllowedUser(session.user.email)) {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}
