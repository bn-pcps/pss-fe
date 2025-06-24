import { writable } from 'svelte/store';

// this will define which components are shown to the user
type AppState =
	| 'pageLoaded'
	| 'unauthenticated'
	| 'idle'
	| 'pickingFiles'
	| 'uploadingFiles'
	| 'uploadSuccess';

export const appState = writable<AppState>('pageLoaded');

// export const setAppState = (state: AppState) => {
// 	appState.set(state);
// };
