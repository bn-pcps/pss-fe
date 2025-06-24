import {
	ps_files,
	ps_shares,
	ps_share_settings,
	ps_download_analytics
} from '$lib/server/db/schema';
import { db } from '$lib/server/db';
import { error, json } from '@sveltejs/kit';
import { eq, and, isNull } from 'drizzle-orm';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, getClientAddress, request }) => {
	const { fileId } = params;
	const password = url.searchParams.get('password');

	if (!fileId) {
		throw error(400, 'File ID is required');
	}

	if (!env.PUBLIC_FILE_SERVICE_URL) {
		throw error(503, 'File service is not configured');
	}

	try {
		// Get file data with share info
		const fileData = await db
			.select({
				file: ps_files,
				share: ps_shares,
				settings: ps_share_settings
			})
			.from(ps_files)
			.innerJoin(ps_shares, eq(ps_files.share_id, ps_shares.id))
			.leftJoin(ps_share_settings, eq(ps_shares.id, ps_share_settings.share_id))
			.where(
				and(eq(ps_files.id, fileId), isNull(ps_files.deleted_at), isNull(ps_shares.deleted_at))
			)
			.limit(1);

		if (fileData.length === 0) {
			throw error(404, 'File not found');
		}

		const { file, share, settings } = fileData[0];

		// Check if share is public
		if (!share.is_public) {
			throw error(403, 'Share is not public');
		}

		// Check if share is expired
		if (settings?.expiry && new Date(settings.expiry) < new Date()) {
			throw error(410, 'Share has expired');
		}

		// Check password if required
		if (settings?.password_hash) {
			if (!password || password !== settings.password_hash) {
				throw error(401, 'Invalid password');
			}
		}

		// Check download limit (if set)
		if (settings?.download_limit && share.download_count >= settings.download_limit) {
			throw error(429, 'Download limit exceeded');
		}

		// Log download analytics
		try {
			await db.insert(ps_download_analytics).values({
				share_id: share.id,
				file_id: file.id,
				ip_address: getClientAddress(),
				user_agent: request.headers.get('user-agent') || undefined
				// TODO: Add geolocation data if needed
			});
		} catch (analyticsError) {
			console.error('Failed to log download analytics:', analyticsError);
			// Don't fail the download if analytics fail
		}

		// Increment download count
		try {
			await db
				.update(ps_shares)
				.set({
					download_count: share.download_count + 1,
					updated_at: new Date()
				})
				.where(eq(ps_shares.id, share.id));
		} catch (updateError) {
			console.error('Failed to update download count:', updateError);
			// Don't fail the download if count update fails
		}

		// Return file service URL
		const fileServiceUrl = new URL(`${env.PUBLIC_FILE_SERVICE_URL}/f/${file.id}`);
		if (password) {
			fileServiceUrl.searchParams.set('password', password);
		}

		return json({
			fileId: file.id,
			fileName: file.file_name,
			size: file.size,
			mimetype: file.mimetype,
			downloadUrl: fileServiceUrl.toString(),
			message: 'Download authorized'
		});
	} catch (err) {
		console.error('Error processing download:', err);
		if (err instanceof Error && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Internal server error');
	}
};
