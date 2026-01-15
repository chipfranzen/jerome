import type { SessionDeck } from '$lib/types/anki';

/**
 * Format a field for CSV export (escape special characters).
 */
function formatField(value: string): string {
	if (value === undefined || value === null) {
		return '';
	}

	// Replace tabs with spaces
	let formatted = value.replace(/\t/g, ' ');

	// Replace newlines with HTML breaks for Anki
	formatted = formatted.replace(/\n/g, '<br>');

	// Escape quotes by doubling them
	formatted = formatted.replace(/"/g, '""');

	// Wrap in quotes if contains comma, quote, or newline
	if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
		formatted = `"${formatted}"`;
	}

	return formatted;
}

/**
 * Export session deck to Anki-compatible CSV format.
 */
export function exportDeckToCSV(deck: SessionDeck, language: string = 'vietnamese'): string {
	const rows: string[] = [];

	// Header row
	rows.push(
		[
			'Front',
			'Back',
			'Sentence',
			'Sentence Translation',
			'Example',
			'Example Translation',
			'Tags'
		].join('\t')
	);

	// Data rows
	for (const card of deck.cards) {
		// Tags: word class + language
		const tags = `${card.word_class} ${language}`;

		const row = [
			formatField(card.front),
			formatField(card.back),
			formatField(card.sentence),
			formatField(card.sentence_translation),
			formatField(card.example_sentence),
			formatField(card.example_translation),
			formatField(tags)
		].join('\t');

		rows.push(row);
	}

	return rows.join('\n');
}

/**
 * Download CSV file to user's computer.
 */
export function downloadCSV(csvContent: string, filename: string): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
}

/**
 * Generate filename for deck export.
 */
export function generateExportFilename(deckTitle: string): string {
	const sanitized = deckTitle
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

	const timestamp = new Date().toISOString().split('T')[0];
	return `${sanitized}-${timestamp}.csv`;
}
