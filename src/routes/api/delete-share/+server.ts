import { db } from '$lib/server/db/index';
import { ps_shares, ps_users } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Check authentication
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get the share ID from the request body
		const { shareId } = await request.json();
		if (!shareId) {
			return json({ error: 'Share ID is required' }, { status: 400 });
		}

		// Get user from database
		const dbUser = (
			await db.select().from(ps_users).where(eq(ps_users.google_id, session.user.id)).limit(1)
		)[0];

		if (!dbUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Verify the share belongs to the user and is not already deleted
		const share = await db
			.select()
			.from(ps_shares)
			.where(
				and(
					eq(ps_shares.id, shareId),
					eq(ps_shares.user_id, dbUser.id),
					isNull(ps_shares.deleted_at)
				)
			)
			.limit(1);

		if (share.length === 0) {
			return json({ error: 'Share not found or access denied' }, { status: 404 });
		}

		// Soft delete the share by setting deleted_at timestamp
		await db
			.update(ps_shares)
			.set({
				deleted_at: new Date(),
				updated_at: new Date()
			})
			.where(eq(ps_shares.id, shareId));

		return json({ success: true, message: 'Share deleted successfully' });
	} catch (error) {
		console.error('Error deleting share:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
