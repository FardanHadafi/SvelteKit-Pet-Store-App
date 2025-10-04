import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

interface AuthResponse {
	token: string;
	user: {
		id: number;
		username: string;
		email: string;
		role: string;
		created_at: string;
		updated_at: string;
	};
}

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const loginData = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		};

		try {
			const response = await fetch('http://localhost:3000/api/users/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(loginData)
			});

			const data = await response.json();

			if (!response.ok) {
				return fail(response.status, {
					apiError: data.error || data.message || 'Login failed',
					formData: loginData
				});
			}

			// ✅ Type assertion for successful response
			const authData = data as AuthResponse;

			// Save token
			cookies.set('auth_token', authData.token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24
			});

			// Save user
			cookies.set('user', JSON.stringify(authData.user), {
				path: '/',
				maxAge: 60 * 60 * 24
			});
		} catch (error) {
			// ❌ DON'T CATCH HERE - let it bubble up
			console.error('Login error:', error);
			return fail(500, {
				apiError: 'Network error. Please try again.',
				formData: loginData
			});
		}

		// ✅ Redirect OUTSIDE try-catch
		throw redirect(303, '/dashboard');
	}
};
