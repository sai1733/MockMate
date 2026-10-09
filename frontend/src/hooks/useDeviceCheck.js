import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to perform pre-flight hardware checks per 04-interview-engine.md.
 * Requests mic & camera permissions and maps specific hardware errors.
 */
export const useDeviceCheck = () => {
  const [micGranted, setMicGranted] = useState(false);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const setupAudioMonitoring = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume level (0 - 100)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('Audio visualization not supported or failed to initialize:', err);
    }
  };

  const cleanupStreams = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    setChecking(true);
    setError(null);
    cleanupStreams();

    try {
      // 1. Microphone Request (Mandatory for Voice Mock Interviews)
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = micStream;
      setMicGranted(true);
      setupAudioMonitoring(micStream);

      // 2. Camera Request (Optional graceful degradation per 04-interview-engine.md)
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraGranted(true);
        // Stop temporary camera track once check passes
        camStream.getTracks().forEach((t) => t.stop());
      } catch (camErr) {
        console.warn('Camera check failed or unavailable. Proceeding with audio-only mode:', camErr.name);
        setCameraGranted(false);
      }
    } catch (err) {
      // Map error types per 04-interview-engine.md specifications
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          setError({
            type: 'NotAllowedError',
            title: 'Microphone Permission Blocked',
            message: 'You have denied microphone access. Please click the camera/mic icon in your browser URL bar and choose "Always allow" to proceed.',
            fatal: true
          });
          break;

        case 'NotReadableError':
        case 'TrackStartError':
          setError({
            type: 'NotReadableError',
            title: 'Hardware Already in Use',
            message: 'Your microphone or camera is currently locked by another application (e.g. Zoom, Teams, Discord). Please close competing apps and retry.',
            fatal: true
          });
          break;

        case 'NotFoundError':
        case 'DevicesNotFoundError':
          setError({
            type: 'NotFoundError',
            title: 'No Microphone Detected',
            message: 'No physical microphone hardware was detected on your system. Please connect a headset or microphone.',
            fatal: true
          });
          break;

        default:
          setError({
            type: 'UnknownError',
            title: 'Hardware Access Error',
            message: err.message || 'Unable to access audio input devices.',
            fatal: true
          });
      }
      setMicGranted(false);
    } finally {
      setChecking(false);
    }
  }, [cleanupStreams]);

  useEffect(() => {
    requestPermissions();

    return () => {
      cleanupStreams();
    };
  }, [requestPermissions, cleanupStreams]);

  return {
    micGranted,
    cameraGranted,
    checking,
    error,
    audioLevel,
    requestPermissions,
    cleanupStreams
  };
};

export default useDeviceCheck;
