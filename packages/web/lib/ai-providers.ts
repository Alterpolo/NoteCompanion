/**
 * AI Provider Configuration
 *
 * Supports multiple AI providers with their latest models (December 2025):
 * - OpenAI: GPT-5, GPT-4o, o3, o1
 * - Anthropic (Claude): Opus 4.5, Sonnet 4.5
 * - DeepSeek: V3.2 (unified chat/reasoner)
 * - Perplexity: Sonar, Sonar Pro, Deep Research
 * - MiniMax: M2, abab7
 * - GLM (Zhipu): GLM-4.7, GLM-4.5-X, GLM-4.5-Air
 *
 * Most providers use OpenAI-compatible APIs, so we can reuse the same SDK.
 */

export type AIProviderType =
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'perplexity'
  | 'minimax'
  | 'glm';

export interface AIProviderConfig {
  id: AIProviderType;
  name: string;
  baseUrl: string;
  apiKeyEnvVar: string;
  defaultModel: string;
  models: AIModel[];
  isOpenAICompatible: boolean;
  supportsVision: boolean;
  supportsWebSearch: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  contextWindow: number;
  maxOutputTokens: number;
  inputPricePerMillion: number;  // USD per 1M tokens
  outputPricePerMillion: number; // USD per 1M tokens
  cacheHitPricePerMillion?: number; // USD per 1M tokens (cache hit discount)
  supportsVision?: boolean;
  supportsReasoning?: boolean;
}

/**
 * All supported AI providers with their configurations
 * Prices updated December 2025
 */
export const AI_PROVIDERS: Record<AIProviderType, AIProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKeyEnvVar: 'OPENAI_API_KEY',
    defaultModel: 'gpt-4o',
    isOpenAICompatible: true,
    supportsVision: true,
    supportsWebSearch: false,
    models: [
      {
        id: 'gpt-5',
        name: 'GPT-5',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        inputPricePerMillion: 0.625,
        outputPricePerMillion: 5,
        supportsVision: true,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        inputPricePerMillion: 1.25,
        outputPricePerMillion: 5,
        supportsVision: true,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        contextWindow: 128000,
        maxOutputTokens: 16384,
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.6,
        supportsVision: true,
      },
      {
        id: 'o3',
        name: 'o3 (Reasoning)',
        contextWindow: 200000,
        maxOutputTokens: 100000,
        inputPricePerMillion: 1,
        outputPricePerMillion: 4,
        supportsReasoning: true,
      },
      {
        id: 'o3-pro',
        name: 'o3-pro (Reasoning)',
        contextWindow: 200000,
        maxOutputTokens: 100000,
        inputPricePerMillion: 10,
        outputPricePerMillion: 40,
        supportsReasoning: true,
      },
      {
        id: 'o1',
        name: 'o1 (Reasoning)',
        contextWindow: 200000,
        maxOutputTokens: 100000,
        inputPricePerMillion: 7.5,
        outputPricePerMillion: 30,
        supportsReasoning: true,
      },
      {
        id: 'o1-pro',
        name: 'o1-pro (Reasoning)',
        contextWindow: 200000,
        maxOutputTokens: 100000,
        inputPricePerMillion: 75,
        outputPricePerMillion: 300,
        supportsReasoning: true,
      },
    ],
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeyEnvVar: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-sonnet-4-5-20251101',
    isOpenAICompatible: false, // Uses native Anthropic SDK
    supportsVision: true,
    supportsWebSearch: false,
    models: [
      {
        id: 'claude-opus-4-5-20251101',
        name: 'Claude Opus 4.5',
        contextWindow: 200000,
        maxOutputTokens: 32000,
        inputPricePerMillion: 5,
        outputPricePerMillion: 25,
        supportsVision: true,
      },
      {
        id: 'claude-sonnet-4-5-20251101',
        name: 'Claude Sonnet 4.5',
        contextWindow: 200000,
        maxOutputTokens: 16000,
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
        supportsVision: true,
      },
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        contextWindow: 200000,
        maxOutputTokens: 16000,
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
        supportsVision: true,
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputPricePerMillion: 0.8,
        outputPricePerMillion: 4,
        supportsVision: true,
      },
    ],
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyEnvVar: 'DEEPSEEK_API_KEY',
    defaultModel: 'deepseek-chat',
    isOpenAICompatible: true,
    supportsVision: false,
    supportsWebSearch: false,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek V3.2 (Chat)',
        contextWindow: 128000,
        maxOutputTokens: 8192,
        inputPricePerMillion: 0.28,
        outputPricePerMillion: 0.42,
        cacheHitPricePerMillion: 0.028, // 90% savings on cache hit
        supportsVision: false,
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek V3.2 (Reasoner)',
        contextWindow: 128000,
        maxOutputTokens: 64000,
        inputPricePerMillion: 0.28,
        outputPricePerMillion: 0.42,
        cacheHitPricePerMillion: 0.028,
        supportsReasoning: true,
      },
    ],
  },

  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    baseUrl: 'https://api.perplexity.ai',
    apiKeyEnvVar: 'PERPLEXITY_API_KEY',
    defaultModel: 'sonar-pro',
    isOpenAICompatible: true,
    supportsVision: false,
    supportsWebSearch: true, // Native web search!
    models: [
      {
        id: 'sonar',
        name: 'Sonar',
        contextWindow: 127000,
        maxOutputTokens: 8192,
        inputPricePerMillion: 1,
        outputPricePerMillion: 1,
      },
      {
        id: 'sonar-pro',
        name: 'Sonar Pro',
        contextWindow: 200000,
        maxOutputTokens: 8192,
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
      },
      {
        id: 'sonar-deep-research',
        name: 'Deep Research',
        contextWindow: 127000,
        maxOutputTokens: 8192,
        inputPricePerMillion: 2,
        outputPricePerMillion: 8,
        // Note: Additional costs: +$5/1k searches, +$2/1M citations, +$3/1M reasoning
        supportsReasoning: true,
      },
    ],
  },

  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimax.chat/v1',
    apiKeyEnvVar: 'MINIMAX_API_KEY',
    defaultModel: 'abab7-chat-preview',
    isOpenAICompatible: true,
    supportsVision: true,
    supportsWebSearch: true,
    models: [
      {
        id: 'abab7-chat-preview',
        name: 'MiniMax M2',
        contextWindow: 1000000, // 1M context!
        maxOutputTokens: 32000,
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.60,
        // Note: 8% of Claude Sonnet price
      },
      {
        id: 'abab7',
        name: 'MiniMax abab7',
        contextWindow: 1000000,
        maxOutputTokens: 32000,
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.60,
        supportsVision: true,
      },
    ],
  },

  glm: {
    id: 'glm',
    name: 'GLM (Zhipu AI)',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyEnvVar: 'GLM_API_KEY',
    defaultModel: 'glm-4-plus',
    isOpenAICompatible: true,
    supportsVision: true,
    supportsWebSearch: true,
    models: [
      {
        id: 'glm-4-plus',
        name: 'GLM-4.7 (Plus)',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputPricePerMillion: 0.6,
        outputPricePerMillion: 2.2,
        cacheHitPricePerMillion: 0.11, // -82% on cache hit
      },
      {
        id: 'glm-4-5x',
        name: 'GLM-4.5-X',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputPricePerMillion: 2.2,
        outputPricePerMillion: 8.9,
        supportsVision: true,
      },
      {
        id: 'glm-4-air',
        name: 'GLM-4.5-Air',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        inputPricePerMillion: 0.2,
        outputPricePerMillion: 1.1,
      },
      {
        id: 'glm-4v-plus',
        name: 'GLM-4V Plus (Vision)',
        contextWindow: 8000,
        maxOutputTokens: 4096,
        inputPricePerMillion: 0.6,
        outputPricePerMillion: 2.2,
        supportsVision: true,
      },
    ],
  },
};

/**
 * Get the current provider configuration based on environment variables
 */
export function getCurrentProvider(): AIProviderConfig {
  const providerName = (process.env.AI_PROVIDER || 'deepseek').toLowerCase() as AIProviderType;
  return AI_PROVIDERS[providerName] || AI_PROVIDERS.deepseek;
}

/**
 * Get the base URL for the current provider
 * Supports custom base URL override via OPENAI_API_BASE
 */
export function getProviderBaseUrl(): string {
  // Allow custom base URL override
  const customBase = process.env.OPENAI_API_BASE || process.env.OPENAI_BASE_URL;
  if (customBase) {
    return customBase;
  }
  return getCurrentProvider().baseUrl;
}

/**
 * Get the API key for the current provider
 */
export function getProviderApiKey(): string {
  const provider = getCurrentProvider();

  // Check provider-specific key first
  const specificKey = process.env[provider.apiKeyEnvVar];
  if (specificKey) {
    return specificKey;
  }

  // Fall back to generic OPENAI_API_KEY (works for OpenAI-compatible APIs)
  return process.env.OPENAI_API_KEY || '';
}

/**
 * Get the default model for the current provider
 * Can be overridden via OPENAI_MODEL env var
 */
export function getDefaultModel(): string {
  const customModel = process.env.OPENAI_MODEL;
  if (customModel) {
    return customModel;
  }
  return getCurrentProvider().defaultModel;
}

/**
 * Get model info by ID
 */
export function getModelInfo(modelId: string): AIModel | undefined {
  for (const provider of Object.values(AI_PROVIDERS)) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) {
      return model;
    }
  }
  return undefined;
}

/**
 * Get max input tokens for a model
 */
export function getMaxInputTokens(modelId: string): number {
  const model = getModelInfo(modelId);
  if (model) {
    // Reserve space for output
    return model.contextWindow - model.maxOutputTokens;
  }
  // Default fallback
  return 100000;
}

/**
 * List all available providers
 */
export function listProviders(): AIProviderConfig[] {
  return Object.values(AI_PROVIDERS);
}

/**
 * Check if the current provider supports a feature
 */
export function providerSupportsFeature(feature: 'vision' | 'webSearch' | 'reasoning'): boolean {
  const provider = getCurrentProvider();
  switch (feature) {
    case 'vision':
      return provider.supportsVision;
    case 'webSearch':
      return provider.supportsWebSearch;
    case 'reasoning':
      return provider.models.some(m => m.supportsReasoning);
    default:
      return false;
  }
}

/**
 * Get price comparison for all providers (useful for UI display)
 */
export function getPriceComparison(): Array<{
  provider: string;
  model: string;
  inputPrice: number;
  outputPrice: number;
  cachePrice?: number;
}> {
  const comparison: Array<{
    provider: string;
    model: string;
    inputPrice: number;
    outputPrice: number;
    cachePrice?: number;
  }> = [];

  for (const provider of Object.values(AI_PROVIDERS)) {
    for (const model of provider.models) {
      comparison.push({
        provider: provider.name,
        model: model.name,
        inputPrice: model.inputPricePerMillion,
        outputPrice: model.outputPricePerMillion,
        cachePrice: model.cacheHitPricePerMillion,
      });
    }
  }

  // Sort by input price (cheapest first)
  return comparison.sort((a, b) => a.inputPrice - b.inputPrice);
}
