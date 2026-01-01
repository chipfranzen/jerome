import {
	saveEpub,
	getEpub,
	deleteEpub,
	saveEpubMetadata,
	getEpubMetadata,
	deleteEpubMetadata,
	loadAllEpubMetadata
} from '$lib/services/storage';
import type { StoredEpub } from '$lib/types/epub';

class EpubLibraryStore {
	private library = $state<StoredEpub[]>(loadAllEpubMetadata());

	get epubs(): StoredEpub[] {
		return this.library;
	}

	/**
	 * Add a new epub to the library.
	 */
	async addEpub(file: File, metadata: Omit<StoredEpub, 'uploaded_at'>): Promise<void> {
		// Check for duplicates
		if (this.isDuplicate(metadata.id, metadata.file_name)) {
			throw new Error(`An epub with this filename already exists: ${metadata.file_name}`);
		}

		const epub: StoredEpub = {
			...metadata,
			uploaded_at: Date.now()
		};

		// Save file to IndexedDB
		await saveEpub(epub.id, file);

		// Save metadata to localStorage
		saveEpubMetadata(epub);

		// Update reactive state
		this.library.push(epub);
	}

	/**
	 * Check if an epub with the given ID or filename already exists.
	 */
	private isDuplicate(id: string, fileName: string): boolean {
		return this.library.some((epub) => epub.id === id || epub.file_name === fileName);
	}

	/**
	 * Delete an epub from the library.
	 */
	async deleteEpubById(id: string): Promise<void> {
		// Delete from IndexedDB
		await deleteEpub(id);

		// Delete metadata from localStorage
		deleteEpubMetadata(id);

		// Update reactive state
		this.library = this.library.filter((epub) => epub.id !== id);
	}

	/**
	 * Get the epub file blob from IndexedDB.
	 */
	async getEpubFile(id: string): Promise<Blob | undefined> {
		return await getEpub(id);
	}

	/**
	 * Update epub metadata (e.g., last_accessed).
	 */
	updateMetadata(id: string, updates: Partial<StoredEpub>): void {
		const metadata = getEpubMetadata(id);
		if (!metadata) {
			throw new Error(`Epub with id ${id} not found`);
		}

		const updated = { ...metadata, ...updates };
		saveEpubMetadata(updated);

		// Update reactive state
		const index = this.library.findIndex((epub) => epub.id === id);
		if (index >= 0) {
			this.library[index] = updated;
		}
	}

	/**
	 * Get a single epub metadata by ID.
	 */
	getMetadata(id: string): StoredEpub | undefined {
		return this.library.find((epub) => epub.id === id);
	}

	/**
	 * Get epubs sorted by last accessed (most recent first).
	 */
	get recentEpubs(): StoredEpub[] {
		return [...this.epubs].sort((a, b) => {
			const aTime = a.last_accessed ?? a.uploaded_at;
			const bTime = b.last_accessed ?? b.uploaded_at;
			return bTime - aTime;
		});
	}
}

export const epubLibrary = new EpubLibraryStore();
