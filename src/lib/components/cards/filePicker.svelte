<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { share, shareReady } from '$lib/stores/share';
	import { appState } from '$lib/stores/appState';
	import { get } from 'svelte/store';
	import { formatFileSize } from '$lib/utils/formatFileSize';
	import Password from '../fileds/password.svelte';
	import Expiry from '../fileds/expiry.svelte';
	import DownloadLimit from '../fileds/downloadLimit.svelte';
	import CustomURL from '../fileds/customURL.svelte';
	import { userData } from '$lib/stores/user';
	import { popUpOverlayNigga } from '$lib/stores/popUpOverlayNigga';

	let fileInput: HTMLInputElement;

	function openFileSelector() {
		fileInput.click();
	}

	function handleFilesSelected(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const newFiles = Array.from(input.files);
			const currentFiles = get(share)?.files || [];

			// Filter out files that are already in currentFiles (by name and size)
			const uniqueFiles = newFiles.filter((newFile) => {
				return !currentFiles.some(
					(existingFile) =>
						existingFile.name === newFile.name &&
						existingFile.size === newFile.size &&
						existingFile.type === newFile.type
				);
			});

			if (uniqueFiles.length > 0) {
				const user = get(userData);
				const currentTotal = currentFiles.reduce((acc, file) => acc + file.size, 0); // bytes
				const newTotal = uniqueFiles.reduce((acc, file) => acc + file.size, 0); // bytes

				// Convert bytes to MB (1 MB = 1024 * 1024 bytes) and round up
				const totalNewFilesInMB = Math.ceil((currentTotal + newTotal) / (1024 * 1024));

				if (user && user.used_quota + totalNewFilesInMB > user.quota) {
					popUpOverlayNigga.update((v) => ({ ...v, quotaExceeded: true }));
					input.value = '';
					console.log('quota exceeded');
					return;
				}

				share.set({
					title: '',
					description: '',
					extra_features: {},
					files: [...currentFiles, ...uniqueFiles],
					total_size: currentTotal + newTotal
				});
			}
			// Optionally, reset the input so the same file can be selected again
			input.value = '';
			console.log('share', $share);

			// appState.set('pickingFiles');
		}
	}
</script>

<div class="card">
	<div class="files">
		<!-- Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet architecto aperiam, iure et
		quasi facilis accusamus assumenda nemo nobis temporibus accusantium molestias quidem saepe eaque
		minima praesentium repellat iste voluptatem? Lorem ipsum dolor sit amet consectetur adipisicing
		elit. A architecto ipsam iste numquam molestiae. Vitae, quasi accusamus esse qui quo itaque ipsa
		eveniet minima. Illo, consectetur odio. Repellendus, ea esse! Lorem ipsum dolor sit amet
		consectetur, adipisicing elit. Consectetur doloremque optio corporis reiciendis iste, voluptate
		praesentium similique at laudantium officiis quisquam nobis nihil eveniet aliquam consequuntur,
		enim voluptatem quibusdam assumenda. -->
		{#each $share?.files as file}
			<div class="file_item">
				<button
					class="delete"
					on:click={() => {
						console.log('delete file', file);
						share.update((current) => ({
							...current,
							files: current.files.filter((f) => f.name !== file.name),
							total_size: current.total_size - file.size
						}));
					}}
					aria-label="Delete file"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M5.83341 6.66666V15C5.83341 15.9205 6.57961 16.6667 7.50008 16.6667H12.5001C13.4206 16.6667 14.1667 15.9205 14.1667 15V6.66666H15.8334V15C15.8334 16.8409 14.341 18.3333 12.5001 18.3333H7.50008C5.65913 18.3333 4.16675 16.8409 4.16675 15V6.66666H5.83341Z"
							fill="currentColor"
						/>
						<path
							d="M8.33333 9.16666C7.8731 9.16666 7.5 9.53975 7.5 9.99999V13.3333C7.5 13.7936 7.8731 14.1667 8.33333 14.1667C8.79357 14.1667 9.16667 13.7936 9.16667 13.3333V9.99999C9.16667 9.53975 8.79357 9.16666 8.33333 9.16666Z"
							fill="currentColor"
						/>
						<path
							d="M11.6667 9.16666C11.2064 9.16666 10.8333 9.53975 10.8333 9.99999V13.3333C10.8333 13.7936 11.2064 14.1667 11.6667 14.1667C12.1269 14.1667 12.5 13.7936 12.5 13.3333V9.99999C12.5 9.53975 12.1269 9.16666 11.6667 9.16666Z"
							fill="currentColor"
						/>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M6.66659 4.99999V4.16666C6.66659 2.78594 7.78587 1.66666 9.16658 1.66666H10.8333C12.214 1.66666 13.3333 2.78594 13.3333 4.16666V4.99999H15.8333C16.2935 4.99999 16.6666 5.37309 16.6666 5.83332C16.6666 6.29356 16.2935 6.66666 15.8333 6.66666H4.16659C3.70635 6.66666 3.33325 6.29356 3.33325 5.83332C3.33325 5.37309 3.70635 4.99999 4.16659 4.99999H6.66659ZM8.33325 4.16666C8.33325 3.70642 8.70635 3.33332 9.16658 3.33332H10.8333C11.2935 3.33332 11.6666 3.70642 11.6666 4.16666V4.99999H8.33325V4.16666Z"
							fill="currentColor"
						/>
					</svg>
				</button>
				<div class="details">
					<p>{file.name}</p>
					<p>{formatFileSize(file.size)}</p>
				</div>
			</div>
		{/each}

		<button class="btn_add_file" on:click={openFileSelector} style="cursor: pointer;">
			<!-- lg here -->
			<div class="text">
				<p>+ Add Another File</p>
			</div>
		</button>
	</div>
	<div class="options_container">
		<div class="options">
			<div class="details">
				<h3>Share Details</h3>
				<div>
					<!-- show if $share?.files.length > 0 -->
					{#if $share?.files.length > 0}
						<span>{formatFileSize($share?.total_size)}</span>
						<div class="s"></div>
						<span
							>{$share?.files.length}
							{#if $share?.files.length === 1}File{:else}Files{/if}</span
						>
					{:else}
						<span>Start by adding a file on the left.</span>
					{/if}
				</div>
			</div>
			<div class="details_input">
				<input name="title" id="title" placeholder="Title" bind:value={$share.title} />
				<textarea
					name="description"
					id="description"
					placeholder="Description"
					bind:value={$share.description}
				></textarea>
				<div class="seperator">
					<span>Extra Features</span>
					<div></div>
				</div>
			</div>
			<Password />
			<Expiry />
			<DownloadLimit />
			<CustomURL />
		</div>
		<div class="actions">
			<button
				class="btn_cancel"
				on:click={() => {
					popUpOverlayNigga.update((v) => ({ ...v, cancelShare: true }));
				}}
			>
				<span>Cancel</span>
			</button>
			<button
				class="btn_share"
				disabled={!$shareReady}
				on:click={() => {
					popUpOverlayNigga.update((v) => ({ ...v, uploadConfirmation: true }));
				}}
			>
				<span>Share</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="6"
					height="12"
					viewBox="0 0 6 12"
					fill="none"
				>
					<path
						d="M1.5 1.5L4.04051 4.40344C4.61234 5.05696 4.69712 6.00481 4.25034 6.74944L2 10.5"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	</div>
	<input
		type="file"
		multiple
		bind:this={fileInput}
		on:change={handleFilesSelected}
		style="display: none;"
	/>
</div>

<style lang="scss">
	.card {
		// display: flex;
		width: var(--wide-width);
		height: var(--default-height);

		display: inline-flex;
		padding: 4px;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;

		border-radius: 12px;
		background: rgba(243, 245, 247, 0.3);
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		// backdrop-filter: blur(25px);

		overflow: hidden;

		> div {
			width: 100%;
			height: 100%;

			max-height: 100%;
		}
	}

	.files {
		display: flex;
		width: 100%;
		flex-direction: column;
		// justify-content: center;
		align-items: flex-start;
		gap: 4px;

		overflow-y: auto;

		.file_item {
			display: flex;
			align-items: flex-start;
			gap: 4px;
			align-self: stretch;

			> .delete {
				cursor: pointer;

				display: flex;
				padding: 6px;
				align-items: center;

				// aspect-ratio: 1/1;
				// width: 36px;
				height: 100%;

				border-radius: 8px;
				border: 1px solid rgba(218, 224, 231, 0.5);
				background: rgba(243, 245, 247, 0.3);

				color: inherit;
				transition: color 0.1s ease-in-out;

				&:hover {
					color: hsla(0, 50%, 50%, 1);
				}
			}

			.details {
				display: flex;
				padding: 8px 12px;
				justify-content: space-between;
				align-items: center;
				// flex: 1 0 0;

				max-width: 100%;
				width: 100%;

				border-radius: 8px;
				border: 1px solid rgba(218, 224, 231, 0.5);
				background: rgba(243, 245, 247, 0.3);

				font-family: monospace;

				> p:first-child {
					// truncate
					overflow: hidden;
					text-overflow: ellipsis;
					// white-space: pre-wrap;
					white-space: nowrap;
					max-width: 26ch;
					width: 100%;
				}

				> p:nth-child(2) {
					color: rgba(12, 16, 18, 0.5);
					font-size: 0.75rem;
					width: max-content;
					text-align: right;

					white-space: nowrap;
				}
			}
		}
	}

	.btn_add_file {
		position: sticky;
		bottom: 0;

		width: 100%;
		height: 100%;
		min-height: max-content;
		display: flex;
		padding: 8px 12px;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 20px;

		border-radius: 8px;
		border: 1px dashed #91a7b6;
		background: rgba(237, 240, 243, 0.5);

		backdrop-filter: blur(25px);
	}

	.options_container {
		display: flex;
		width: 100%;
		// padding: 4px;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		gap: 4px;

		overflow-y: auto;

		.options {
			// max-height: 100%;

			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
			flex: 1 0 0;
			align-self: stretch;

			padding-top: 12px;

			> .details {
				display: flex;
				flex-direction: column;
				justify-content: center;
				gap: 2px;
				> h3 {
					color: #0c1012;
					font-size: 16px;
					font-style: normal;
					font-weight: 400;
					line-height: normal;
				}

				> div {
					display: flex;
					align-items: center;
					gap: 8px;

					> span {
						// color: #0c1012;
						color: rgba(12, 16, 18, 0.5);
						font-family: monospace;
						font-size: 12px;
						font-style: normal;
						font-weight: 400;
						line-height: normal;
					}

					> .s {
						width: 4px;
						height: 4px;
						aspect-ratio: 1/1;

						background-color: rgba(12, 16, 18, 0.5);
						border-radius: 50%;
					}
				}
			}

			.details_input {
				display: flex;
				flex-direction: column;
				gap: 4px;
				width: 100%;

				> input,
				textarea {
					width: 100%;
					display: flex;
					padding: 8px 12px;
					align-items: center;
					align-self: stretch;
					border-radius: 8px;
					border: 1px solid rgba(218, 224, 231, 0.5);
					background: rgba(243, 245, 247, 0.5);

					outline: none;

					&:focus,
					&:hover,
					&:active {
						border: 1px solid hsla(212, 21%, 80%, 0.5);
						// background-color: red;

						box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0.02);
					}
				}

				> textarea {
					resize: vertical;
					min-height: 4rem;
					font-family: inherit;
				}
			}

			.seperator {
				display: flex;
				align-items: center;
				gap: 8px;
				align-self: stretch;

				> span {
					color: rgba(12, 16, 18, 0.5);
					font-size: 14px;
					font-style: normal;
					font-weight: 400;
					line-height: normal;
					width: fit-content;
					white-space: nowrap;
				}

				> div {
					background-color: rgba(12, 16, 18, 0.5);
					width: 100%;
					height: 1px;
				}
			}
		}

		.actions {
			z-index: 100;

			position: sticky;
			bottom: 0;

			display: flex;
			align-items: flex-start;
			gap: 4px;
			align-self: stretch;

			padding-top: 1rem;

			// background-color: linear-gradient(
			// 	to bottom,
			// 	rgba(243, 245, 247, 0.3) 0%,
			// 	rgba(243, 245, 247, 0) 100%
			// );

			> button {
				cursor: pointer;

				display: flex;
				padding: 8px 16px;
				align-items: center;

				border-radius: 8px;
				border: 1px solid rgba(218, 224, 231, 0.5);
				background: rgba(243, 245, 247, 0.3);

				// backdrop-filter: blur(25px);

				background: rgba(237, 240, 243, 0.5);

				backdrop-filter: blur(25px);

				// background-color: red;

				transition: all 0.1s ease-in-out;

				&.btn_cancel > span {
					color: #bf4040;
					font-size: 1rem;
					font-style: normal;
					font-weight: 400;
					line-height: normal;
				}

				&.btn_share {
					display: flex;
					justify-content: space-between;
					align-items: center;

					width: 100%;
					border: 1px solid rgba(218, 224, 231, 0.5);
					background: linear-gradient(
						90deg,
						rgba(243, 245, 247, 0.3) 0%,
						rgba(179, 229, 179, 0.15) 100%
					);
					color: #0c1012;

					&:disabled {
						// opacity: 0.5;
						cursor: not-allowed;
						background: rgba(237, 240, 243, 0.5);
						color: rgba(12, 16, 18, 0.5);
					}

					> span {
						font-size: 1rem;
						font-style: normal;
						font-weight: 400;
						line-height: normal;
					}
				}

				&:focus,
				&:hover,
				&:active {
					border: 1px solid hsla(212, 21%, 80%, 0.5);
					box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0.02);
				}
			}
		}
	}

	.text {
		width: 100%;
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
