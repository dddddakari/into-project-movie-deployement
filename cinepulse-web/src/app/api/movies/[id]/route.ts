import { NextResponse, type NextRequest } from "next/server";

const TARGET = (process.env.API_PROXY_TARGET ?? "").replace(/\/+$/, "");
const t = (p: string) => `${TARGET}${p}`;

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!TARGET) return NextResponse.json({ error: "API_PROXY_TARGET not set" }, { status: 500 });

  const upstream = await fetch(t(`/api/movies/${params.id}`), {
    method: "DELETE",
    cache: "no-store",
  });

  return new NextResponse(null, { status: upstream.status || 204 });
}
