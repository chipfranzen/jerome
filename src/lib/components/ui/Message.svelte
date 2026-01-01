<script lang="ts">
	interface Props {
		type: 'error' | 'success' | 'info';
		message: string;
	}

	let { type, message }: Props = $props();

	const classes = {
		error: 'text-error',
		success: 'text-success',
		info: 'text-text-secondary'
	};
</script>

<p class="mt-2 text-sm {classes[type]}">{message}</p>
