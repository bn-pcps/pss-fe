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
					<div class="files-list">
						{#each data.files as file}
							<div class="file-item">
								<div class="file-info">
									<span class="file-name">{file.name}</span>
									<span class="file-size">{formatFileSize(file.size)}</span>
									<!-- <span class="file-type">{file.type}</span> -->
								</div>
								<button class="download-btn" on:click={() => downloadFile(file.id, file.name)}>
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
											d="M12.2423 1.75878C11.8567 1.66621 11.4569 1.6664 10.9277 1.66665L8.13193 1.66668C7.46112 1.66667 6.90748 1.66666 6.45649 1.70351C5.98807 1.74178 5.55749 1.82391 5.15304 2.02999C4.52583 2.34957 4.0159 2.8595 3.69632 3.48671C3.49024 3.89116 3.40811 4.32174 3.36984 4.79016C3.33299 5.24115 3.333 5.79478 3.33301 6.46558V13.5344C3.333 14.2052 3.33299 14.7589 3.36984 15.2099C3.40811 15.6783 3.49024 16.1089 3.69632 16.5133C4.0159 17.1405 4.52583 17.6505 5.15304 17.97C5.55749 18.1761 5.98807 18.2582 6.45649 18.2965C6.90748 18.3334 7.46111 18.3334 8.13191 18.3333H11.8674C12.5382 18.3334 13.0919 18.3334 13.5429 18.2965C14.0113 18.2582 14.4419 18.1761 14.8463 17.97C15.4735 17.6505 15.9835 17.1405 16.303 16.5133C16.5091 16.1089 16.5912 15.6783 16.6295 15.2099C16.6664 14.7589 16.6664 14.2052 16.6663 13.5344L16.6664 7.4053C16.6666 6.87614 16.6668 6.4763 16.5742 6.09073C16.4926 5.75061 16.3579 5.42546 16.1751 5.12722C15.968 4.78912 15.6851 4.50653 15.3107 4.13254L14.2005 3.02228C13.8265 2.64792 13.5439 2.36507 13.2058 2.15788C12.9076 1.97512 12.5824 1.84043 12.2423 1.75878ZM10.833 3.33335H8.16634C7.45253 3.33335 6.96728 3.33399 6.59221 3.36464C6.22686 3.39449 6.04002 3.44859 5.90969 3.515C5.59609 3.67479 5.34112 3.92976 5.18133 4.24336C5.11492 4.37369 5.06082 4.56053 5.03097 4.92588C5.00032 5.30095 4.99968 5.7862 4.99968 6.50001V13.5C4.99968 14.2138 5.00032 14.6991 5.03097 15.0741C5.06082 15.4395 5.11492 15.6263 5.18133 15.7567C5.34112 16.0703 5.59609 16.3252 5.90969 16.485C6.04002 16.5514 6.22686 16.6055 6.59221 16.6354C6.96728 16.666 7.45253 16.6667 8.16634 16.6667H11.833C12.5468 16.6667 13.0321 16.666 13.4071 16.6354C13.7725 16.6055 13.9593 16.5514 14.0897 16.485C14.4033 16.3252 14.6582 16.0703 14.818 15.7567C14.8844 15.6263 14.9385 15.4395 14.9684 15.0741C14.999 14.6991 14.9997 14.2138 14.9997 13.5V7.50001H13.333C11.9523 7.50001 10.833 6.38072 10.833 5.00001V3.33335ZM14.633 5.83334C14.5328 5.71492 14.3729 5.55176 14.0722 5.25103L13.082 4.26084C12.7813 3.96011 12.6181 3.80018 12.4997 3.70003V5.00001C12.4997 5.46025 12.8728 5.83334 13.333 5.83334H14.633Z"
											fill="#0C1012"
										/>
										<path
											d="M10.5893 14.7559C10.2638 15.0814 9.73618 15.0814 9.41074 14.7559L7.74408 13.0893C7.41864 12.7638 7.41864 12.2362 7.74408 11.9107C8.06951 11.5853 8.59715 11.5853 8.92259 11.9107L9.16667 12.1548V9.16667C9.16667 8.70643 9.53976 8.33333 10 8.33333C10.4602 8.33333 10.8333 8.70643 10.8333 9.16667V12.1548L11.0774 11.9107C11.4028 11.5853 11.9305 11.5853 12.2559 11.9107C12.5814 12.2362 12.5814 12.7638 12.2559 13.0893L10.5893 14.7559Z"
											fill="#0C1012"
										/>
									</svg>
								</button>
							</div>
						{/each}
					</div>
					<button class="download-all-btn" on:click={downloadAllFiles}> Download All </button>
				</div>
			{:else}
				<div class="no-files">
					<p>No files available</p>
				</div>
			{/if}

			<!-- {#if data.settings.expiry}
				<div class="expiry-info">
					<small>Expires: {new Date(data.settings.expiry).toLocaleString()}</small>
				</div>
			{/if} -->
		</div>
	</div>
</div>

<style>
	:global(body) {
		background: radial-gradient(100% 100% at 50% 100%, #d1e3f0 0%, #f0ebf4 50%, #edf0f3 100%);
	}

	button {
		cursor: pointer;
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
		/* width: min(90vw, 800px);
		max-width: 800px;
		min-height: 400px;
		padding: 24px;
		border-radius: 12px;
		background: rgba(243, 245, 247, 0.3);
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		backdrop-filter: blur(25px); */

		display: flex;
		width: var(--default-width);
		height: var(--default-height);

		/* height: 400px; */

		padding: 4px;
		/* align-items: center; */
		gap: 10px;

		border-radius: 12px;
		background: rgba(243, 245, 247, 0.3);
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		backdrop-filter: blur(25px);
		* {
			max-width: 100%;
		}
	}

	.content {
		/* display: flex;
		flex-direction: column;
		gap: 20px; */

		height: 100%;

		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		flex: 1 0 0;
		align-self: stretch;
	}

	.header {
		display: flex;
		padding: 12px 16px;
		flex-direction: column;
		align-items: flex-start;
		align-self: stretch;

		border-radius: 8px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		background: rgba(243, 245, 247, 0.3);
	}

	.header h2 {
		color: #0c1012;
		font-size: 1.25rem;
		font-style: normal;
		font-weight: 700;
		line-height: normal;
	}

	.description {
		/* margin: 0 0 12px 0;
		color: #666;
		line-height: 1.5; */

		color: #0c1012;
		font-size: 1rem;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
	}

	.details {
		color: #888;
		font-size: 14px;

		display: flex;
		padding-top: 4px;
		align-items: center;
		gap: 8px;
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

	.files-section {
		height: 100%;

		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		flex: 1 0 0;
		align-self: stretch;
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

	.files-list {
		height: 100%;

		display: flex;
		flex-direction: column;
		gap: 8px;

		overflow-y: auto;
		overflow-x: hidden;
	}

	.file-item {
		display: flex;
		align-items: flex-start;
		gap: 4px;
		align-self: stretch;
	}

	.file-info {
		display: flex;
		padding: 8px 12px;
		justify-content: space-between;
		align-items: center;
		flex: 1 0 0;

		border-radius: 8px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		background: rgba(243, 245, 247, 0.3);
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
		height: 100%;

		display: flex;
		padding: 8px;
		align-items: center;

		border-radius: 8px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		background: rgba(243, 245, 247, 0.3);
	}

	.download-all-btn {
		display: flex;
		padding: 8px 16px;
		justify-content: center;
		align-items: center;
		align-self: stretch;

		border-radius: 8px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		background: linear-gradient(90deg, rgba(243, 245, 247, 0.3) 0%, rgba(191, 217, 191, 0.15) 100%);

		color: #0c1012;
		font-size: 1rem;
		font-style: normal;
		font-weight: 400;
		line-height: normal;
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
