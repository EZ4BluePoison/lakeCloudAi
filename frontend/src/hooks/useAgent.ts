import { useMemo } from 'react';
import type { Agent, MyAgent, PlazaAgent } from '@/types';
import { chatAgents, myAgents, plazaAgents } from '@/data/agents';
import { getAgentIconInfo, normalizeAgentForChat } from '@/services/agentService';

export function useChatAgent(agentId: string): Agent | undefined {
  const agent = useMemo(() => {
    const found = chatAgents.find(a => a.id === agentId);
    if (found) {
      const iconInfo = getAgentIconInfo(agentId);
      return {
        ...found,
        icon: iconInfo.icon,
        avatarGradient: iconInfo.avatarGradient,
      };
    }
    return undefined;
  }, [agentId]);

  return agent;
}

export function useMyAgent(agentId: string): MyAgent | undefined {
  const agent = useMemo(() => {
    const found = myAgents.find(a => a.id === agentId);
    if (found) {
      const iconInfo = getAgentIconInfo(agentId);
      return {
        ...found,
        icon: iconInfo.icon,
        iconBg: iconInfo.iconBg,
      };
    }
    return undefined;
  }, [agentId]);

  return agent;
}

export function usePlazaAgent(agentId: string): PlazaAgent | undefined {
  const agent = useMemo(() => {
    const found = plazaAgents.find(a => a.id === agentId);
    if (found) {
      const iconInfo = getAgentIconInfo(agentId);
      return {
        ...found,
        icon: iconInfo.icon,
        iconBg: iconInfo.iconBg,
      };
    }
    return undefined;
  }, [agentId]);

  return agent;
}

export function useAllChatAgents(): Agent[] {
  const agents = useMemo(() => {
    return chatAgents.map(agent => {
      const iconInfo = getAgentIconInfo(agent.id);
      return {
        ...agent,
        icon: iconInfo.icon,
        avatarGradient: iconInfo.avatarGradient,
      };
    });
  }, []);

  return agents;
}

export function useAllMyAgents(): MyAgent[] {
  const agents = useMemo(() => {
    return myAgents.map(agent => {
      const iconInfo = getAgentIconInfo(agent.id);
      return {
        ...agent,
        icon: iconInfo.icon,
        iconBg: iconInfo.iconBg,
      };
    });
  }, []);

  return agents;
}

export function useAllPlazaAgents(): PlazaAgent[] {
  const agents = useMemo(() => {
    return plazaAgents.map(agent => {
      const iconInfo = getAgentIconInfo(agent.id);
      return {
        ...agent,
        icon: iconInfo.icon,
        iconBg: iconInfo.iconBg,
      };
    });
  }, []);

  return agents;
}

export function useAgentByName(name: string): { chat?: Agent; my?: MyAgent; plaza?: PlazaAgent } | null {
  const result = useMemo(() => {
    const chat = chatAgents.find(a => a.name === name);
    const my = myAgents.find(a => a.name === name);
    const plaza = plazaAgents.find(a => a.name === name);

    if (!chat && !my && !plaza) return null;

    return {
      chat: chat ? {
        ...chat,
        ...getAgentIconInfo(chat.id),
      } : undefined,
      my: my ? {
        ...my,
        ...getAgentIconInfo(my.id),
      } : undefined,
      plaza: plaza ? {
        ...plaza,
        ...getAgentIconInfo(plaza.id),
      } : undefined,
    };
  }, [name]);

  return result;
}

export function useNormalizedAgent(agent: Agent | MyAgent | PlazaAgent): Agent {
  const normalized = useMemo(() => {
    if ('tips' in agent) {
      return agent;
    }
    return normalizeAgentForChat(agent);
  }, [agent]);

  return normalized;
}
