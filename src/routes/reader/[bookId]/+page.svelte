<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import ePub, { type Book, type Rendition, type Contents } from 'epubjs';
	import { epubLibrary } from '$lib/stores/epub-library.svelte';
	import { sessionStore } from '$lib/stores/session.svelte';
	import { settingsStore } from '$lib/stores/settings.svelte';
	import { lookupWord, extractContext } from '$lib/services/openai';
	import type { LLMResponse } from '$lib/types/language';
	import type { AnkiCard } from '$lib/types/anki';
	import { DEFAULT_READING_FONT, getGoogleFontsUrl, getReadingFontFamily } from '$lib/config/fonts';
	import Button from '$lib/components/ui/Button.svelte';
	import IconChevronLeft from '$lib/components/icons/IconChevronLeft.svelte';
	import IconChevronRight from '$lib/components/icons/IconChevronRight.svelte';
	import IconArrowLeft from '$lib/components/icons/IconArrowLeft.svelte';
	import LookupPanel from '$lib/components/reader/LookupPanel.svelte';

	const bookId = $page.params.bookId;

	let viewerContainer: HTMLDivElement;
	let book: Book | null = null;
	let rendition: Rendition | null = null;
	let isLoading = $state(true);
	let error = $state('');
	let currentLocation = $state('');

	// Lookup panel state
	let isPanelOpen = $state(true);
	let isLookingUp = $state(false);
	let lookupError = $state<string | null>(null);
	let definition = $state<LLMResponse | null>(null);
	let lastClickData = $state<{ context: string; clickIndex: number } | null>(null);

	function getThemeStyles(fontSize: number) {
		return {
			'*': {
				'font-family': `${getReadingFontFamily(DEFAULT_READING_FONT)} !important`,
				'font-size': `${fontSize}rem !important`,
				'line-height': '1.75 !important'
			}
		};
	}

	async function handleTextClick(event: MouseEvent, contents: Contents) {
		// Don't process if no API key
		if (!settingsStore.hasApiKey) {
			lookupError = 'Please set your OpenAI API key in settings to use word lookup.';
			definition = null;
			return;
		}

		const selection = contents.window.getSelection();
		if (!selection || selection.rangeCount === 0) return;

		const range = selection.getRangeAt(0);
		const clickedNode = range.startContainer;

		// Find the closest block-level container (p, div, etc.)
		let container =
			clickedNode.nodeType === Node.TEXT_NODE
				? clickedNode.parentElement
				: (clickedNode as Element);

		while (container && !['P', 'DIV', 'SPAN', 'TD', 'LI'].includes(container.tagName)) {
			container = container.parentElement;
		}

		if (!container) return;

		// Get all text content from the container
		const fullText = container.textContent || '';
		if (!fullText.trim()) return;

		// Calculate the absolute offset by creating a range from container start to click
		const containerRange = contents.document.createRange();
		containerRange.selectNodeContents(container);
		containerRange.setEnd(clickedNode, range.startOffset);

		const absoluteOffset = containerRange.toString().length;

		// Extract context window
		const { context, relativeIndex } = extractContext(fullText, absoluteOffset);

		// Debug logging
		console.log('Click details:', {
			clickedText: fullText.substring(Math.max(0, absoluteOffset - 10), absoluteOffset + 10),
			absoluteOffset,
			relativeIndex,
			context,
			fullText: fullText.substring(0, 100) + '...'
		});

		// Store for retry
		lastClickData = { context, clickIndex: relativeIndex };

		// Perform lookup
		await performLookup(context, relativeIndex);
	}

	async function performLookup(context: string, clickIndex: number) {
		if (!sessionStore.session) return;

		isLookingUp = true;
		lookupError = null;
		definition = null;

		try {
			const result = await lookupWord(
				context,
				clickIndex,
				sessionStore.session.language,
				settingsStore.apiKey!
			);

			definition = result;
		} catch (err) {
			lookupError = err instanceof Error ? err.message : 'Failed to lookup word';
		} finally {
			isLookingUp = false;
		}
	}

	function handleRetry() {
		if (lastClickData) {
			performLookup(lastClickData.context, lastClickData.clickIndex);
		}
	}

	function handleAddCard(card: AnkiCard) {
		sessionStore.addCard(card);
	}

	function togglePanel() {
		isPanelOpen = !isPanelOpen;
	}

	onMount(async () => {
		try {
			const metadata = epubLibrary.getMetadata(bookId);
			if (!metadata) {
				error = 'Book not found';
				isLoading = false;
				return;
			}

			const epubBlob = await epubLibrary.getEpubFile(bookId);
			if (!epubBlob) {
				error = 'Could not load epub file';
				isLoading = false;
				return;
			}

			sessionStore.loadSession(bookId, metadata.title, metadata.language);
			epubLibrary.updateMetadata(bookId, { last_accessed: Date.now() });

			const arrayBuffer = await epubBlob.arrayBuffer();
			book = ePub(arrayBuffer);

			rendition = book.renderTo(viewerContainer, {
				width: '100%',
				height: '100%',
				spread: 'none'
			});

			// Register fonts
			rendition.hooks.content.register(function (contents) {
				const head = contents.document.head;
				const link = contents.document.createElement('link');
				link.rel = 'stylesheet';
				link.href = getGoogleFontsUrl(DEFAULT_READING_FONT);
				head.appendChild(link);

				// Add click handler to the iframe content
				contents.document.addEventListener('click', (e) => {
					handleTextClick(e as MouseEvent, contents);
				});
			});

			rendition.themes.default(getThemeStyles(settingsStore.fontSize));

			const session = sessionStore.session;
			if (session && session.current_position) {
				await rendition.display(session.current_position);
			} else {
				await rendition.display();
			}

			rendition.on(
				'relocated',
				(location: { start: { cfi: string; displayed: { page: number; total: number } } }) => {
					const cfi = location.start.cfi;
					sessionStore.updatePosition(cfi);
					currentLocation = location.start.displayed.page + ' / ' + location.start.displayed.total;
				}
			);

			isLoading = false;
		} catch (err) {
			console.error('Error loading epub:', err);
			error = err instanceof Error ? err.message : 'Failed to load book';
			isLoading = false;
		}
	});

	onDestroy(() => {
		if (rendition) {
			rendition.destroy();
		}
	});

	$effect(() => {
		if (rendition) {
			rendition.themes.override(getThemeStyles(settingsStore.fontSize));
		}
	});

	function handlePrevPage() {
		rendition?.prev();
	}

	function handleNextPage() {
		rendition?.next();
	}
</script>

<div class="flex h-screen flex-col">
	<!-- Header -->
	<header class="border-b border-text-tertiary bg-surface px-4 py-3">
		<div class="mx-auto flex max-w-4xl items-center justify-between">
			<a
				href={resolve('/')}
				class="flex items-center gap-2 text-text-secondary hover:text-text-primary"
			>
				<IconArrowLeft size={20} />
				<span>Library</span>
			</a>

			{#if sessionStore.session}
				<h1 class="text-lg font-semibold text-text-primary">
					{sessionStore.session.book_title}
				</h1>
			{/if}

			<div class="flex items-center gap-2">
				{#if currentLocation}
					<span class="text-sm text-text-secondary">{currentLocation}</span>
				{/if}
				{#if sessionStore.deck}
					<span class="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
						{sessionStore.deck.cards.length} cards
					</span>
				{/if}
			</div>
		</div>
	</header>

	<!-- Reader Area with Side Panel -->
	<main class="relative flex flex-1 overflow-hidden bg-background">
		<!-- Epub Viewer (takes remaining space) -->
		<div class="relative flex-1 overflow-hidden">
			<div bind:this={viewerContainer} class="absolute inset-0 pb-24"></div>

			{#if isLoading}
				<div class="absolute inset-0 flex items-center justify-center bg-background">
					<p class="text-text-secondary">Loading book...</p>
				</div>
			{/if}

			{#if error}
				<div class="absolute inset-0 flex items-center justify-center bg-background">
					<div class="text-center">
						<p class="mb-4 text-error">{error}</p>
						<Button onclick={() => (window.location.href = resolve('/'))}>Back to Library</Button>
					</div>
				</div>
			{/if}

			{#if !isLoading && !error}
				<div class="absolute inset-x-0 bottom-8 flex justify-center gap-4">
					<button
						onclick={handlePrevPage}
						class="rounded-full bg-surface p-3 shadow-lg hover:bg-background focus:ring-2 focus:ring-primary-500 focus:outline-none"
						aria-label="Previous page"
					>
						<IconChevronLeft size={24} class="text-text-primary" />
					</button>
					<button
						onclick={handleNextPage}
						class="rounded-full bg-surface p-3 shadow-lg hover:bg-background focus:ring-2 focus:ring-primary-500 focus:outline-none"
						aria-label="Next page"
					>
						<IconChevronRight size={24} class="text-text-primary" />
					</button>
				</div>
			{/if}
		</div>

		<!-- Lookup Panel -->
		<LookupPanel
			isOpen={isPanelOpen}
			isLoading={isLookingUp}
			{definition}
			error={lookupError}
			onRetry={handleRetry}
			onAddCard={handleAddCard}
			onToggle={togglePanel}
		/>
	</main>
</div>
