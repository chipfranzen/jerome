<script lang="ts">
	import { resolve } from '$app/paths';
	import { settingsStore } from '$lib/stores/settings.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Message from '$lib/components/ui/Message.svelte';

	let apiKeyInput = $state(settingsStore.apiKey ?? '');
	let apiKeyError = $state('');
	let saveSuccess = $state(false);

	function handleSaveApiKey() {
		try {
			apiKeyError = '';
			saveSuccess = false;

			// Require a value when saving
			if (!apiKeyInput || apiKeyInput.trim() === '') {
				apiKeyError = 'Please enter an API key or use the Clear Key button';
				return;
			}

			settingsStore.apiKey = apiKeyInput;
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

<Container>
	<Heading level={1}>Settings</Heading>

	<!-- API Key Section -->
	<Card>
		<Heading level={2}>OpenAI API Key</Heading>
		<p class="mb-4 text-sm text-text-secondary">
			Your API key is stored locally in your browser and never sent to any server except OpenAI.
		</p>

		<Input
			id="api-key"
			type="password"
			bind:value={apiKeyInput}
			placeholder="sk-..."
			label="API Key"
		/>

		{#if apiKeyError}
			<Message type="error" message={apiKeyError} />
		{/if}
		{#if saveSuccess}
			<Message type="success" message="API key saved successfully!" />
		{/if}

		<div class="flex gap-3">
			<Button onclick={handleSaveApiKey}>Save API Key</Button>
			{#if settingsStore.hasApiKey}
				<Button variant="secondary" onclick={handleClearApiKey}>Clear Key</Button>
			{/if}
		</div>
	</Card>

	<!-- Font Size Section -->
	<Card>
		<Heading level={2}>Reading Preferences</Heading>

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
	</Card>

	<!-- Back Link -->
	<div class="mt-8">
		<a href={resolve('/')} class="text-primary-600 hover:text-primary-700">← Back to Library</a>
	</div>
</Container>
