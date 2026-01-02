<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 24, class: className = '' }: Props = $props();
</script>

<svg
	class={className}
	width={size}
	height={size}
	fill="none"
	stroke="currentColor"
	viewBox="0 0 24 24"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M10 19l-7-7m0 0l7-7m-7 7h18"
	/>
</svg>
