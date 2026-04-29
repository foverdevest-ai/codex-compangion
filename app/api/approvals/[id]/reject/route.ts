import { NextResponse } from "next/server";
import { z } from "zod";
import { CodexAppServerProvider } from "@/providers/codex-app-server-provider";

const schema = z.object({ note: z.string().max(2000).optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = schema.parse(await request.json());
  const provider = new CodexAppServerProvider();
  const approval = await provider.rejectRequest({ approvalRequestId: id, note: body.note });
  return NextResponse.json({ approval });
}
