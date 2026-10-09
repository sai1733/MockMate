import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Compass, 
  ExternalLink, 
  Layers, 
  LogOut, 
  Play, 
  Sparkles, 
  TrendingUp, 
  User, 
  Zap, 
  AlertCircle,
  Loader2,
  Camera,
  UploadCloud
} from 'lucide-react';

export default function CandidateDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tag-level analytics stats & completed interview history in parallel
        const [statsRes, historyRes] = await Promise.all([
          api.get('/users/me/stats').catch((err) => {
            console.warn('Failed to fetch /api/users/me/stats, trying fallback /api/analytics/user-stats', err);
            return api.get('/analytics/user-stats');
          }),
          api.get('/interviews/history').catch((err) => {
            console.warn('Failed to fetch /api/interviews/history, trying fallback /api/analytics/history', err);
            return api.get('/analytics/history');
          })
        ]);

        if (isMounted) {
          setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
          setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics:', err);
        if (isMounted) {
          setError('Unable to load performance telemetry. Please refresh or try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleViewDetails = (session) => {
    console.log('Viewing interview session details:', session);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('File exceeds 2MB limit. Please choose a smaller image.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError(null);

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.user) {
        updateUser(res.data.user);
      } else if (res.data?.avatarUrl) {
        updateUser({ avatarUrl: res.data.avatarUrl });
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setAvatarError(err.response?.data?.message || 'Failed to upload avatar to Cloudinary');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Metric Computations
  const totalInterviews = history.length;
  
  const validScores = history
    .map((h) => h.compositeScore)
    .filter((s) => typeof s === 'number' && !isNaN(s));

  const averageScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : null;

  const topSkill = stats.length > 0
    ? [...stats].sort((a, b) => (b.A || 0) - (a.A || 0))[0]
    : null;

  // Format date helper with graceful fallback
  const formatSessionDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch {
      return 'Recent';
    }
  };

  // Custom Recharts Tooltip
  const CustomRadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white capitalize">{data.subject}</p>
          <p className="text-indigo-400 font-mono">
            Proficiency Score: <span className="font-bold">{data.A ?? 0}/100</span>
          </p>
          {data.timesTested && (
            <p className="text-slate-400">Questions Evaluated: {data.timesTested}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Main Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-white tracking-tight">
              Mock<span className="text-indigo-500 group-hover:text-indigo-400 transition">Mate</span>
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Candidate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-white border border-slate-700 shadow-sm"
            >
              Dashboard
            </Link>
            <Link
              to="/green-room"
              className="text-xs font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
            >
              Green Room
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/green-room"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Start Practice</span>
          </Link>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'Candidate'} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                )}
              </div>
              <span className="hidden sm:inline font-medium">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Header with Avatar Upload */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar & Upload Trigger */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-950 border-2 border-indigo-500/30 shadow-md flex items-center justify-center text-indigo-400 font-extrabold text-2xl">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change Profile Picture"
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border border-slate-900 transition flex items-center justify-center"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Live Analytics Active
                </span>
                <span className="text-xs text-slate-400">Track: {user?.track || 'Software Engineering'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Track your asynchronous AI interview scores, analyze tag proficiencies across technical domains, and benchmark your progress.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 transition"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{uploadingAvatar ? 'Uploading to Cloudinary...' : user?.avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <Link
              to="/green-room"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Green Room</span>
            </Link>
          </div>
        </div>

        {/* Avatar Upload Error Alert */}
        {avatarError && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{avatarError}</span>
            </div>
            <button
              onClick={() => setAvatarError(null)}
              className="text-red-400 hover:text-red-300 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-2xl text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Completed Sessions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Completed Sessions</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{totalInterviews}</span>
              <span className="text-xs text-slate-500">simulated interviews</span>
            </div>
          </div>

          {/* Card 2: Average Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Score</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {averageScore !== null ? `${averageScore}%` : '—'}
              </span>
              <span className="text-xs text-slate-500">across graded sessions</span>
            </div>
          </div>

          {/* Card 3: Top Domain */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Strongest Competency</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 truncate">
              <span className="text-xl font-bold text-white capitalize truncate">
                {topSkill ? topSkill.subject : 'Evaluating...'}
              </span>
              {topSkill && (
                <span className="text-xs font-semibold text-emerald-400">({topSkill.A}%)</span>
              )}
            </div>
          </div>

          {/* Card 4: Evaluation Readiness */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Evaluation Engine</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-white">Gemini 1.5 Flash</span>
              <span className="text-xs text-purple-400 font-mono">Resilient</span>
            </div>
          </div>
        </div>

        {/* Main Analytics Grid: Radar Chart + Skill Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Radar Chart Card */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-400" />
                    Skill Proficiency Radar
                  </h2>
                  <p className="text-xs text-slate-400">
                    Calculated via MongoDB aggregation pipeline grouped by evaluated tag slugs.
                  </p>
                </div>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                  {stats.length} Tag Dimensions
                </span>
              </div>

              {loading ? (
                <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-xs">Aggregating tag telemetry...</p>
                </div>
              ) : stats.length > 0 ? (
                <div className="w-full h-80 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={stats} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#cbd5e1', fontSize: 12 }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        stroke="#475569" 
                        tick={{ fill: '#64748b', fontSize: 10 }} 
                      />
                      <Radar 
                        name="Candidate Proficiency" 
                        dataKey="A" 
                        stroke="#6366f1" 
                        fill="#6366f1" 
                        fillOpacity={0.45} 
                      />
                      <Tooltip content={<CustomRadarTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-center p-6 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                    <Compass className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">No Tag Telemetry Available Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Complete your first technical mock interview in the Green Room. As AI evaluations finalize, your skill radar will automatically render here.
                  </p>
                  <Link
                    to="/green-room"
                    className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                  >
                    Launch Green Room →
                  </Link>
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span>Full scale: 0 – 100 points per domain</span>
              <span className="text-indigo-400 font-mono">Aggregated from Interview.questions.tags</span>
            </div>
          </div>

          {/* Competency Breakdown List */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-400" />
                Domain Competency Breakdown
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Detailed scores per technical tag evaluated by Gemini rubric criteria.
              </p>

              {loading ? (
                <div className="space-y-3 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : stats.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {stats.map((item, idx) => {
                    const score = item.A ?? 0;
                    const color = score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                                : score >= 60 ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' 
                                : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

                    return (
                      <div 
                        key={idx} 
                        className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-white capitalize">
                            {item.subject}
                          </span>
                          <div className="text-[11px] text-slate-400">
                            Evaluated in {item.timesTested || 1} question{(item.timesTested || 1) > 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${color}`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-center text-xs text-slate-500">
                  Scores will populate as interview questions are submitted and graded.
                </div>
              )}
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-4 text-[11px] text-slate-500">
              Evaluations utilize rubric criteria across accuracy, depth, syntax, and delivery.
            </div>
          </div>
        </div>

        {/* Section 2: Historical Interview Sessions Timeline & Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Interview Session History
              </h2>
              <p className="text-xs text-slate-400">
                Sorted chronological timeline of completed mock sessions with composite AI scoring.
              </p>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Total Recorded: {history.length}
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-800/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Date & Time</th>
                    <th className="pb-3 font-semibold">Track</th>
                    <th className="pb-3 font-semibold">Seniority</th>
                    <th className="pb-3 font-semibold">Graded Qs</th>
                    <th className="pb-3 font-semibold">Composite Score</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((session) => {
                    const score = session.compositeScore;
                    const scoreBadge = score !== null 
                      ? score >= 80 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : score >= 60
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                    return (
                      <tr key={session._id} className="hover:bg-slate-850/50 transition">
                        <td className="py-4 font-medium text-slate-200 text-xs">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{formatSessionDate(session.completedAt || session.startedAt)}</span>
                          </div>
                        </td>

                        <td className="py-4">
                          <span className="font-semibold text-xs text-white">
                            {session.track}
                          </span>
                        </td>

                        <td className="py-4">
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                            {session.difficulty}
                          </span>
                        </td>

                        <td className="py-4 text-xs text-slate-400">
                          {session.gradedQuestions} / {session.totalQuestions} evaluated
                        </td>

                        <td className="py-4">
                          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${scoreBadge}`}>
                            {score !== null ? `${score}%` : 'Pending Grade'}
                          </span>
                        </td>

                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(session)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800">
              <div className="p-3 bg-slate-800 rounded-2xl text-slate-400">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-white">No Interview History Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Your completed mock interview sessions, questions, and composite scoring metrics will appear here.
              </p>
              <Link
                to="/green-room"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition mt-2 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start Your First Interview</span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
