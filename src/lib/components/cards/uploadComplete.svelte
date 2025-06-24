<script lang="ts">
	import { share, share_id, final_share_slug, share_expiry } from '$lib/stores/share';
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	let showQRCode = false;
	let qrCodeDataUrl = '';

	const generateQRCode = async () => {
		try {
			const url = `https://plnr.sh/${$final_share_slug}`;
			qrCodeDataUrl = await QRCode.toDataURL(url, {
				width: 150,
				margin: 2,
				color: {
					dark: '#0C1012',
					light: '#FFFFFF'
				}
			});
		} catch (error) {
			console.error('Error generating QR code:', error);
		}
	};

	onMount(() => {
		generateQRCode();
	});
</script>

<div class="card">
	<div>
		<!-- lg here -->
		<div class="logo">
			{#if showQRCode}
				<img src={qrCodeDataUrl} alt="QR Code for plnr.sh/{$final_share_slug}" />
			{:else}
				<img src="/lg_ps.svg" alt="PlanarShare.com" />
			{/if}
		</div>
		<div class="content">
			<h1>Your file is shared!</h1>
			<p>Share the link bellow to the desired file recipient.</p>

			<div class="actions">
				{#if $share_expiry}
					<p>
						Valid until: {new Date($share_expiry).toLocaleDateString()}
					</p>
				{/if}
				<div class="link">
					<button
						on:click={() => {
							window.location.href = `/share/${$final_share_slug}`;
						}}
					>
						<span>plnr.sh/{$final_share_slug}</span>
					</button>
					<button
						on:click={() => {
							navigator.clipboard.writeText(`plnr.sh/${$final_share_slug}`);
							// alert(`Link copied to clipboard: ${url}`);
						}}
						aria-label="Copy link"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="22"
							height="23"
							viewBox="0 0 22 23"
							fill="none"
						>
							<path
								d="M15.4355 3.5506H11.1482C10.665 3.55058 10.2481 3.55057 9.90472 3.57862C9.54232 3.60823 9.18187 3.6736 8.83502 3.85033C8.31758 4.11398 7.89688 4.53468 7.63323 5.05213C7.4565 5.39897 7.39113 5.75943 7.36152 6.12182C7.33347 6.46517 7.33348 6.88203 7.3335 7.36523V9.0506H9.16683V7.4006C9.16683 6.87209 9.16754 6.53084 9.18877 6.27112C9.20911 6.02209 9.24365 5.92977 9.26674 5.88444C9.35463 5.71196 9.49486 5.57173 9.66734 5.48384C9.71266 5.46075 9.80499 5.42621 10.054 5.40587C10.3137 5.38465 10.655 5.38393 11.1835 5.38393H15.4002C15.9287 5.38393 16.2699 5.38465 16.5296 5.40587C16.7787 5.42621 16.871 5.46075 16.9163 5.48384C17.0888 5.57173 17.229 5.71196 17.3169 5.88444C17.34 5.92977 17.3746 6.02209 17.3949 6.27112C17.4161 6.53084 17.4168 6.87209 17.4168 7.4006V11.6173C17.4168 12.1458 17.4161 12.487 17.3949 12.7468C17.3746 12.9958 17.34 13.0881 17.3169 13.1334C17.229 13.3059 17.0888 13.4461 16.9163 13.534C16.871 13.5571 16.7787 13.5917 16.5296 13.612C16.2699 13.6332 15.9287 13.6339 15.4002 13.6339H13.7502V15.4673H15.4355C15.9187 15.4673 16.3356 15.4673 16.6789 15.4392C17.0413 15.4096 17.4018 15.3443 17.7486 15.1675C18.2661 14.9039 18.6868 14.4832 18.9504 13.9657C19.1272 13.6189 19.1925 13.2584 19.2221 12.896C19.2502 12.5527 19.2502 12.1358 19.2502 11.6526V7.36529C19.2502 6.88207 19.2502 6.46518 19.2221 6.12182C19.1925 5.75943 19.1272 5.39897 18.9504 5.05213C18.6868 4.53468 18.2661 4.11398 17.7486 3.85033C17.4018 3.6736 17.0413 3.60823 16.6789 3.57862C16.3356 3.55057 15.9187 3.55058 15.4355 3.5506Z"
								fill="#0C1012"
							/>
							<path
								fill-rule="evenodd"
								clip-rule="evenodd"
								d="M6.56467 8.13391H10.852C11.3352 8.1339 11.7521 8.13388 12.0954 8.16193C12.4578 8.19154 12.8183 8.25692 13.1651 8.43364C13.6826 8.6973 14.1033 9.11799 14.3669 9.63544C14.5437 9.98229 14.609 10.3427 14.6386 10.7051C14.6667 11.0485 14.6667 11.4654 14.6667 11.9486V16.2359C14.6667 16.7191 14.6667 17.136 14.6386 17.4794C14.609 17.8418 14.5437 18.2022 14.3669 18.5491C14.1033 19.0665 13.6826 19.4872 13.1651 19.7508C12.8183 19.9276 12.4578 19.9929 12.0954 20.0226C11.7521 20.0506 11.3352 20.0506 10.852 20.0506H6.56469C6.08146 20.0506 5.66459 20.0506 5.32123 20.0226C4.95883 19.9929 4.59838 19.9276 4.25153 19.7508C3.73408 19.4872 3.31339 19.0665 3.04973 18.5491C2.87301 18.2022 2.80763 17.8418 2.77802 17.4794C2.74997 17.136 2.74998 16.7191 2.75 16.2359V11.9486C2.74998 11.4654 2.74997 11.0485 2.77802 10.7051C2.80763 10.3427 2.87301 9.98229 3.04973 9.63544C3.31339 9.11799 3.73408 8.6973 4.25153 8.43364C4.59838 8.25692 4.95883 8.19154 5.32123 8.16193C5.66458 8.13388 6.08145 8.1339 6.56467 8.13391ZM5.47052 9.98918C5.22149 10.0095 5.12917 10.0441 5.08384 10.0672C4.91136 10.155 4.77113 10.2953 4.68325 10.4678C4.66015 10.5131 4.62561 10.6054 4.60527 10.8544C4.58405 11.1142 4.58334 11.4554 4.58334 11.9839V16.2006C4.58334 16.7291 4.58405 17.0703 4.60527 17.3301C4.62561 17.5791 4.66015 17.6714 4.68325 17.7167C4.77113 17.8892 4.91136 18.0295 5.08384 18.1173C5.12917 18.1404 5.22149 18.175 5.47052 18.1953C5.73024 18.2165 6.07149 18.2172 6.6 18.2172H10.8167C11.3452 18.2172 11.6864 18.2165 11.9462 18.1953C12.1952 18.175 12.2875 18.1404 12.3328 18.1173C12.5053 18.0295 12.6455 17.8892 12.7334 17.7167C12.7565 17.6714 12.7911 17.5791 12.8114 17.3301C12.8326 17.0703 12.8333 16.7291 12.8333 16.2006V11.9839C12.8333 11.4554 12.8326 11.1142 12.8114 10.8544C12.7911 10.6054 12.7565 10.5131 12.7334 10.4678C12.6455 10.2953 12.5053 10.155 12.3328 10.0672C12.2875 10.0441 12.1952 10.0095 11.9462 9.98918C11.6864 9.96796 11.3452 9.96725 10.8167 9.96725H6.6C6.07149 9.96725 5.73024 9.96796 5.47052 9.98918Z"
								fill="#0C1012"
							/>
						</svg>
					</button>
				</div>
				<button
					on:click={() => {
						showQRCode = !showQRCode;
					}}
				>
					<span>{showQRCode ? 'Hide QR code' : 'Show QR code'}</span>
				</button>
				<button
					class="btn_share"
					on:click={() => {
						window.location.href = `/`;
					}}
				>
					<span>Make another share</span>
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

		height: max-content;

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

	.logo {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 150px;
		height: 150px;

		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}

	.content {
		> h1 {
			color: #0c1012;
			text-align: center;
			font-size: 20px;
			font-style: normal;
			font-weight: 700;
			line-height: normal;
		}
		> p {
			text-align: center;
			// 	color: rgba(12, 16, 18, 0.5);
			// 	font-size: 14px;
			// 	font-style: italic;
			// 	font-weight: 400;
			// 	line-height: normal;
		}

		// button {
		// 	margin-top: 10px;
		// 	padding: 8px 16px;
		// 	background: #4caf50;
		// 	color: white;
		// 	border: none;
		// 	border-radius: 4px;
		// 	cursor: pointer;
		// }
	}

	.actions {
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		align-self: stretch;

		> p {
			color: rgba(12, 16, 18, 0.5);
			text-align: center;
			font-size: 14px;
			font-style: italic;
			font-weight: 400;
			line-height: normal;
		}

		> .link {
			display: flex;
			align-items: center;
			gap: 4px;
			width: 100%;

			> button:nth-child(1) {
				font-family: monospace;
			}

			> button:nth-child(2) {
				padding: 6px;
				width: fit-content;
			}
		}

		button {
			cursor: pointer;

			width: 100%;
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

			font-size: 1rem;

			&.btn_cancel > span {
				color: #bf4040;
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
</style>
