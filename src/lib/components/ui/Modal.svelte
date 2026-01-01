<script lang="ts">
	import IconClose from '$lib/components/icons/IconClose.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		title: string;
		children: import('svelte').Snippet;
	}

	let { isOpen, onClose, title, children }: Props = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		onclick={handleBackdropClick}
		role="presentation"
	>
		<div class="relative w-full max-w-lg rounded-lg bg-surface p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-text-primary">{title}</h2>
				<button
					onclick={onClose}
					class="text-text-secondary hover:text-text-primary focus:outline-none"
					aria-label="Close modal"
				>
					<IconClose size={24} />
				</button>
			</div>
			{@render children()}
		</div>
	</div>
{/if}
