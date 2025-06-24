import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { handleAuth } from '$lib/auth/handleAuth';

// Compose the Paraglide handler
const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

// Compose both handlers: auth first, then paraglide
export const handle: Handle = async ({ event, resolve }) => {
	return handleAuth({
		event,
		resolve: (event) => handleParaglide({ event, resolve: (e, o) => resolve(e, o) })
	});
};
