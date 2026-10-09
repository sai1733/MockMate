import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useDeviceCheck from '../../hooks/useDeviceCheck';
import api from '../../api/axios';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  Play, 
  Volume2, 
  RotateCw,
  Sparkles
} from 'lucide-react';

const TRACKS = ['Frontend', 'Backend', 'Fullstack', 'DevOps', 'System Design', 'HR / Behavioral'];
const DIFFICULTIES = ['Junior', 'Mid', 'Senior'];

export default function GreenRoom() {
  const navigate = useNavigate();
  const { micGranted, cameraGranted, checking, error, audioLevel, requestPermissions, cleanupStreams } = useDeviceCheck();

  const [track, setTrack] = useState('Frontend');
  const [difficulty, setDifficulty] = useState('Mid');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);

  const handleStartInterview = async () => {
    if (!micGranted) return;
    setStarting(true);
    setStartError(null);

    try {
      // Cleanup pre-flight monitoring audio context before transitioning into room
      cleanupStreams();

      const res = await api.post('/interviews/start', { track, difficulty });
      const session = res.data;
      navigate(`/interview/${session._id}`, { state: { session } });
    } catch (err) {
      setStartError(
        err.response?.data?.message || 'Failed to start interview. Please ensure question bank is populated.'
      );
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-slate-700">|</span>
          <span className="text-base font-bold text-white">
            Mock<span className="text-indigo-500">Mate</span>
          </span>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-medium">
            The Green Room
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pre-Flight Hardware Check
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Verify your audio input, configure your target interview track, and prepare for a simulated high-stress environment.
            </p>
          </div>

          {startError && (
            <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{startError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Card: Hardware Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
                  1. Audio & Video Diagnostics
                </h2>

                {/* Microphone Check */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${micGranted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {micGranted ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Microphone Input</div>
                        <div className="text-xs text-slate-400">
                          {checking ? 'Checking permissions...' : micGranted ? 'Hardware active & accessible' : 'Input unavailable'}
                        </div>
                      </div>
                    </div>
                    {micGranted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>

                  {/* Real-time Audio Level Visualizer */}
                  {micGranted && (
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium text-slate-300">
                          <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Voice Input Meter
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">{audioLevel}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-75 rounded-full"
                          style={{ width: `${audioLevel}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Speak into your microphone to verify speech volume before entering.
                      </p>
                    </div>
                  )}

                  {/* Camera Check (Optional) */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cameraGranted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                        {cameraGranted ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Webcam Preview</div>
                        <div className="text-xs text-slate-400">
                          {cameraGranted ? 'Visual composure enabled' : 'Camera optional (Audio-only mode)'}
                        </div>
                      </div>
                    </div>
                    {cameraGranted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Optional
                      </span>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-800/80 text-xs space-y-2">
                    <div className="font-semibold text-red-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {error.title}
                    </div>
                    <p className="text-red-300/90 leading-relaxed">{error.message}</p>
                    <button
                      type="button"
                      onClick={requestPermissions}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs bg-red-900/60 hover:bg-red-800/80 text-white font-medium px-3 py-1.5 rounded-lg transition"
                    >
                      <RotateCw className="w-3 h-3" /> Retry Device Check
                    </button>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
                Pre-flight hardware check ensures media stream continuity so in-flight interviews are never disrupted.
              </div>
            </div>

            {/* Right Card: Interview Track & Difficulty Selection */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  2. Session Configuration
                </h2>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Interview Track *
                  </label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {TRACKS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Seniority Level *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border transition ${
                          difficulty === d
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Protocol Information */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-400">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Interview Format Protocol:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>5 targeted questions tailored to your track</li>
                    <li>10 seconds preparation time per question</li>
                    <li>120 seconds maximum voice response per question</li>
                    <li>Instant asynchronous AI feedback & scoring</li>
                  </ul>
                </div>
              </div>

              {/* Start Interview CTA */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={!micGranted || starting || checking}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl text-sm transition shadow-lg"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Initializing Interview Session...
                    </>
                  ) : !micGranted ? (
                    <>
                      <MicOff className="w-4 h-4" /> Microphone Access Required
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" /> Start Live Interview Room
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
