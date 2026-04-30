import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/server/auth/require-auth";
import { activeProjectCookieName } from "@/server/projects/scope";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { id, status: "ACTIVE" }, select: { id: true } });
  if (!project) {
    return NextResponse.redirect(new URL("/projects", _request.url));
  }

  const response = NextResponse.redirect(new URL(`/threads?project=${project.id}`, _request.url));
  response.cookies.set(activeProjectCookieName, project.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 90
  });
  return response;
}
