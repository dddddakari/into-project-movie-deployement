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
      await deleteMovie(id);
      setMovies(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-300 to-orange-300 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Film className="h-10 w-10 text-orange-800" />
            <h1 className="text-5xl font-bold tracking-widest text-orange-900 uppercase">
              Movie Collection
            </h1>
          </div>
        </header>

        {/* Add Movie */}
        <section className="mb-8 rounded-xl border-4 border-yellow-500 bg-yellow-100 p-6 shadow-lg">
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-orange-900">
            <Plus className="h-6 w-6" />
            Add New Movie
          </h2>
          <p className="mb-4 text-sm text-orange-800">Add a new action movie to your collection</p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="title" className="text-sm font-medium text-orange-900">
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
                className="w-full rounded-md border-2 border-yellow-500 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="releaseYear" className="text-sm font-medium text-orange-900">
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
                className="w-full rounded-md border-2 border-yellow-500 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="director" className="text-sm font-medium text-orange-900">
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
                className="w-full rounded-md border-2 border-yellow-500 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-4 py-2 font-bold text-white transition hover:bg-orange-700 disabled:opacity-60 md:w-auto"
              >
                <Plus className="h-4 w-4" />
                {isLoading ? 'Adding…' : 'Add Movie'}
              </button>
            </div>
          </form>
          {error && <div className="mt-3 text-sm text-red-700">{error}</div>}
        </section>

        {/* Movies */}
        {isLoading && movies.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-orange-600" />
            <p className="text-orange-800">Loading movies…</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="rounded-xl border-4 border-yellow-500 bg-yellow-100 p-10 text-center shadow-md">
            <Film className="mx-auto mb-4 h-16 w-16 text-orange-500" />
            <h3 className="mb-2 text-xl font-semibold text-orange-900">No movies found</h3>
            <p className="text-orange-700">Add your first movie to get started!</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((m) => (
              <li
                key={m.id}
                className="group rounded-xl border-4 border-yellow-500 bg-yellow-50 shadow-md transition hover:shadow-xl"
              >
                <div className="p-5">
                  <div className="mb-1 line-clamp-2 text-lg font-bold text-orange-900">{m.title}</div>
                  <div className="text-sm font-medium text-orange-700">{m.releaseYear}</div>
                  <div className="mt-2 text-sm text-orange-800">
                    <span className="font-medium">Director:</span> {m.director}
                  </div>
                </div>
                <div className="flex gap-2 border-t-4 border-yellow-500 p-3">
                  <button
                    onClick={() => openEdit(m)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full border-2 border-yellow-400 px-3 py-1.5 text-sm font-bold text-orange-800 transition hover:border-orange-500 hover:bg-orange-100"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(m.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-full border-2 border-red-400 px-3 py-1.5 text-sm font-bold text-red-700 transition hover:border-red-500 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Edit Modal */}
        {showEdit && editing && (
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={() => !isLoading && setShowEdit(false)}
          >
            <div
              className="w-full max-w-md rounded-xl border-4 border-yellow-500 bg-yellow-50 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-orange-800" />
                <h3 className="text-lg font-bold text-orange-900">Edit Movie</h3>
              </div>
              <form onSubmit={onEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="edit-title" className="text-sm font-medium text-orange-900">
                    Movie Title
                  </label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    required
                    value={editing.title}
                    onChange={onEditChange}
                    className="w-full rounded-md border-2 border-yellow-500 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-year" className="text-sm font-medium text-orange-900">
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
                    className="w-full rounded-md border-2 border-yellow-500 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="edit-director" className="text-sm font-medium text-orange-900">
                    Director
                  </label>
                  <input
                    id="edit-director"
                    name="director"
                    type="text"
                    required
                    value={editing.director}
                    onChange={onEditChange}
                    className="w-full rounded-md border-2 border-yellow-500 px-3 py-2 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="inline-flex flex-1 items-center justify-center rounded-full border-2 border-yellow-400 px-4 py-2 text-sm font-bold text-orange-800 transition hover:bg-orange-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
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
