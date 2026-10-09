import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to interface with the native Web Speech API with auto-restart on silent drops.
 * Ensures long spoken candidate answers are never truncated during pauses.
 */
export const useSpeechToText = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [speechError, setSpeechError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const committedTextRef = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API is not supported in this browser.');
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          committedTextRef.current += (committedTextRef.current ? ' ' : '') + item[0].transcript.trim();
        } else {
          interim += ' ' + item[0].transcript;
        }
      }

      const fullTranscript = (committedTextRef.current + (interim ? ' ' + interim.trim() : '')).trim();
      setTranscript(fullTranscript);
    };

    /**
     * CRITICAL AUTO-RESTART LOGIC:
     * When candidates pause speaking for >1-2 seconds, browsers fire 'onend' silently.
     * If shouldListenRef is still true, immediately restart recognition so speech is never lost.
     */
    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (err) {
          // If already starting, ignore InvalidStateError
          if (err.name !== 'InvalidStateError') {
            console.warn('[Speech Recognition] Auto-restart warning:', err.message);
          }
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      // 'no-speech' happens on natural silence; do not stop recording
      if (event.error === 'no-speech') {
        return;
      }
      if (event.error === 'aborted' && !shouldListenRef.current) {
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        setSpeechError('Microphone hardware access was revoked or lost. Speech transcription paused.');
        setIsListening(false);
        shouldListenRef.current = false;
      }
      console.warn('[Speech Recognition] Error encountered:', event.error);
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      try {
        recognition.stop();
      } catch (err) {}
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        console.warn('Error starting speech recognition:', err.message);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {}
  }, []);

  const resetTranscript = useCallback(() => {
    committedTextRef.current = '';
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    speechError
  };
};

export default useSpeechToText;
