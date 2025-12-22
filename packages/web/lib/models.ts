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
