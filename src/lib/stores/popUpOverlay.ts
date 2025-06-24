import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

type PopUpOverlay = {
	component: SvelteComponent;
	onClickOutside: () => void;
};

export const popUpOverlay = writable<PopUpOverlay[]>([]);

export const addPopUpOverlay = (component: SvelteComponent, onClickOutside: () => void) => {
	popUpOverlay.update((current) => [...current, { component, onClickOutside }]);
};
