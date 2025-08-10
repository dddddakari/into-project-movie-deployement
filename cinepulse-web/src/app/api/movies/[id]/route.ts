import { NextResponse } from "next/server";

const TARGET = (process.env.API_PROXY_TARGET ?? "").replace(/\/+$/, "");
const t = (p: string) => `${TARGET}${p}`;

type Ctx = { params: { id: string } };

export async function PUT(req: Request, { params }: Ctx) {
  if (!TARGET) return NextResponse.json({ error: "API_PROXY_TARGET not set" }, { status: 500 });

  const body = await req.text();
  const upstream = await fetch(t(`/api/movies/${params.id}`), {
    method: "PUT",
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

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!TARGET) return NextResponse.json({ error: "API_PROXY_TARGET not set" }, { status: 500 });

  const upstream = await fetch(t(`/api/movies/${params.id}`), {
    method: "DELETE",
    cache: "no-store",
  });

  // 204 No Content is common; return empty body with the same status
  return new NextResponse(null, { status: upstream.status || 204 });
}
