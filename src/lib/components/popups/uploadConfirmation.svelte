<script lang="ts">
	import { popUpOverlayNigga } from '$lib/stores/popUpOverlayNigga';
	import { share } from '$lib/stores/share';
	import { appState } from '$lib/stores/appState';
	import { onMount } from 'svelte';
	import { formatFileSize } from '$lib/utils/formatFileSize';

	function closePopup() {
		popUpOverlayNigga.update((v) => ({ ...v, uploadConfirmation: false }));
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				closePopup();
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div
	class="overlay"
	role="button"
	aria-label="Close popup"
	tabindex="0"
	on:click={closePopup}
	on:keydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') closePopup();
	}}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="card" on:click|stopPropagation>
		<div class="content">
			<div class="title">
				<h2>Confirm Upload</h2>
			</div>
			<p>
				Do you want to upload these files with total size of {formatFileSize($share.total_size)}?
			</p>
			<div class="files">
				{#each $share.files as file}
					<div class="file">
						<p>{file.name}</p>
					</div>
				{/each}
			</div>
			<div class="actions">
				<button
					class="btn_confirm"
					on:click={() => {
						appState.set('uploadingFiles');
						popUpOverlayNigga.update((v) => ({ ...v, uploadConfirmation: false }));
					}}
				>
					Confirm
				</button>
				<button
					class="btn_cancel"
					on:click={() => {
						popUpOverlayNigga.update((v) => ({ ...v, uploadConfirmation: false }));
					}}
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.overlay {
		position: absolute;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.card {
		width: var(--default-width);
		padding: 1.25rem;
		/* align-self: stretch; */

		border-radius: 12px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		/* background: rgba(243, 245, 247, 0.3); */
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		/* backdrop-filter: blur(25px); */

		/* border-radius: 8px; */
		background: rgba(237, 240, 243, 0.85);
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		align-self: stretch;
	}

	.title {
		display: flex;
		align-items: center;
		gap: 4px;
		align-self: stretch;

		h2 {
			color: #0c1012;
			text-align: center;
			font-size: 16px;
			font-style: normal;
			font-weight: 700;
			line-height: normal;
		}
	}

	p {
		text-align: justify;
	}

	.files {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		align-self: stretch;

		// padding-left: 10px;
		// padding: 2rem;

		margin-bottom: 10px;
		background: rgba(237, 240, 243, 0.5);
		border-radius: 8px;
		padding: 1rem;

		max-height: 5ch;
		overflow-y: auto;

		> .file {
			// padding: 10px;

			> p {
				color: #0c1012;
				font-family: monospace;
			}
		}
	}

	.actions {
		display: flex;
		// align-items: center;
		// justify-content: flex-end;

		gap: 4px;
		// align-self: stretch;
		width: 100%;
		flex-direction: column;

		> button {
			cursor: pointer;

			display: flex;
			padding: 8px 16px;
			align-items: center;
			justify-content: center;

			width: 100%;

			border-radius: 8px;
			border: 1px solid rgba(218, 224, 231, 0.5);
			background: rgba(243, 245, 247, 0.3);

			// backdrop-filter: blur(25px);

			background: rgba(237, 240, 243, 0.5);

			backdrop-filter: blur(25px);

			// background-color: red;

			border: 1px solid hsla(212, 21%, 80%, 0);
			box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0);
			transition: all 0.1s ease-in-out;

			&.btn_cancel {
				// background: rgba(243, 245, 247, 0.3);
				width: 100%;
			}

			&.btn_confirm {
				// background: rgba(243, 245, 247, 0.3);

				color: hsl(123, 50%, 35%);
			}

			&:focus,
			&:hover,
			&:active {
				border: 1px solid hsla(212, 21%, 80%, 0.5);
				box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0.02);
			}
		}
	}
</style>
