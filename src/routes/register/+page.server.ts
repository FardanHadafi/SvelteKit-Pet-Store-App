import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Form data interface matching Go struct
interface UserRegisterRequest {
	username: string;
	email: string;
	password: string;
	role: string;
}

// Validation function
function validateForm(formData: UserRegisterRequest): Record<string, string> {
	const errors: Record<string, string> = {};

	// Username validation
	if (!formData.username.trim()) {
		errors.username = 'Username is required';
	} else if (formData.username.length < 3) {
		errors.username = 'Username must be at least 3 characters';
	} else if (formData.username.length > 50) {
		errors.username = 'Username must be less than 50 characters';
	}

	// Email validation
	if (!formData.email.trim()) {
		errors.email = 'Email is required';
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
		errors.email = 'Please enter a valid email address';
	}

	// Password validation
	if (!formData.password) {
		errors.password = 'Password is required';
	} else if (formData.password.length < 6) {
		errors.password = 'Password must be at least 6 characters';
	}

	return errors;
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const userData: UserRegisterRequest = {
			username: formData.get('username') as string,
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			role: (formData.get('role') as string) || 'user'
		};

		// Validate form
		const errors = validateForm(userData);
		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				formData: userData
			});
		}

		try {
			const response = await fetch('http://localhost:3000/api/users/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});

			const data = await response.json();

			if (response.ok) {
				// Registration successful
				throw redirect(303, '/login');
			} else {
				// Handle server-side validation errors or other errors
				return fail(400, {
					apiError: data.message || data.error || 'Registration failed',
					formData: userData
				});
			}
		} catch (error) {
			if (error instanceof redirect) {
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
