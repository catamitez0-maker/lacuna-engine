import { NextResponse } from "next/server";
import {
  archivePersistentRuntimeSession,
  getPrismaClient,
  loadRuntimeSessionSnapshot,
  pausePersistentRuntimeSession,
  resumePersistentRuntimeSession,
} from "@lacuna-engine/persistence";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

type SessionPatchBody = {
  status?: "open" | "paused" | "archived";
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const prisma = getPrismaClient();
  const snapshot = await loadRuntimeSessionSnapshot(prisma, sessionId);

  if (!snapshot) {
    return NextResponse.json(
      { ok: false, error: `Session ${sessionId} was not found.` },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, snapshot });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { sessionId } = await params;
  const prisma = getPrismaClient();
  const body = (await request.json().catch(() => ({}))) as SessionPatchBody;

  try {
    if (body.status === "paused") {
      const session = await pausePersistentRuntimeSession(prisma, sessionId);
      return NextResponse.json({ ok: true, session });
    }

    if (body.status === "open") {
      const session = await resumePersistentRuntimeSession(prisma, sessionId);
      return NextResponse.json({ ok: true, session });
    }

    if (body.status === "archived") {
      const session = await archivePersistentRuntimeSession(prisma, sessionId);
      return NextResponse.json({ ok: true, session });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "PATCH body must include status open, paused, or archived.",
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    );
  }
}
