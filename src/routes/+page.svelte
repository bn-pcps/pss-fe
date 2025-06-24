<script lang="ts">
	import { userData, type UserData } from '$lib/stores/user';
	import { share } from '$lib/stores/share';
	import { onDestroy } from 'svelte';

	import { authClient } from '$lib/auth-client';
	// import { appState, setAppState } from '$lib/stores/appState';
	import { appState } from '$lib/stores/appState';
	import { shareReady } from '$lib/stores/share';
	import { get } from 'svelte/store';

	import Profile from '$lib/components/profile.svelte';
	import CardSignIn from '$lib/components/cards/signIn.svelte';
	import CardIdle from '$lib/components/cards/idle.svelte';
	import CardFilePicker from '$lib/components/cards/filePicker.svelte';
	import CardUploadHandler from '$lib/components/cards/uploadHandler.svelte';
	import CardUploadComplete from '$lib/components/cards/uploadComplete.svelte';

	// popups
	import { popUpOverlayNigga } from '$lib/stores/popUpOverlayNigga';
	import CancelShare from '$lib/components/popups/cancelShare.svelte';
	import UploadConfirmation from '$lib/components/popups/uploadConfirmation.svelte';

	export let data;

	let user = data.user as UserData | null;

	if (user?.id) {
		console.log('user', user);
		appState.set('idle');
		$userData = user;
	} else {
		appState.set('unauthenticated');
	}

	async function loginWithGoogle() {
		await authClient.signIn.social({
			provider: 'google'
		});
	}

	async function logout() {
		await authClient.signOut();
	}

	async function checkout() {
		await authClient.checkout({
			// Any Polar Product ID can be passed here
			// products: ['286794eb-c809-4fc1-adc1-3b3bd34e21b0'],
			products: ['8f1d08c1-6b9f-4aa5-b2ac-b7aa43d62691'],
			// Or, if you setup "products" in the Checkout Config, you can pass the slug
			// slug: 'PlanarShare.com-PRO'
			slug: 'PlanarShare.com-PRO-test'
		});
	}

	// Validation function for Share
	function validateShare(shareObj: any): boolean {
		console.log('🔍 Validating share:', shareObj);

		if (!shareObj) {
			console.log('❌ Share validation failed: shareObj is null/undefined');
			return false;
		}

		// Validate files
		if (!Array.isArray(shareObj.files) || shareObj.files.length === 0) {
			console.log('❌ Share validation failed: files are not an array or empty', {
				isArray: Array.isArray(shareObj.files),
				length: shareObj.files?.length
			});
			return false;
		}
		console.log('✅ Files validation passed:', shareObj.files.length, 'files');

		// Validate title (non-empty string)
		if (typeof shareObj.title !== 'string' || shareObj.title.trim().length === 0) {
			console.log('❌ Share validation failed: invalid title', {
				type: typeof shareObj.title,
				value: shareObj.title,
				trimmedLength: shareObj.title?.trim?.()?.length
			});
			return false;
		}
		console.log('✅ Title validation passed:', shareObj.title);

		// description is optional, no validation needed
		console.log('✅ Description validation passed (optional)');

		// Validate extra_features (optional)
		const ef = shareObj.extra_features || {};
		const enabled = Array.isArray(ef.enabled_features) ? ef.enabled_features : [];
		console.log('🔧 Extra features enabled:', enabled);

		// Only validate extras if enabled
		if (enabled.includes('password')) {
			if (typeof ef.password !== 'string' || ef.password === '') {
				console.log('❌ Share validation failed: invalid password', {
					type: typeof ef.password,
					value: ef.password
				});
				return false;
			}
			console.log('✅ Password validation passed');
		}

		if (enabled.includes('expiry')) {
			const expiryNum = Number(ef.expiry);
			if (ef.expiry === undefined || isNaN(expiryNum) || expiryNum < 1 || expiryNum > 7) {
				console.log('❌ Share validation failed: invalid expiry', {
					value: ef.expiry,
					asNumber: expiryNum,
					isNaN: isNaN(expiryNum)
				});
				return false;
			}
			console.log('✅ Expiry validation passed:', expiryNum, 'days');
		}

		if (enabled.includes('download_limit')) {
			if (typeof ef.download_limit !== 'number' || ef.download_limit < 0) {
				console.log('❌ Share validation failed: invalid download_limit', {
					type: typeof ef.download_limit,
					value: ef.download_limit
				});
				return false;
			}
			console.log('✅ Download limit validation passed:', ef.download_limit);
		}

		if (enabled.includes('customURL')) {
			if (typeof ef.customURL !== 'string' || ef.customURL.length < 6) {
				console.log('❌ Share validation failed: invalid customURL', {
					type: typeof ef.customURL,
					value: ef.customURL,
					length: ef.customURL?.length
				});
				return false;
			}
			console.log('✅ Custom URL validation passed:', ef.customURL);
		}

		// Validate total_size: must match sum of file sizes
		const expectedTotalSize = Array.isArray(shareObj.files)
			? shareObj.files.reduce((acc: number, file: File) => acc + (file.size || 0), 0)
			: 0;
		if (shareObj.total_size !== expectedTotalSize) {
			console.log('❌ Share validation failed: total_size mismatch', {
				declared: shareObj.total_size,
				calculated: expectedTotalSize,
				difference: shareObj.total_size - expectedTotalSize
			});
			return false;
		}
		console.log('✅ Total size validation passed:', expectedTotalSize, 'bytes');

		console.log('🎉 Share validation PASSED - share is valid!');
		return true;
	}

	// Function to run when any store changes
	function onAnyStoreChange() {
		// console.log('A store changed!', {
		// 	userData: $userData,
		// 	appState: $appState
		// });
		console.log('A store changed!', {
			userData: $userData,
			appState: $appState,
			share: $share,
			shareReady: $shareReady
		});

		if (validateShare($share)) {
			shareReady.set(true);
		} else {
			shareReady.set(false);
		}
	}

	// Subscriptions
	const unsubUser = userData.subscribe(() => {
		onAnyStoreChange();
	});
	const unsubAppState = appState.subscribe((state) => {
		onAnyStoreChange();

		// Update document title based on app state (only in browser)
		if (typeof document !== 'undefined') {
			const baseTitle = 'PlanarShare';
			let title = baseTitle;

			switch (state) {
				case 'unauthenticated':
					title = `${baseTitle} - Sign In`;
					break;
				case 'idle':
					title = `${baseTitle} - Ready to Share`;
					break;
				case 'pickingFiles':
					title = `${baseTitle} - Select Files`;
					break;
				case 'uploadingFiles':
					title = `${baseTitle} - Uploading...`;
					break;
				case 'uploadSuccess':
					title = `${baseTitle} - Upload Complete`;
					break;
				case 'pageLoaded':
				default:
					title = baseTitle;
					break;
			}

			document.title = title;
		}
	});
	const unsubShare = share.subscribe(() => {
		onAnyStoreChange();
	});
	shareReady.subscribe(() => {
		console.log('shareReady', $shareReady);
	});

	onDestroy(() => {
		unsubUser();
		unsubAppState();
		unsubShare();
	});

	let isDragging = false;

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		if (get(appState) === 'idle') {
			appState.set('pickingFiles');
		}
		const dt = event.dataTransfer;
		if (!dt || !dt.files || dt.files.length === 0) return;
		const droppedFiles = Array.from(dt.files);
		const currentShare = get(share);
		const currentFiles = currentShare.files || [];
		// Filter out duplicates by name, size, and type
		const uniqueFiles = droppedFiles.filter((newFile) => {
			return !currentFiles.some(
				(existingFile) =>
					existingFile.name === newFile.name &&
					existingFile.size === newFile.size &&
					existingFile.type === newFile.type
			);
		});
		if (uniqueFiles.length > 0) {
			const user = get(userData);
			const currentTotal = currentFiles.reduce((acc, file) => acc + file.size, 0);
			const newTotal = uniqueFiles.reduce((acc, file) => acc + file.size, 0);
			// Convert bytes to MB and round up
			const totalNewFilesInMB = Math.ceil((currentTotal + newTotal) / (1024 * 1024));
			if (user && user.used_quota + totalNewFilesInMB > user.quota) {
				popUpOverlayNigga.update((v) => ({ ...v, quotaExceeded: true }));
				return;
			}
			share.set({
				...currentShare,
				files: [...currentFiles, ...uniqueFiles],
				total_size: currentTotal + newTotal
			});
		}
	}
</script>

<div class="overlay">
	{#if $popUpOverlayNigga.cancelShare}
		<CancelShare />
	{:else if $popUpOverlayNigga.uploadConfirmation}
		<UploadConfirmation />
	{/if}
</div>

<div
	class="cardsContainer {isDragging ? 'is-dragging' : ''}"
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	role="region"
	aria-label="File drop area"
>
	<!-- only show the following if user is null -->
	{#if $appState === 'unauthenticated'}
		<CardSignIn />
		<!-- {:else if $appState === 'idle' || $share?.files.length === 0} -->
	{:else if $share?.files.length === 0}
		<div>
			<CardIdle />
		</div>
		<!-- {:else if ($appState === 'pickingFiles' || $appState === 'uploadingFiles') && $share?.files.length > 0} -->
		<!-- {:else if $appState === 'pickingFiles' || $appState === 'uploadingFiles'} -->
	{:else if ($appState === 'idle' || $appState === 'pickingFiles') && $share?.files.length > 0}
		<CardFilePicker />
	{:else if $appState === 'uploadingFiles'}
		<CardUploadHandler />
	{:else if $appState === 'uploadSuccess'}
		<CardUploadComplete />
	{/if}
</div>

<div class="profileContainer">
	{#if $appState !== 'unauthenticated' && $appState !== 'pageLoaded'}
		<Profile />
	{/if}
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
	}

	.profileContainer {
		position: fixed;
		bottom: 0;
		right: 0;
		width: 100%;
		/* background-color: red; */
		padding-bottom: 3rem;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.cardsContainer.is-dragging {
		outline: 3px dashed #91a7b6;
		/* background: rgba(200, 220, 255, 0.15); */
		background: hsl(205, 51%, 88%);
	}
</style>
