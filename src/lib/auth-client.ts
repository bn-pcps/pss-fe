import { createAuthClient } from 'better-auth/svelte';

import { polarClient } from '@polar-sh/better-auth';

// export const authClient = createAuthClient({});

// import { createAuthClient } from 'better-auth/client';
export const authClient = createAuthClient({
	plugins: [polarClient()]
});

export const signIn = async () => {
	await authClient.signIn.social({
		provider: 'google',
		callbackURL: '/dashboard'
	});
};

// const data = await authClient.signIn.social({
// 	provider: 'google',
// 	idToken: {
// 		token: 'Google ID Token',
// 		accessToken: 'Google Access Token'
// 	}
// });
