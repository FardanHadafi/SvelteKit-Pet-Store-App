import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Match Go AuthResponse structure
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

		const userData = {
			username: formData.get('username') as string,
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			role: (formData.get('role') as string) || 'user'
		};

		try {
			const response = await fetch('http://localhost:3000/api/users/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});

			const data: AuthResponse = await response.json();

			if (!response.ok) {
				return fail(400, {
					apiError: 'Registration failed',
					formData: userData
				});
			}

			// ✅ Save token from response
			cookies.set('auth_token', data.token, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 // 24 hours
			});

			// ✅ Save user info
			cookies.set('user', JSON.stringify(data.user), {
				path: '/',
				maxAge: 60 * 60 * 24
			});

			console.log('✅ Registration successful, token saved');
			throw redirect(303, '/login');
		} catch (error) {
			// Don't catch redirects
			if (error instanceof Response || (error as any)?.status) {
				throw error;
			}

			console.error('Registration error:', error);
			return fail(500, {
				apiError: 'Network error. Please try again.',
				formData: userData
			});
		}
	}
};
