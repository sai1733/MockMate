import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Mic, 
  BrainCircuit, 
  Activity, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Award, 
  Terminal, 
  Zap, 
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-white tracking-tight">
              Mock<span className="text-indigo-500">Mate</span>
            </span>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] px-2.5 py-0.5 rounded-full font-semibold">
              Enterprise v2.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20"
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 flex-1 flex flex-col justify-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">
              Next-Gen AI Technical Interview Simulator
            </span>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Master Technical Interviews with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-500">
                Live Speech & Instant AI Grading
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
              Simulate high-pressure engineering interviews with real-time speech recognition, server-anchored timers, and rigorous rubric-based AI evaluations powered by Google Gemini.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3.5 rounded-2xl text-sm transition shadow-xl shadow-indigo-600/25 hover:scale-[1.02]"
            >
              <span>{user ? "Open Dashboard" : "Start Practicing Free"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={user ? "/green-room" : "/login"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-6 py-3.5 rounded-2xl text-sm transition"
            >
              <span>{user ? "Enter Green Room" : "Sign In to Account"}</span>
            </Link>
          </div>

          {/* Key Trust Signals */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Local Audio Storage</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Gemini 1.5 Flash Rubric Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Full Recharts Skill Telemetry</span>
            </div>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Pre-Flight Green Room</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calibrate microphone hardware, verify audio levels with real-time Web Audio API meters, and choose your difficulty before entering the room.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Web Speech Pipeline</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Native speech-to-text with auto-restart engine catches drops during quiet pauses. Real-time interim streaming transcription with zero lag.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Resilient AI Grader</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asynchronous fire-and-forget submission with XML prompt-injection defense. Background cron sweepers heal dropped evaluations automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Skill Spider Radar</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-performance MongoDB aggregation pipelines calculate average scores grouped by tag slug, visualized via interactive Recharts spider graphs.
              </p>
            </div>
          </div>
        </div>

        {/* Tracks Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Available Technical Domains & Seniority Tracks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Frontend', 'Backend', 'Fullstack', 'DevOps', 'System Design', 'HR / Behavioral'].map((t) => (
              <span
                key={t}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span>MockMate</span>
            <span className="text-slate-600">•</span>
            <span className="font-normal text-slate-500">AI Mock Interview Platform</span>
          </div>
          <p>© {new Date().getFullYear()} MockMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
