import { useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useWhisperSTT } from '@/hooks/useWhisperSTT';
import { toast } from 'sonner';

export interface VoiceInputButtonProps {
  /** Called when a transcription result is available. */
  onResult: (text: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  /** Optional tooltip placement is not implemented; title is used for accessibility. */
  title?: string;
}

export function VoiceInputButton({
  onResult,
  className = '',
  size = 'md',
  title = '语音输入',
}: VoiceInputButtonProps) {
  const { state, error, progress, start, stop } = useWhisperSTT(onResult, {
    language: 'zh',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleClick = () => {
    if (state === 'recording') {
      stop();
    } else {
      void start();
    }
  };

  const busy = state === 'loading' || state === 'transcribing';

  const sizeClasses = size === 'sm'
    ? 'w-7 h-7 rounded-md'
    : 'w-9 h-9 rounded-xl';

  const stateClasses =
    state === 'recording'
      ? 'bg-red-50 text-red-500 hover:bg-red-100 animate-pulse'
      : busy
        ? 'bg-[#F2F3F5] text-[#3370FF] cursor-wait'
        : 'text-[#8F959E] hover:text-[#3370FF] hover:bg-[#F2F3F5]';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      title={state === 'recording' ? '结束录音' : title}
      className={`flex items-center justify-center transition-all duration-200 ${sizeClasses} ${stateClasses} ${className}`}
    >
      {busy ? (
        <Loader2 className={`${size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'} animate-spin`} />
      ) : (
        <Mic className={`${size === 'sm' ? 'w-4 h-4' : 'w-4 h-4'}`} />
      )}
      {state === 'loading' && progress > 0 && (
        <span className="sr-only">模型加载中 {progress}%</span>
      )}
    </button>
  );
}
