<script lang="ts">
	interface Props {
		level: 1 | 2 | 3;
		children: import('svelte').Snippet;
	}

	let { level, children }: Props = $props();

	const classes = {
		1: 'mb-8 text-3xl font-bold text-text-primary',
		2: 'mb-4 text-xl font-semibold text-text-primary',
		3: 'mb-3 text-lg font-medium text-text-primary'
	};
</script>

{#if level === 1}
	<h1 class={classes[1]}>{@render children()}</h1>
{:else if level === 2}
	<h2 class={classes[2]}>{@render children()}</h2>
{:else}
	<h3 class={classes[3]}>{@render children()}</h3>
{/if}
