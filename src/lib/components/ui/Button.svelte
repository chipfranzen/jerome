<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'danger';
		type?: 'button' | 'submit';
		onclick?: () => void;
		disabled?: boolean;
		children: import('svelte').Snippet;
	}

	let {
		variant = 'primary',
		type = 'button',
		onclick,
		disabled = false,
		children
	}: Props = $props();

	const baseClasses =
		'rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
	const variantClasses = {
		primary:
			'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
		secondary:
			'border border-text-tertiary text-text-primary hover:bg-background focus:ring-text-tertiary disabled:opacity-50 disabled:cursor-not-allowed',
		danger:
			'bg-error text-white hover:bg-red-600 focus:ring-error disabled:opacity-50 disabled:cursor-not-allowed'
	};

	const classes = `${baseClasses} ${variantClasses[variant]}`;
</script>

<button {type} {onclick} {disabled} class={classes}>
	{@render children()}
</button>
