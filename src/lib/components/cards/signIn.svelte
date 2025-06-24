<script lang="ts">
	import { authClient } from '$lib/auth-client';

	async function loginWithGoogle() {
		await authClient.signIn.social({
			provider: 'google'
		});
	}
</script>

<div class="card">
	<div>
		<!-- lg here -->
		<div class="logo">
			<img src="/lg_ps.svg" alt="PlanarShare.com" />
		</div>

		<div class="heading">
			<h2>Welcome!</h2>
			<p>Please sign in to start sharing your files with the world.</p>
		</div>

		<div class="button">
			<button on:click={loginWithGoogle}>
				<img src="/lg_google.svg" alt="Google" />
				Login with Google
			</button>
			<p>We require users to login before sharing to prevent spam and abuse.</p>
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

		> div {
			display: flex;
			padding: 32px 24px 24px 24px;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			// gap: 20px;

			border-radius: 8px;
			background: rgba(237, 240, 243, 0.3);
		}
	}

	.heading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;

		margin-bottom: 20px;

		> h2 {
			font-size: 1.25rem;
		}
		> p {
			text-align: center;
		}
	}

	.button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;

		> button {
			cursor: pointer;
			display: flex;
			padding: 12px 16px;
			justify-content: center;
			align-items: flex-start;
			gap: 8px;
			align-self: stretch;
			font-size: 1rem;

			border-radius: 8px;
			border: 1px solid rgba(218, 224, 231, 0.5);
			background: rgba(243, 245, 247, 0.3);
		}
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
