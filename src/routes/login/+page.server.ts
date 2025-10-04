import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// If a user who is already logged in tries to visit the login page,
// redirect them straight to the dashboard.
export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('auth_token');
	if (token) {
		// Redirect to dashboard if already logged in
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	// Assumes your login form action is named "login"
	// e.g., <form method="POST" action="?/login">
	login: async ({ request, cookies, fetch }) => {
		const data = await request.formData();
		const username = data.get('username'); // Changed from email to username
		const password = data.get('password');

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required.' });
		}

		try {
			// This should be the URL of your backend API
			const API_BASE = 'http://localhost:3000/api';

			// 1. Call your backend login endpoint
			const response = await fetch(`${API_BASE}/users/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: username.toString(),
					password: password.toString()
				})
			});

			if (!response.ok) {
				// Handle non-OK responses
				let errorMessage = 'Invalid credentials';
				try {
					const errorData = await response.json();
					errorMessage = errorData.message || errorData.error || errorMessage;
				} catch {
					// If response is not JSON, use status text
					errorMessage = response.statusText || 'Login failed';
				}
				return fail(response.status, {
					error: errorMessage,
					username: username.toString()
				});
			}

			const result = await response.json();

			// 2. Set the auth token and user info in cookies
			if (result.token) {
				cookies.set('auth_token', result.token, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 7 // 1 week
				});
			}

			if (result.user) {
				cookies.set('user_data', JSON.stringify(result.user), {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'strict',
					maxAge: 60 * 60 * 24 * 7 // 1 week
				});
			}

			// 3. Redirect to the dashboard
			throw redirect(303, '/dashboard');
		} catch (err) {
			console.error('Login action failed:', err);
			if (err instanceof redirect) {
				throw err;
			}
			return fail(500, {
				error: 'An internal server error occurred. Please try again later.'
			});
		}
	}
};
