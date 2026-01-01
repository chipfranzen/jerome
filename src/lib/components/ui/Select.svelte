<script lang="ts">
	interface Props {
		id?: string;
		value: string;
		options: Array<{ value: string; label: string }>;
		label?: string;
		required?: boolean;
	}

	let { id, value = $bindable(), options, label, required = false }: Props = $props();

	const selectClasses =
		'w-full rounded-md border border-text-tertiary bg-background px-4 py-2 text-text-primary focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';
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

	<select {id} bind:value {required} class={selectClasses}>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
