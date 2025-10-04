export interface User {
	[x: string]: number | string;
	id: number;
	username: string;
	email: string;
	role: string;
}

export interface Pet {
	id: number;
	name: string;
	species: string;
	breed: string;
	age: number;
	owner_id: number;
	owner_username?: string;
}
