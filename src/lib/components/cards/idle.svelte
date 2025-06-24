<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { share } from '$lib/stores/share';
	import { appState } from '$lib/stores/appState';
	import { userData } from '$lib/stores/user';
	import { popUpOverlayNigga } from '$lib/stores/popUpOverlayNigga';

	let fileInput: HTMLInputElement;

	function openFileSelector() {
		fileInput.click();
	}

	function handleFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const files = Array.from(input.files);
			const user = $userData;
			const currentTotal = $share?.total_size || 0; // bytes
			const newTotal = files.reduce((acc, file) => acc + file.size, 0); // bytes
			// Convert bytes to MB and round up
			const totalNewFilesInMB = Math.ceil((currentTotal + newTotal) / (1024 * 1024));

			if (user && user.used_quota + totalNewFilesInMB > user.quota) {
				popUpOverlayNigga.update((v) => ({ ...v, quotaExceeded: true }));
				input.value = '';
				return;
			}

			// Add a new share with the selected files
			share.set({
				title: '',
				description: '',
				extra_features: {},
				files: [...($share?.files || []), ...files],
				total_size: files.reduce((acc, file) => acc + file.size, $share?.total_size || 0)
			});
			// Optionally, reset the input so the same file can be selected again
			input.value = '';
			console.log('share', $share);

			appState.set('pickingFiles');
		}
	}
</script>

<button class="card" on:click={openFileSelector} style="cursor: pointer;">
	<div>
		<!-- lg here -->
		<div class="logo">
			<img src="/lg_ps.svg" alt="PlanarShare.com" />
		</div>
		<div class="text">
			<p>Click or drag file(s)/folder(s) here to create a new share.</p>
		</div>
	</div>
	<input
		type="file"
		multiple
		bind:this={fileInput}
		on:change={handleFilesSelected}
		style="display: none;"
	/>
</button>

<style lang="scss">
	.card {
		display: flex;
		width: var(--default-width);
		padding: 4px;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		gap: 4px;

		border-radius: 12px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		background: rgba(243, 245, 247, 0.3);
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		backdrop-filter: blur(25px);

		height: var(--default-height);

		> div {
			height: 100%;
			display: flex;
			padding: 32px 24px 24px 24px;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 20px;

			border-radius: 8px;
			border: 1px dashed #91a7b6;
			background: rgba(237, 240, 243, 0.3);
		}
	}

	.text {
		> p {
			color: rgba(12, 16, 18, 0.5);
			text-align: center;
			font-size: 14px;
			font-style: italic;
			font-weight: 400;
			line-height: normal;
		}
	}
</style>
