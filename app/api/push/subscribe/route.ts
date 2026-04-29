import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/server/auth/require-auth";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  })
});

export async function POST(request: Request) {
  const auth = await requireApiSession();
  if (auth.response) return auth.response;

  const body = schema.parse(await request.json());
  const user = await prisma.user.findUniqueOrThrow({ where: { email: auth.session!.user!.email! } });
  const subscription = await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    update: {
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: request.headers.get("user-agent")
    },
    create: {
      userId: user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: request.headers.get("user-agent")
    }
  });

  return NextResponse.json({ subscriptionId: subscription.id });
}
