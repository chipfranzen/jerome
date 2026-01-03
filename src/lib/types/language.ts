export interface LanguageConfig {
	code: string;
	name: string;
	system_prompt: string;
	additional_fields?: string[];
}

export interface LLMResponse {
	error?: string; // LLM populates if it cannot process the request
	full_word: string;
	word_class: string;
	definition: string;
	sentence: string; // The identified sentence containing the word
	sentence_translation: string;
	example_sentence: string;
	example_translation: string;
	word_boundaries?: {
		start: number; // Character position in sentence
		end: number;
	};
}
