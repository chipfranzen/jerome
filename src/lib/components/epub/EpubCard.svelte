<script lang="ts">
	import type { StoredEpub } from '$lib/types/epub';
	import { LANGUAGES } from '$lib/config/languages';
	import IconTrash from '$lib/components/icons/IconTrash.svelte';
	import IconBook from '$lib/components/icons/IconBook.svelte';
	import IconCalendar from '$lib/components/icons/IconCalendar.svelte';
	import IconEye from '$lib/components/icons/IconEye.svelte';

	interface Props {
		epub: StoredEpub;
		onDelete: (id: string) => void;
		onOpen: (id: string) => void;
	}

	let { epub, onDelete, onOpen }: Props = $props();

	const languageName = LANGUAGES[epub.language]?.name || epub.language;
	const uploadDate = new Date(epub.uploaded_at).toLocaleDateString();
	const lastAccessed = epub.last_accessed
		? new Date(epub.last_accessed).toLocaleDateString()
		: null;

	function handleDelete(event: Event) {
		event.stopPropagation();
		if (confirm(`Delete "${epub.title}"?`)) {
			onDelete(epub.id);
		}
	}
</script>

<div
	class="group cursor-pointer rounded-lg border border-text-tertiary bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
	onclick={() => onOpen(epub.id)}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && onOpen(epub.id)}
>
	<div class="mb-2 flex items-start justify-between">
		<div class="flex-1">
			<h3 class="text-lg font-semibold text-text-primary">{epub.title}</h3>
			{#if epub.author}
				<p class="text-sm text-text-secondary">{epub.author}</p>
			{/if}
		</div>
		<button
			onclick={handleDelete}
			class="text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100 hover:text-error focus:opacity-100"
			aria-label="Delete book"
		>
			<IconTrash size={20} />
		</button>
	</div>

	<div class="mt-3 flex items-center gap-4 text-xs text-text-tertiary">
		<span class="flex items-center gap-1">
			<IconBook size={14} />
			{languageName}
		</span>
		<span class="flex items-center gap-1">
			<IconCalendar size={14} />
			{uploadDate}
		</span>
		{#if lastAccessed}
			<span class="flex items-center gap-1">
				<IconEye size={14} />
				{lastAccessed}
			</span>
		{/if}
	</div>
</div>
