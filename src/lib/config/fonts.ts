/**
 * Available reading fonts for user selection.
 */
export const READING_FONTS = {
	cormorant: {
		name: 'Cormorant',
		weights: [300, 400, 700],
		fallbacks: ['"Times New Roman"', 'serif'],
		displayName: 'Cormorant (elegant, distinctive)'
	},
	crimson: {
		name: 'Crimson Text',
		weights: [400, 600, 700],
		fallbacks: ['"Times New Roman"', 'serif'],
		displayName: 'Crimson Text (classic, readable)'
	},
	noto: {
		name: 'Noto Serif',
		weights: [400, 700],
		fallbacks: ['Times New Roman', 'serif'],
		displayName: 'Noto Serif (modern, comprehensive)'
	},
	gentium: {
		name: 'Gentium Plus',
		weights: [400, 700],
		fallbacks: ['"Times New Roman"', 'serif'],
		displayName: 'Gentium Plus (designed for minority languages)'
	}
} as const;

export type ReadingFontKey = keyof typeof READING_FONTS;

/**
 * Default reading font (used in MVP, will be user-selectable later).
 */
export const DEFAULT_READING_FONT: ReadingFontKey = 'cormorant';

/**
 * UI font configuration (not user-selectable).
 */
export const UI_FONT = {
	name: 'Inter',
	weights: [300, 400, 500, 600, 700],
	fallbacks: ['system-ui', 'sans-serif']
} as const;

/**
 * Generate Google Fonts URL for a specific reading font.
 */
export function getGoogleFontsUrl(readingFont: ReadingFontKey = DEFAULT_READING_FONT): string {
	const reading = READING_FONTS[readingFont];
	const readingParam = `family=${reading.name.replace(/ /g, '+')}:wght@${reading.weights.join(';')}`;
	const uiParam = `family=${UI_FONT.name}:wght@${UI_FONT.weights.join(';')}`;
	return `https://fonts.googleapis.com/css2?${readingParam}&${uiParam}&display=swap`;
}

/**
 * Get font-family CSS value for reading text.
 */
export function getReadingFontFamily(readingFont: ReadingFontKey = DEFAULT_READING_FONT): string {
	const font = READING_FONTS[readingFont];
	const withQuotes = (f: string) => (f.includes(' ') && !f.startsWith('"') ? `"${f}"` : f);
	return [font.name, ...font.fallbacks].map(withQuotes).join(', ');
}

/**
 * Get font-family CSS value for UI text.
 */
export function getUIFontFamily(): string {
	return [UI_FONT.name, ...UI_FONT.fallbacks].join(', ');
}
