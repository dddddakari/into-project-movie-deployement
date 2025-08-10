import { NextRequest, NextResponse } from "next/server";

const TARGET = (process.env.API_PROXY_TARGET ?? "").replace(/\/+$/, "");

function targetUrl(path: string) {
  if (!TARGET) throw new Error("API_PROXY_TARGET is not set");
  return `${TARGET}${path}`;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.text();
  const res = await fetch(targetUrl(`/api/movies/${params.id}`), {
    method: "PUT",
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

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(targetUrl(`/api/movies/${params.id}`), { method: "DELETE" });
  // 204 has no body
  return new NextResponse(null, { status: res.status || 204 });
}
