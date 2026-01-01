<script lang="ts">
	import ePub from 'epubjs';
	import { epubLibrary } from '$lib/stores/epub-library.svelte';
	import { LANGUAGES } from '$lib/config/languages';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Message from '$lib/components/ui/Message.svelte';
	import IconBook from '$lib/components/icons/IconBook.svelte';

	interface Props {
		onSuccess: () => void;
	}

	let { onSuccess }: Props = $props();

	let file = $state<File | null>(null);
	let title = $state('');
	let author = $state('');
	let language = $state('vi');
	let isProcessing = $state(false);
	let error = $state('');
	let isDragging = $state(false);

	const languageOptions = Object.values(LANGUAGES).map((lang) => ({
		value: lang.code,
		label: lang.name
	}));

	let fileInputRef: HTMLInputElement;

	async function processFile(selectedFile: File) {
		if (!selectedFile.name.endsWith('.epub')) {
			error = 'Please select an .epub file';
			return;
		}

		file = selectedFile;
		error = '';
		isProcessing = true;

		try {
			// Extract metadata from epub
			const arrayBuffer = await selectedFile.arrayBuffer();
			const book = ePub(arrayBuffer);
			await book.ready;

			// Get metadata
			const metadata = await book.loaded.metadata;
			title = metadata.title || selectedFile.name.replace('.epub', '');
			author = metadata.creator || '';

			// Try to detect language from epub metadata
			if (metadata.language) {
				const detectedLang = metadata.language.toLowerCase().substring(0, 2);
				if (LANGUAGES[detectedLang]) {
					language = detectedLang;
				}
			}
		} catch {
			error = 'Could not read epub metadata. You can still upload and edit details manually.';
			title = selectedFile.name.replace('.epub', '');
		} finally {
			isProcessing = false;
		}
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const selectedFile = input.files?.[0];
		if (selectedFile) {
			await processFile(selectedFile);
		}
	}

	function handleDragEnter(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		// Only set to false if leaving the drop zone itself, not child elements
		if (event.currentTarget === event.target) {
			isDragging = false;
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const droppedFile = event.dataTransfer?.files?.[0];
		if (droppedFile) {
			await processFile(droppedFile);
		}
	}

	function handleDropZoneClick() {
		fileInputRef.click();
	}

	async function handleSubmit() {
		if (!file) {
			error = 'Please select a file';
			return;
		}

		if (!title.trim()) {
			error = 'Please enter a title';
			return;
		}

		isProcessing = true;
		error = '';

		try {
			await epubLibrary.addEpub(file, {
				id: crypto.randomUUID(),
				title: title.trim(),
				author: author.trim() || undefined,
				file_name: file.name,
				language
			});

			onSuccess();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to upload epub';
		} finally {
			isProcessing = false;
		}
	}
</script>

<div>
	{#if !file}
		<!-- Drop Zone -->
		<div
			class="mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors {isDragging
				? 'border-primary-500 bg-primary-50'
				: 'border-text-tertiary hover:border-primary-400 hover:bg-background'}"
			ondragenter={handleDragEnter}
			ondragover={handleDragOver}
			ondragleave={handleDragLeave}
			ondrop={handleDrop}
			onclick={handleDropZoneClick}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && handleDropZoneClick()}
		>
			<div class="flex flex-col items-center gap-3">
				<div class="rounded-full bg-primary-100 p-4">
					<IconBook size={32} class="text-primary-600" />
				</div>
				<div>
					<p class="text-lg font-medium text-text-primary">
						{isDragging ? 'Drop your epub file here' : 'Drag and drop your epub file'}
					</p>
					<p class="mt-1 text-sm text-text-secondary">or click to browse</p>
				</div>
				<p class="text-xs text-text-tertiary">.epub files only</p>
			</div>
		</div>

		<!-- Hidden File Input -->
		<input
			bind:this={fileInputRef}
			type="file"
			accept=".epub"
			onchange={handleFileChange}
			class="hidden"
		/>
	{/if}

	{#if isProcessing}
		<Message type="info" message="Processing epub file..." />
	{/if}

	{#if file}
		<!-- Show selected file -->
		<div class="mb-4 rounded-lg border border-primary-500 bg-primary-50 p-3">
			<div class="flex items-center gap-2 text-sm text-primary-700">
				<IconBook size={16} />
				<span class="font-medium">{file.name}</span>
			</div>
		</div>

		<!-- Title Input -->
		<Input id="title" type="text" bind:value={title} label="Title" required />

		<!-- Author Input -->
		<Input id="author" type="text" bind:value={author} label="Author" />

		<!-- Language Select -->
		<Select
			id="language"
			bind:value={language}
			options={languageOptions}
			label="Language"
			required
		/>

		{#if error}
			<Message type="error" message={error} />
		{/if}

		<!-- Submit Button -->
		<div class="flex justify-end gap-3">
			<Button variant="secondary" onclick={() => (file = null)}>Change File</Button>
			<Button variant="primary" onclick={handleSubmit} disabled={isProcessing}>
				{isProcessing ? 'Uploading...' : 'Add to Library'}
			</Button>
		</div>
	{/if}
</div>
