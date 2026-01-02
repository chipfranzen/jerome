import {
	saveReadingSession,
	loadReadingSession,
	clearReadingSession,
	saveSessionDeck,
	loadSessionDeck
} from '$lib/services/storage';
import type { ReadingSession } from '$lib/types/epub';
import type { SessionDeck, AnkiCard } from '$lib/types/anki';

class SessionStore {
	private currentSession = $state<ReadingSession | null>(loadReadingSession());
	private currentDeck = $state<SessionDeck | null>(null);

	get session(): ReadingSession | null {
		return this.currentSession;
	}

	get deck(): SessionDeck | null {
		return this.currentDeck;
	}

	get isActive(): boolean {
		return this.currentSession !== null;
	}

	/**
	 * Start a new reading session.
	 */
	startSession(bookId: string, bookTitle: string, language: string): void {
		const now = Date.now();

		this.currentSession = {
			id: crypto.randomUUID(),
			book_id: bookId,
			book_title: bookTitle,
			language,
			current_position: '',
			started_at: now,
			last_updated: now
		};

		// Load or create deck for this book
		const existingDeck = loadSessionDeck(bookId);
		if (existingDeck) {
			this.currentDeck = existingDeck;
		} else {
			this.currentDeck = {
				book_id: bookId,
				book_title: bookTitle,
				cards: [],
				created_at: now,
				updated_at: now
			};
			saveSessionDeck(this.currentDeck);
		}

		saveReadingSession(this.currentSession);
	}

	/**
	 * Update the current reading position.
	 */
	updatePosition(cfi: string): void {
		if (!this.currentSession) return;

		this.currentSession.current_position = cfi;
		this.currentSession.last_updated = Date.now();
		saveReadingSession(this.currentSession);
	}

	/**
	 * Add a card to the current session deck.
	 */
	addCard(card: AnkiCard): void {
		if (!this.currentDeck) return;

		this.currentDeck.cards.push(card);
		this.currentDeck.updated_at = Date.now();
		saveSessionDeck(this.currentDeck);
	}

	/**
	 * Remove a card from the current session deck.
	 */
	removeCard(cardId: string): void {
		if (!this.currentDeck) return;

		this.currentDeck.cards = this.currentDeck.cards.filter((card) => card.id !== cardId);
		this.currentDeck.updated_at = Date.now();
		saveSessionDeck(this.currentDeck);
	}

	/**
	 * Clear the current session deck (after export).
	 */
	clearDeck(): void {
		if (!this.currentDeck) return;

		const now = Date.now();
		this.currentDeck = {
			book_id: this.currentDeck.book_id,
			book_title: this.currentDeck.book_title,
			cards: [],
			created_at: now,
			updated_at: now
		};
		saveSessionDeck(this.currentDeck);
	}

	/**
	 * End the current session.
	 */
	endSession(): void {
		this.currentSession = null;
		this.currentDeck = null;
		clearReadingSession();
	}

	/**
	 * Load an existing session or start a new one.
	 */
	loadSession(bookId: string, bookTitle: string, language: string): void {
		const existingSession = loadReadingSession();

		if (existingSession && existingSession.book_id === bookId) {
			// Resume existing session for this book
			this.currentSession = existingSession;
		} else {
			// End old session if switching books
			if (existingSession) {
				clearReadingSession();
			}
			// Start new session
			this.startSession(bookId, bookTitle, language);
			return;
		}

		// Load the deck for this book
		this.currentDeck = loadSessionDeck(bookId);
		if (!this.currentDeck) {
			// Create deck if it doesn't exist
			const now = Date.now();
			this.currentDeck = {
				book_id: bookId,
				book_title: bookTitle,
				cards: [],
				created_at: now,
				updated_at: now
			};
			saveSessionDeck(this.currentDeck);
		}
	}
}

export const sessionStore = new SessionStore();
