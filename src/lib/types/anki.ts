export interface AnkiCard {
	id: string;
	front: string;
	back: string;
	sentence: string;
	sentence_translation: string;
	example_sentence: string;
	word_class: string;
	created_at: number;
	source_text?: string;
}

export interface SessionDeck {
	id: string;
	book_id: string;
	book_title: string;
	cards: AnkiCard[];
	created_at: number;
	updated_at: number;
}
