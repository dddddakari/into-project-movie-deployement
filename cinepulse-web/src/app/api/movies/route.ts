import { NextRequest, NextResponse } from "next/server";

const TARGET = (process.env.API_PROXY_TARGET ?? "").replace(/\/+$/, "");

function targetUrl(path: string) {
  if (!TARGET) throw new Error("API_PROXY_TARGET is not set");
  return `${TARGET}${path}`;
}

export async function GET() {
  const res = await fetch(targetUrl("/api/movies"), { cache: "no-store" });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(targetUrl("/api/movies"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const text = await res.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return new NextResponse(text, { status: res.status });
  }
}
