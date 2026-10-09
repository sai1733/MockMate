import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  ShieldCheck, 
  Tags, 
  HelpCircle, 
  Sparkles, 
  Plus, 
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tagsCount: 0, questionsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [tagsRes, questionsRes] = await Promise.all([
          api.get('/tags'),
          api.get('/questions')
        ]);
        setStats({
          tagsCount: tagsRes.data.length,
          questionsCount: questionsRes.data.length
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Admin CMS Control Center
            </h1>
            <p className="mt-1 text-slate-400 text-sm">
              Welcome back, <span className="text-white font-medium">{user?.name}</span>. Manage interview tracks, rubric anchors, and controlled taxonomy.
            </p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" /> Role: Admin (RBAC Active)
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Questions</span>
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats.questionsCount}
          </div>
          <p className="text-xs text-slate-500">Live technical & behavioral interview prompts</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Controlled Tags</span>
            <Tags className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {loading ? '...' : stats.tagsCount}
          </div>
          <p className="text-xs text-slate-500">Taxonomy tags for candidate skill radars</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Engine</span>
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Gemini Flash Active
          </div>
          <p className="text-xs text-slate-500">Strict JSON schema & prompt sandboxing</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/questions/new"
          className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition">
              AI Rubric Generator
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a new interview question with Gemini 1.5 Flash auto-generating 3-4 sentence anchor rubrics and tag suggestions.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:translate-x-1 transition">
            <span>Create Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/questions"
          className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition">
              Question Bank
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse, filter by track/difficulty, inspect ideal answers, and delete questions from the active session pool.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-400 group-hover:translate-x-1 transition">
            <span>Browse Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/tags"
          className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Tags className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition">
              Tag Registry
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage controlled slugs for languages, frameworks, and concepts to ensure clean MongoDB aggregations in candidate analytics.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-purple-400 group-hover:translate-x-1 transition">
            <span>Manage Tags</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>
    </div>
  );
}
