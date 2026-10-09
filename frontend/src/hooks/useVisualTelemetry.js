import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to run MediaPipe FaceLandmarker inside a dedicated Web Worker
 * Extracts frames at ~5 FPS using createImageBitmap and transfers them without blocking UI thread.
 * 
 * @param {Object} options
 * @param {React.RefObject<HTMLVideoElement>} options.videoRef - Reference to the camera <video> preview
 * @param {boolean} options.isRecording - True when in active RECORDING state
 * @returns {{ visualScore: number|null, faceDetected: boolean, isReady: boolean, resetTelemetry: Function }}
 */
export default function useVisualTelemetry({ videoRef, isRecording }) {
  const [visualScore, setVisualScore] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const workerRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize Web Worker using standard Vite ESM syntax
  useEffect(() => {
    let worker = null;

    try {
      worker = new Worker(
        new URL('../workers/faceLandmarker.worker.js', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (e) => {
        const { type, visualScore: score, faceDetected: detected } = e.data;

        if (type === 'WORKER_READY') {
          setIsReady(true);
        } else if (type === 'TELEMETRY_UPDATE') {
          if (typeof score === 'number') {
            setVisualScore(score);
          }
          setFaceDetected(Boolean(detected));
        } else if (type === 'RESET_DONE') {
          setVisualScore(score || 85);
          setFaceDetected(false);
        }
      };

      worker.onerror = (err) => {
        console.warn('[useVisualTelemetry] Web Worker runtime warning:', err.message);
      };

      workerRef.current = worker;
    } catch (err) {
      console.warn('[useVisualTelemetry] Failed to instantiate worker:', err);
    }

    // Hidden offscreen canvas for frame extraction
    canvasRef.current = document.createElement('canvas');
    canvasRef.current.width = 320;
    canvasRef.current.height = 240;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (worker) {
        worker.terminate();
      }
      workerRef.current = null;
    };
  }, []);

  // Frame extraction loop active only during isRecording
  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // If recording starts and we don't have a score yet, provide baseline
    setVisualScore((prev) => prev ?? 85);

    // Run frame capture loop at ~5 FPS (200ms)
    intervalRef.current = setInterval(async () => {
      const video = videoRef?.current;
      const worker = workerRef.current;
      const canvas = canvasRef.current;

      if (!video || !worker || !canvas || video.readyState < 2) {
        return;
      }

      try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const bitmap = await createImageBitmap(canvas);

        // Transfer ImageBitmap ownership to the worker for zero-copy memory performance
        worker.postMessage(
          {
            type: 'PROCESS_FRAME',
            frameBitmap: bitmap,
            timestamp: Date.now()
          },
          [bitmap]
        );
      } catch (err) {
        // Video might be pausing or transitioning
      }
    }, 200);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, videoRef]);

  const resetTelemetry = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'RESET' });
    }
    setVisualScore(null);
    setFaceDetected(false);
  };

  return {
    visualScore,
    faceDetected,
    isReady,
    resetTelemetry
  };
}
