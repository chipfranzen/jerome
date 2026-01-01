<script lang="ts">
	import { resolve } from '$app/paths';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import EpubLibrary from '$lib/components/epub/EpubLibrary.svelte';
</script>

<Container>
	<div class="mb-6 flex items-center justify-between">
		<Heading level={1}>Jerome</Heading>
		<a href={resolve('/settings')} class="text-primary-600 hover:text-primary-700">Settings</a>
	</div>

	<EpubLibrary />
</Container>
