import { writable } from 'svelte/store';

interface ExtraFeatures {
	enabled_features?: string[]; // optional, can be either falsy (including empty array) or an array of strings
	password?: string; // optional, can be either falsy (including empty string) or a string
	expiry?: string; // optional, can be either falsy (including 0) or a number min 1 max 7
	download_limit?: number; // optional, can be either falsy (including 0) or a number >= 0
	customURL?: string; // optional, can be either falsy (including empty string) or 6 characters long
}

interface Share {
	title: string; // required
	description: string; // optional
	extra_features: ExtraFeatures; // optional
	files: File[]; // required
	total_size: number; // required. re-validate by looping through files and summing up the size.
}

export const share = writable<Share>({
	title: '',
	description: '',
	extra_features: {},
	files: [],
	total_size: 0
});

// will be acquired from the server after the share is created
export const share_id = writable<string>('');

// will be acquired from the server after the share is created
export const final_share_slug = writable<string>('');

// will be acquired from the server after the share is created
export const share_expiry = writable<string | null>(null);

export const shareReady = writable<boolean>(false);
