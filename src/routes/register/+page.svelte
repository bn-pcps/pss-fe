<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let name = '';
	let image = '';
	let loading = false;
	let error: string | null = null;
	let res: any = null;

	async function handleSubmit() {
		loading = true;
		error = null;
		try {
			const { data, error: signUpError } = await authClient.signUp.email({
				email,
				password,
				name,
				image
				// callbackURL: '/dashboard'
			});
			if (signUpError) {
				error = signUpError.message ?? 'Unknown error';
				alert(error);
			} else {
				// Optionally redirect or show a message
				// goto('/dashboard');
			}
			res = data;
		} catch (err: any) {
			error = err?.message ?? 'An unexpected error occurred.';
			alert(error);
		} finally {
			loading = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<label for="email">Email</label>
	<input type="email" name="email" placeholder="Email" bind:value={email} required />
	<br />
	<label for="password">Password</label>
	<input
		type="password"
		name="password"
		placeholder="Password"
		bind:value={password}
		required
		minlength="8"
	/>
	<label for="name">Name</label>
	<input type="text" name="name" placeholder="Name" bind:value={name} required />
	<label for="image">Image</label>
	<input type="text" name="image" placeholder="Image" bind:value={image} />
	<button type="submit" disabled={loading}>Register</button>
</form>

<pre>{JSON.stringify(res, null, 2)}</pre>
