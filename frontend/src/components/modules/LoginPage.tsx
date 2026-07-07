import { useAuthStore } from '@/store/authStore';
import { getOAuth2Url, getMockLoginResult, type MockRole } from '@/services/authService';
import { Cloud, LogIn, Shield, User, Users } from 'lucide-react';

const isDev = import.meta.env.DEV;

const mockRoles: { role: MockRole; label: string; icon: React.ElementType }[] = [
  { role: 'admin', label: '模拟管理员登录', icon: Shield },
  { role: 'manager', label: '模拟部门负责人登录', icon: Users },
  { role: 'user', label: '模拟普通员工登录', icon: User },
];

export default function LoginPage() {
  const { isLoading, error, loginWithToken } = useAuthStore();

  const handleLogin = () => {
    window.location.href = getOAuth2Url();
  };

  const handleMockLogin = (role: MockRole) => {
    const result = getMockLoginResult(role);
    void loginWithToken(result.token, {
      user: result.user,
      roles: result.roles,
      permissions: result.permissions,
    });
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
        <p className="text-[13px] text-center text-[#8F959E] mb-8">登录后即可使用智能助手、知识库与应用广场</p>

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#3370FF] text-white text-[15px] font-medium hover:bg-[#245BDB] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <LogIn className="w-4 h-4" />
          {isLoading ? '登录中…' : '通过国联门户登录'}
        </button>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[#FFF2F0] text-[#F54A45] text-[13px]">
            {error}
          </div>
        )}

        {isDev && (
          <div className="mt-6 pt-6 border-t border-[#DEE0E3]">
            <p className="text-[11px] text-center text-[#BBBFC4] mb-3">开发调试：快速模拟不同角色</p>
            <div className="grid grid-cols-3 gap-2">
              {mockRoles.map(({ role, label, icon: Icon }) => (
                <button
                  key={role}
                  onClick={() => handleMockLogin(role)}
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
          作为国联集团门户子门户，自动同步组织架构与权限
        </p>
      </div>
    </div>
  );
}
