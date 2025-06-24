<script lang="ts">
	import { formatFileSize } from '$lib/utils/formatFileSize';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	export let data;
	const { user, stats, activeShares, customerPortalUrl } = data;

	function formatDate(date: string | Date) {
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		return dateObj.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getShareUrl(share: any) {
		// Use custom slug if available, otherwise use the special id route
		if (share.custom_slug) {
			return `/share/${share.custom_slug}`;
		} else {
			return `/share/id?shareid=${share.id}`;
		}
	}

	async function deleteShare(shareId: string, shareTitle: string) {
		if (
			!confirm(`Are you sure you want to delete "${shareTitle}"? This action cannot be undone.`)
		) {
			return;
		}

		try {
			const response = await fetch('/api/delete-share', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ shareId })
			});

			if (!response.ok) {
				const error = await response.json();
				alert(`Failed to delete share: ${error.error}`);
				return;
			}

			// Reload the page to refresh the share list
			window.location.reload();
		} catch (error) {
			console.error('Error deleting share:', error);
			alert('Failed to delete share. Please try again.');
		}
	}

	async function handleUpgrade() {
		await authClient.checkout({
			products: ['286794eb-c809-4fc1-adc1-3b3bd34e21b0'],
			slug: 'PlanarShare.com-PRO'
		});
	}

	function handleManageSubscription() {
		if (customerPortalUrl) {
			window.open(customerPortalUrl, '_blank');
		}
	}

	async function handleSignOut() {
		await authClient.signOut();
		goto('/');
	}
</script>

<svelte:head>
	<title>Dashboard - {user.name}</title>
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<div class="header-content">
			<div class="user-info">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="32"
					height="32"
					viewBox="0 0 20 20"
					fill="none"
				>
					<path
						d="M7.50016 11.6667C5.19898 11.6667 3.3335 13.5322 3.3335 15.8334C3.3335 17.2141 4.45278 18.3334 5.8335 18.3334H14.1668C15.5475 18.3334 16.6668 17.2141 16.6668 15.8334C16.6668 13.5322 14.8013 11.6667 12.5002 11.6667H7.50016Z"
						fill="#fff"
					/>
					<path
						d="M10.0002 1.66669C7.69898 1.66669 5.8335 3.53217 5.8335 5.83335C5.8335 8.13454 7.69898 10 10.0002 10C12.3013 10 14.1668 8.13454 14.1668 5.83335C14.1668 3.53217 12.3013 1.66669 10.0002 1.66669Z"
						fill="#fff"
					/>
				</svg>
				<div class="user-details">
					<h1>Welcome back, {user.name}!</h1>
					<p class="email">{user.email}</p>
					<div class="user-badges">
						<div class="plan-badge">{user.plan}</div>
						<button class="signout-btn" on:click={handleSignOut}>Sign Out</button>
					</div>
				</div>
			</div>

			<div class="quota-section">
				<div class="quota-info">
					<div class="quota-text">
						<span class="quota-label">Storage Quota</span>
						<span class="quota-usage">
							{formatFileSize(user.usedQuota, 1, 'MB')} / {formatFileSize(user.quota, 1, 'MB')}
							<span class="quota-remaining"
								>({formatFileSize(user.quota - user.usedQuota, 1, 'MB')} left)</span
							>
						</span>
					</div>
					<div class="quota-progress">
						<div
							class="quota-progress-fill"
							style="width: {Math.min((user.usedQuota / user.quota) * 100, 100)}%"
						></div>
					</div>
				</div>

				{#if user.planId === 1}
					<button class="upgrade-btn" on:click={handleUpgrade}> Upgrade to Pro </button>
				{:else}
					<button class="manage-btn" on:click={handleManageSubscription}>
						Manage Subscription
					</button>
				{/if}
			</div>
		</div>
	</header>

	<main class="dashboard-main">
		<!-- Statistics Cards -->
		<section class="stats-section">
			<h2>Your Statistics</h2>
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-icon">📁</div>
					<div class="stat-content">
						<div class="stat-number">{stats.totalShares.toLocaleString()}</div>
						<div class="stat-label">Total Shares</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">📄</div>
					<div class="stat-content">
						<div class="stat-number">{stats.totalFiles.toLocaleString()}</div>
						<div class="stat-label">Total Files</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">💾</div>
					<div class="stat-content">
						<div class="stat-number">{formatFileSize(stats.totalSize, 1, 'B')}</div>
						<div class="stat-label">Total Size</div>
					</div>
				</div>

				<div class="stat-card">
					<div class="stat-icon">⬇️</div>
					<div class="stat-content">
						<div class="stat-number">{stats.totalDownloads.toLocaleString()}</div>
						<div class="stat-label">Total Downloads</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Active Shares -->
		<section class="shares-section">
			<div class="section-header">
				<h2>Your Active Shares</h2>
				{#if activeShares.length > 0}
					<span class="share-count">{activeShares.length} active</span>
				{/if}
			</div>

			{#if activeShares.length === 0}
				<div class="empty-state">
					<div class="empty-icon">📂</div>
					<h3>No active shares yet</h3>
					<p>Create your first share to get started!</p>
					<a href="/" class="create-share-btn">Create Share</a>
				</div>
			{:else}
				<div class="shares-grid">
					{#each activeShares as share}
						<div class="share-card">
							<div class="share-header">
								<div class="share-title">
									<h3>{share.title}</h3>
									<div class="share-visibility">
										{share.is_public ? '🌐 Public' : '🔒 Private'}
									</div>
								</div>
							</div>

							{#if share.description}
								<p class="share-description">{share.description}</p>
							{/if}

							<div class="share-stats">
								<div class="share-stat">
									<span class="stat-icon">📄</span>
									<span>{share.file_count} files</span>
								</div>
								<div class="share-stat">
									<span class="stat-icon">💾</span>
									<span>{formatFileSize(Number(share.size), 1, 'B')}</span>
								</div>
								<div class="share-stat">
									<span class="stat-icon">⬇️</span>
									<span>{share.download_count} downloads</span>
								</div>
								<div class="share-stat">
									<span class="stat-icon">👁️</span>
									<span>{share.view_count} views</span>
								</div>
							</div>

							<div class="share-footer">
								<div class="share-date">
									Created {formatDate(share.created_at)}
								</div>
								<div class="share-actions">
									<a href={getShareUrl(share)} class="share-action view">View</a>
									<button
										class="share-action delete"
										on:click={() => deleteShare(share.id, share.title)}>Delete</button
									>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>

<style>
	:global(body) {
		/* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
		background-attachment: fixed;
		overflow: auto;
	}

	.dashboard {
		min-height: 100vh;
		background: radial-gradient(100% 100% at 50% 100%, #081117 0%, #0b070d 50%, #080a0c 100%);
		/* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
		/* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
		/* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; */
	}

	.dashboard-header {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		padding: 2rem 0;
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: white;
	}

	.user-details h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.email {
		opacity: 0.9;
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}

	.user-badges {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.plan-badge {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		width: fit-content;
	}

	.signout-btn {
		background: transparent;
		color: rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.signout-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border-color: rgba(255, 255, 255, 0.5);
	}

	.quota-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 300px;
	}

	.quota-info {
		color: white;
	}

	.quota-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.quota-label {
		font-size: 0.875rem;
		font-weight: 500;
		opacity: 0.9;
	}

	.quota-usage {
		font-size: 0.875rem;
		font-family: monospace;
	}

	.quota-remaining {
		opacity: 0.7;
	}

	.quota-progress {
		width: 100%;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
	}

	.quota-progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4ade80, #22c55e);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.upgrade-btn,
	.manage-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}

	.upgrade-btn:hover,
	.manage-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		border-color: rgba(255, 255, 255, 0.5);
		transform: translateY(-1px);
	}

	.upgrade-btn {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.upgrade-btn:hover {
		background: linear-gradient(135deg, #5a6fd8, #6a4190);
	}

	.dashboard-main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.stats-section {
		margin-bottom: 4rem;
	}

	.stats-section h2,
	.shares-section h2 {
		color: white;
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.stat-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.stat-icon {
		font-size: 2rem;
		background: rgba(255, 255, 255, 0.2);
		width: 60px;
		height: 60px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-content {
		color: white;
	}

	.stat-number {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		opacity: 0.9;
		font-size: 0.9rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.share-count {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.empty-state {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 4rem 2rem;
		text-align: center;
		color: white;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h3 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		opacity: 0.9;
		margin-bottom: 2rem;
	}

	.create-share-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		padding: 0.75rem 2rem;
		border-radius: 8px;
		text-decoration: none;
		font-weight: 500;
		transition: background-color 0.2s ease;
		display: inline-block;
	}

	.create-share-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.shares-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.share-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		color: white;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.share-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.share-header {
		margin-bottom: 1rem;
	}

	.share-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.share-title h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.share-visibility {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.share-description {
		opacity: 0.9;
		margin-bottom: 1rem;
		line-height: 1.5;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.share-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.share-stat {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		opacity: 0.9;
	}

	.share-stat .stat-icon {
		font-size: 1rem;
		background: none;
		width: auto;
		height: auto;
		border-radius: 0;
	}

	.share-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.share-date {
		font-size: 0.875rem;
		opacity: 0.8;
	}

	.share-actions {
		display: flex;
		gap: 0.5rem;
	}

	.share-action {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.share-action.view {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.share-action.view:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.share-action.delete {
		background: transparent;
		color: #ff6b6b;
		border: 1px solid rgba(255, 107, 107, 0.3);
	}

	.share-action.delete:hover {
		background: rgba(255, 107, 107, 0.1);
		border-color: rgba(255, 107, 107, 0.5);
	}

	@media (max-width: 768px) {
		.header-content,
		.dashboard-main {
			padding: 0 1rem;
		}

		.header-content {
			flex-direction: column;
			gap: 1.5rem;
			align-items: center;
			text-align: center;
		}

		.user-info {
			flex-direction: column;
			text-align: center;
		}

		.user-details h1 {
			font-size: 1.5rem;
		}

		.quota-section {
			min-width: unset;
			width: 100%;
			max-width: 300px;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.shares-grid {
			grid-template-columns: 1fr;
		}

		.share-title {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}

		.share-stats {
			grid-template-columns: 1fr;
		}

		.share-footer {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}
	}
</style>
