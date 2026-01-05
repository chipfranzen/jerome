<script lang="ts">
	interface Props {
		children: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<h3 class="mb-2 text-sm font-semibold text-text-secondary uppercase">
	{@render children()}
</h3>
