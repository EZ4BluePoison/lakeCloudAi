import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuthHeaders } from '@/services/authService';

type STTState = 'idle' | 'recording' | 'loading' | 'transcribing' | 'error';

export interface UseWhisperSTTReturn {
  state: STTState;
  error: string | null;
  progress: number;
  start: () => Promise<void>;
  stop: () => void;
}

export function useWhisperSTT(
  onResult: (text: string) => void,
  options?: { language?: string }
): UseWhisperSTTReturn {
  const [state, setState] = useState<STTState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const abortCleanupRef = useRef(false);

  const transcribeAudio = useCallback(async (audioBlob: Blob, mimeType: string) => {
    setProgress(30);

    const extension = mimeType.includes('webm')
      ? 'webm'
      : mimeType.includes('mp4')
        ? 'mp4'
        : mimeType.includes('wav')
          ? 'wav'
          : 'webm';
    const filename = `recording.${extension}`;

    const formData = new FormData();
    formData.append('file', audioBlob, filename);
    formData.append('language', options?.language || 'zh');

    setProgress(60);

    const response = await fetch('/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    setProgress(90);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errorData.error || `语音转写失败 (${response.status})`);
    }

    const data = (await response.json()) as { text?: string; error?: string };
    if (data.error) {
      throw new Error(data.error);
    }

    setProgress(100);
    return data.text || '';
  }, [options?.language]);

  const start = useCallback(async () => {
    if (state === 'recording' || state === 'loading' || state === 'transcribing') return;
    setError(null);
    setProgress(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (abortCleanupRef.current) return;

        setState('loading');
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
          const text = await transcribeAudio(audioBlob, recorder.mimeType);
          if (abortCleanupRef.current) return;

          setState('transcribing');
          if (text) {
            onResult(text.trim());
          }
          setState('idle');
        } catch (err) {
          if (abortCleanupRef.current) return;
          const message = err instanceof Error ? err.message : '语音识别失败，请重试';
          setError(message);
          setState('error');
        }
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        setError('录音出错，请重试');
        setState('error');
      };

      recorder.start();
      setState('recording');
    } catch (err) {
      const message = err instanceof Error ? err.message : '无法访问麦克风';
      setError(message);
      setState('error');
    }
  }, [state, transcribeAudio, onResult]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  }, []);

  useEffect(() => {
    abortCleanupRef.current = false;
    return () => {
      abortCleanupRef.current = true;
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      mediaRecorderRef.current = null;
    };
  }, []);

  return { state, error, progress, start, stop };
}
