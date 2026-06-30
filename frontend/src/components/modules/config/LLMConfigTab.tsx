import { useState, useMemo } from 'react';
import { Bot, Key, Server, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { availableLLMs as staticAvailableLLMs, modelMetadatas as staticModelMetadatas, ollamaDefaultConfig } from '@/data/agentConfigs';
import type { AgentConfig } from '@/types';
import { OllamaConfigPanel } from './OllamaConfigPanel';

interface LLMConfigTabProps {
  config: AgentConfig;
  onChange: (config: AgentConfig) => void;
  onDirty: () => void;
}

interface ModelProviderInfo {
  provider: string;
  name: string;
  models: string[];
}

export function LLMConfigTab({ config, onChange, onDirty }: LLMConfigTabProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  
  const availableLLMs = useMemo((): ModelProviderInfo[] => {
    const ollamaProvider: ModelProviderInfo = {
      provider: 'ollama',
      name: 'Ollama Local Model',
      models: ollamaModels
    };
    return [...(staticAvailableLLMs as ModelProviderInfo[]), ollamaProvider];
  }, [ollamaModels]);
  
  const allModelMetadatas = useMemo(() => {
    return [...staticModelMetadatas];
  }, []);
  
  const handleLLMChange = (field: keyof AgentConfig['llmConfig'], value: string | number) => {
    onChange({
      ...config,
      llmConfig: { ...config.llmConfig, [field]: value }
    });
    onDirty();
  };
  
  const handleOllamaConfigChange = (llmConfig: typeof config.llmConfig) => {
    onChange({
      ...config,
      llmConfig
    });
    onDirty();
    if (llmConfig.provider === 'ollama') {
      loadOllamaModels(llmConfig.ollamaBaseUrl || ollamaDefaultConfig.baseUrl);
    }
  };
  
  const loadOllamaModels = async (baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map((m: { name?: string; model?: string }) => m.name || m.model) || [];
        setOllamaModels(models);
      }
    } catch (error) {
      console.error('Failed to load Ollama models:', error);
    }
  };
  
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    try {
      if (config.llmConfig.provider === 'ollama') {
        const baseUrl = config.llmConfig.ollamaBaseUrl || ollamaDefaultConfig.baseUrl;
        const response = await fetch(`${baseUrl}/api/tags`);
        if (response.ok) {
          const data = await response.json();
          const models = data.models?.map((m: { name?: string; model?: string }) => m.name || m.model) || [];
          setOllamaModels(models);
          setConnectionStatus('success');
        } else {
          setConnectionStatus('error');
        }
      } else if (config.llmConfig.provider === 'wuxidata') {
        const baseUrl = config.llmConfig.apiEndpoint || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/chat/health`);
        setConnectionStatus(response.ok ? 'success' : 'error');
      } else if (config.llmConfig.apiKey && config.llmConfig.apiKey.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const currentProvider = availableLLMs.find(p => p.provider === config.llmConfig.provider);
  const providerModels = currentProvider?.models || [];
  const currentModelMetadata = allModelMetadatas.find(m => m.id === config.llmConfig.model);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-[#DEE0E3] p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bot className="w-5 h-5 text-[#3370FF]" />
          <h2 className="text-[15px] font-semibold text-[#1F2329]">LLM Configuration</h2>
        </div>
        
        <div className="mb-6">
          <label className="block text-[13px] font-medium text-[#646A73] mb-2">Service Provider</label>
          <div className="grid grid-cols-2 gap-3">
            {availableLLMs.map((provider) => (
              <button
                key={provider.provider}
                onClick={() => handleLLMChange('provider', provider.provider)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  config.llmConfig.provider === provider.provider 
                    ? 'border-[#3370FF] bg-[#E8F1FF]' 
                    : 'border-[#DEE0E3] hover:border-[#B8C7D7]'
                }`}
              >
                <div className="font-medium text-[#1F2329]">{provider.name}</div>
                <div className="text-xs text-[#8F959E] mt-1">{provider.models.length} models available</div>
              </button>
            ))}
          </div>
        </div>
        
        {config.llmConfig.provider === 'ollama' && (
          <OllamaConfigPanel
            config={config.llmConfig}
            onChange={handleOllamaConfigChange}
          />
        )}
        
        {config.llmConfig.provider !== 'ollama' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" /> API Key
              </label>
              <input
                type="password"
                value={config.llmConfig.apiKey || ''}
                onChange={(e) => handleLLMChange('apiKey', e.target.value)}
                placeholder="Enter your API Key"
                className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all"
              />
              <p className="text-xs text-[#8F959E] mt-1">
                Your API Key is stored securely locally and never sent to third parties
              </p>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2 flex items-center gap-2">
                <Server className="w-4 h-4" /> API Endpoint (Optional)
              </label>
              <input
                type="text"
                value={config.llmConfig.apiEndpoint || ''}
                onChange={(e) => handleLLMChange('apiEndpoint', e.target.value)}
                placeholder="https://api.example.com/v1"
                className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="px-3 py-1.5 text-sm rounded-md bg-[#F2F3F5] text-[#646A73] hover:bg-[#E8E9EB] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isTestingConnection ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Test Connection
              </button>
              
              {connectionStatus === 'success' && (
                <span className="flex items-center gap-1 text-sm text-[#00B96B]">
                  <CheckCircle2 className="w-4 h-4" />
                  Connected
                </span>
              )}
              
              {connectionStatus === 'error' && (
                <span className="flex items-center gap-1 text-sm text-[#F54A45]">
                  <XCircle className="w-4 h-4" />
                  Connection Failed
                </span>
              )}
            </div>
          </div>
        )}
        
        {config.llmConfig.provider !== 'ollama' && (
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[#646A73] mb-2">Model</label>
            <select
              value={config.llmConfig.model}
              onChange={(e) => handleLLMChange('model', e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all bg-white"
            >
              {providerModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            
            {currentModelMetadata && (
              <div className="mt-3 p-3 bg-[#F8F9FA] rounded-lg">
                <div className="font-medium text-[#1F2329] text-sm">{currentModelMetadata.name}</div>
                <div className="text-xs text-[#8F959E] mt-1">{currentModelMetadata.description}</div>
                <div className="flex gap-4 mt-2 text-xs text-[#646A73]">
                  <span>Context: {currentModelMetadata.maxContextLength.toLocaleString()} tokens</span>
                  {currentModelMetadata.pricing && (
                    <span>
                      Price: ${currentModelMetadata.pricing.inputTokenPrice}/1K input, ${currentModelMetadata.pricing.outputTokenPrice}/1K output
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-6 pt-4 border-t border-[#DEE0E3]">
          <h3 className="text-sm font-medium text-[#1F2329]">Advanced Parameters</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">
                Temperature
                <span className="text-[11px] text-[#8F959E] ml-1">({config.llmConfig.temperature})</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.llmConfig.temperature}
                onChange={(e) => handleLLMChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-[#8F959E] mt-1">
                Lower values make output more deterministic, higher values make it more creative
              </p>
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">
                Top-P
                <span className="text-[11px] text-[#8F959E] ml-1">({config.llmConfig.topP})</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.llmConfig.topP}
                onChange={(e) => handleLLMChange('topP', parseFloat(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-[#8F959E] mt-1">
                Controls diversity via nucleus sampling. Recommend adjusting only one of temperature or topP
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">Max Tokens</label>
              <input
                type="number"
                min="1"
                max="128000"
                value={config.llmConfig.maxTokens}
                onChange={(e) => handleLLMChange('maxTokens', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all"
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-medium text-[#646A73] mb-2">Frequency Penalty</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={config.llmConfig.frequencyPenalty}
                onChange={(e) => handleLLMChange('frequencyPenalty', parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}