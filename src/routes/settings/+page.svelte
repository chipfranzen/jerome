<script lang="ts">
	import { settingsStore } from '$lib/stores/settings.svelte';

	let apiKeyInput = $state(settingsStore.apiKey ?? '');
	let apiKeyError = $state('');
	let saveSuccess = $state(false);

	function handleSaveApiKey() {
		try {
			apiKeyError = '';
			saveSuccess = false;
			settingsStore.apiKey = apiKeyInput || undefined;
			saveSuccess = true;
			setTimeout(() => {
				saveSuccess = false;
			}, 2000);
		} catch (error) {
			apiKeyError = error instanceof Error ? error.message : 'Invalid API key';
		}
	}

	function handleClearApiKey() {
		settingsStore.clearApiKey();
		apiKeyInput = '';
		saveSuccess = false;
	}
</script>

<div class="mx-auto max-w-2xl p-6">
	<h1 class="mb-8 text-3xl font-bold text-text-primary">Settings</h1>

	<!-- API Key Section -->
	<section class="mb-8 rounded-lg bg-surface p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold text-text-primary">OpenAI API Key</h2>
		<p class="mb-4 text-sm text-text-secondary">
			Your API key is stored locally in your browser and never sent to any server except OpenAI.
		</p>

		<div class="mb-4">
			<label for="api-key" class="mb-2 block text-sm font-medium text-text-primary">
				API Key
			</label>
			<input
				id="api-key"
				type="password"
				bind:value={apiKeyInput}
				placeholder="sk-..."
				class="w-full rounded-md border border-text-tertiary bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
			/>
			{#if apiKeyError}
				<p class="mt-2 text-sm text-error">{apiKeyError}</p>
			{/if}
			{#if saveSuccess}
				<p class="mt-2 text-sm text-success">API key saved successfully!</p>
			{/if}
		</div>

		<div class="flex gap-3">
			<button
				onclick={handleSaveApiKey}
				class="rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
			>
				Save API Key
			</button>
			{#if settingsStore.hasApiKey}
				<button
					onclick={handleClearApiKey}
					class="rounded-md border border-text-tertiary px-4 py-2 text-text-primary hover:bg-background focus:ring-2 focus:ring-text-tertiary focus:ring-offset-2 focus:outline-none"
				>
					Clear Key
				</button>
			{/if}
		</div>
	</section>

	<!-- Font Size Section -->
	<section class="rounded-lg bg-surface p-6 shadow-sm">
		<h2 class="mb-4 text-xl font-semibold text-text-primary">Reading Preferences</h2>

		<div>
			<label for="font-size" class="mb-2 block text-sm font-medium text-text-primary">
				Font Size: {settingsStore.fontSize.toFixed(2)} rem
			</label>
			<input
				id="font-size"
				type="range"
				min="0.75"
				max="2.5"
				step="0.125"
				bind:value={settingsStore.fontSize}
				class="w-full"
			/>
			<div class="mt-2 flex justify-between text-xs text-text-secondary">
				<span>Small</span>
				<span>Medium</span>
				<span>Large</span>
			</div>
		</div>

		<!-- Preview Text -->
		<div class="mt-4 rounded border border-text-tertiary p-4">
			<p style="font-size: {settingsStore.fontSize}rem" class="font-serif text-text-primary">
				The quick brown fox jumps over the lazy dog. This is a preview of your reading font size.
			</p>
		</div>
	</section>

	<!-- Back Link -->
	<div class="mt-8">
		<a href="/" class="text-primary-600 hover:text-primary-700">← Back to Library</a>
	</div>
</div>
