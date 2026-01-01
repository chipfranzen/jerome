<script lang="ts">
	let { children } = $props();
</script>

<section class="rounded-lg bg-surface p-6 shadow-sm">
	{@render children()}
</section>
