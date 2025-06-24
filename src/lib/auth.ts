import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './server/db';

import { env } from '$env/dynamic/private';

// import { polar, checkout, portal, usage, webhooks } from "@polar-sh/better-auth";
import { polar, checkout, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import { ps_used_quota, ps_user_plan } from './server/db/schema';

const polarClient = new Polar({
	accessToken: env.POLAR_ACCESS_TOKEN
});

export const auth = betterAuth({
	// export const { handleAuth, signIn, signOut, getSession } = betterAuth({
	database: drizzleAdapter(db, {
		provider: 'pg'
	}),
	// emailAndPassword: {
	// 	enabled: true
	// },
	socialProviders: {
		google: {
			prompt: 'select_account',
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			scope: ['openid', 'email', 'profile']
		}
	},
	plugins: [
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			use: [
				checkout({
					products: [
						{
							productId: '286794eb-c809-4fc1-adc1-3b3bd34e21b0',
							slug: 'PlanarShare.com-PRO' // Custom slug for easy reference in Checkout URL, e.g. /checkout/PlanarShare.com-PRO
						},
						{
							productId: '8f1d08c1-6b9f-4aa5-b2ac-b7aa43d62691',
							slug: 'PlanarShare.com-PRO-test' // Custom slug for easy reference in Checkout URL, e.g. /checkout/PlanarShare.com-PRO
						}
					],
					// successUrl: `http://${env.APP_URL}/api/polar/validate-checkout?checkout_id={CHECKOUT_ID}`,
					successUrl: `${env.APP_URL}/?checkout_id={CHECKOUT_ID}`,
					authenticatedUsersOnly: true
				})
				// webhooks({
				// 	secret: env.POLAR_WEBHOOK_SECRET || '',
				// 	onCustomerStateChanged: async (payload) => {
				// 		console.log('onCustomerStateChanged', payload);
				// 	}, // Triggered when anything regarding a customer changes
				// 	onOrderPaid: async (payload) => {
				// 		console.log('onOrderPaid', payload);
				// 		// upsert the user's plan
				// 		await db.insert(ps_user_plan).values({
				// 			user_id: payload.customer.id,
				// 			plan_id: 1
				// 		});
				// 	}, // Triggered when an order was paid (purchase, subscription renewal, etc.)
				// 	onPayload: async (payload) => {
				// 		console.log('onPayload', payload);
				// 	} // Catch-all for all events
				// })
			]
		})
	]
});
