import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';
import { db } from '$lib/server/db';
import { ps_plans, ps_used_quota, ps_user_plan, ps_users } from '$lib/server/db/schema';
import type { ServerLoadEvent } from '@sveltejs/kit';
import type { RouteParams } from './$types';
import { eq } from 'drizzle-orm';
import { CheckoutStatus } from '@polar-sh/sdk/models/components/checkoutstatus.js';
import { Polar } from '@polar-sh/sdk';
import { env } from '$env/dynamic/private';

// import { getSession } from 'better-auth/api';

const polarClient = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN
});

export const load = async (event) => {
	// if (event.url.searchParams.get('customer_session_token')) {
	if (event.url.searchParams.get('checkout_id')) {
		await updateUserPlan(event);
		return redirect(302, '/');
	}

	await validatePlan(event);

	await getCustomerPortal(event);

	const user = await compileUserData(event);
	console.log('user', user);
	// return { user };

	if (user) {
		return { user };
		// return user;
	}

	return { user: null };
	// return null;
};

const getCustomerPortal = async (event: ServerLoadEvent<RouteParams>) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	const userId = session?.user?.id;

	if (!userId) {
		return;
	}

	const result = await polarClient.customerSessions.create({
		customerExternalId: userId
	});

	// Handle the result
	console.log('customer portal', result);

	return result;
};

const updateUserPlan = async (event: ServerLoadEvent<RouteParams>) => {
	console.log('updateUserPlan');

	const checkoutId = event.url.searchParams.get('checkout_id');
	if (!checkoutId) {
		return { valid: false, error: 'Missing checkout_id' };
	}

	try {
		const polar_session = await polarClient.checkouts.get({ id: checkoutId });
		// const session
		const session = await auth.api.getSession({ headers: event.request.headers });
		const userId = session?.user?.id;

		if (!userId) {
			console.log('No user ID found');
			return;
		}

		// Check if polar_session exists and is paid
		console.log('polar_session', polar_session);
		if (!polar_session || polar_session.status !== CheckoutStatus.Succeeded) {
			console.log('Checkout not paid or not found');
		}

		if (userId && polar_session.customerExternalId !== userId) {
			console.log('Checkout does not belong to user');
		}

		// check if subscription is active
		const subscriptions = await polarClient.subscriptions.list({
			customerId: polar_session.customerId
		});
		const latestSubscription = subscriptions.result.items[0];
		console.log('latestSubscription', latestSubscription.id);

		if (latestSubscription.status !== 'active') {
			console.log('Subscription not active');
			return;
		}

		// return { valid: true, session };

		// update the user's plan
		const newPlanId = polar_session.productId;
		const newPlan = (await db.select().from(ps_plans).where(eq(ps_plans.polar_id, newPlanId)))[0];
		if (!newPlan) {
			console.log('Plan not found');
			return;
		}

		const dbUser = (await db.select().from(ps_users).where(eq(ps_users.google_id, userId)))[0];
		if (!dbUser) {
			console.log('User not found');
			return;
		}

		// update the user's plan
		await db
			.update(ps_user_plan)
			.set({
				plan_id: newPlan.id,
				updated_at: new Date(),
				// expires_at: new Date()
				// subscription_id: polar_session.subscriptionId
				subscription_id: latestSubscription.id
			})
			.where(eq(ps_user_plan.user_id, dbUser.id));

		// return { valid: true, session };

		// update the user's plan
	} catch (e) {
		console.error('Error validating checkout', e);
		// return json({ valid: false, error: 'Error validating checkout' }, { status: 500 });
	}
};

const compileUserData = async (event: ServerLoadEvent<RouteParams>) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) {
		// throw redirect(302, '/'); // or '/login' if you have a login page
		return { user: null };
	}

	console.log('session niggas', session);

	// set `ps_users` if user with google_id is not found
	let dbuser = (await db.select().from(ps_users).where(eq(ps_users.google_id, session.user.id)))[0];
	if (!dbuser) {
		const _user = await db
			.insert(ps_users)
			.values({
				google_id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				avatar_url: session.user.image,
				created_at: new Date(),
				updated_at: new Date()
			})
			.returning();
		console.log('_user', _user);
		dbuser = _user[0];

		// upsert the user's plan
		await db.insert(ps_user_plan).values({
			user_id: dbuser.id,
			plan_id: 1
		});

		// upsert the user's quota
		await db.insert(ps_used_quota).values({
			user_id: dbuser.id,
			used_quota: 0
		});
	}
	// console.log('user', user);

	const userPlan = (
		await db.select().from(ps_user_plan).where(eq(ps_user_plan.user_id, dbuser.id))
	)[0];
	const planId = userPlan?.plan_id;

	const dbplan = (await db.select().from(ps_plans).where(eq(ps_plans.id, planId)))[0];

	console.log('dbplan', dbplan);

	// const dbquota = dbplan.quota;

	// console.log('dbquota', dbquota);

	const dbusedquota = (
		await db.select().from(ps_used_quota).where(eq(ps_used_quota.user_id, dbuser.id))
	)[0];

	const user = {
		id: dbuser.id,
		name: dbuser.name,
		avatar: dbuser.avatar_url,
		plan: dbplan.plan_name,
		quota: dbplan.quota,
		used_quota: dbusedquota.used_quota
	};

	return user;
};

const validatePlan = async (event: ServerLoadEvent<RouteParams>) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (!session?.user) {
		return;
	}

	const dbUser = (
		await db.select().from(ps_users).where(eq(ps_users.google_id, session.user.id))
	)[0];

	if (!dbUser) {
		console.log('User not found');
		return;
	}

	const userPlan = (
		await db.select().from(ps_user_plan).where(eq(ps_user_plan.user_id, dbUser.id))
	)[0];

	if (!userPlan) {
		console.log('User plan not found');
		return;
	}

	if (userPlan.plan_id !== 1 && userPlan.subscription_id) {
		// if (userPlan.plan_id !== 1) {
		const subscription = await polarClient.subscriptions.get({
			// id: '8156fdd8-6095-4eb3-927c-bfa763406ac1'
			id: userPlan.subscription_id
		});
		// console.log('subscription', JSON.stringify(subscription, null, 2));
		console.log('subscription.status', subscription.status);

		// // Check status
		// if (subscription.status === 'active') {
		//   // Plan is valid
		// } else {
		//   // Plan is not valid
		// }

		if (subscription.status !== 'active' && userPlan.plan_id !== 1) {
			console.log('User plan expired');
			await db
				.update(ps_user_plan)
				.set({
					plan_id: 1,
					updated_at: new Date()
				})
				.where(eq(ps_user_plan.user_id, dbUser.id));
			return;
		}

		console.log('User plan valid');
	}
	return;
};

// const validatePlan = async (event: ServerLoadEvent<RouteParams>) => {
// 	const session = await auth.api.getSession({ headers: event.request.headers });

// 	if (!session?.user) {
// 		return;
// 	}

// 	// const dbUser = (
// 	// 	await db.select().from(ps_users).where(eq(ps_users.google_id, session.user.id))
// 	// )[0];

// 	// if (!dbUser) {
// 	// 	console.log('User not found');
// 	// 	return;
// 	// }

// 	// const userPlan = (
// 	// 	await db.select().from(ps_user_plan).where(eq(ps_user_plan.user_id, dbUser.id))
// 	// )[0];

// 	// if (!userPlan) {
// 	// 	console.log('User plan not found');
// 	// 	return;
// 	// }

// 	// if (userPlan.expires_at && userPlan.expires_at < new Date()) {
// 	// 	console.log('User plan expired');
// 	// 	await db
// 	// 		.update(ps_user_plan)
// 	// 		.set({
// 	// 			plan_id: 1,
// 	// 			updated_at: new Date(),
// 	// 			expires_at: null
// 	// 		})
// 	// 		.where(eq(ps_user_plan.user_id, dbUser.id));
// 	// 	return;
// 	// }

// 	//   // Find all checkouts/subscriptions for this user
// 	// const checkouts = await polarClient.checkouts.list({
// 	// 	customerId: '9f1f6c10-b266-47aa-87a6-5164daaca7e2'
// 	// });
// 	// console.log('checkouts', JSON.stringify(checkouts, null, 2));
// 	// const checkouts = await polarClient.checkouts.list();

// 	// // Or, if you have a subscription ID:
// 	const subscription = await polarClient.subscriptions.get({
// 		id: '8156fdd8-6095-4eb3-927c-bfa763406ac1'
// 	});
// 	// console.log('subscription', JSON.stringify(subscription, null, 2));
// 	console.log('subscription.status', subscription.status);

// 	// // Check status
// 	// if (subscription.status === 'active') {
// 	//   // Plan is valid
// 	// } else {
// 	//   // Plan is not valid
// 	// }

// 	// if (true) {
// 	// 	console.log('User plan expired');
// 	// 	await db
// 	// 		.update(ps_user_plan)
// 	// 		.set({
// 	// 			plan_id: 1,
// 	// 			updated_at: new Date(),
// 	// 			expires_at: null
// 	// 		})
// 	// 		.where(eq(ps_user_plan.user_id, dbUser.id));
// 	// 	return;
// 	// }

// 	console.log('User plan valid');
// 	return;
// };
