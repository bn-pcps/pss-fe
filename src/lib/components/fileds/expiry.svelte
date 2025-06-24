<script>
	import { share } from '$lib/stores/share';

	let isEnabled = false;
	let expiry = '';

	function updateShareExpiry() {
		share.update((current) => {
			const features = current.extra_features.enabled_features || [];
			let newFeatures = features;
			if (isEnabled) {
				if (!features.includes('expiry')) {
					newFeatures = [...features, 'expiry'];
				}
			} else {
				newFeatures = features.filter((f) => f !== 'expiry');
			}
			return {
				...current,
				extra_features: {
					...current.extra_features,
					expiry: isEnabled ? expiry : undefined,
					enabled_features: newFeatures
				}
			};
		});
	}

	function handleToggle() {
		isEnabled = !isEnabled;
		updateShareExpiry();
	}
</script>

<div class="feat">
	<button class="toggle" aria-label="Expiry" onclick={handleToggle} aria-pressed={isEnabled}>
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
		<span>Set Expiry</span>
	</button>
	<div
		class="password_input"
		aria-hidden={!isEnabled}
		aria-disabled={!isEnabled}
		style="display: {isEnabled ? 'block' : 'none'}"
	>
		<select
			bind:value={expiry}
			onchange={updateShareExpiry}
			style="color: {!expiry ? '#6B7280' : 'inherit'}"
		>
			<option value="" disabled>Select expiry up to 7 days</option>
			<option value="1">1 day</option>
			<option value="3">3 days</option>
			<option value="7">7 days</option>
		</select>
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

	.password_input {
		width: 100%;

		> select {
			cursor: pointer;

			width: 100%;
			display: flex;
			padding: 8px 12px;
			align-items: center;
			align-self: stretch;
			border-radius: 8px;
			border: 1px solid rgba(218, 224, 231, 0.5);
			background: rgba(243, 245, 247, 0.5);
			outline: none;
			appearance: none;
			background-image: url('data:image/svg+xml;utf8,<svg fill="none" height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg"><path d="M3 5L6 8L9 5" stroke="%230C1012" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
			background-repeat: no-repeat;
			background-position: right 12px center;
			padding-right: 32px;
			/* Ensures text doesn't overlap arrow */
		}

		> select:hover {
			border: 1px solid hsla(212, 21%, 80%, 0.5);
			box-shadow: 0px 2px 10px 0px rgba(12, 16, 18, 0.02);
		}
	}
</style>
