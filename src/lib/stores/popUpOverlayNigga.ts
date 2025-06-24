import { writable } from 'svelte/store';

interface PopUpOverlayNigga {
	cancelShare: boolean;
	quotaExceeded: boolean;
	uploadConfirmation: boolean;
	passwordPrompt: boolean;
}

// lowkey gatau mau namanin apa
export const popUpOverlayNigga = writable<PopUpOverlayNigga>({
	cancelShare: false,
	quotaExceeded: false,
	uploadConfirmation: false,
	passwordPrompt: false
});
