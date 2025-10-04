import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Get token from cookies
	const token = event.cookies.get('auth_token');
	const userStr = event.cookies.get('user');

	// ✅ CHECK IF userStr EXISTS before parsing
	if (token && userStr) {
		try {
			event.locals.user = JSON.parse(userStr);
			event.locals.token = token;
		} catch (error) {
			console.error('Failed to parse user cookie:', error);
			// Clear invalid cookies
			event.cookies.delete('auth_token', { path: '/' });
			event.cookies.delete('user', { path: '/' });
		}
	}

	// Protected routes
	const protectedRoutes = ['/dashboard', '/profile', '/admin'];
	const isProtectedRoute = protectedRoutes.some((route) => event.url.pathname.startsWith(route));

	// ✅ Redirect to login if accessing protected route without auth
	if (isProtectedRoute && !token) {
		throw redirect(303, '/login');
	}

	return resolve(event);
};
