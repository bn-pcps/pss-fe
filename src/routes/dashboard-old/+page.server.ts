import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/server/db/index';
import { ps_shares, ps_users } from '$lib/server/db/schema';
import { eq, sum, count, sql } from 'drizzle-orm';

export const load = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) {
		throw redirect(302, '/'); // or '/login' if you have a login page
	}

	// Get the actual user.id from google_id
	const user = await db
		.select({ id: ps_users.id })
		.from(ps_users)
		.where(eq(ps_users.google_id, session.user.id))
		.limit(1);

	if (!user[0]) {
		throw redirect(302, '/'); // User not found in database
	}

	const userId = user[0].id;

	// Get user statistics
	const stats = await db
		.select({
			totalShares: count(ps_shares.id),
			totalFiles: sum(ps_shares.file_count),
			totalSize: sum(ps_shares.size),
			totalDownloads: sum(ps_shares.download_count)
		})
		.from(ps_shares)
		.where(sql`${ps_shares.user_id} = ${userId} AND ${ps_shares.deleted_at} IS NULL`);

	// Get active shares with details
	const activeShares = await db
		.select({
			id: ps_shares.id,
			title: ps_shares.title,
			description: ps_shares.description,
			file_count: ps_shares.file_count,
			size: ps_shares.size,
			download_count: ps_shares.download_count,
			view_count: ps_shares.view_count,
			created_at: ps_shares.created_at,
			is_public: ps_shares.is_public
		})
		.from(ps_shares)
		.where(sql`${ps_shares.user_id} = ${userId} AND ${ps_shares.deleted_at} IS NULL`)
		.orderBy(sql`${ps_shares.created_at} DESC`);

	return {
		user: session.user,
		stats: {
			totalShares: Number(stats[0]?.totalShares || 0),
			totalFiles: Number(stats[0]?.totalFiles || 0),
			totalSize: Number(stats[0]?.totalSize || 0),
			totalDownloads: Number(stats[0]?.totalDownloads || 0)
		},
		activeShares
	};
};
