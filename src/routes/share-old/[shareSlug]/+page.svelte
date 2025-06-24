<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import type { PageData } from './$types';
	import { formatFileSize } from '$lib/utils/formatFileSize';

	export let data: PageData;

	let passwordInput = '';
	let showPasswordForm = false;

	// Check if we need to show password form
	$: if (data.settings.needs_password && !data.settings.password_correct) {
		showPasswordForm = true;
	}

	// Add a function to hash the password using SHA-256 and return hex string
	async function sha256Hex(str: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(str);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	// Make handlePasswordSubmit async and hash the password before using it
	async function handlePasswordSubmit() {
		if (browser && passwordInput.trim()) {
			const hashedPassword = await sha256Hex(passwordInput.trim());
			// Redirect with hashed password as URL parameter for client-side validation
			const url = new URL(window.location.href);
			url.searchParams.set('password', hashedPassword);
			goto(url.toString(), { replaceState: true });
		}
	}

	// function formatFileSize(bytes: number): string {
	// 	if (bytes === 0) return '0 Bytes';
	// 	const k = 1024;
	// 	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	// 	const i = Math.floor(Math.log(bytes) / Math.log(k));
	// 	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	// }

	function downloadFile(fileId: string, fileName: string) {
		if (!env.PUBLIC_FILE_SERVICE_URL) {
			alert('File service is not configured');
			return;
		}

		// Get current password from URL if any
		const urlParams = new URLSearchParams(window.location.search);
		const password = urlParams.get('password');

		// Build download URL for individual file
		const downloadUrl = new URL(`${env.PUBLIC_FILE_SERVICE_URL}/d/f/${fileId}`);
		if (password) {
			downloadUrl.searchParams.set('password', password);
		}

		// Direct download using file service
		window.open(downloadUrl.toString(), '_blank');
	}

	function downloadAllFiles() {
		if (!env.PUBLIC_FILE_SERVICE_URL) {
			alert('File service is not configured');
			return;
		}

		// Get current password from URL if any
		const urlParams = new URLSearchParams(window.location.search);
		const password = urlParams.get('password');

		// Build download URL for entire share
		const downloadUrl = new URL(`${env.PUBLIC_FILE_SERVICE_URL}/d/s/${data.share.id}`);
		if (password) {
			downloadUrl.searchParams.set('password', password);
		}

		// Direct download using file service
		window.open(downloadUrl.toString(), '_blank');
	}
</script>

<svelte:head>
	<title>{data.share.title} - Shared Files</title>
	<meta name="description" content={data.share.description || 'Shared files'} />
</svelte:head>

<div class="cardsContainer">
	<div class="share_card">
		<div class="content">
			<div class="header">
				<h2>{data.share.title}</h2>
				{#if data.share.description}
					<p class="description">{data.share.description}</p>
				{/if}
				<div class="details">
					<span>{data.share.file_count} files</span>
					<div class="separator"></div>
					<span>{formatFileSize(data.share.size)}</span>
					<div class="separator"></div>
					<span>{data.share.download_count} downloads</span>
				</div>
			</div>

			{#if showPasswordForm && !data.settings.password_correct}
				<div class="password-form">
					<h3>This share is password protected</h3>
					<form on:submit|preventDefault={handlePasswordSubmit}>
						<input
							type="password"
							bind:value={passwordInput}
							placeholder="Enter password"
							class="password-input"
						/>
						<button type="submit" class="submit-btn">Access Files</button>
					</form>
				</div>
			{:else if data.files.length > 0}
				<div class="files-section">
					<div class="files-header">
						<h3>Files ({data.files.length})</h3>
						<button class="download-all-btn" on:click={downloadAllFiles}> Download All </button>
					</div>
					<div class="files-list">
						{#each data.files as file}
							<div class="file-item">
								<div class="file-info">
									<span class="file-name">{file.name}</span>
									<span class="file-size">{formatFileSize(file.size)}</span>
									<span class="file-type">{file.type}</span>
								</div>
								<button class="download-btn" on:click={() => downloadFile(file.id, file.name)}>
									Download
								</button>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="no-files">
					<p>No files available</p>
				</div>
			{/if}

			{#if data.settings.expiry}
				<div class="expiry-info">
					<small>Expires: {new Date(data.settings.expiry).toLocaleString()}</small>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	:global(body) {
		background: radial-gradient(100% 100% at 50% 100%, #d1e3f0 0%, #f0ebf4 50%, #edf0f3 100%);
	}

	.cardsContainer {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 20px;
	}

	.share_card {
		width: min(90vw, 800px);
		max-width: 800px;
		min-height: 400px;
		padding: 24px;
		border-radius: 12px;
		background: rgba(243, 245, 247, 0.3);
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		backdrop-filter: blur(25px);
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.header h2 {
		margin: 0 0 8px 0;
		color: #1a1a1a;
		font-size: 24px;
		font-weight: 600;
	}

	.description {
		margin: 0 0 12px 0;
		color: #666;
		line-height: 1.5;
	}

	.details {
		display: flex;
		align-items: center;
		gap: 12px;
		color: #888;
		font-size: 14px;
	}

	.separator {
		width: 4px;
		height: 4px;
		background: #ccc;
		border-radius: 50%;
	}

	.password-form {
		background: rgba(255, 255, 255, 0.5);
		padding: 20px;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.password-form h3 {
		margin: 0 0 16px 0;
		color: #333;
	}

	.password-form form {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.password-input {
		flex: 1;
		padding: 10px 12px;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 14px;
	}

	.submit-btn,
	.download-btn,
	.download-all-btn {
		padding: 10px 16px;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s;
	}

	.submit-btn:hover,
	.download-btn:hover,
	.download-all-btn:hover {
		background: #0056b3;
	}

	.files-section h3 {
		margin: 0;
		color: #333;
	}

	.files-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.download-all-btn {
		background: #28a745;
	}

	.download-all-btn:hover {
		background: #1e7e34;
	}

	.files-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.file-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.file-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
	}

	.file-name {
		font-weight: 500;
		color: #333;
	}

	.file-size,
	.file-type {
		font-size: 12px;
		color: #666;
	}

	.download-btn {
		padding: 6px 12px;
		font-size: 12px;
	}

	.no-files {
		text-align: center;
		padding: 40px 20px;
		color: #666;
	}

	.expiry-info {
		padding-top: 16px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		color: #888;
		text-align: center;
	}

	@media (max-width: 600px) {
		.file-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.password-form form {
			flex-direction: column;
			align-items: stretch;
		}

		.files-header {
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
		}
	}
</style>
