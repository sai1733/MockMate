import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { 
  Sparkles, 
  ArrowLeft, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Check
} from 'lucide-react';

const TRACKS = ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'System Design', 'HR / Behavioral'];
const DIFFICULTIES = ['Junior', 'Mid', 'Senior'];
const TYPES = ['TECHNICAL', 'HR_BEHAVIORAL'];

export default function QuestionEditor() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('Mid');
  const [type, setType] = useState('TECHNICAL');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [idealAnswerFormat, setIdealAnswerFormat] = useState('');

  // Registry Tags & AI Suggestions
  const [availableTags, setAvailableTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Status State
  const [generatingAi, setGeneratingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoadingTags(true);
        const res = await api.get('/tags');
        setAvailableTags(res.data);
      } catch (err) {
        console.error('Failed to load tags for selection:', err);
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchQuestionDetails = async () => {
        try {
          const res = await api.get(`/questions/${id}`);
          const q = res.data;
          setTitle(q.title || '');
          setTrack(q.track || 'Frontend');
          setDifficulty(q.difficulty || 'Mid');
          setType(q.type || 'TECHNICAL');
          setIdealAnswerFormat(q.idealAnswerFormat || '');
          if (q.tags && Array.isArray(q.tags)) {
            setSelectedTagIds(q.tags.map((t) => t._id || t));
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load question details.');
        }
      };
      fetchQuestionDetails();
    }
  }, [id]);

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) => 
      prev.includes(tagId) 
        ? prev.filter((id) => id !== tagId) 
        : [...prev, tagId]
    );
  };

  /**
   * CRITICAL AI INTEGRATION:
   * Calls POST /api/questions/generate-rubric with title, track, and difficulty.
   * Auto-populates idealAnswerFormat and matches suggestedTags with registry tags.
   */
  const handleAutoGenerateRubric = async () => {
    if (!title.trim()) {
      setError('Please enter a Question Title before generating an AI rubric.');
      return;
    }

    setError(null);
    setGeneratingAi(true);

    try {
      const res = await api.post('/questions/generate-rubric', {
        title: title.trim(),
        track,
        difficulty
      });

      const { idealAnswerFormat: aiAnswer, suggestedTags: aiTags } = res.data;

      // 1. Auto-fill the ideal answer format
      if (aiAnswer) {
        setIdealAnswerFormat(aiAnswer);
      }

      // 2. Select matching registry tags based on AI suggested tag slugs
      if (aiTags && Array.isArray(aiTags)) {
        setSuggestedTags(aiTags);
        const matchingTagIds = availableTags
          .filter((t) => aiTags.some((slug) => slug.toLowerCase() === t.slug.toLowerCase()))
          .map((t) => t._id);

        if (matchingTagIds.length > 0) {
          setSelectedTagIds((prev) => Array.from(new Set([...prev, ...matchingTagIds])));
        }
      }

      setSuccessMsg('AI rubric & suggested tags generated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'AI generation failed');
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !idealAnswerFormat.trim()) {
      setError('Please provide Question Title and Ideal Answer Format.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        track,
        difficulty,
        type,
        tags: selectedTagIds,
        idealAnswerFormat: idealAnswerFormat.trim()
      };

      if (isEditMode) {
        await api.put(`/questions/${id}`, payload);
      } else {
        await api.post('/questions', payload);
      }

      navigate('/admin/questions', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/admin/questions"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Questions
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-400" /> {isEditMode ? 'Edit Interview Question' : 'Create New Interview Question'}
          </h1>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Attributes Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            1. Core Question Attributes
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Question Title / Prompt *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How does the Virtual DOM reconciliation algorithm work in React?"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Track *
              </label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TRACKS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Difficulty Level *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Question Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI Rubric Generation Card */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Ideal Answer & AI Rubric Anchor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                This exact answer is supplied to Gemini 1.5 Flash to anchor candidate scoring and accuracy deductions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoGenerateRubric}
              disabled={generatingAi || !title.trim()}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shrink-0 self-start sm:self-auto"
            >
              {generatingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating via Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" /> Auto-Generate Rubric with AI
                </>
              )}
            </button>
          </div>

          <div>
            <textarea
              required
              rows={5}
              value={idealAnswerFormat}
              onChange={(e) => setIdealAnswerFormat(e.target.value)}
              placeholder="Provide a 3-4 sentence comprehensive benchmark answer, or click 'Auto-Generate Rubric with AI' above..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
            />
          </div>

          {/* AI Suggested Tags Display */}
          {suggestedTags.length > 0 && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-medium">Gemini Suggested Tags:</span>
              {suggestedTags.map((st) => (
                <span key={st} className="px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-300 font-mono text-[11px] border border-indigo-700/40">
                  #{st}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tags Selection Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              3. Associate Tags ({selectedTagIds.length} selected)
            </h2>
            <Link
              to="/admin/tags"
              className="text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Manage Registry Tags
            </Link>
          </div>

          {loadingTags ? (
            <div className="text-xs text-slate-500 flex items-center gap-2 py-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Loading available tags...
            </div>
          ) : availableTags.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              No tags found in registry. Please visit Tag Manager to create tags.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {availableTags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag._id);
                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border
                      ${isSelected 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm' 
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                      }
                    `}
                  >
                    <span>{tag.name}</span>
                    <span className="font-mono text-[10px] opacity-70">({tag.slug})</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Link
            to="/admin/questions"
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Question...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEditMode ? 'Update Question' : 'Save Question'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
