import { useCallback, useEffect, useRef, useState } from 'react';

type STTState = 'idle' | 'recording' | 'loading' | 'transcribing' | 'error';

export interface UseWhisperSTTReturn {
  state: STTState;
  error: string | null;
  progress: number;
  start: () => Promise<void>;
  stop: () => void;
}

const TARGET_SAMPLE_RATE = 16000;

async function decodeAudioBlob(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  try {
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    if (decoded.sampleRate === TARGET_SAMPLE_RATE && decoded.numberOfChannels === 1) {
      return decoded.getChannelData(0);
    }
    // Resample to 16 kHz mono using OfflineAudioContext
    const offline = new OfflineAudioContext(
      1,
      Math.ceil(decoded.duration * TARGET_SAMPLE_RATE),
      TARGET_SAMPLE_RATE
    );
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  } finally {
    void ctx.close();
  }
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
  const pipelineRef = useRef<unknown>(null);
  const abortCleanupRef = useRef(false);

  const ensureModel = useCallback(async () => {
    if (pipelineRef.current) return;
    setProgress(0);
    const { pipeline, env } = await import('@xenova/transformers');
    // Only use remote CDN models; no local model folder is needed in the browser.
    (env as Record<string, unknown>).allowLocalModels = false;
    (env as Record<string, unknown>).allowRemoteModels = true;

    pipelineRef.current = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        quantized: true,
        progress_callback: (p: { status?: string; loaded?: number; total?: number }) => {
          if (p && typeof p.loaded === 'number' && typeof p.total === 'number' && p.total > 0) {
            setProgress(Math.min(100, Math.round((p.loaded / p.total) * 100)));
          }
        },
      }
    );
  }, []);

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
          const audio = await decodeAudioBlob(audioBlob);
          await ensureModel();
          if (abortCleanupRef.current) return;

          setState('transcribing');
          const transcriber = pipelineRef.current as (audio: Float32Array, options?: Record<string, unknown>) => Promise<{ text?: string } | { text?: string }[]>;
          const output = await transcriber(audio, {
            task: 'transcribe',
            language: options?.language || 'chinese',
            chunk_length_s: 30,
            stride_length_s: 5,
          });
          if (abortCleanupRef.current) return;

          const text = Array.isArray(output) ? output[0]?.text : output?.text;
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
  }, [state, ensureModel, onResult, options?.language]);

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
