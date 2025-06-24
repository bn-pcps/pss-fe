import { db } from '$lib/server/db';
import { ps_share_settings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get('slug');
	if (!slug) {
		return new Response(JSON.stringify({ exists: false }), { status: 400 });
	}
	const result = await db
		.select({ id: ps_share_settings.id })
		.from(ps_share_settings)
		.where(eq(ps_share_settings.custom_slug, slug))
		.limit(1);
	return new Response(JSON.stringify({ exists: result.length > 0 }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};
