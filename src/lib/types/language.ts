export interface LanguageConfig {
	code: string;
	name: string;
	system_prompt: string;
	additional_fields?: string[];
}

export interface LLMResponse {
	selected_text: string;
	full_word: string;
	word_class: string;
	definition: string;
	sentence_translation: string;
	example_sentence: string;
	word_boundaries?: {
		start: number;
		end: number;
	};
}
