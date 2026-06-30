import { useState, useEffect, useCallback } from 'react';
import { Server, Settings, CheckCircle, XCircle, RefreshCw, Download, Info, Globe, Cpu, Database, Calendar } from 'lucide-react';
import type { LLMConfig } from '@/types';
import { OllamaClient, createOllamaClient, type OllamaModel } from '@/services/ollamaService';

interface OllamaConfigPanelProps {
  config: LLMConfig;
  onChange: (config: LLMConfig) => void;
}

function formatSize(bytes: number): string {
  const GB = 1024 * 1024 * 1024;
  const MB = 1024 * 1024;
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  return `${bytes} B`;
}

export function OllamaConfigPanel({ config, onChange }: OllamaConfigPanelProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    if (config.provider === 'ollama') {
      testConnection();
    }
  }, [config.provider]); // eslint-disable-line react-hooks/exhaustive-deps -- testConnection is defined below and stable enough for this effect

  const testConnection = useCallback(async () => {
    setIsTesting(true);
    setStatus('idle');
    try {
      const client = createOllamaClient({ baseUrl: config.ollamaBaseUrl || 'http://localhost:11434' });
      const available = await client.isAvailable();
      setStatus(available ? 'success' : 'error');
      if (available) {
        await loadModels(client);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setStatus('error');
    } finally {
      setIsTesting(false);
    }
  }, [config.ollamaBaseUrl]); // eslint-disable-line react-hooks/exhaustive-deps -- loadModels is defined below and stable enough for this callback

  const loadModels = useCallback(async (client?: OllamaClient) => {
    setIsLoadingModels(true);
    try {
      const ollamaClient = client || createOllamaClient({ baseUrl: config.ollamaBaseUrl || 'http://localhost:11434' });
      const models = await ollamaClient.listModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setIsLoadingModels(false);
    }
  }, [config.ollamaBaseUrl]);

  const handleBaseUrlChange = (value: string) => {
    onChange({ ...config, ollamaBaseUrl: value });
    setStatus('idle');
  };

  const handleModelChange = (modelName: string) => {
    onChange({ ...config, model: modelName });
  };

  const selectedModelDetails = availableModels.length > 0 
    ? availableModels.find(m => (m.name || m.model) === config.model) 
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Server className="w-5 h-5 text-[#3370FF]" />
        <div>
          <h2 className="text-[15px] font-semibold text-[#1F2329]">Ollama Local Service Config</h2>
          <p className="text-xs text-[#8F959E]">Connect to locally deployed model service</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-[13px] font-medium text-[#646A73] mb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4" />Service URL (Base URL)
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={config.ollamaBaseUrl || 'http://localhost:11434'}
              onChange={(e) => handleBaseUrlChange(e.target.value)}
              placeholder="http://localhost:11434"
              className="flex-1 px-3 py-2 rounded-md border border-[#DEE0E3] text-[13px] text-[#1F2329] focus:outline-none focus:ring-2 focus:ring-[#3370FF]/20 focus:border-[#3370FF] transition-all"
            />
            <button
              onClick={testConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-md bg-[#3370FF] text-white hover:bg-[#245BDB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Test Connection
            </button>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            {status === 'success' && (
              <div className="flex items-center gap-1.5 text-sm text-[#00B96B] bg-[#E8F8EE] px-3 py-1.5 rounded-md">
                <CheckCircle className="w-4 h-4" />Connected - Ollama service is running
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-1.5 text-sm text-[#F54A45] bg-[#FDE8E8] px-3 py-1.5 rounded-md">
                <XCircle className="w-4 h-4" />Failed to connect - Please check if Ollama service is running
              </div>
            )}
            {status === 'idle' && (
              <div className="flex items-center gap-1.5 text-sm text-[#8F959E] bg-[#F2F3F5] px-3 py-1.5 rounded-md">
                <Info className="w-4 h-4" />Click Test Connection to verify Ollama service status
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-[#DEE0E3] pt-4">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[13px] font-medium text-[#646A73] flex items-center gap-2">
            <Cpu className="w-4 h-4" />Locally Deployed Models
          </label>
          <button
            onClick={() => loadModels()}
            disabled={isLoadingModels || status !== 'success'}
            className="text-xs text-[#3370FF] hover:text-[#245BDB] flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E8F1FF] hover:bg-[#D0E0FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
            {isLoadingModels ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>

        {status !== 'success' && availableModels.length === 0 && (
          <div className="text-center py-8 bg-[#F8F9FA] rounded-lg">
            <XCircle className="w-10 h-10 text-[#F54A45] mx-auto mb-3" />
            <div className="text-sm text-[#8F959E] mb-2">Failed to get model list</div>
            <p className="text-xs text-[#646A73]">Please make sure Ollama service is connected first</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            {isLoadingModels ? (
              <div className="text-center py-8 text-[#8F959E]">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <div>Getting local model list...</div>
              </div>
            ) : availableModels.length > 0 ? (
              <div className="space-y-2">
                {availableModels.map((model) => {
                  const name = model.name || model.model;
                  const isSelected = config.model === name;
                  const sizeDisplay = formatSize(model.size || 0);
                  
                  return (
                    <button
                      key={name}
                      onClick={() => handleModelChange(name)}
                      className={`text-left p-4 rounded-lg border-2 transition-all w-full ${
                        isSelected ? 'border-[#3370FF] bg-[#E8F1FF]' : 'border-[#DEE0E3] hover:border-[#B8C7D7] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-medium text-[#1F2329]">{name}</span>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-[#3370FF]" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs text-[#646A73] flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              {sizeDisplay}
                            </span>
                            {model.modified_at && (
                              <span className="text-xs text-[#8F959E] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(model.modified_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 bg-[#F8F9FA] rounded-lg">
                <div className="text-[#8F959E] mb-3">No models deployed locally</div>
                <div className="text-xs text-[#646A73] space-y-2 mb-4">
                  <p>Please run the following command in your terminal to download a model:</p>
                  <div className="bg-[#1F2329] text-white p-3 rounded-lg text-left font-mono">
                    <p className="mb-1">ollama pull qwen2</p>
                    <p className="mb-1">ollama pull llama3</p>
                    <p>ollama pull mistral</p>
                  </div>
                </div>
                <button
                  onClick={() => window.open('https://ollama.com/library', '_blank')}
                  className="px-4 py-2 text-sm rounded-md bg-[#F2F3F5] text-[#646A73] hover:bg-[#E8E9EB] transition-colors flex items-center gap-2 mx-auto"
                >
                  <Download className="w-4 h-4" />Browse Ollama Model Library
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedModelDetails && (
        <div className="border-t border-[#DEE0E3] pt-4 mt-4">
          <h3 className="text-sm font-medium text-[#1F2329] mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />Selected Model Details
          </h3>
          <div className="bg-[#F8F9FA] rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8F959E] block mb-1">Model Name</label>
                <div className="text-sm font-medium text-[#1F2329]">{selectedModelDetails.name || selectedModelDetails.model}</div>
              </div>
              <div>
                <label className="text-xs text-[#8F959E] block mb-1">File Size</label>
                <div className="text-sm text-[#646A73]">{formatSize(selectedModelDetails.size || 0)}</div>
              </div>
              <div>
                <label className="text-xs text-[#8F959E] block mb-1">Deployment Status</label>
                <div className="text-sm text-[#00B96B] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />Deployed, Ready to Use
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}