<script lang="ts">
	import { popUpOverlayNigga } from '$lib/stores/popUpOverlayNigga';
	import { share } from '$lib/stores/share';
	import { appState } from '$lib/stores/appState';
	import { onMount } from 'svelte';

	function closePopup() {
		popUpOverlayNigga.update((v) => ({ ...v, cancelShare: false }));
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
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M18.7824 16.1068L13.7896 6.10359C13.053 4.62783 10.9472 4.62781 10.2106 6.10358L5.21763 16.1068C4.55392 17.4366 5.52095 19 7.0071 19H16.9929C18.479 19 19.4461 17.4366 18.7824 16.1068ZM15.579 5.21043C14.1059 2.25889 9.89432 2.25888 8.42112 5.2104L3.42816 15.2136C2.10074 17.8731 4.03478 21 7.0071 21H16.9929C19.9652 21 21.8992 17.8731 20.5719 15.2137L15.579 5.21043Z"
						fill="#BF4040"
					/>
					<path
						d="M13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8V12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12V8Z"
						fill="#BF4040"
					/>
					<path
						d="M12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15Z"
						fill="#BF4040"
					/>
				</svg>
				<h2>Cancel Share</h2>
			</div>
			<p>
				Are you sure you want to cancel the share? This will remove all files and reset the share.
			</p>
			<div class="actions">
				<button
					class="btn_confirm"
					on:click={() => {
						share.set({
							title: '',
							description: '',
							extra_features: {},
							files: [],
							total_size: 0
						});
						appState.set('idle');
						popUpOverlayNigga.update((v) => ({ ...v, cancelShare: false }));
					}}
				>
					Confirm
				</button>
				<button
					class="btn_cancel"
					on:click={() => {
						popUpOverlayNigga.update((v) => ({ ...v, cancelShare: false }));
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

				color: #bf4040;
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
