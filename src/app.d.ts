declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				username: string;
				email: string;
				role: string;
			};
			token?: string;
		}
	}
}

export {};
