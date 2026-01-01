<script lang="ts">
	interface Props {
		id?: string;
		type?: 'text' | 'password' | 'email' | 'file';
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		required?: boolean;
		accept?: string;
	}

	let {
		id,
		type = 'text',
		value = $bindable(''),
		placeholder,
		label,
		error,
		required = false,
		accept
	}: Props = $props();

	const inputClasses = `w-full rounded-md border ${error ? 'border-error' : 'border-text-tertiary'} bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`;
</script>

<div class="mb-4">
	{#if label}
		<label for={id} class="mb-2 block text-sm font-medium text-text-primary">
			{label}
			{#if required}
				<span class="text-error">*</span>
			{/if}
		</label>
	{/if}

	<input {id} {type} bind:value {placeholder} {required} {accept} class={inputClasses} />

	{#if error}
		<p class="mt-2 text-sm text-error">{error}</p>
	{/if}
</div>
