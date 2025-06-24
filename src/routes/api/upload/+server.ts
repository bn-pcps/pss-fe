import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/auth';
import { db } from '$lib/server/db';
import {
	ps_shares,
	ps_share_settings,
	ps_upload_signatures,
	ps_users,
	ps_used_quota,
	ps_user_plan,
	ps_plans
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

interface ExtraFeatures {
	enabled_features?: string[];
	password?: string;
	expiry?: string;
	download_limit?: number;
	customURL?: string;
}

interface ShareData {
	title: string;
	description: string;
	extra_features: ExtraFeatures;
	files: Array<{ name: string; size: number; type: string }>;
	total_size: number;
}

// Server-side validation function (same as client)
function validateShare(shareObj: ShareData): { valid: boolean; error?: string } {
	if (!shareObj) return { valid: false, error: 'No share data provided' };

	// Validate files
	if (!Array.isArray(shareObj.files) || shareObj.files.length === 0) {
		return { valid: false, error: 'No files provided' };
	}

	// Validate title (non-empty string)
	if (typeof shareObj.title !== 'string' || shareObj.title.trim().length === 0) {
		return { valid: false, error: 'Title is required' };
	}

	// description is optional, no validation needed

	// Validate extra_features (optional)
	const ef = shareObj.extra_features || {};
	const enabled = Array.isArray(ef.enabled_features) ? ef.enabled_features : [];

	// Only validate extras if enabled
	if (enabled.includes('password')) {
		if (typeof ef.password !== 'string' || ef.password === '') {
			return { valid: false, error: 'Password is required when password feature is enabled' };
		}
	}
	if (enabled.includes('expiry')) {
		const expiryNum = Number(ef.expiry);
		if (ef.expiry === undefined || isNaN(expiryNum) || expiryNum < 1 || expiryNum > 7) {
			return { valid: false, error: 'Expiry must be between 1 and 7 days' };
		}
	}
	if (enabled.includes('download_limit')) {
		if (typeof ef.download_limit !== 'number' || ef.download_limit < 0) {
			return { valid: false, error: 'Download limit must be a positive number' };
		}
	}
	if (enabled.includes('customURL')) {
		if (typeof ef.customURL !== 'string' || ef.customURL.length < 6) {
			return { valid: false, error: 'Custom URL must be at least 6 characters long' };
		}
	}

	// Validate total_size: must match sum of file sizes
	const expectedTotalSize = Array.isArray(shareObj.files)
		? shareObj.files.reduce((acc: number, file: { size: number }) => acc + (file.size || 0), 0)
		: 0;
	if (shareObj.total_size !== expectedTotalSize) {
		return { valid: false, error: 'Total size does not match sum of file sizes' };
	}

	return { valid: true };
}

export const POST: RequestHandler = async ({ request }) => {
	console.log('❗❗❗hit');

	try {
		// Check authentication
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Parse request body
		const shareData: ShareData = await request.json();

		// Validate share data
		const validation = validateShare(shareData);
		if (!validation.valid) {
			return json({ error: validation.error }, { status: 400 });
		}

		// Get user from database
		const dbUser = (
			await db.select().from(ps_users).where(eq(ps_users.google_id, session.user.id)).limit(1)
		)[0];

		if (!dbUser) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		// Check quota (convert bytes to MB)
		const totalSizeInMB = Math.ceil(shareData.total_size / (1024 * 1024));
		const usedQuota = (
			await db.select().from(ps_used_quota).where(eq(ps_used_quota.user_id, dbUser.id)).limit(1)
		)[0];
		const userPlan = (
			await db.select().from(ps_user_plan).where(eq(ps_user_plan.user_id, dbUser.id)).limit(1)
		)[0];

		if (userPlan) {
			const plan = (
				await db.select().from(ps_plans).where(eq(ps_plans.id, userPlan.plan_id)).limit(1)
			)[0];
			if (usedQuota && plan && usedQuota.used_quota + totalSizeInMB > plan.quota) {
				return json({ error: 'Quota exceeded' }, { status: 403 });
			}
		}

		// Check custom URL availability if provided, or generate one if not
		const ef = shareData.extra_features;
		const enabled = ef.enabled_features || [];
		let finalSlug: string | undefined = undefined;
		// if (enabled.includes('customURL')) {
		if (ef.customURL) {
			console.log('custom url found', ef.customURL);
			const existingSlug = (
				await db
					.select()
					.from(ps_share_settings)
					.where(eq(ps_share_settings.custom_slug, ef.customURL))
					.limit(1)
			)[0];
			if (existingSlug) {
				return json({ error: 'Custom URL already taken' }, { status: 409 });
			}
			finalSlug = ef.customURL;
			console.log('final slug', finalSlug);
		} else {
			console.log('no custom url, generating candidate');
			// Generate a unique random 8 (or more if loop more than 100)-character slug
			let isUnique = false;
			let candidate = '';
			const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			let i = 0;
			while (!isUnique) {
				// Increase slug length after 100 attempts (8 -> 9, 9 -> 10, etc.)
				const slugLength = 8 + Math.floor(i / 100);
				candidate = Array.from(
					{ length: slugLength },
					() => chars[Math.floor(Math.random() * chars.length)]
				).join('');
				const existing = (
					await db
						.select()
						.from(ps_share_settings)
						.where(eq(ps_share_settings.custom_slug, candidate))
						.limit(1)
				)[0];
				if (!existing) isUnique = true;
				i++;
				if (i > 1000) {
					console.log('failed to find unique slug after 1000 attempts');
					// return json({ error: 'Failed to find unique slug' }, { status: 500 });
					finalSlug = 'share';
				}
			}
			console.log('i', i);
			console.log('found candidate', candidate);
			finalSlug = candidate;
			console.log('final slug', finalSlug);
		}
		// }

		// Create share in database
		const [newShare] = await db
			.insert(ps_shares)
			.values({
				user_id: dbUser.id,
				title: shareData.title.trim(),
				description: shareData.description || null
			})
			.returning();

		// Create share settings (always needed for slug storage)
		let expiryTimestamp: Date | undefined = undefined;
		const settingsData = {
			share_id: newShare.id,
			password_hash: undefined as string | undefined,
			expiry: undefined as Date | undefined,
			download_limit: undefined as number | undefined,
			custom_slug: finalSlug
		};

		if (enabled.includes('password') && ef.password) {
			// Hash password
			settingsData.password_hash = crypto.createHash('sha256').update(ef.password).digest('hex');
		}

		if (enabled.includes('expiry') && ef.expiry) {
			// Calculate expiry date
			const expiryDays = Number(ef.expiry);
			const expiryDate = new Date();
			expiryDate.setDate(expiryDate.getDate() + expiryDays);
			settingsData.expiry = expiryDate;
			expiryTimestamp = expiryDate; // Store for response
		}

		if (enabled.includes('download_limit') && ef.download_limit) {
			settingsData.download_limit = ef.download_limit;
		}

		await db.insert(ps_share_settings).values(settingsData);

		// Create upload signature
		const signature = Buffer.from(`${dbUser.id}:${newShare.id}:${Date.now()}`).toString('base64');
		const signatureExpiry = new Date();
		signatureExpiry.setHours(signatureExpiry.getHours() + 1); // 1 hour expiry

		await db.insert(ps_upload_signatures).values({
			share_id: newShare.id,
			signature,
			expiry: signatureExpiry,
			expected_file_count: shareData.files.length,
			expected_file_size: Math.ceil(shareData.total_size / (1024 * 1024)) // Convert to MB and round up
		});

		const res = {
			success: true,
			share_id: newShare.id,
			share_slug: finalSlug,
			signature,
			expiry: expiryTimestamp,
			bruh: 'bruh'
		};

		console.log('❗❗❗res', res);

		return json(res);
	} catch (error) {
		console.error('Error creating share:', error);
		return json({ error: 'Internal server error (sv)' }, { status: 500 });
	}
};
