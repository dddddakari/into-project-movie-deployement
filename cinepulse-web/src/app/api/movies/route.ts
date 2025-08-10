import { NextResponse } from "next/server";

const TARGET = (process.env.API_PROXY_TARGET ?? "").replace(/\/+$/, "");
const t = (p: string) => `${TARGET}${p}`;

export async function GET() {
  if (!TARGET) return NextResponse.json({ error: "API_PROXY_TARGET not set" }, { status: 500 });

  const upstream = await fetch(t("/api/movies"), { cache: "no-store" });
  const json = await upstream.json();
  return NextResponse.json(json, { status: upstream.status });
}

export async function POST(req: Request) {
  if (!TARGET) return NextResponse.json({ error: "API_PROXY_TARGET not set" }, { status: 500 });

  const body = await req.text();
  const upstream = await fetch(t("/api/movies"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const text = await upstream.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: upstream.status });
  } catch {
    return new NextResponse(text, { status: upstream.status });
  }
}
