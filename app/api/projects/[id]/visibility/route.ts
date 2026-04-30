import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/server/auth/require-auth";
import { activeProjectCookieName } from "@/server/projects/scope";

const schema = z.object({
  status: z.enum(["ACTIVE", "HIDDEN"])
});

async function parseRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return schema.parse(await request.json());
  }

  const form = await request.formData();
  return schema.parse({ status: form.get("status") });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  const { status } = await parseRequest(request);
  await prisma.project.update({
    where: { id },
    data: { status }
  });

  const acceptsJson = contentType.includes("application/json") || request.headers.get("accept")?.includes("application/json");
  if (acceptsJson) return NextResponse.json({ id, status });

  const response = NextResponse.redirect(new URL("/projects", request.url), { status: 303 });
  if (status === "HIDDEN") {
    response.cookies.delete(activeProjectCookieName);
  }
  return response;
}
