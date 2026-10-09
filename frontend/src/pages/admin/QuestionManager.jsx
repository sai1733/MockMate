import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit2,
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  Filter
} from 'lucide-react';

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Filters
  const [trackFilter, setTrackFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (trackFilter) params.track = trackFilter;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await api.get('/questions', { params });
      setQuestions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [trackFilter, difficultyFilter, typeFilter]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete question: "${title.slice(0, 40)}..."?`)) {
      return;
    }

    setDeletingId(id);
    setError(null);
    try {
      await api.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      setMessage('Question deleted successfully.');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Junior':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Mid':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Senior':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" /> Question Bank CMS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage interview questions, anchor rubrics, and tag alignments.
          </p>
        </div>
        <Link
          to="/admin/questions/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Question
        </Link>
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

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <Filter className="w-4 h-4 text-slate-500" /> Filter By:
        </div>

        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Tracks</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Fullstack">Fullstack</option>
          <option value="DevOps">DevOps</option>
          <option value="HR / Behavioral">HR / Behavioral</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Difficulties</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="TECHNICAL">Technical</option>
          <option value="HR_BEHAVIORAL">HR / Behavioral</option>
        </select>

        {(trackFilter || difficultyFilter || typeFilter) && (
          <button
            onClick={() => {
              setTrackFilter('');
              setDifficultyFilter('');
              setTypeFilter('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Questions Listing */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-semibold text-white">
            Questions ({questions.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click row to view ideal rubric anchor
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-indigo-500" />
            <span>Loading question bank...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm space-y-3">
            <p>No questions found matching your filter criteria.</p>
            <Link
              to="/admin/questions/new"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Create a question now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {questions.map((q) => {
              const isExpanded = expandedId === q._id;
              return (
                <div key={q._id} className="p-4 sm:p-5 hover:bg-slate-800/30 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : q._id)}
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {q.track}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getDifficultyBadge(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          {q.type}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-medium text-white flex items-center gap-2">
                        {q.title}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </h3>

                      {/* Tag Badges */}
                      {q.tags && q.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                          {q.tags.map((tag) => (
                            <span
                              key={tag._id || tag}
                              className="text-xs font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded"
                            >
                              #{tag.slug || tag.name || tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        to={`/admin/questions/${q._id}/edit`}
                        className="text-slate-400 hover:text-indigo-400 p-2 rounded-lg hover:bg-indigo-950/30 transition"
                        title="Edit Question"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(q._id, q.title)}
                        disabled={deletingId === q._id}
                        className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-950/30 transition disabled:opacity-50"
                        title="Delete Question"
                      >
                        {deletingId === q._id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Ideal Answer Preview */}
                  {isExpanded && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                      <div className="font-semibold text-indigo-400 uppercase tracking-wide">
                        Ideal Answer Format (Gemini Grading Anchor):
                      </div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {q.idealAnswerFormat}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
