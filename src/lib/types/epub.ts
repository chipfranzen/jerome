export interface StoredEpub {
	id: string;
	title: string;
	author?: string;
	file_name: string;
	uploaded_at: number;
	last_accessed?: number;
}
