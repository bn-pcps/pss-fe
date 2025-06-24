<script lang="ts">
	import { share, share_id, final_share_slug, share_expiry } from '$lib/stores/share';
	import { appState } from '$lib/stores/appState';
	import { userData } from '$lib/stores/user';
	import { onDestroy } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { get } from 'svelte/store';

	let uploadProgress = 0;
	let uploadedFiles = 0;
	let currentStatus = 'Preparing upload...';
	let errorMessage = '';
	let redirectTimeout: ReturnType<typeof setTimeout> | null = null;
	let redirectCountdown = 5;
	let isRedirecting = false;

	const files = $share.files;
	const totalFiles = files.length;

	// Function to prepare files data for sending (without the actual File objects)
	function prepareShareMetadata() {
		return {
			title: $share.title,
			description: $share.description,
			extra_features: $share.extra_features,
			files: $share.files.map((file) => ({
				name: file.name,
				size: file.size,
				type: file.type
			})),
			total_size: $share.total_size
		};
	}

	// Function to upload metadata and get signature
	async function uploadMetadata() {
		const metadata = prepareShareMetadata();

		const response = await fetch('/api/upload', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(metadata)
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to create share');
		}

		return await response.json();
	}

	// Function to upload files to file service
	async function uploadFilesToService(signature: string) {
		const FILE_SERVICE_URL = env.PUBLIC_FILE_SERVICE_URL || 'http://localhost:3000';

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			currentStatus = `Uploading ${file.name}...`;

			const formData = new FormData();
			formData.append('file', file);

			const uploadResponse = await fetch(`${FILE_SERVICE_URL}/up/${signature}`, {
				method: 'POST',
				body: formData
			});

			if (!uploadResponse.ok) {
				throw new Error(`Failed to upload ${file.name}`);
			}

			uploadedFiles = i + 1;
			uploadProgress = Math.round((uploadedFiles / totalFiles) * 100);
		}
	}

	// Main upload function
	async function startUpload() {
		try {
			currentStatus = 'Creating share...';
			uploadProgress = 0;
			uploadedFiles = 0;
			errorMessage = '';

			// Step 1: Upload metadata and get signature
			const result = await uploadMetadata();
			share_id.set(result.share_id);
			final_share_slug.set(result.share_slug);
			share_expiry.set(result.expiry);

			console.log('❗❗❗result', result);

			// Step 2: Upload files to file service
			currentStatus = 'Uploading files...';
			await uploadFilesToService(result.signature);

			// Success
			currentStatus = 'Upload complete!';
			uploadProgress = 100;

			// Start redirect countdown
			// startRedirectCountdown();

			// Transition to success state after a short delay
			setTimeout(() => {
				appState.set('uploadSuccess');
			}, 100);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			currentStatus = 'Upload failed';
			console.error('Upload error:', error);
		}
	}

	function startRedirectCountdown() {
		isRedirecting = true;
		redirectCountdown = 5;
		const tick = () => {
			if (redirectCountdown > 1) {
				redirectCountdown--;
				redirectTimeout = setTimeout(tick, 1000);
			} else {
				const id = get(share_id);
				window.location.href = `/share/id?shareid=${id}`;
			}
		};
		redirectTimeout = setTimeout(tick, 1000);
	}

	function cancelRedirect() {
		isRedirecting = false;
		if (redirectTimeout) {
			clearTimeout(redirectTimeout);
			redirectTimeout = null;
		}
	}

	// Start upload immediately when component mounts
	startUpload();
</script>

<div class="card">
	<div>
		<!-- lg here -->
		<div class="logo">
			<img src="/lg_ps.svg" alt="PlanarShare.com" />
		</div>
		<div class="text">
			{#if errorMessage}
				<p class="error">{errorMessage}</p>
				<button on:click={() => appState.set('pickingFiles')}>Try Again</button>
			{:else}
				<p>{currentStatus}</p>
				{#if uploadProgress > 0}
					<p>{uploadProgress}% ({uploadedFiles}/{totalFiles} files)</p>
				{/if}

				<div class="progressBar">
					<div class="progressBarFill" style="width: {uploadProgress}%"></div>
				</div>

				{#if isRedirecting}
					<p>
						Redirecting to download page in {redirectCountdown} second{redirectCountdown === 1
							? ''
							: 's'}...
					</p>
					<button on:click={cancelRedirect}>Cancel Redirect</button>
				{/if}
			{/if}
		</div>
	</div>
</div>

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
			width: 100%;
			height: 100%;
			display: flex;
			padding: 32px 24px 24px 24px;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 20px;

			border-radius: 8px;
			// border: 1px dashed #91a7b6;
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

		.error {
			color: #bf4040 !important;
			font-weight: 500;
		}

		button {
			margin-top: 10px;
			padding: 8px 16px;
			background: #4caf50;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
		}
	}

	.progressBar {
		width: 100%;
		height: 10px;
		background-color: #e0e0e0;
		border-radius: 5px;
	}

	.progressBarFill {
		height: 100%;
		background-color: #4caf50;
		border-radius: 5px;
		transition: width 0.3s ease;
	}
</style>
