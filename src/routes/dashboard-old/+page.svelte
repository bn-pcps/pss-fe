<script lang="ts">
	import { formatFileSize } from '$lib/utils/formatFileSize';

	export let data;
	const { user, stats, activeShares } = data;

	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getShareUrl(shareId: string) {
		return `/share/${shareId}`;
	}
</script>

<svelte:head>
	<title>Dashboard - {user.name}</title>
</svelte:head>

<div class="dashboard">
	<header class="dashboard-header">
		<div class="header-content">
			<div class="user-info">
				{#if user.avatar_url}
					<img src={user.avatar_url} alt={user.name} class="avatar" />
				{/if}
				<div>
					<h1>Welcome back, {user.name}!</h1>
					<p class="email">{user.email}</p>
				</div>
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
									<a href={getShareUrl(share.id)} class="share-action view">View</a>
									<button class="share-action edit">Edit</button>
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
	.dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		color: white;
	}

	.avatar {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.3);
	}

	.user-info h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.email {
		opacity: 0.9;
		font-size: 1rem;
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
		transition: transform 0.2s ease, box-shadow 0.2s ease;
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
		transition: transform 0.2s ease, box-shadow 0.2s ease;
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

	.share-action.edit {
		background: transparent;
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.share-action.edit:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	@media (max-width: 768px) {
		.header-content,
		.dashboard-main {
			padding: 0 1rem;
		}

		.user-info {
			flex-direction: column;
			text-align: center;
		}

		.user-info h1 {
			font-size: 1.5rem;
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
