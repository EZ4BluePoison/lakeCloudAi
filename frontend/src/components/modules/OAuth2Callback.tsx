import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Loader2, AlertCircle } from 'lucide-react';

export default function OAuth2Callback() {
  const loginWithCode = useAuthStore((state) => state.loginWithCode);

  const initialCode = useMemo(() => new URLSearchParams(window.location.search).get('code'), []);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    initialCode ? 'loading' : 'error'
  );
  const [message, setMessage] = useState(
    initialCode ? '正在处理授权回调…' : '授权回调缺少 code 参数，请重新登录。'
  );

  useEffect(() => {
    if (!initialCode) return;

    loginWithCode(initialCode)
      .then(() => {
        setStatus('success');
        setMessage('登录成功，正在进入系统…');
        // 清除 URL 上的授权码并跳回首页
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = '/';
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : '登录失败，请重试。');
      });
  }, [loginWithCode, initialCode]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F6F7]">
      <div className="flex flex-col items-center text-center p-8">
        {status === 'error' ? (
          <AlertCircle className="w-12 h-12 text-[#F54A45] mb-4" />
        ) : (
          <Loader2 className="w-12 h-12 text-[#3370FF] animate-spin mb-4" />
        )}
        <h2 className="text-[18px] font-medium text-[#1F2329] mb-2">
          {status === 'success' ? '登录成功' : status === 'error' ? '登录失败' : '正在登录'}
        </h2>
        <p className="text-[13px] text-[#8F959E]">{message}</p>
      </div>
    </div>
  );
}
