import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Tags, Plus, Trash2, Loader2, AlertCircle, CheckCircle2, Hash } from 'lucide-react';

const CATEGORIES = ['language', 'framework', 'concept', 'soft-skill'];

export default function TagManager() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('concept');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tags');
      setTags(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate clean slug if user hasn't explicitly customized slug
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await api.post('/tags', {
        name,
        slug: slug || undefined,
        category
      });
      setTags((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setName('');
      setSlug('');
      setCategory('concept');
      setMessage(`Tag "${res.data.name}" added successfully.`);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create tag');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTag = async (id, tagName) => {
    if (!window.confirm(`Are you sure you want to delete tag "${tagName}"?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      await api.delete(`/tags/${id}`);
      setTags((prev) => prev.filter((t) => t._id !== id));
      setMessage(`Tag "${tagName}" deleted.`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tag');
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'language':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'framework':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'concept':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'soft-skill':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Tags className="w-6 h-6 text-indigo-400" /> Controlled Tag Registry
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Define canonical skill, framework, and language tags used to anchor questions and candidate radar analytics.
        </p>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Tag Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-indigo-400" /> Create New Tag
        </h2>
        <form onSubmit={handleCreateTag} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tag Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Asynchronous JavaScript"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Slug (Hyphenated identifier) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 pointer-events-none">
                <Hash className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().trim())}
                placeholder="async-js"
                className="w-full pl-8 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-indigo-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting || !name || !slug}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Tag
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tags List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-semibold text-white">
            Existing Tags ({tags.length})
          </h2>
          <span className="text-xs text-slate-500">
            Sorted alphabetically
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
            <span>Loading registry tags...</span>
          </div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No tags created yet. Use the form above to add your first tag.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Tag Name</th>
                  <th scope="col" className="px-6 py-3">Slug</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tags.map((tag) => (
                  <tr key={tag._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-3.5 font-medium text-white">
                      {tag.name}
                    </td>
                    <td className="px-6 py-3.5">
                      <code className="text-xs font-mono text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {tag.slug}
                      </code>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block border text-xs px-2.5 py-0.5 rounded-full capitalize font-medium ${getCategoryBadge(tag.category)}`}>
                        {tag.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteTag(tag._id, tag.name)}
                        disabled={deletingId === tag._id}
                        className="text-slate-400 hover:text-red-400 disabled:opacity-50 p-1.5 rounded-lg hover:bg-red-950/30 transition"
                        title="Delete Tag"
                      >
                        {deletingId === tag._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
