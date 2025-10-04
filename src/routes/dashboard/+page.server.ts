import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface User {
	id: number;
	username: string;
	email: string;
	role: 'user' | 'admin';
	created_at?: string;
}

interface Pet {
	id?: number;
	name: string;
	species: string;
	breed: string;
	age: number;
	owner_id: number;
	owner_username?: string;
}

const API_BASE = 'https://localhost:3000/api';

async function apiCall(
	fetch: typeof window.fetch,
	path: string,
	token: string | undefined,
	options: RequestInit = {}
) {
	if (!token) throw redirect(303, '/login');

	const response = await fetch(`${API_BASE}${path}`, {
		...options,
		headers: {
			...options.headers,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		}
	});

	if (response.status === 401) {
		// Handle token refresh or redirect to login
		throw redirect(303, '/login');
	}

	return response;
}

// --- LOAD FUNCTION ---
// This runs on the server before the page is rendered.
// It fetches all the necessary data for the component.
export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('auth_token');
	const userStr = cookies.get('user');

	if (!token || !userStr) {
		throw redirect(303, '/login');
	}

	const currentUser: User = JSON.parse(userStr);

	try {
		// Parallel fetch for pets and (if admin) users
		const petsPromise = apiCall(fetch, '/pets', token).then((res) => res.json() as Promise<Pet[]>);

		let usersPromise: Promise<User[]> = Promise.resolve([]);
		if (currentUser.role === 'admin') {
			usersPromise = apiCall(fetch, '/users', token).then((res) => res.json() as Promise<User[]>);
		}

		const [pets, users] = await Promise.all([petsPromise, usersPromise]);

		return {
			currentUser,
			pets,
			users,
			error: null
		};
	} catch (error) {
		console.error('Failed to load dashboard data:', error);
		return {
			currentUser,
			pets: [],
			users: [],
			error: 'Could not load dashboard data. Please try again later.'
		};
	}
};

// --- ACTIONS ---
// These handle form submissions from the component.
export const actions: Actions = {
	/**
	 * Add a new pet
	 */
	addPet: async ({ request, cookies, fetch }) => {
		const token = cookies.get('auth_token');
		const data = await request.formData();

		try {
			const response = await apiCall(fetch, '/pets', token, {
				method: 'POST',
				body: JSON.stringify({
					name: data.get('name'),
					species: data.get('species'),
					breed: data.get('breed'),
					age: Number(data.get('age'))
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				return fail(response.status, { error: errorData.message || 'Failed to add pet' });
			}
			return { success: true, message: 'Pet added successfully!' };
		} catch (e) {
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	},

	/**
	 * Update an existing pet
	 */
	updatePet: async ({ request, cookies, fetch }) => {
		const token = cookies.get('auth_token');
		const data = await request.formData();
		const petId = data.get('id');

		if (!petId) {
			return fail(400, { error: 'Pet ID is missing.' });
		}

		try {
			const response = await apiCall(fetch, `/pets/${petId}`, token, {
				method: 'PUT',
				body: JSON.stringify({
					name: data.get('name'),
					species: data.get('species'),
					breed: data.get('breed'),
					age: Number(data.get('age'))
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				return fail(response.status, { error: errorData.message || 'Failed to update pet' });
			}
			return { success: true, message: 'Pet updated successfully!' };
		} catch (e) {
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	},

	/**
	 * Delete a pet
	 */
	deletePet: async ({ request, cookies, fetch }) => {
		const token = cookies.get('auth_token');
		const data = await request.formData();
		const petId = data.get('id');

		try {
			const response = await apiCall(fetch, `/pets/${petId}`, token, {
				method: 'DELETE'
			});

			if (!response.ok) {
				return fail(response.status, { error: 'Failed to delete pet.' });
			}
			return { success: true, deletedPetId: petId };
		} catch (e) {
			return fail(500, { error: 'An unexpected error occurred.' });
		}
	},

	/**
	 * Logout the user
	 */
	logout: async ({ cookies }) => {
		// Clear the cookies
		cookies.delete('auth_token', { path: '/' });
		cookies.delete('user', { path: '/' });

		// Redirect to login page
		throw redirect(303, '/login');
	}
};
