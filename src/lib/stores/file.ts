import { writable } from 'svelte/store';

interface ExtraFeatures {
	password?: string;
	expiry?: string;
	download_limit?: number;
}

interface Share {
	title: string;
	description: string;
	extra_features: ExtraFeatures;
	files: File[];
}

export const shares = writable<Share[]>([]);
