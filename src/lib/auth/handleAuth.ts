import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/auth';

export const handleAuth: Handle = ({ event, resolve }) =>
	svelteKitHandler({ event, resolve, auth });
