import { loadSettings, saveSettings, type AppSettings } from '$lib/services/storage';

class SettingsStore {
	private settings = $state<AppSettings>(loadSettings());

	get apiKey(): string | undefined {
		return this.settings.apiKey;
	}

	set apiKey(value: string | undefined) {
		if (value && !this.isValidApiKey(value)) {
			throw new Error('Invalid API key format. OpenAI keys must start with "sk-"');
		}
		this.settings.apiKey = value;
		this.persist();
	}

	get selectedLanguage(): string {
		return this.settings.selectedLanguage;
	}

	set selectedLanguage(value: string) {
		this.settings.selectedLanguage = value;
		this.persist();
	}

	get fontSize(): number {
		return this.settings.fontSize;
	}

	set fontSize(value: number) {
		if (value < 0.75 || value > 2.5) {
			throw new Error('Font size must be between 0.75 and 2.5 rem');
		}
		this.settings.fontSize = value;
		this.persist();
	}

	get hasApiKey(): boolean {
		return this.settings.apiKey !== undefined && this.settings.apiKey.length > 0;
	}

	private isValidApiKey(key: string): boolean {
		return key.startsWith('sk-');
	}

	private persist(): void {
		saveSettings(this.settings);
	}

	clearApiKey(): void {
		this.apiKey = undefined;
	}
}

export const settingsStore = new SettingsStore();
