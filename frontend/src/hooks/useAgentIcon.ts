import { useMemo } from 'react';
import { getAgentIconInfo, type AgentIconInfo } from '@/services/agentService';

export function useAgentIcon(agentId: string): AgentIconInfo {
  const iconInfo = useMemo(() => {
    return getAgentIconInfo(agentId);
  }, [agentId]);

  return iconInfo;
}

export function useAgentAvatar(agentId: string): { icon: string; gradient: string } {
  const iconInfo = useAgentIcon(agentId);
  return {
    icon: iconInfo.icon,
    gradient: iconInfo.avatarGradient,
  };
}

export function useAgentIconBg(agentId: string): { icon: string; iconBg: string } {
  const iconInfo = useAgentIcon(agentId);
  return {
    icon: iconInfo.icon,
    iconBg: iconInfo.iconBg,
  };
}
