import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { User, Pet } from '$lib/types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('auth_token');
	const userStr = cookies.get('user');

	// If not logged in, redirect to login
	if (!token || !userStr) {
		throw redirect(303, '/login');
	}

	const user: User = JSON.parse(userStr);

	// Fetch pets from your API
	try {
		const response = await fetch('http://localhost:3000/api/pets', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		if (response.ok) {
			const pets: Pet[] = await response.json();
			return { user, pets };
		}
	} catch (error) {
		console.error('Failed to fetch pets:', error);
	}

	// Return empty pets if fetch fails
	return {
		user,
		pets: [] as Pet[]
	};
};

export const actions: Actions = {
	// Add pet
	addPet: async ({ request, cookies }) => {
		const token = cookies.get('auth_token');
		const formData = await request.formData();

		const petData = {
			name: formData.get('name') as string,
			species: formData.get('species') as string,
			breed: formData.get('breed') as string,
			age: Number(formData.get('age'))
		};

		try {
			const response = await fetch('http://localhost:3000/api/pets', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`
				},
				body: JSON.stringify(petData)
			});

			if (response.ok) {
				return {
					success: true as const,
					message: 'Pet added successfully!'
				};
			} else {
				const error = await response.json();
				return fail(400, {
					error: error.message || 'Failed to add pet'
				});
			}
		} catch (error) {
			return fail(500, {
				error: 'Network error. Please try again.'
			});
		}
	},

	// Delete pet
	deletePet: async ({ request, cookies }) => {
		const token = cookies.get('auth_token');
		const formData = await request.formData();
		const petId = formData.get('id');

		try {
			const response = await fetch(`http://localhost:3000/api/pets/${petId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.ok) {
				return {
					success: true as const,
					message: 'Pet deleted successfully!'
				};
			} else {
				return fail(400, {
					error: 'Failed to delete pet'
				});
			}
		} catch (error) {
			return fail(500, {
				error: 'Network error. Please try again.'
			});
		}
	},

	// Logout
	logout: async ({ cookies }) => {
		cookies.delete('auth_token', { path: '/' });
		cookies.delete('user', { path: '/' });
		throw redirect(303, '/login');
	}
};
