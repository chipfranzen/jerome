<script lang="ts">
	import type { SessionDeck } from '$lib/types/anki';
	import Button from '$lib/components/ui/Button.svelte';
	import IconTrash from '$lib/components/icons/IconTrash.svelte';

	interface Props {
		deck: SessionDeck | null;
		onExport: () => void;
		onDeleteCard: (cardId: string) => void;
		onClearDeck: () => void;
	}

	let { deck, onExport, onDeleteCard, onClearDeck }: Props = $props();

	function handleClearDeck() {
		if (!deck || deck.cards.length === 0) return;

		const confirmed = confirm(
			`Are you sure you want to clear all ${deck.cards.length} card${deck.cards.length !== 1 ? 's' : ''}? This cannot be undone.`
		);

		if (confirmed) {
			onClearDeck();
		}
	}
</script>

<div class="flex h-full flex-col border-t border-text-tertiary bg-surface">
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-text-tertiary p-3">
		<div>
			<h3 class="font-semibold text-text-primary">Session Deck</h3>
			<p class="text-sm text-text-secondary">
				{deck ? `${deck.cards.length} card${deck.cards.length !== 1 ? 's' : ''}` : '0 cards'}
			</p>
		</div>
		<div class="flex gap-2">
			{#if deck && deck.cards.length > 0}
				<Button variant="danger" onclick={handleClearDeck}>Clear</Button>
				<Button variant="secondary" onclick={onExport}>Export</Button>
			{/if}
		</div>
	</div>

	<!-- Card List -->
	<div class="flex-1 overflow-y-auto p-3">
		{#if !deck || deck.cards.length === 0}
			<div class="flex h-full items-center justify-center">
				<p class="text-center text-sm text-text-secondary">
					No cards yet.<br />Click words to add cards.
				</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each deck.cards as card (card.id)}
					<div
						class="group rounded border border-text-tertiary bg-background p-2 hover:border-primary-300"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<p class="truncate font-semibold text-text-primary">{card.front}</p>
								<p class="truncate text-sm text-text-secondary">{card.back}</p>
								<p class="text-xs text-text-tertiary">{card.word_class}</p>
							</div>
							<button
								onclick={() => onDeleteCard(card.id)}
								class="shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:text-error"
								aria-label="Delete card"
							>
								<IconTrash size={16} />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
