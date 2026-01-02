import { get, set, del, keys } from 'idb-keyval';
import type { ReadingSession, StoredEpub } from '$lib/types/epub';
import type { SessionDeck } from '$lib/types/anki';

// IndexedDB keys
const EPUB_PREFIX = 'epub:';

// LocalStorage keys
const SETTINGS_KEY = 'jerome:settings';
const EPUB_METADATA_PREFIX = 'jerome:epub-metadata';
const READING_SESSION_KEY = 'jerome:reading-session';
const SESSION_DECK_PREFIX = 'jerome:session-deck:';

// Types
export interface AppSettings {
	apiKey?: string;
	fontSize: number; // in rem units
}

// ========================================
// IndexedDB Functions (for epub files)
// ========================================

/**
 * Save an epub file to IndexedDB.
 */
export async function saveEpub(id: string, blob: Blob): Promise<void> {
	await set(`${EPUB_PREFIX}${id}`, blob);
}

/**
 * Retrieve an epub file from IndexedDB.
 */
export async function getEpub(id: string): Promise<Blob | undefined> {
	return await get(`${EPUB_PREFIX}${id}`);
}

/**
 * Delete an epub file from IndexedDB.
 */
export async function deleteEpub(id: string): Promise<void> {
	await del(`${EPUB_PREFIX}${id}`);
}

/**
 * List all epub IDs stored in IndexedDB.
 */
export async function listEpubIds(): Promise<string[]> {
	const allKeys = await keys();
	return allKeys
		.filter((key) => typeof key === 'string' && key.startsWith(EPUB_PREFIX))
		.map((key) => (key as string).replace(EPUB_PREFIX, ''));
}

// ========================================
// LocalStorage Functions (for metadata)
// ========================================

/**
 * Save or update epub metadata.
 */
export function saveEpubMetadata(metadata: StoredEpub): void {
	localStorage.setItem(`${EPUB_METADATA_PREFIX}${metadata.id}`, JSON.stringify(metadata));
}

/**
 * Get metadata for a single epub by ID.
 */
export function getEpubMetadata(id: string): StoredEpub | undefined {
	const stored = localStorage.getItem(`${EPUB_METADATA_PREFIX}${id}`);
	if (stored) {
		return JSON.parse(stored);
	}
	return undefined;
}

/**
 * Load all epub metadata from localStorage.
 */
export function loadAllEpubMetadata(): StoredEpub[] {
	const metadata: StoredEpub[] = [];

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);
		if (key && key.startsWith(EPUB_METADATA_PREFIX)) {
			const stored = localStorage.getItem(key);
			if (stored) {
				metadata.push(JSON.parse(stored));
			}
		}
	}

	return metadata;
}

/**
 * Delete epub metadata from localStorage.
 */
export function deleteEpubMetadata(id: string): void {
	localStorage.removeItem(`${EPUB_METADATA_PREFIX}${id}`);
}

// ========================================
// LocalStorage Functions (for settings)
// ========================================

/**
 * Save user settings to localStorage.
 */
export function saveSettings(settings: AppSettings): void {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * Load user settings from localStorage.
 */
export function loadSettings(): AppSettings {
	const stored = localStorage.getItem(SETTINGS_KEY);
	if (stored) {
		return JSON.parse(stored);
	}
	// Default fontsize.
	return { fontSize: 1.125 };
}
//
// ========================================
// Reading Session Functions
// ========================================

/**
 * Save the current reading session.
 */
export function saveReadingSession(session: ReadingSession): void {
	localStorage.setItem(READING_SESSION_KEY, JSON.stringify(session));
}

/**
 * Load the current reading session.
 */
export function loadReadingSession(): ReadingSession | null {
	const stored = localStorage.getItem(READING_SESSION_KEY);
	if (stored) {
		return JSON.parse(stored);
	}
	return null;
}

/**
 * Clear the current reading session.
 */
export function clearReadingSession(): void {
	localStorage.removeItem(READING_SESSION_KEY);
}

/**
 * Save a session deck.
 */
export function saveSessionDeck(deck: SessionDeck): void {
	localStorage.setItem(`${SESSION_DECK_PREFIX}${deck.book_id}`, JSON.stringify(deck));
}

/**
 * Load a session deck by book ID.
 */
export function loadSessionDeck(bookId: string): SessionDeck | null {
	const stored = localStorage.getItem(`${SESSION_DECK_PREFIX}${bookId}`);
	if (stored) {
		return JSON.parse(stored);
	}
	return null;
}

/**
 * Delete a session deck by book ID.
 */
export function deleteSessionDeck(bookId: string): void {
	localStorage.removeItem(`${SESSION_DECK_PREFIX}${bookId}`);
}
