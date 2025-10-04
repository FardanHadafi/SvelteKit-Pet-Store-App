<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import { onMount } from 'svelte';

	// --- TYPE DEFINITIONS ---
	// These should ideally be in a shared types file (e.g., src/app.d.ts)
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

	// Data from the server's `load` function
	export let data;
	// Result from form actions
	export let form;

	// Destructure data for easier access in the template
	let { users, pets, currentUser, error } = data;

	// --- LOCAL UI STATE ---
	let activeTab: 'users' | 'pets' | 'my-pets' | 'add-pet' = 'my-pets';
	let loading = true;

	// Pet form state
	let editingPet: Pet | null = null;
	let petForm: Omit<Pet, 'id' | 'owner_id' | 'owner_username'> = {
		name: '',
		species: '',
		breed: '',
		age: 0
	};
	let petLoading = false; // For form submission state

	// Reactive statement to update local pets list after deletion
	$: if (form?.success && form?.deletedPetId) {
		pets = pets.filter((p) => p.id !== Number(form.deletedPetId));
	}

	// --- UI HANDLERS ---
	function startEditPet(pet: Pet) {
		editingPet = pet;
		petForm = {
			name: pet.name,
			species: pet.species,
			breed: pet.breed,
			age: pet.age
		};
		activeTab = 'add-pet';
	}

	function resetPetForm() {
		petForm = { name: '', species: '', breed: '', age: 0 };
		editingPet = null;
	}

	function handleFormSubmit() {
		petLoading = true;
	}

	function handleFormResult({ result }: { result: ActionResult }) {
		petLoading = false;
		if (result.type === 'success') {
			// In a real app, you'd invalidate data to refetch from the server:
			// `await invalidateAll();`
			// For now, we'll just reset the form and switch tabs.
			resetPetForm();
			activeTab = 'my-pets';
			// You would need to refetch pets to see the new/updated one.
			// SvelteKit's `invalidateAll()` from `@sveltejs/kit` is perfect for this.
		}
	}

	onMount(() => {
		loading = false;
	});
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="dashboard">
	<!-- Header -->
	<header class="dashboard-header">
		<div class="header-content">
			<h1>Pet Management Dashboard</h1>
			{#if currentUser}
				<div class="user-info">
					<span>Welcome, <strong>{currentUser.username}</strong> ({currentUser.role})</span>
					<form method="POST" action="?/logout" use:enhance>
						<button type="submit" class="logout-btn">Logout</button>
					</form>
				</div>
			{/if}
		</div>
	</header>

	<!-- Navigation Tabs -->
	<nav class="tabs">
		<button class:active={activeTab === 'my-pets'} on:click={() => (activeTab = 'my-pets')}>
			My Pets
		</button>
		<button
			class:active={activeTab === 'add-pet'}
			on:click={() => {
				resetPetForm();
				activeTab = 'add-pet';
			}}
		>
			{editingPet ? 'Edit Pet' : 'Add Pet'}
		</button>
		{#if currentUser?.role === 'admin'}
			<button class:active={activeTab === 'users'} on:click={() => (activeTab = 'users')}>
				All Users
			</button>
			<button class:active={activeTab === 'pets'} on:click={() => (activeTab = 'pets')}>
				All Pets
			</button>
		{/if}
	</nav>

	<!-- Main Content -->
	<main class="dashboard-content">
		{#if loading}
			<div class="loading">Loading...</div>
		{:else if error}
			<div class="error-alert">{error}</div>
		{:else}
			<!-- My Pets Tab -->
			{#if activeTab === 'my-pets'}
				{@const myPets = pets.filter((pet) => pet.owner_id === currentUser?.id)}
				<div class="tab-content">
					<h2>My Pets</h2>
					{#if myPets.length === 0}
						<div class="empty-state">
							<p>You haven't added any pets yet.</p>
							<button on:click={() => (activeTab = 'add-pet')} class="btn-primary">
								Add Your First Pet
							</button>
						</div>
					{:else}
						<div class="pets-grid">
							{#each myPets as pet (pet.id)}
								<div class="pet-card">
									<h3>{pet.name}</h3>
									<div class="pet-details">
										<p><strong>Species:</strong> {pet.species}</p>
										<p><strong>Breed:</strong> {pet.breed}</p>
										<p><strong>Age:</strong> {pet.age} years</p>
									</div>
									<div class="pet-actions">
										<button on:click={() => startEditPet(pet)} class="btn-edit">Edit</button>
										<form method="POST" action="?/deletePet" use:enhance>
											<input type="hidden" name="id" value={pet.id} />
											<button type="submit" class="btn-delete">Delete</button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Add/Edit Pet Tab -->
			{#if activeTab === 'add-pet'}
				<div class="tab-content">
					<h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
					<form
						method="POST"
						action={editingPet ? '?/updatePet' : '?/addPet'}
						use:enhance={() => {
							handleFormSubmit();
							return handleFormResult;
						}}
						class="pet-form"
					>
						{#if editingPet}
							<input type="hidden" name="id" value={editingPet.id} />
						{/if}
						<div class="form-group">
							<label for="name">Pet Name</label>
							<input
								id="name"
								name="name"
								type="text"
								bind:value={petForm.name}
								required
								placeholder="Enter pet name"
							/>
						</div>

						<div class="form-group">
							<label for="species">Species</label>
							<input
								id="species"
								name="species"
								type="text"
								bind:value={petForm.species}
								required
								placeholder="e.g., Dog, Cat, Bird"
							/>
						</div>

						<div class="form-group">
							<label for="breed">Breed</label>
							<input
								id="breed"
								name="breed"
								type="text"
								bind:value={petForm.breed}
								required
								placeholder="Enter breed"
							/>
						</div>

						<div class="form-group">
							<label for="age">Age (years)</label>
							<input
								id="age"
								name="age"
								type="number"
								bind:value={petForm.age}
								required
								min="0"
								max="50"
							/>
						</div>

						{#if form?.error}
							<div class="error-alert" style="margin-bottom: 1rem;">{form.error}</div>
						{/if}

						<div class="form-actions">
							<button type="submit" disabled={petLoading} class="btn-primary">
								{petLoading ? 'Saving...' : editingPet ? 'Update Pet' : 'Add Pet'}
							</button>
							{#if editingPet}
								<button
									type="button"
									on:click={() => {
										resetPetForm();
										activeTab = 'my-pets';
									}}
									class="btn-secondary"
								>
									Cancel
								</button>
							{/if}
						</div>
					</form>
				</div>
			{/if}

			<!-- All Users Tab (Admin only) -->
			{#if activeTab === 'users' && currentUser?.role === 'admin'}
				<div class="tab-content">
					<h2>All Users</h2>
					<div class="users-table">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Username</th>
									<th>Email</th>
									<th>Role</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each users as user}
									<tr>
										<td>{user.id}</td>
										<td>{user.username}</td>
										<td>{user.email}</td>
										<td><span class="role-badge {user.role}">{user.role}</span></td>
										<td class="actions">
											<button class="btn-edit">Edit</button>
											<button class="btn-delete">Delete</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- All Pets Tab (Admin only) -->
			{#if activeTab === 'pets' && currentUser?.role === 'admin'}
				<div class="tab-content">
					<h2>All Pets</h2>
					<div class="pets-table">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Name</th>
									<th>Species</th>
									<th>Breed</th>
									<th>Age</th>
									<th>Owner</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each pets as pet (pet.id)}
									<tr>
										<td>{pet.id}</td>
										<td>{pet.name}</td>
										<td>{pet.species}</td>
										<td>{pet.breed}</td>
										<td>{pet.age}</td>
										<td>{pet.owner_username || `User ${pet.owner_id}`}</td>
										<td class="actions">
											<button on:click={() => startEditPet(pet)} class="btn-edit">Edit</button>
											<form method="POST" action="?/deletePet" use:enhance>
												<input type="hidden" name="id" value={pet.id} />
												<button type="submit" class="btn-delete">Delete</button>
											</form>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		{/if}
	</main>
</div>

<style>
	/* All your original styles are preserved here */
	.dashboard {
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	.dashboard-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-content h1 {
		margin: 0;
		font-size: 1.8rem;
		font-weight: 600;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.logout-btn {
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.3);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.logout-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.tabs {
		background: white;
		border-bottom: 1px solid #e1e5e9;
		padding: 0 2rem;
		display: flex;
		gap: 0;
	}

	.tabs button {
		padding: 1rem 2rem;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		font-size: 1rem;
		color: #666;
		transition: all 0.3s ease;
	}

	.tabs button.active {
		color: #667eea;
		border-bottom-color: #667eea;
		background-color: #f8f9ff;
	}

	.tabs button:hover:not(.active) {
		background-color: #f8f9fa;
	}

	.dashboard-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.loading,
	.error-alert {
		text-align: center;
		padding: 2rem;
		font-size: 1.1rem;
	}

	.error-alert {
		background: #fee;
		color: #c33;
		border: 1px solid #fcc;
		border-radius: 6px;
	}

	.tab-content h2 {
		margin-bottom: 1.5rem;
		color: #333;
	}

	.pets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.pet-card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		border: 1px solid #e1e5e9;
	}

	.pet-card h3 {
		margin: 0 0 1rem 0;
		color: #333;
		font-size: 1.3rem;
	}

	.pet-details p {
		margin: 0.5rem 0;
		color: #666;
	}

	.pet-actions {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;
	}
	.pet-actions form {
		margin: 0;
	}

	.pet-form {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		max-width: 500px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #333;
	}

	.form-group input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e1e5e9;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
	}

	.btn-primary,
	.btn-secondary,
	.btn-edit,
	.btn-delete {
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.3s ease;
		color: white;
	}

	.btn-primary {
		background: #667eea;
	}
	.btn-primary:hover:not(:disabled) {
		background: #5a6fd8;
	}
	.btn-primary:disabled {
		background: #b0b7d3;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: #6c757d;
	}
	.btn-secondary:hover {
		background: #5a6268;
	}

	.btn-edit {
		background: #28a745;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}
	.btn-edit:hover {
		background: #218838;
	}

	.btn-delete {
		background: #dc3545;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}
	.btn-delete:hover {
		background: #c82333;
	}

	.users-table,
	.pets-table {
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 1rem;
		text-align: left;
		border-bottom: 1px solid #e1e5e9;
	}
	th {
		background: #f8f9fa;
		font-weight: 600;
		color: #333;
	}

	td.actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.role-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
	}
	.role-badge.admin {
		background: #dc3545;
		color: white;
	}
	.role-badge.user {
		background: #28a745;
		color: white;
	}
	.role-badge.moderator {
		background: #ffc107;
		color: #212529;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		background: white;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.empty-state p {
		margin-bottom: 1.5rem;
		color: #666;
		font-size: 1.1rem;
	}
</style>
