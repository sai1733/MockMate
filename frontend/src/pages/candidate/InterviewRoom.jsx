import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../api/axios';
import useSpeechToText from '../../hooks/useSpeechToText';
import useVisualTelemetry from '../../hooks/useVisualTelemetry';
import { 
  Mic, 
  MicOff, 
  Clock, 
  Send, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Volume2,
  Video,
  VideoOff,
  Eye
} from 'lucide-react';

const PREP_TIME_SECONDS = 10;
const MAX_RECORDING_SECONDS = 120;

export default function InterviewRoom() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Session state
  const [session, setSession] = useState(location.state?.session || null);
  const [loadingSession, setLoadingSession] = useState(!location.state?.session);
  const [sessionError, setSessionError] = useState(null);

  // Exact 4-State Machine: 'PREPARING' | 'RECORDING' | 'SUBMITTING' | 'TRANSITION'
  const [interviewState, setInterviewState] = useState('PREPARING');

  // Timers
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(PREP_TIME_SECONDS);
  const [recordSecondsLeft, setRecordSecondsLeft] = useState(MAX_RECORDING_SECONDS);

  // Speech Recognition Hook
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript, 
    isSupported: speechSupported,
    speechError
  } = useSpeechToText();

  // Edge AI Visual Telemetry & Camera Preview
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    let activeStream = null;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        activeStream = stream;
        setMediaStream(stream);
        setCameraActive(true);
      } catch (err) {
        console.warn('[InterviewRoom] Camera not available or denied:', err.message);
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, interviewState]);

  const { visualScore, faceDetected, resetTelemetry } = useVisualTelemetry({
    videoRef,
    isRecording: interviewState === 'RECORDING'
  });

  // Load session from backend if not supplied in location.state or upon page refresh
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const res = await api.get(`/interviews/${sessionId}`);
        if (!isMounted) return;

        const data = res.data;
        setSession(data);

        if (data.status === 'completed') {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Calculate timer integrity on mount / reload
        const startedAt = new Date(data.currentQuestionStartedAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);

        if (elapsedSeconds < PREP_TIME_SECONDS) {
          setPrepSecondsLeft(PREP_TIME_SECONDS - elapsedSeconds);
          setInterviewState('PREPARING');
        } else if (elapsedSeconds < PREP_TIME_SECONDS + MAX_RECORDING_SECONDS) {
          const recElapsed = elapsedSeconds - PREP_TIME_SECONDS;
          setRecordSecondsLeft(Math.max(0, MAX_RECORDING_SECONDS - recElapsed));
          setInterviewState('RECORDING');
          startListening();
        } else {
          // Timer already exceeded 120s
          setRecordSecondsLeft(0);
          setInterviewState('RECORDING');
        }
      } catch (err) {
        if (isMounted) {
          setSessionError(err.response?.data?.message || 'Failed to load interview session.');
        }
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    };

    if (!session) {
      loadSession();
    }

    return () => {
      isMounted = false;
    };
  }, [sessionId, session, navigate, startListening]);

  // 1. PREPARING State Timer (10s countdown)
  useEffect(() => {
    if (interviewState !== 'PREPARING') return;

    const interval = setInterval(() => {
      setPrepSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Transition to RECORDING state
          setInterviewState('RECORDING');
          setRecordSecondsLeft(MAX_RECORDING_SECONDS);
          resetTranscript();
          startListening();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [interviewState, startListening, resetTranscript]);

  // 2. RECORDING State Timer (120s server-anchored countdown)
  useEffect(() => {
    if (interviewState !== 'RECORDING') return;

    const interval = setInterval(() => {
      if (!session?.currentQuestionStartedAt) return;

      const startedAt = new Date(session.currentQuestionStartedAt).getTime();
      const elapsedMs = Date.now() - startedAt;
      // Subtract prep offset
      const recordingElapsedMs = Math.max(0, elapsedMs - PREP_TIME_SECONDS * 1000);
      const remainingSeconds = Math.max(0, Math.ceil((MAX_RECORDING_SECONDS * 1000 - recordingElapsedMs) / 1000));

      setRecordSecondsLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(interval);
        // Auto-submit when time expires
        handleSubmitAnswer();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [interviewState, session]);

  // Manually skip prep
  const handleSkipPrep = () => {
    setInterviewState('RECORDING');
    setRecordSecondsLeft(MAX_RECORDING_SECONDS);
    resetTranscript();
    startListening();
  };

  // Submit Answer -> TRANSITION -> Next Question Flow
  const handleSubmitAnswer = useCallback(async () => {
    if (interviewState === 'SUBMITTING' || interviewState === 'TRANSITION') return;

    setInterviewState('SUBMITTING');
    stopListening();

    try {
      const qIndex = session.currentQuestionIndex;
      const currentTranscript = transcript.trim();
      const scoreToSubmit = typeof visualScore === 'number' ? visualScore : null;

      // 1. Fire-and-Forget: POST /api/interviews/:id/answer with edge AI visualScore
      await api.post(`/interviews/${sessionId}/answer`, {
        userTranscript: currentTranscript || '(No speech transcript recorded)',
        questionIndex: qIndex,
        visualScore: scoreToSubmit
      });

      // 2. Transition state
      setInterviewState('TRANSITION');

      // 3. Immediately advance to next question: POST /api/interviews/:id/next-question
      const nextRes = await api.post(`/interviews/${sessionId}/next-question`);
      const nextSession = nextRes.data;

      // 4. Check if interview completed
      if (nextSession.status === 'completed' || nextSession.currentQuestionIndex >= nextSession.questions.length) {
        navigate('/dashboard', { 
          replace: true, 
          state: { message: 'Interview session completed! AI grading in progress.' } 
        });
        return;
      }

      // Reset for next question cycle
      setSession(nextSession);
      resetTranscript();
      resetTelemetry();
      setPrepSecondsLeft(PREP_TIME_SECONDS);
      setRecordSecondsLeft(MAX_RECORDING_SECONDS);
      setInterviewState('PREPARING');
    } catch (err) {
      console.error('Error submitting answer:', err);
      setSessionError(err.response?.data?.message || 'Error submitting answer to server.');
      setInterviewState('RECORDING');
    }
  }, [interviewState, session, sessionId, transcript, visualScore, stopListening, resetTranscript, resetTelemetry, navigate]);

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium">Entering secure interview environment...</p>
      </div>
    );
  }

  if (sessionError && !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Session Initialization Failed</h2>
          <p className="text-xs text-slate-400">{sessionError}</p>
          <Link
            to="/green-room"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
          >
            Return to Green Room
          </Link>
        </div>
      </div>
    );
  }

  const currentQIndex = session?.currentQuestionIndex || 0;
  const totalQuestions = session?.questions?.length || 5;
  const currentQuestionEntry = session?.questions?.[currentQIndex];
  const questionDetails = currentQuestionEntry?.questionId || {};

  // Formatter for timer displays (mm:ss)
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const timerColor = recordSecondsLeft <= 20 
    ? 'text-red-400 border-red-500/40 bg-red-950/20' 
    : recordSecondsLeft <= 45 
    ? 'text-amber-400 border-amber-500/40 bg-amber-950/20' 
    : 'text-indigo-400 border-indigo-500/40 bg-indigo-950/20';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-tight">
            Mock<span className="text-indigo-500">Mate</span>
          </span>
          <span className="h-4 w-px bg-slate-800"></span>
          <span className="text-xs font-medium text-slate-400">
            {session.track} • {session.difficulty}
          </span>
        </div>

        {/* State Machine Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              interviewState === 'RECORDING' 
                ? 'bg-red-500 animate-ping' 
                : interviewState === 'PREPARING' 
                ? 'bg-amber-400 animate-pulse' 
                : 'bg-indigo-400'
            }`}></span>
            <span className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300">
              State: {interviewState}
            </span>
          </div>

          <div className="bg-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg font-mono">
            Q {currentQIndex + 1} / {totalQuestions}
          </div>
        </div>
      </header>

      {/* Main Focus Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center space-y-6">
        {/* Question Header & Meta */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
          {/* Top Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/40">
                Question {currentQIndex + 1}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {questionDetails.type || 'TECHNICAL'}
              </span>
            </div>

            {/* Denormalized Tag Badges */}
            {currentQuestionEntry?.tags && currentQuestionEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentQuestionEntry.tags.map((t) => (
                  <span key={t} className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Question Title Prompt */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug">
            {questionDetails.title || 'Loading question prompt...'}
          </h1>
        </div>

        {/* Unified Live Workspace Grid: Camera Preview (Left) + Interactive Context (Right) */}
        <div className="space-y-4">
          {/* Status & Timer Bar */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                interviewState === 'RECORDING' && isListening 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : interviewState === 'PREPARING'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {interviewState === 'RECORDING' ? (
                  isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {interviewState === 'PREPARING' && 'Preparation Window'}
                  {interviewState === 'RECORDING' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Live Audio Recording
                    </>
                  )}
                  {(interviewState === 'SUBMITTING' || interviewState === 'TRANSITION') && 'Processing Speech Payload'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {interviewState === 'PREPARING' && `Recording starts automatically in ${prepSecondsLeft}s`}
                  {interviewState === 'RECORDING' && (speechSupported ? 'Web Speech API continuous transcription active' : 'Speech recognition not supported in browser')}
                  {(interviewState === 'SUBMITTING' || interviewState === 'TRANSITION') && 'Synchronizing response and advancing...'}
                </div>
              </div>
            </div>

            {/* Server-Side Anchored Countdown Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${
              interviewState === 'PREPARING' 
                ? 'text-amber-400 border-amber-500/40 bg-amber-950/20'
                : timerColor
            }`}>
              <Clock className="w-4 h-4" />
              <span>
                {interviewState === 'PREPARING' ? `${prepSecondsLeft}s` : formatTimer(recordSecondsLeft)}
              </span>
            </div>
          </div>

          {/* Persistent Camera Video + Interactive State Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Webcam Preview Container with MediaPipe Telemetry */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md min-h-[220px] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover min-h-[220px] ${cameraActive ? 'block' : 'hidden'}`}
              />
              {!cameraActive && (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                  <VideoOff className="w-8 h-8 text-slate-600" />
                  <span className="text-xs">Camera Optional</span>
                  <span className="text-[10px] text-slate-600 font-mono">Audio-only mode</span>
                </div>
              )}

              {/* Edge AI Visual Composure Telemetry Badge */}
              {cameraActive && (
                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span className="text-slate-300 font-medium text-[10px]">
                      {faceDetected ? 'Composure' : 'Scanning Pose'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span className="font-mono font-bold text-indigo-300 text-xs">
                      {visualScore !== null ? `${visualScore}%` : '85%'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Pane: PREPARING Guidance OR Live Speech-to-Text */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              {interviewState === 'PREPARING' ? (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" /> Preparation Window ({prepSecondsLeft}s remaining)
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Read the question carefully and structure your talking points. Your camera telemetry and speech recording will begin automatically when the timer reaches 0s.
                    </p>
                    <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                      <p className="text-slate-300 font-semibold">Pro Tips for Maximum Score:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>Speak clearly at an even pace; transcription updates live.</li>
                        <li>Maintain eye contact with the camera for optimal composure scoring.</li>
                        <li>Structure answers using STAR (Situation, Task, Action, Result).</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSkipPrep}
                      className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg transition"
                    >
                      Skip Preparation & Start Speaking <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Live Speech-to-Text Transcript:
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {transcript.split(/\s+/).filter(Boolean).length} words spoken
                      </span>
                    </div>

                    {speechError && (
                      <div className="mb-2 p-2.5 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>{speechError}</span>
                      </div>
                    )}

                    <div className="min-h-[130px] max-h-[200px] overflow-y-auto rounded-xl bg-slate-950 p-4 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                      {transcript ? (
                        transcript
                      ) : (
                        <span className="text-slate-500 italic">
                          Start speaking. Your spoken words will be transcribed here in real time...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>Edge AI: MediaPipe GPU WebGL Worker</span>
                    <span className="text-indigo-400 font-mono">Sampling ~5 FPS</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submission Actions (Visible during recording/submitting) */}
          {interviewState !== 'PREPARING' && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> 125s server timer strictly enforced
              </div>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={interviewState === 'SUBMITTING' || interviewState === 'TRANSITION'}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 px-6 rounded-xl text-sm transition shadow-lg"
              >
                {interviewState === 'SUBMITTING' || interviewState === 'TRANSITION' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting & Advancing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Answer
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer Info */}
      <footer className="border-t border-slate-800/80 bg-slate-900/30 px-6 py-3 text-center text-xs text-slate-500">
        MockMate Asynchronous Pipeline • Gemini 1.5 Flash Grading Anchor Active • Timer Security Enforced
      </footer>
    </div>
  );
}
