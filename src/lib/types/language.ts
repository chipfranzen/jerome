export interface LanguageConfig {
	code: string;
	name: string;
	system_prompt: string;
	additional_fields?: string[];
}

export interface LLMResponse {
	error?: string;
	full_word: string;
	word_class: string;
	definition: string;
	sentence: string;
	sentence_translation: string;
	example_sentence: string;
	example_translation: string;
}
