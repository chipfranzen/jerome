import OpenAI from 'openai';
import type { LLMResponse } from '$lib/types/language';
import { LANGUAGES } from '$lib/config/languages';

/**
 * Look up a word using OpenAI API.
 */
export async function lookupWord(
	context: string,
	clickIndex: number,
	language: string,
	apiKey: string
): Promise<LLMResponse> {
	const languageConfig = LANGUAGES[language];
	if (!languageConfig) {
		throw new Error(`Unsupported language: ${language}`);
	}

	const client = new OpenAI({
		apiKey,
		dangerouslyAllowBrowser: true // We are client-side only
	});

	try {
		const completion = await client.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{
					role: 'system',
					content: languageConfig.system_prompt
				},
				{
					role: 'user',
					content: `Context: "${context}"\nClick index: ${clickIndex}`
				}
			],
			response_format: { type: 'json_object' },
			temperature: 0.3
		});

		const responseText = completion.choices[0]?.message?.content;
		if (!responseText) {
			throw new Error('No response from OpenAI');
		}

		// Parse JSON response
		const parsed = JSON.parse(responseText) as LLMResponse;

		// If LLM returned an error, throw it
		if (parsed.error) {
			throw new Error(parsed.error);
		}

		return parsed;
	} catch (error) {
		// Handle different error types
		if (error instanceof Error) {
			// Check for API-specific errors
			if (error.message.includes('API key')) {
				throw new Error('Invalid API key. Please check your settings.');
			}
			if (error.message.includes('rate limit')) {
				throw new Error('Rate limit exceeded. Please try again in a moment.');
			}
			if (error.message.includes('quota')) {
				throw new Error('API quota exceeded. Please check your OpenAI account.');
			}

			// Re-throw with original message
			throw error;
		}

		throw new Error('An unexpected error occurred during lookup.');
	}
}

/**
 * Extract a context window around a click position.
 */
export function extractContext(
	text: string,
	clickIndex: number,
	windowSize = 200
): {
	context: string;
	relativeIndex: number;
} {
	const start = Math.max(0, clickIndex - windowSize);
	const end = Math.min(text.length, clickIndex + windowSize);
	const context = text.slice(start, end);
	const relativeIndex = clickIndex - start;

	return { context, relativeIndex };
}
