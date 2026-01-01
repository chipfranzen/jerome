<script lang="ts">
	import { epubLibrary } from '$lib/stores/epub-library.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import EpubCard from './EpubCard.svelte';
	import EpubUploader from './EpubUploader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import IconPlus from '$lib/components/icons/IconPlus.svelte';

	let showUploadModal = $state(false);

	async function handleDelete(id: string) {
		await epubLibrary.deleteEpubById(id);
	}

	function handleOpen(id: string) {
		goto(resolve('/reader/[bookId]', { bookId: id }));
	}

	function handleUploadSuccess() {
		showUploadModal = false;
	}

	const books = $derived(epubLibrary.recentEpubs);
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-text-primary">Your Library</h2>
		<Button onclick={() => (showUploadModal = true)}>
			<span class="flex items-center gap-2">
				<IconPlus size={16} />
				Upload Epub
			</span>
		</Button>
	</div>

	{#if books.length === 0}
		<EmptyState
			title="No books yet"
			description="Upload your first epub to start building your language learning library."
		>
			<Button onclick={() => (showUploadModal = true)}>Upload Your First Book</Button>
		</EmptyState>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2">
			{#each books as book (book.id)}
				<EpubCard epub={book} onDelete={handleDelete} onOpen={handleOpen} />
			{/each}
		</div>
	{/if}
</div>

<Modal isOpen={showUploadModal} onClose={() => (showUploadModal = false)} title="Upload Epub">
	<EpubUploader onSuccess={handleUploadSuccess} />
</Modal>
