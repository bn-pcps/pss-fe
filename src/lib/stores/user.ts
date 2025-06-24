import { writable } from 'svelte/store';

export interface UserData {
	id: string;
	name: string;
	// email: string;
	avatar: string;
	plan: string;
	quota: number;
	used_quota: number;
}

export const userData = writable<UserData | null>(null);
