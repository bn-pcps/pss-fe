import { ps_shares, ps_share_settings, ps_files, ps_visit_analytics } from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { eq, and, isNull } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, url, getClientAddress, request }) => {
	const { shareSlug } = params;

	// Validate shareSlug format
	if (!shareSlug || shareSlug.length < 1) {
		throw error(400, 'Invalid share identifier');
	}

	try {
		let shareData;

		// Check if this is the special "id" route
		if (shareSlug === 'id') {
			const shareId = url.searchParams.get('shareid');
			if (!shareId || shareId.length < 1) {
				throw error(400, 'Share ID is required');
			}
			shareData = await getShareById(shareId);
		} else {
			// Handle as custom slug
			shareData = await getShareBySlug(shareSlug);
		}

		if (!shareData) {
			throw error(404, "Share doesn't exist");
		}

		// Check if share is deleted
		if (shareData.share.deleted_at) {
			throw error(404, "Share doesn't exist");
		}

		// Check if share is public
		if (!shareData.share.is_public) {
			throw error(403, 'Share is not public');
		}

		// Check if share is expired - fail immediately without leaking data
		if (shareData.settings?.expiry && new Date(shareData.settings.expiry) < new Date()) {
			throw error(410, 'Share has expired and is no longer available');
		}

		// Check download limit - fail immediately without leaking data
		if (
			shareData.settings?.download_limit &&
			shareData.share.download_count >= shareData.settings.download_limit
		) {
			throw error(429, 'Share has reached its download limit and is no longer available');
		}

		// Track visit analytics (don't fail if this fails)
		try {
			await db.insert(ps_visit_analytics).values({
				share_id: shareData.share.id,
				ip_address: getClientAddress(),
				user_agent: request.headers.get('user-agent') || undefined,
				referrer: request.headers.get('referer') || undefined
				// TODO: Add geolocation data if needed
			});

			// Increment view count
			await db
				.update(ps_shares)
				.set({
					view_count: shareData.share.view_count + 1,
					updated_at: new Date()
				})
				.where(eq(ps_shares.id, shareData.share.id));
		} catch (analyticsError) {
			console.error('Failed to log visit analytics:', analyticsError);
			// Don't fail the page load if analytics fail
		}

		// Get password from URL params for client-side validation
		const passwordAttempt = url.searchParams.get('password');

		console.log('passwordAttempt', passwordAttempt);
		console.log('shareData.settings?.password_hash', shareData.settings?.password_hash);

		// If password protected, include password validation info
		const needsPassword = !!shareData.settings?.password_hash;
		const passwordCorrect = needsPassword
			? passwordAttempt === shareData.settings?.password_hash
			: true;

		// Don't return files if password is required but not provided/incorrect
		const files = !needsPassword || passwordCorrect ? shareData.files : [];

		return {
			shareSlug: shareSlug === 'id' ? url.searchParams.get('shareid') : shareSlug,
			share: {
				id: shareData.share.id, // Actual share ID for file service
				title: shareData.share.title,
				description: shareData.share.description,
				file_count: shareData.share.file_count,
				size: shareData.share.size,
				view_count: shareData.share.view_count + 1, // Return updated count
				download_count: shareData.share.download_count,
				created_at: shareData.share.created_at
			},
			settings: {
				expiry: shareData.settings?.expiry || null,
				download_limit: shareData.settings?.download_limit || null,
				needs_password: needsPassword,
				password_correct: passwordCorrect
			},
			files: files.map((file) => ({
				id: file.id,
				name: file.file_name,
				size: file.size,
				type: file.mimetype
			})),
			timestamp: new Date().toISOString()
		};
	} catch (err) {
		console.error('Error loading share:', err);
		if (err instanceof Error && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Failed to load share');
	}
};

const getShareBySlug = async (shareSlug: string) => {
	// First get the share settings by custom_slug
	const shareSettings = await db
		.select()
		.from(ps_share_settings)
		.where(eq(ps_share_settings.custom_slug, shareSlug))
		.limit(1);

	if (shareSettings.length === 0) {
		return null;
	}

	const settings = shareSettings[0];

	// Get the share data
	const shareData = await db
		.select()
		.from(ps_shares)
		.where(and(eq(ps_shares.id, settings.share_id), isNull(ps_shares.deleted_at)))
		.limit(1);

	if (shareData.length === 0) {
		return null;
	}

	const share = shareData[0];

	// Get files for this share
	const files = await db
		.select()
		.from(ps_files)
		.where(and(eq(ps_files.share_id, share.id), isNull(ps_files.deleted_at)));

	return {
		share,
		settings,
		files
	};
};

const getShareById = async (shareId: string) => {
	// Get the share data directly by ID
	const shareData = await db
		.select()
		.from(ps_shares)
		.where(and(eq(ps_shares.id, shareId), isNull(ps_shares.deleted_at)))
		.limit(1);

	if (shareData.length === 0) {
		return null;
	}

	const share = shareData[0];

	// Get share settings if they exist
	const shareSettings = await db
		.select()
		.from(ps_share_settings)
		.where(eq(ps_share_settings.share_id, share.id))
		.limit(1);

	const settings = shareSettings.length > 0 ? shareSettings[0] : null;

	// Get files for this share
	const files = await db
		.select()
		.from(ps_files)
		.where(and(eq(ps_files.share_id, share.id), isNull(ps_files.deleted_at)));

	return {
		share,
		settings,
		files
	};
};
