<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	// Data from server
	export let data: PageData;
	export let form: any; // Use 'any' for form to avoid TypeScript errors

	// Simple state
	let activeTab = 'my-pets';

	// Get current user and pets from data
	$: currentUser = data.user;
	$: myPets = data.user.filter((pet: { owner_id: any }) => pet.owner_id === currentUser?.id);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="dashboard">
	<!-- Header -->
	<header>
		<h1>Pet Dashboard</h1>
		{#if currentUser}
			<div class="user-info">
				<span>Welcome, {currentUser.username}</span>
				<form method="POST" action="?/logout" use:enhance>
					<button type="submit">Logout</button>
				</form>
			</div>
		{:else}
			<p>Not logged in</p>
		{/if}
	</header>

	<!-- Tabs -->
	<nav class="tabs">
		<button class:active={activeTab === 'my-pets'} on:click={() => (activeTab = 'my-pets')}>
			My Pets
		</button>
		<button class:active={activeTab === 'add-pet'} on:click={() => (activeTab = 'add-pet')}>
			Add Pet
		</button>
	</nav>

	<!-- Content -->
	<main>
		<!-- My Pets Tab -->
		{#if activeTab === 'my-pets'}
			<h2>My Pets</h2>

			{#if form && 'success' in form && form.success}
				<div class="success">✓ {form.message}</div>
			{/if}

			{#if form && 'error' in form}
				<div class="error">✗ {form.error}</div>
			{/if}

			{#if myPets.length === 0}
				<p>No pets yet. Add your first pet!</p>
			{:else}
				<div class="pets-grid">
					{#each myPets as pet (pet.id)}
						<div class="pet-card">
							<h3>{pet.name}</h3>
							<p><strong>Species:</strong> {pet.species}</p>
							<p><strong>Breed:</strong> {pet.breed}</p>
							<p><strong>Age:</strong> {pet.age} years</p>

							<form method="POST" action="?/deletePet" use:enhance>
								<input type="hidden" name="id" value={pet.id} />
								<button type="submit" class="btn-delete">Delete</button>
							</form>
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		<!-- Add Pet Tab -->
		{#if activeTab === 'add-pet'}
			<h2>Add New Pet</h2>

			{#if form && 'error' in form}
				<div class="error">{form.error}</div>
			{/if}

			<form method="POST" action="?/addPet" use:enhance class="pet-form">
				<div class="form-group">
					<label for="name">Pet Name</label>
					<input id="name" name="name" type="text" required placeholder="Enter pet name" />
				</div>

				<div class="form-group">
					<label for="species">Species</label>
					<input id="species" name="species" type="text" required placeholder="e.g., Dog, Cat" />
				</div>

				<div class="form-group">
					<label for="breed">Breed</label>
					<input id="breed" name="breed" type="text" required placeholder="Enter breed" />
				</div>

				<div class="form-group">
					<label for="age">Age (years)</label>
					<input id="age" name="age" type="number" required min="0" max="50" />
				</div>

				<button type="submit" class="btn-primary">Add Pet</button>
			</form>
		{/if}
	</main>
</div>

<style>
	.dashboard {
		min-height: 100vh;
		background: #f5f5f5;
	}

	header {
		background: #667eea;
		color: white;
		padding: 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	header h1 {
		margin: 0;
		font-size: 1.5rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info button {
		background: white;
		color: #667eea;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.tabs {
		background: white;
		padding: 0 1rem;
		display: flex;
		gap: 0;
		border-bottom: 2px solid #e1e5e9;
	}

	.tabs button {
		padding: 1rem 2rem;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		cursor: pointer;
		font-size: 1rem;
		color: #666;
	}

	.tabs button.active {
		color: #667eea;
		border-bottom-color: #667eea;
	}

	main {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	main h2 {
		margin-bottom: 1.5rem;
	}

	.success {
		background: #d4edda;
		color: #155724;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.error {
		background: #f8d7da;
		color: #721c24;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.pets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.5rem;
	}

	.pet-card {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.pet-card h3 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.pet-card p {
		margin: 0.5rem 0;
		color: #666;
	}

	.pet-card form {
		margin-top: 1rem;
	}

	.pet-form {
		background: white;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
		border-radius: 4px;
		font-size: 1rem;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
	}

	.btn-primary {
		background: #667eea;
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	.btn-primary:hover {
		background: #5a6fd8;
	}

	.btn-delete {
		background: #dc3545;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.btn-delete:hover {
		background: #c82333;
	}
</style>
