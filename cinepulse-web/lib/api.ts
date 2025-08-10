// lib/api.ts

export type Movie = {
    id: number;
    title: string;
    releaseYear: number;
    director: string;
  };


  export type MovieInput = Omit<Movie, "id">;
  
  // If NEXT_PUBLIC_API_BASE is set, we hit your EB backend directly.
  // If it's empty, we hit a local Next.js API route (proxy) at /api/movies.
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");
  
  /** Small fetch helper with better errors */
  async function json<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const res = await fetch(input, {
      cache: "no-store",
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `${(init?.method ?? "GET")} ${typeof input === "string" ? input : input.toString()} -> ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`
      );
    }
  
    // Handle empty responses (e.g., 200 with no body, or 204 No Content)
    const contentLength = res.headers.get("content-length");
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
  
    if (res.status === 204 || contentLength === "0" || (!isJson && res.status === 200)) {
      return undefined as T;
    }
  
    return (await res.json()) as T;
  }
  
  
  const path = (p: string) => `${API_BASE}${p}`; // if API_BASE === "" -> relative
  
  // GET /api/movies
  export async function listMovies(): Promise<Movie[]> {
    return json<Movie[]>(path("/api/movies"));
  }
  
  // POST /api/movies
  export async function createMovie(m: MovieInput): Promise<Movie> {
    // ensure number type for releaseYear
    const body: MovieInput = { ...m, releaseYear: Number(m.releaseYear) };
    return json<Movie>(path("/api/movies"), {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
  
  // PUT /api/movies/:id
  export async function updateMovie(id: number, m: MovieInput): Promise<Movie> {
    const body: MovieInput = { ...m, releaseYear: Number(m.releaseYear) };
    return json<Movie>(path(`/api/movies/${id}`), {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
  
  // DELETE /api/movies/:id
  export async function deleteMovie(id: number): Promise<void> {
    await json<void>(path(`/api/movies/${id}`), { method: "DELETE" });
  }
  
  // useful if you want to display which backend you’re hitting in the UI
  export const API_BASE_DISPLAY = API_BASE || "/api (proxy)";
  