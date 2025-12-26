import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { LanguageModel } from 'ai';
import {
  getCurrentProvider,
  getProviderBaseUrl,
  getProviderApiKey,
  getDefaultModel,
  getMaxInputTokens,
  AI_PROVIDERS,
  type AIProviderType,
} from './ai-providers';

// Re-export provider utilities for external use
export { getCurrentProvider, getDefaultModel, AI_PROVIDERS, listProviders } from './ai-providers';
export type { AIProviderType, AIProviderConfig, AIModel } from './ai-providers';

/**
 * Get max context tokens for the current model
 */
export const getMaxContextTokens = (): number => {
  const modelName = getDefaultModel();
  return getMaxInputTokens(modelName);
};

/**
 * Token estimation based on typical tokenizer behavior:
 * English: 1 char ≈ 0.3 token -> 1 token ≈ 3.3 chars
 * Using 3 chars per token for safety margin
 */
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 3);
};

/**
 * Truncate context to fit within model limits
 * Keeps the most recent/relevant content
 */
export const truncateContext = (contextString: string, maxTokens?: number): string => {
  const limit = maxTokens || getMaxContextTokens();
  const estimatedTokens = estimateTokens(contextString);

  if (estimatedTokens <= limit) {
    return contextString;
  }

  console.warn(`[models] Context too long (${estimatedTokens} tokens), truncating to ${limit} tokens`);

  // Truncate from the beginning, keeping the most recent content
  // 3 chars per token based on estimation
  const maxChars = limit * 3;
  const truncated = contextString.slice(-maxChars);

  // Find a clean break point (paragraph or line)
  const cleanBreak = truncated.indexOf('\n\n');
  if (cleanBreak > 0 && cleanBreak < 1000) {
    return '[Context truncated due to length...]\n\n' + truncated.slice(cleanBreak + 2);
  }

  return '[Context truncated due to length...]\n\n' + truncated;
};

/**
 * Create the LLM provider based on current configuration
 * Supports: OpenAI, DeepSeek, Perplexity, MiniMax, GLM (all OpenAI-compatible)
 * And: Anthropic (native SDK)
 */
const createLLMProvider = () => {
  const provider = getCurrentProvider();
  const baseUrl = getProviderBaseUrl();
  const apiKey = getProviderApiKey();

  if (!apiKey) {
    console.warn(`[models] WARNING: No API key found for provider ${provider.name}`);
  }

  // Anthropic uses its own SDK
  if (provider.id === 'anthropic') {
    return {
      type: 'anthropic' as const,
      client: createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
      }),
    };
  }

  // All other providers use OpenAI-compatible API
  return {
    type: 'openai-compatible' as const,
    client: createOpenAI({
      apiKey: apiKey,
      baseURL: baseUrl,
    }),
  };
};

// Lazy-initialize provider
let llmProvider: ReturnType<typeof createLLMProvider> | null = null;

const getLLMProviderInstance = () => {
  if (!llmProvider) {
    llmProvider = createLLMProvider();
  }
  return llmProvider;
};

/**
 * Get the configured model for chat completion
 * Model is configurable via AI_PROVIDER and OPENAI_MODEL env vars
 */
export const getModel = (name?: string): LanguageModel => {
  const modelName = name || getDefaultModel();
  const provider = getLLMProviderInstance();

  if (provider.type === 'anthropic') {
    return provider.client(modelName) as LanguageModel;
  }

  return provider.client(modelName) as LanguageModel;
};

/**
 * Get the model for responses (same as getModel)
 * Web search availability depends on the provider
 */
export const getResponsesModel = (): LanguageModel => {
  return getModel();
};

/**
 * Get the raw provider for advanced usage
 */
export const getLLMProvider = () => {
  return getLLMProviderInstance().client;
};

/**
 * Get a specific provider by type
 * Useful for comparing responses or fallback scenarios
 */
export const getProviderByType = (providerType: AIProviderType) => {
  const config = AI_PROVIDERS[providerType];
  if (!config) {
    throw new Error(`Unknown provider: ${providerType}`);
  }

  const apiKey = process.env[config.apiKeyEnvVar] || process.env.OPENAI_API_KEY || '';

  if (providerType === 'anthropic') {
    return createAnthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY || '',
    });
  }

  return createOpenAI({
    apiKey: apiKey,
    baseURL: config.baseUrl,
  });
};

/**
 * Get a model from a specific provider
 * Example: getModelFromProvider('deepseek', 'deepseek-reasoner')
 */
export const getModelFromProvider = (providerType: AIProviderType, modelName?: string): LanguageModel => {
  const config = AI_PROVIDERS[providerType];
  const model = modelName || config.defaultModel;
  const provider = getProviderByType(providerType);
  return provider(model) as LanguageModel;
};

// Log current configuration on module load
const currentProvider = getCurrentProvider();
const currentModel = getDefaultModel();
console.log(`[models] Provider: ${currentProvider.name}, Model: ${currentModel}, Base URL: ${getProviderBaseUrl()}`);
