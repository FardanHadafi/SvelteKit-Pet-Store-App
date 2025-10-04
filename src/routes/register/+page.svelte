<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	// Initialize form data with server data or defaults
	let formData = {
		username: form?.formData?.username || '',
		email: form?.formData?.email || '',
		password: form?.formData?.password || '',
		role: form?.formData?.role || 'user'
	};

	function goToLogin() {
		goto('/login');
	}
</script>

<svelte:head>
	<title>Register</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>Create Account</h1>
		<p class="subtitle">Join us today</p>

		{#if form?.apiError}
			<div class="alert alert-error">
				{form.apiError}
			</div>
		{/if}

		<form method="POST" use:enhance class="auth-form">
			<div class="form-group">
				<label for="username">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					bind:value={formData.username}
					class:error={form?.errors?.username}
					placeholder="Enter your username (3-50 characters)"
					required
				/>
				{#if form?.errors?.username}
					<span class="error-message">{form.errors.username}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="email">Email</label>
				<input
					id="email"
					name="email"
					type="email"
					bind:value={formData.email}
					class:error={form?.errors?.email}
					placeholder="Enter your email"
					required
				/>
				{#if form?.errors?.email}
					<span class="error-message">{form.errors.email}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					name="password"
					type="password"
					bind:value={formData.password}
					class:error={form?.errors?.password}
					placeholder="Enter your password (min 6 characters)"
					required
				/>
				{#if form?.errors?.password}
					<span class="error-message">{form.errors.password}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="role">Role (Optional)</label>
				<select id="role" name="role" bind:value={formData.role}>
					<option value="user">User</option>
					<option value="admin">Admin</option>
					<option value="moderator">Moderator</option>
				</select>
			</div>

			<button type="submit" class="submit-btn"> Sign Up </button>
		</form>

		<div class="auth-footer">
			<p>
				Already have an account? <a href="/login" on:click|preventDefault={goToLogin}>Sign In</a>
			</p>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.auth-card {
		background: white;
		padding: 40px;
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		width: 100%;
		max-width: 400px;
	}

	h1 {
		text-align: center;
		color: #333;
		margin-bottom: 8px;
		font-weight: 600;
	}

	.subtitle {
		text-align: center;
		color: #666;
		margin-bottom: 30px;
	}

	.alert {
		padding: 12px;
		border-radius: 6px;
		margin-bottom: 20px;
		text-align: center;
	}

	.alert-error {
		background-color: #fee;
		color: #c33;
		border: 1px solid #fcc;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	label {
		font-weight: 500;
		color: #333;
		margin-bottom: 6px;
	}

	input,
	select {
		padding: 12px;
		border: 2px solid #e1e5e9;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.3s ease;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #667eea;
	}

	input.error {
		border-color: #e74c3c;
	}

	.error-message {
		color: #e74c3c;
		font-size: 14px;
		margin-top: 4px;
	}

	.submit-btn {
		padding: 14px;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.3s ease;
	}

	.submit-btn:hover:not(:disabled) {
		background: #5a6fd8;
	}

	.submit-btn:disabled {
		background: #b0b7d3;
		cursor: not-allowed;
	}

	.auth-footer {
		text-align: center;
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #e1e5e9;
	}

	.auth-footer a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
	}

	.auth-footer a:hover {
		text-decoration: underline;
	}
</style>
