'use client';

import { useEffect, useState } from 'react';
import { Film, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Movie, MovieInput } from '../../lib/api';
import { listMovies, createMovie, updateMovie, deleteMovie } from '../../lib/api';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [form, setForm] = useState<MovieInput>({
    title: '',
    releaseYear: new Date().getFullYear(),
    director: '',
  });
  const [editing, setEditing] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMovies();
      setMovies(data);
    } catch {
      setError('Failed to load movies');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === 'releaseYear' ? Number(value) : value,
    }) as MovieInput);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.title.trim() || !form.director.trim()) {
      setError('Title and Director are required');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await createMovie(form);
      setForm({ title: '', releaseYear: new Date().getFullYear(), director: '' });
      await refresh();
    } catch {
      setError('Failed to add movie');
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(m: Movie) {
    setEditing(m);
    setShowEdit(true);
  }

  function onEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editing) return;
    const { name, value } = e.target;
    setEditing({
      ...editing,
      [name]: name === 'releaseYear' ? Number(value) : value,
    } as Movie);
  }

  async function onEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setIsLoading(true);
    setError(null);
    try {
      const { id, title, releaseYear, director } = editing;
      await updateMovie(id, { title, releaseYear, director });
      setShowEdit(false);
      setEditing(null);
      await refresh();
    } catch {
      setError('Failed to update movie');
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete(id: number) {
    try {
      await deleteMovie(id);                 // calls /api/movies/:id (no JSON expected)
      setMovies(prev => prev.filter(m => m.id !== id)); // update UI immediately
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Film className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Movie Collection</h1>
          </div>
          <p className="text-lg text-gray-600">
            Backend: <code className="text-gray-800">{process.env.NEXT_PUBLIC_API_BASE ?? '/api (proxy)'}</code>
          </p>
        </header>

        {/* Add Movie */}
        <section className="mb-8 rounded-xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold">
            <Plus className="h-5 w-5" />
            Add New Movie
          </h2>
          <p className="mb-4 text-sm text-gray-600">Add a new action movie to your collection</p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Movie Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Enter movie title"
                value={form.title}
                onChange={onChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="releaseYear" className="text-sm font-medium text-gray-700">
                Release Year
              </label>
              <input
                id="releaseYear"
                name="releaseYear"
                type="number"
                min={1900}
                max={2030}
                required
                placeholder="2024"
                value={form.releaseYear}
                onChange={onChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="director" className="text-sm font-medium text-gray-700">
                Director
              </label>
              <input
                id="director"
                name="director"
                type="text"
                required
                placeholder="Director name"
                value={form.director}
                onChange={onChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60 md:w-auto"
              >
                <Plus className="h-4 w-4" />
                {isLoading ? 'Adding…' : 'Add Movie'}
              </button>
            </div>
          </form>
          {error && <div className="mt-3 text-sm text-rose-600">{error}</div>}
        </section>

        {/* Movies */}
        {isLoading && movies.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-gray-600">Loading movies…</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="rounded-xl border border-slate-200/70 bg-white/80 p-10 text-center shadow-sm backdrop-blur">
            <Film className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">No movies found</h3>
            <p className="text-gray-500">Add your first movie to get started!</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((m) => (
              <li
                key={m.id}
                className="group rounded-xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur transition hover:shadow-md"
              >
                <div className="p-5">
                  <div className="mb-1 line-clamp-2 text-lg font-bold text-gray-900">{m.title}</div>
                  <div className="text-sm font-medium text-blue-600">{m.releaseYear}</div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Director:</span> {m.director}
                  </div>
                </div>
                <div className="flex gap-2 border-t border-slate-200/70 p-3">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm transition hover:border-blue-300 hover:bg-blue-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(m.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit “modal” (simple Tailwind overlay, no library) */}
        {showEdit && editing && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={() => !isLoading && setShowEdit(false)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Edit Movie</h3>
              </div>
              <form onSubmit={onEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="edit-title" className="text-sm font-medium text-gray-700">
                    Movie Title
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    value={editing.title}
                    onChange={onEditChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-year" className="text-sm font-medium text-gray-700">
                    Release Year
                  </label>
                  <input
                    id="edit-year"
                    name="releaseYear"
                    type="number"
                    min={1900}
                    max={2030}
                    required
                    value={editing.releaseYear}
                    onChange={onEditChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-director" className="text-sm font-medium text-gray-700">
                    Director
                  </label>
                  <input
                    id="edit-director"
                    name="director"
                    type="text"
                    required
                    value={editing.director}
                    onChange={onEditChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isLoading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
