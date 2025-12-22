import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

// Get base URL from environment - NO fallback to api.openai.com
// Supports: DeepSeek, OpenAI, or any OpenAI-compatible API
const BASE_URL = process.env.OPENAI_API_BASE || process.env.OPENAI_BASE_URL;
if (!BASE_URL) {
  console.warn('[models] WARNING: OPENAI_API_BASE or OPENAI_BASE_URL not set. API calls may fail.');
}

// Get model from environment or use default
const DEFAULT_MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Max INPUT tokens by model (context window minus max output)
// DeepSeek: 128k total, 8k max output -> 120k input
const MODEL_MAX_INPUT_TOKENS: Record<string, number> = {
  'deepseek-chat': 115000,      // 128k - 8k output - 5k safety margin
  'deepseek-coder': 115000,
  'deepseek-reasoner': 60000,   // 128k - 64k output (thinking mode)
  'gpt-4o': 120000,             // 128k context
  'gpt-4o-mini': 120000,
  'gpt-4-turbo': 120000,
  'gpt-4': 7000,                // 8k context
  'gpt-3.5-turbo': 15000,       // 16k context
  'claude-3-opus': 190000,      // 200k context
  'claude-3-sonnet': 190000,
  'claude-3-haiku': 190000,
};

// Get max input tokens for current model
export const getMaxContextTokens = (): number => {
  return MODEL_MAX_INPUT_TOKENS[DEFAULT_MODEL_NAME] || 100000;
};

// Token estimation based on DeepSeek docs:
// English: 1 char ≈ 0.3 token -> 1 token ≈ 3.3 chars
// Using 3 chars per token for safety margin
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
  // 3 chars per token based on DeepSeek estimation
  const maxChars = limit * 3;
  const truncated = contextString.slice(-maxChars);
  
  // Find a clean break point (paragraph or line)
  const cleanBreak = truncated.indexOf('\n\n');
  if (cleanBreak > 0 && cleanBreak < 1000) {
    return '[Context truncated due to length...]\n\n' + truncated.slice(cleanBreak + 2);
  }
  
  return '[Context truncated due to length...]\n\n' + truncated;
};

// Create OpenAI-compatible provider with explicit baseURL (no fallback)
const llmProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: BASE_URL,
});

/**
 * Get the configured model for chat completion
 * Model is configurable via OPENAI_MODEL env var
 */
export const getModel = (name?: string): LanguageModel => {
  const modelName = name || DEFAULT_MODEL_NAME;
  return llmProvider(modelName) as LanguageModel;
};

/**
 * Get the model for responses (same as getModel)
 * Web search availability depends on the provider
 */
export const getResponsesModel = (): LanguageModel => {
  return llmProvider(DEFAULT_MODEL_NAME) as LanguageModel;
};

/**
 * Get the raw provider for advanced usage (e.g., web search tools)
 */
export const getLLMProvider = () => llmProvider;
