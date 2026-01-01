<script lang="ts">
	interface Props {
		title: string;
		description: string;
		children?: import('svelte').Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
	<div class="mb-4 text-6xl">📚</div>
	<h3 class="mb-2 text-xl font-semibold text-text-primary">{title}</h3>
	<p class="mb-6 text-text-secondary">{description}</p>
	{#if children}
		{@render children()}
	{/if}
</div>
