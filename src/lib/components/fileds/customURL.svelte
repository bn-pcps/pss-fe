<script lang="ts">
	import { share } from '$lib/stores/share';

	let isEnabled = false;
	let customURL = '';
	let isValid = true;
	let isSlugTaken = false;
	let debounceTimeout: ReturnType<typeof setTimeout>;
	// let customURL = $derived($share.extra_features.customURL || '');

	function updateShareCustomURL() {
		share.update((current) => {
			const features = current.extra_features.enabled_features || [];
			let newFeatures = features;
			if (isEnabled) {
				if (!features.includes('customURL')) {
					newFeatures = [...features, 'customURL'];
				}
			} else {
				newFeatures = features.filter((f) => f !== 'customURL');
			}
			return {
				...current,
				extra_features: {
					...current.extra_features,
					customURL: isEnabled ? customURL : undefined,
					enabled_features: newFeatures
				}
			};
		});
	}

	function handleToggle() {
		isEnabled = !isEnabled;
		updateShareCustomURL();
	}

	function sanitizeAndValidateURL(value: string) {
		// Replace spaces with dashes
		let sanitized = value.replace(/\s+/g, '-');
		// Validate: only allow a-z, A-Z, 0-9, -, _ and minimum 6 characters (if not empty)
		isValid =
			/^[a-zA-Z0-9-_]*$/.test(sanitized) && (sanitized.length === 0 || sanitized.length >= 6);
		return sanitized;
	}

	async function checkSlugAvailability(slug: string) {
		if (!slug || !isValid) {
			isSlugTaken = false;
			return;
		}
		try {
			const res = await fetch(`/api/validate-slug?slug=${encodeURIComponent(slug)}`);
			if (res.ok) {
				const data = await res.json();
				isSlugTaken = data.exists;
			} else {
				isSlugTaken = false;
			}
		} catch (e) {
			isSlugTaken = false;
		}
	}

	function handleInput(event: Event) {
		let value = (event.target as HTMLInputElement).value;
		let sanitized = sanitizeAndValidateURL(value);
		if (sanitized !== value) {
			(event.target as HTMLInputElement).value = sanitized;
		}
		customURL = sanitized;
		updateShareCustomURL();

		clearTimeout(debounceTimeout);
		if (customURL && isValid) {
			debounceTimeout = setTimeout(() => {
				checkSlugAvailability(customURL);
			}, 400);
		} else {
			isSlugTaken = false;
		}
	}
</script>

<div class="feat">
	<button class="toggle" aria-label="Custom URL" onclick={handleToggle} aria-pressed={isEnabled}>
		<div class="checkbox">
			<div class="checkbox_inner" style="display: {isEnabled ? 'flex' : 'none'}">
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
						d="M13.0893 7.74408C13.4148 8.06951 13.4148 8.59715 13.0893 8.92259L9.756 12.2559C9.43057 12.5814 8.90293 12.5814 8.57749 12.2559L6.91083 10.5893C6.58539 10.2638 6.58539 9.73618 6.91083 9.41074C7.23626 9.08531 7.7639 9.08531 8.08934 9.41074L9.16675 10.4882L11.9108 7.74408C12.2363 7.41864 12.7639 7.41864 13.0893 7.74408Z"
						fill="#0C1012"
					/>
				</svg>
			</div>
		</div>
		<span>Custom URL</span>
	</button>
	<div
		class="custom_url_input"
		aria-hidden={!isEnabled}
		aria-disabled={!isEnabled}
		style="display: {isEnabled ? 'block' : 'none'}"
	>
		<div class="custom_url_input_inner">
			<span class="input-prefix">plnr.sh/</span>
			<input
				type="text"
				placeholder="min-6-characters"
				bind:value={customURL}
				oninput={handleInput}
				class:is-invalid={!isValid || isSlugTaken}
			/>
		</div>
		{#if customURL && customURL.length > 0 && customURL.length < 6}
			<div class="error-message">Custom URL must be at least 6 characters.</div>
		{/if}
		{#if isSlugTaken}
			<div class="error-message">This custom URL is already taken.</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.feat {
		display: flex;
		padding: 2px 0px;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		align-self: stretch;

		width: 100%;
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 2px;

		cursor: pointer;

		width: 100%;

		color: #0c1012;
		font-size: 14px;
		font-style: normal;
		font-weight: 400;
		line-height: normal;

		background: none;
		border: none;
		outline: none;

		&:hover .checkbox {
			border: 1px solid hsla(212, 21%, 80%, 0.5);
			box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0.02);
		}
	}

	.checkbox {
		display: flex;
		width: 20px;
		height: 20px;
		align-items: center;
		gap: 10px;

		border-radius: 100px;
		border: 1px solid rgba(218, 224, 231, 0.5);
		background: rgba(243, 245, 247, 0.5);

		> .checkbox_inner {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.custom_url_input {
		width: 100%;

		font-family: monospace;

		.custom_url_input_inner {
			position: relative;
			width: 100%;
		}

		.input-prefix {
			position: absolute;
			left: 12px;
			top: 50%;
			transform: translateY(-50%);
			// color: rgba(12, 16, 18, 0.5);
			font-size: 12px;
			pointer-events: none;
			z-index: 1;
		}

		input {
			width: 100%;
			padding: 8px 12px;
			padding-left: 9.7ch;
			border-radius: 8px;
			border: 1px solid rgba(218, 224, 231, 0.5);
			background: rgba(243, 245, 247, 0.5);
			outline: none;
			position: relative;

			font-family: monospace;
			font-size: 12px;

			&:focus,
			&:hover,
			&:active {
				border: 1px solid hsla(212, 21%, 80%, 0.5);
				box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0.02);
			}

			&.is-invalid {
				// border: 1px solid #e74c3c !important; // Red border for invalid
				border: 1px solid hsla(0, 50%, 50%, 1) !important; // Red border for invalid
			}
		}
	}

	.error-message {
		color: #e74c3c;
		font-size: 12px;
		margin-top: 2px;
	}
</style>
