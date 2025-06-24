import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/server/db/index';
import {
	ps_shares,
	ps_users,
	ps_share_settings,
	ps_plans,
	ps_user_plan,
	ps_used_quota
} from '$lib/server/db/schema';
import { eq, sum, count, sql } from 'drizzle-orm';
import { Polar } from '@polar-sh/sdk';
import { env } from '$env/dynamic/private';

const polarClient = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN
});

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

	// Get active shares with details and custom slug
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
			is_public: ps_shares.is_public,
			custom_slug: ps_share_settings.custom_slug
		})
		.from(ps_shares)
		.leftJoin(ps_share_settings, eq(ps_shares.id, ps_share_settings.share_id))
		.where(sql`${ps_shares.user_id} = ${userId} AND ${ps_shares.deleted_at} IS NULL`)
		.orderBy(sql`${ps_shares.created_at} DESC`);

	// Get user plan and quota information
	const userPlan = (
		await db.select().from(ps_user_plan).where(eq(ps_user_plan.user_id, userId))
	)[0];

	const plan = userPlan
		? (await db.select().from(ps_plans).where(eq(ps_plans.id, userPlan.plan_id)))[0]
		: null;

	const usedQuota = (
		await db.select().from(ps_used_quota).where(eq(ps_used_quota.user_id, userId))
	)[0];

	// Get customer portal URL for subscription management
	let customerPortalUrl = null;
	try {
		const result = await polarClient.customerSessions.create({
			customerExternalId: session.user.id
		});
		customerPortalUrl = result.customerPortalUrl;
	} catch (error) {
		console.error('Error creating customer portal session:', error);
	}

	return {
		user: {
			...session.user,
			plan: plan?.plan_name || 'Free',
			planId: plan?.id || 1,
			quota: plan?.quota || 0,
			usedQuota: usedQuota?.used_quota || 0
		},
		stats: {
			totalShares: Number(stats[0]?.totalShares || 0),
			totalFiles: Number(stats[0]?.totalFiles || 0),
			totalSize: Number(stats[0]?.totalSize || 0),
			totalDownloads: Number(stats[0]?.totalDownloads || 0)
		},
		activeShares,
		customerPortalUrl
	};
};
