import { NextResponse, type NextRequest } from "next/server";

const TARGET = (process.env.API_PROXY_TARGET ?? "").replace(/\/+$/, "");
const t = (p: string) => `${TARGET}${p}`;

// PUT handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, ctx: any) {
  // Force-cast ctx to the expected shape
  const { id } = (ctx as { params: { id: string } }).params;

  const data = await req.json();
  const res = await fetch(t(`/api/movies/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.status });
}

// DELETE handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(_req: NextRequest, ctx: any) {
  const { id } = (ctx as { params: { id: string } }).params;

  const res = await fetch(t(`/api/movies/${id}`), {
    method: "DELETE",
  });

  return NextResponse.json(await res.json(), { status: res.status });
}
