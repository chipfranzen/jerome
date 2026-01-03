<script lang="ts">
	import type { LLMResponse } from '$lib/types/language';
	import type { AnkiCard } from '$lib/types/anki';
	import Button from '$lib/components/ui/Button.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	interface Props {
		isOpen: boolean;
		isLoading: boolean;
		definition: LLMResponse | null;
		error: string | null;
		onRetry: () => void;
		onAddCard: (card: AnkiCard) => void;
		onToggle: () => void;
	}

	let { isOpen, isLoading, definition, error, onRetry, onAddCard, onToggle }: Props = $props();

	let showExampleTranslation = $state(false);
	let cardAdded = $state(false);

	// Reset states when definition changes
	$effect(() => {
		if (definition) {
			showExampleTranslation = false;
			cardAdded = false;
		}
	});

	function handleAddCard() {
		if (!definition || cardAdded) return;

		const card: AnkiCard = {
			id: crypto.randomUUID(),
			front: definition.full_word,
			back: definition.definition,
			sentence: definition.sentence,
			sentence_translation: definition.sentence_translation,
			example_sentence: definition.example_sentence,
			word_class: definition.word_class,
			created_at: Date.now()
		};

		onAddCard(card);
		cardAdded = true;
	}
</script>

{#if isOpen}
	<aside class="flex h-full w-96 flex-col border-l border-text-tertiary bg-surface shadow-lg">
		<!-- Fixed Header -->
		<div class="flex items-center justify-between border-b border-text-tertiary p-4">
			{#if definition}
				<div class="flex-1">
					<h2 class="text-2xl font-semibold text-text-primary">{definition.full_word}</h2>
					<p class="text-sm text-text-secondary">{definition.word_class}</p>
				</div>
				<Button
					variant={cardAdded ? 'secondary' : 'primary'}
					onclick={handleAddCard}
					disabled={cardAdded}
				>
					{cardAdded ? 'Added ✓' : 'Add to Deck'}
				</Button>
			{:else}
				<h2 class="text-lg font-semibold text-text-primary">Word Lookup</h2>
			{/if}
			<button
				onclick={onToggle}
				class="ml-2 text-text-secondary hover:text-text-primary"
				aria-label="Close panel"
			>
				✕
			</button>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-4">
			{#if isLoading}
				<!-- Loading State -->
				<div class="flex items-center justify-center py-12">
					<div class="text-center">
						<div class="mb-2 text-4xl">⏳</div>
						<p class="text-text-secondary">Looking up word...</p>
					</div>
				</div>
			{:else if error}
				<!-- Error State -->
				<div class="rounded-lg border border-error bg-red-50 p-4">
					<p class="mb-3 font-semibold text-error">Error</p>
					<p class="mb-4 text-sm text-text-primary">{error}</p>
					<Button variant="primary" onclick={onRetry}>Try Again</Button>
				</div>
			{:else if definition}
				<!-- Definition -->
				<div>
					<SectionHeading>Definition</SectionHeading>
					<p class="text-text-primary">{definition.definition}</p>
				</div>

				<!-- In Context -->
				<div>
					<SectionHeading>In Context</SectionHeading>
					<p class="mb-1 text-text-primary italic">
						"{#if definition.word_boundaries}
							{definition.sentence.slice(0, definition.word_boundaries.start)}<strong
								>{definition.sentence.slice(
									definition.word_boundaries.start,
									definition.word_boundaries.end
								)}</strong
							>{definition.sentence.slice(definition.word_boundaries.end)}
						{:else}
							{definition.sentence}
						{/if}"
					</p>
					<p class="text-sm text-text-secondary">→ {definition.sentence_translation}</p>
				</div>

				<!-- Example -->
				<div>
					<SectionHeading>Example</SectionHeading>
					<p class="mb-2 text-text-primary italic">
						{definition.example_sentence}
					</p>
					<div>
						<button
							onclick={() => (showExampleTranslation = !showExampleTranslation)}
							class="text-sm text-primary-600 hover:text-primary-700"
						>
							{showExampleTranslation ? 'Hide' : 'Show'} Translation ▼
						</button>
						{#if showExampleTranslation}
							<p class="mt-2 text-sm text-text-secondary">
								→ {definition.example_translation}
							</p>
						{/if}
					</div>
				</div>
			{:else}
				<!-- Empty State -->
				<div class="flex items-center justify-center py-12">
					<div class="text-center">
						<div class="mb-2 text-4xl">📖</div>
						<p class="text-text-secondary">Click a word to see its definition</p>
					</div>
				</div>
			{/if}
		</div>
	</aside>
{:else}
	<!-- Collapsed state - show toggle button -->
	<button
		onclick={onToggle}
		class="fixed top-1/2 right-0 z-10 -translate-y-1/2 rounded-l-lg bg-surface px-2 py-4 shadow-lg hover:bg-background"
		aria-label="Open lookup panel"
	>
		◀
	</button>
{/if}
