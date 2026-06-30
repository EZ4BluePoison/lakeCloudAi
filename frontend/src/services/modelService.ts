
import type {
  LLMConfig,
  ChatMessage,
  ChatResponse,
  ChatStreamChunk
} from '@/types';
import {
  OllamaClient,
  createOllamaClient,
  type OllamaChatMessage
} from './ollamaService';

export class ModelService {
  config: LLMConfig;
  ollamaClient?: OllamaClient;

  constructor(config: LLMConfig) {
    this.config = config;
    
    if (config.provider === 'ollama') {
      this.ollamaClient = createOllamaClient({
        baseUrl: config.ollamaBaseUrl || 'http://localhost:11434'
      });
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (this.config.provider === 'ollama') {
        if (this.ollamaClient) {
          return await this.ollamaClient.isAvailable();
        }
        return false;
      }
      
      if (this.config.provider === 'wuxidata') {
        const baseUrl = this.getWuxidataBaseUrl();
        const response = await fetch(`${baseUrl}/api/v1/chat/health`);
        return response.ok;
      }
      
      return true;
    } catch (error) {
      console.error('Model service unavailable:', error);
      return false;
    }
  }

  async listModels(): Promise<any[]> {
    try {
      if (this.config.provider === 'ollama' && this.ollamaClient) {
        return await this.ollamaClient.listModels();
      }
      
      if (this.config.provider === 'wuxidata') {
        return [
          { name: '/model/Qwen3-Next', label: 'Qwen3-Next-80B-A3B' },
          { name: '/model/DeepSeek-V32', label: 'DeepSeek-V3.2' },
          { name: '/model/qwen3_32b', label: 'Qwen3-32B' },
          { name: '/model/qwen3_vl_30b', label: 'Qwen3-VL-30B' },
          { name: '/model/qwen3_30b', label: 'Qwen3-30B' },
        ];
      }
      
      return [
        { name: 'llama3', label: 'Llama 3' },
        { name: 'mistral', label: 'Mistral' },
        { name: 'qwen2', label: 'Qwen 2' },
        { name: 'gemma', label: 'Gemma' },
      ];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    console.log('Sending chat request to:', this.config.provider, this.config.model);
    
    try {
      if (this.config.provider === 'ollama' && this.ollamaClient) {
        return await this.chatWithOllama(messages);
      }
      
      if (this.config.provider === 'wuxidata') {
        return await this.chatWithWuxidata(messages);
      }
      
      return await this.chatWithMock(messages);
    } catch (error) {
      console.error('Chat failed:', error);
      throw error;
    }
  }

  private async chatWithOllama(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.ollamaClient) {
      throw new Error('Ollama client not initialized');
    }

    const ollamaMessages: OllamaChatMessage[] = messages.map(msg => ({
      role: msg.role as OllamaChatMessage['role'],
      content: msg.content
    }));

    const startTime = Date.now();
    
    const response = await this.ollamaClient.chat({
      model: this.config.model,
      messages: ollamaMessages,
      stream: false,
      options: {
        temperature: this.config.temperature,
        top_p: this.config.topP,
        num_predict: this.config.maxTokens,
        top_k: 40
      }
    });

    const latency = Date.now() - startTime;

    return {
      id: `ollama-${Date.now()}`,
      content: response.message.content,
      model: response.model,
      usage: {
        promptTokens: response.prompt_eval_count || 0,
        completionTokens: response.eval_count || 0,
        totalTokens: (response.prompt_eval_count || 0) + (response.eval_count || 0)
      },
      metadata: {
        finishReason: 'stop',
        latency: latency
      }
    };
  }

  private async chatWithMock(messages: ChatMessage[]): Promise<ChatResponse> {
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
    
    const content = this.getMockResponse(messages, this.config.provider);
    
    return {
      id: 'chat-' + Date.now(),
      content,
      model: this.config.model,
      usage: {
        promptTokens: this.estimateTokens(messages),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: 0
      },
      metadata: {
        finishReason: 'stop',
        latency: 800
      }
    };
  }

  async *streamChat(messages: ChatMessage[]): AsyncGenerator<ChatStreamChunk> {
    try {
      if (this.config.provider === 'ollama' && this.ollamaClient) {
        for await (const chunk of this.streamChatWithOllama(messages)) {
          yield chunk;
        }
        return;
      }
      
      if (this.config.provider === 'wuxidata') {
        for await (const chunk of this.streamChatWithWuxidata(messages)) {
          yield chunk;
        }
        return;
      }
      
      for await (const chunk of this.streamChatWithMock(messages)) {
        yield chunk;
      }
    } catch (error) {
      console.error('Stream chat failed:', error);
      throw error;
    }
  }

  private async *streamChatWithOllama(messages: ChatMessage[]): AsyncGenerator<ChatStreamChunk> {
    if (!this.ollamaClient) {
      throw new Error('Ollama client not initialized');
    }

    const ollamaMessages: OllamaChatMessage[] = messages.map(msg => ({
      role: msg.role as OllamaChatMessage['role'],
      content: msg.content
    }));

    const responseId = `ollama-stream-${Date.now()}`;

    for await (const chunk of this.ollamaClient.streamChat({
      model: this.config.model,
      messages: ollamaMessages,
      stream: true,
      options: {
        temperature: this.config.temperature,
        top_p: this.config.topP,
        num_predict: this.config.maxTokens
      }
    })) {
      yield {
        id: responseId,
        content: chunk.message.content,
        isDelta: true,
        isFinished: chunk.done
      };
    }
  }

  private getWuxidataBaseUrl(): string {
    return this.config.apiEndpoint || 'http://localhost:8080';
  }

  private buildWuxidataRequestBody(messages: ChatMessage[]) {
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
      stream: false,
      temperature: this.config.temperature ?? 0.6,
      max_tokens: this.config.maxTokens ?? 2048,
      top_p: this.config.topP ?? 0.9
    };

    // Qwen3-Next 支持思考模式
    if (this.config.model === '/model/Qwen3-Next' || this.config.model?.includes('qwen3')) {
      body.enable_thinking = true;
    }

    return body;
  }

  private async chatWithWuxidata(messages: ChatMessage[]): Promise<ChatResponse> {
    const baseUrl = this.getWuxidataBaseUrl();
    const startTime = Date.now();

    const response = await fetch(`${baseUrl}/api/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(this.buildWuxidataRequestBody(messages))
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`后端代理请求失败: ${response.status} ${text}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;
    const choice = data.choices?.[0];
    const content = choice?.message?.content || '';

    return {
      id: data.id || `wuxidata-${Date.now()}`,
      content,
      model: data.model || this.config.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      },
      metadata: {
        finishReason: choice?.finish_reason || 'stop',
        latency
      }
    };
  }

  private async *streamChatWithWuxidata(messages: ChatMessage[]): AsyncGenerator<ChatStreamChunk> {
    const baseUrl = this.getWuxidataBaseUrl();
    const body = this.buildWuxidataRequestBody(messages);
    body.stream = true;

    const response = await fetch(`${baseUrl}/api/v1/chat/completions/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`后端流式代理请求失败: ${response.status} ${text}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    const responseId = `wuxidata-stream-${Date.now()}`;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (dataStr === '[DONE]') {
          yield { id: responseId, content: '', isDelta: true, isFinished: true };
          return;
        }

        try {
          const data = JSON.parse(dataStr);
          const delta = data.choices?.[0]?.delta;
          if (delta?.content) {
            yield {
              id: responseId,
              content: delta.content,
              isDelta: true,
              isFinished: data.choices[0]?.finish_reason != null
            };
          }
        } catch (e) {
          console.warn('解析 SSE 数据失败:', dataStr, e);
        }
      }
    }
  }

  private async *streamChatWithMock(messages: ChatMessage[]): AsyncGenerator<ChatStreamChunk> {
    const response = await this.chatWithMock(messages);
    const content = response.content;
    const chunkSize = 3;
    
    for (let i = 0; i < content.length; i += chunkSize) {
      yield {
        id: response.id + '-' + i,
        content: content.slice(i, i + chunkSize),
        isDelta: true,
        isFinished: i + chunkSize >= content.length
      };
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    yield {
      id: response.id + '-finish',
      content: '',
      isDelta: false,
      isFinished: true,
      metadata: { usage: response.usage }
    };
  }

  private getMockResponse(messages: ChatMessage[], provider: string): string {
    const lastMessage = messages[messages.length - 1];
    const question = lastMessage?.content || '';
    
    const providerPrefix = {
      'openai': '🤖 [OpenAI GPT]',
      'anthropic': '🧠 [Anthropic Claude]',
      'azure': '☁️ [Azure OpenAI]',
      'ollama': '🏠 [Ollama 本地模型]',
      'custom': '🔧 [自定义模型]'
    };
    
    const prefix = providerPrefix[provider as keyof typeof providerPrefix] || '🤖';
    
    if (question.includes('你好') || question.includes('hi')) {
      return `${prefix} 你好！我是知识问答助手，很高兴为您服务。请问有什么关于集团制度或业务流程的问题吗？`;
    }
    
    if (question.includes('请假') || question.includes('休假')) {
      return `${prefix} 根据集团《员工考勤与请假管理制度》，请假流程如下：

1. 填写请假申请单，注明请假类型和天数
2. 直属主管审批（1-3天）
3. 部门经理审批（4-7天）
4. 人力资源部备案（超过7天）

请假需提前3个工作日申请，病假需提供医院证明。`;
    }
    
    if (question.includes('报销') || question.includes('费用')) {
      return `${prefix} 费用报销流程参考《财务报销流程指南》：

报销步骤：
1. 收集发票和相关凭证
2. 填写电子报销单
3. 部门负责人审批
4. 财务审核（3个工作日内）
5. 完成支付

注意：超过2000元的报销需提供合同或协议作为附件。`;
    }
    
    return `${prefix} 感谢您的提问！基于您配置的知识库，我正在为您分析相关内容。您可以继续与我进行多轮对话。`;
  }

  private estimateTokens(messages: ChatMessage[]): number {
    return messages.reduce((total, msg) => {
      return total + Math.ceil(msg.content.length / 4);
    }, 0);
  }
}

export function createModelService(config: LLMConfig): ModelService {
  return new ModelService(config);
}

