export interface StoredEpub {
	id: string;
	title: string;
	author?: string;
	file_name: string;
	language: string;
	uploaded_at: number;
	last_accessed?: number;
	last_position?: string; // CFI from epub.js
}

export interface ReadingSession {
	id: string;
	book_id: string;
	book_title: string;
	language: string;
	current_position: string; // CFI from epub.js
	started_at: number;
	last_updated: number;
}
