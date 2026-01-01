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
