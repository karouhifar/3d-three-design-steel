import { NextResponse } from "next/server";
import { quoteRequestSchema } from "@/lib/quote-schema";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 1. parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 },
    );
  }

  // 2. validate with the shared zod schema (server is source of truth)
  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const payload = parsed.data;

  // 3. forward to the real backend / CRM if configured
  const backendUrl = process.env.QUOTE_BACKEND_URL;
  if (backendUrl) {
    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.QUOTE_BACKEND_TOKEN
            ? { authorization: `Bearer ${process.env.QUOTE_BACKEND_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(payload),
        // don't hang the request forever
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        return NextResponse.json(
          { ok: false, error: "backend_error", status: res.status },
          { status: 502 },
        );
      }

      const data = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: true, ...data });
    } catch {
      return NextResponse.json(
        { ok: false, error: "backend_unreachable" },
        { status: 502 },
      );
    }
  }

  // 4. no backend wired yet — accept + log so the form works end-to-end
  console.log("[quote] received:", JSON.stringify(payload));
  return NextResponse.json({
    ok: true,
    id: `local-${Date.now().toString(36)}`,
  });
}
