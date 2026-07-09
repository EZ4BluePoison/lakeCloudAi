import { useState, useEffect, useCallback } from 'react';
import { Cloud, Eye, EyeOff, Loader2, RefreshCw, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { fetchCaptcha, type CaptchaInfo } from '@/services/authService';

const isDev = import.meta.env.DEV;

const devAccounts = [
  { label: '管理员', username: 'admin', icon: Shield },
  { label: '测试用户', username: 'testuser', icon: Users },
];

export default function LoginPage() {
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaInfo | null>(null);
  const [captchaCode, setCaptchaCode] = useState('');

  const loadCaptcha = useCallback(async () => {
    try {
      const c = await fetchCaptcha();
      setCaptcha(c);
    } catch {
      setCaptcha(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 初始化验证码
    void loadCaptcha();
  }, [loadCaptcha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !captchaCode.trim() || !captcha) return;
    try {
      await login(username.trim(), password.trim(), captchaCode.trim(), captcha.captchaKey);
    } catch {
      setCaptchaCode('');
      void loadCaptcha();
    }
  };

  const handleDevLogin = (account: { username: string; password?: string }) => {
    setUsername(account.username);
    setPassword(account.password || 'thy@123456');
    setCaptchaCode('');
    void loadCaptcha();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F5F6F7] to-[#E8F1FF]">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#DEE0E3]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3370FF] to-[#00E5FF] flex items-center justify-center shadow-lg">
            <Cloud className="w-9 h-9 text-white" />
          </div>
        </div>
        <h1 className="text-[22px] font-semibold text-center text-[#1F2329] mb-2">太湖云 AI 企业智能体</h1>
        <p className="text-[13px] text-center text-[#8F959E] mb-8">登录后即可使用智能助手、知识库与系统管理</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="h-11 rounded-xl bg-[#F2F3F5] border-transparent focus:border-[#3370FF] text-[14px] placeholder:text-[#BBBFC4]"
            />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-11 rounded-xl bg-[#F2F3F5] border-transparent focus:border-[#3370FF] text-[14px] placeholder:text-[#BBBFC4] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F959E] hover:text-[#3370FF]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {captcha?.captchaImage ? (
              <img
                src={captcha.captchaImage}
                alt="验证码"
                className="h-11 rounded-xl border border-[#DEE0E3] bg-white object-contain cursor-pointer flex-1"
                onClick={() => void loadCaptcha()}
                title="点击刷新"
              />
            ) : (
              <div className="h-11 rounded-xl bg-[#F2F3F5] flex-1 flex items-center justify-center text-[#8F959E] text-[13px]">
                验证码加载中
              </div>
            )}
            <button
              type="button"
              onClick={() => void loadCaptcha()}
              disabled={isLoading}
              className="h-11 px-4 rounded-xl bg-[#E8F1FF] text-[#3370FF] text-[13px] font-medium hover:bg-[#D0E0FF] disabled:opacity-60 flex items-center gap-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              刷新
            </button>
          </div>

          <div>
            <Input
              placeholder="请输入验证码"
              value={captchaCode}
              onChange={(e) => setCaptchaCode(e.target.value)}
              disabled={isLoading}
              maxLength={10}
              className="h-11 rounded-xl bg-[#F2F3F5] border-transparent focus:border-[#3370FF] text-[14px] placeholder:text-[#BBBFC4]"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#FFF2F0] text-[#F54A45] text-[13px]">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !captcha || !captchaCode.trim()}
            className="w-full h-11 rounded-xl bg-[#3370FF] hover:bg-[#245BDB] text-white text-[15px] font-medium disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '登录'}
          </Button>
        </form>

        {isDev && (
          <div className="mt-6 pt-6 border-t border-[#DEE0E3]">
            <p className="text-[11px] text-center text-[#BBBFC4] mb-3">开发调试：快速模拟不同账号</p>
            <div className="grid grid-cols-2 gap-2">
              {devAccounts.map(({ label, username: u, icon: Icon }) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => void handleDevLogin({ username: u })}
                  className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl bg-[#F2F3F5] hover:bg-[#E8F1FF] text-[#646A73] hover:text-[#3370FF] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-[11px] text-center text-[#BBBFC4]">
          账号密码由管理后台统一维护，登录即代表同意相关安全策略
        </p>
      </div>
    </div>
  );
}
