<script lang="ts">
	import { page } from '$app/stores';

	$: error = $page.error;
	$: status = $page.status;

	function getErrorMessage(
		status: number,
		message?: string
	): { title: string; description: string } {
		switch (status) {
			case 404:
				return {
					title: "Share Doesn't Exist",
					description: "This share doesn't exist or has been removed."
				};
			case 410:
				return {
					title: 'Share Expired',
					description: 'This share has expired and is no longer available for download.'
				};
			case 429:
				return {
					title: 'Download Limit Reached',
					description: 'This share has reached its download limit and is no longer available.'
				};
			case 403:
				return {
					title: 'Access Denied',
					description: "You don't have permission to access this share."
				};
			case 400:
				return {
					title: 'Invalid Request',
					description: message?.includes('Share ID is required')
						? 'The share ID appears to be invalid or missing.'
						: 'The share link appears to be invalid.'
				};
			case 500:
				return {
					title: 'Server Error',
					// description: "Share either expired, reached download limit, or doesn't exist."
					description: "Something went wrong. Please try again later."
				};
			default:
				return {
					title: 'Share Unavailable',
					description: "Share either expired, reached download limit, or doesn't exist."
				};
		}
	}

	$: errorInfo = getErrorMessage(status, error?.message);
</script>

<svelte:head>
	<title>Error - {errorInfo.title}</title>
</svelte:head>

<div class="error-container">
	<div class="error-card">
		<div class="error-content">
			<div class="error-icon">
				{#if status === 410}
					⏰
				{:else if status === 429}
					🚫
				{:else if status === 404}
					🔍
				{:else if status === 403}
					🔒
				{:else}
					⚠️
				{/if}
			</div>
			<h1>{errorInfo.title}</h1>
			<p>{errorInfo.description}</p>

			{#if status === 410}
				<div class="additional-info">
					<p>
						<small
							>The person who shared this content set an expiration date that has now passed.</small
						>
					</p>
				</div>
			{:else if status === 429}
				<div class="additional-info">
					<p>
						<small
							>The person who shared this content limited the number of downloads, and that limit
							has been reached.</small
						>
					</p>
				</div>
			{:else if status === 400}
				<div class="additional-info">
					{#if error?.message?.includes('Share ID is required')}
						<p>
							<small
								>Make sure you're using the correct share link. The URL should be in the format:
								/share/id?shareid=...</small
							>
						</p>
					{:else}
						<p>
							<small
								>Make sure you're using the correct share link. Valid formats are /share/custom-slug
								or /share/id?shareid=...</small
							>
						</p>
					{/if}
				</div>
			{:else if status === 500}
				<div class="additional-info">
					<p><small>The share may have been removed, expired, or hit its download limit.</small></p>
				</div>
			{/if}

			<div class="actions">
				<button on:click={() => window.history.back()} class="back-btn"> Go Back </button>
				<a href="/" class="home-btn"> Go Home </a>
			</div>
		</div>
	</div>
</div>

<style>
	:global(body) {
		background: radial-gradient(100% 100% at 50% 100%, #d1e3f0 0%, #f0ebf4 50%, #edf0f3 100%);
	}

	.error-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 20px;
	}

	.error-card {
		width: min(90vw, 500px);
		padding: 40px 32px;
		border-radius: 12px;
		background: rgba(243, 245, 247, 0.3);
		box-shadow: 0px 6px 6px 0px rgba(12, 16, 18, 0.04);
		backdrop-filter: blur(25px);
		text-align: center;
	}

	.error-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.error-icon {
		font-size: 64px;
		margin-bottom: 8px;
	}

	h1 {
		margin: 0;
		color: #1a1a1a;
		font-size: 28px;
		font-weight: 600;
	}

	p {
		margin: 0;
		color: #666;
		font-size: 16px;
		line-height: 1.5;
		max-width: 400px;
	}

	.additional-info {
		background: rgba(255, 255, 255, 0.5);
		padding: 16px;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		margin-top: 8px;
	}

	.additional-info p {
		color: #888;
		font-size: 14px;
		margin: 0;
	}

	.actions {
		display: flex;
		gap: 12px;
		margin-top: 8px;
	}

	.back-btn,
	.home-btn {
		padding: 12px 20px;
		border-radius: 6px;
		font-size: 14px;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.2s;
		border: none;
		font-family: inherit;
	}

	.back-btn {
		background: #6c757d;
		color: white;
	}

	.back-btn:hover {
		background: #545b62;
	}

	.home-btn {
		background: #007bff;
		color: white;
	}

	.home-btn:hover {
		background: #0056b3;
	}

	@media (max-width: 600px) {
		.error-card {
			padding: 32px 24px;
		}

		.actions {
			flex-direction: column;
		}

		.back-btn,
		.home-btn {
			width: 100%;
		}
	}
</style>
