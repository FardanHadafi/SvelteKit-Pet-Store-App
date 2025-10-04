<script lang="ts">
	import { goto } from '$app/navigation';

	// Form data interface matching Go struct
	interface UserLoginRequest {
		username: string;
		password: string;
	}

	// Form state
	let formData: UserLoginRequest = {
		username: '',
		password: ''
	};

	let errors: Partial<Record<keyof UserLoginRequest, string>> = {};
	let isLoading = false;
	let apiError = '';

	// Validation function
	function validateForm(): boolean {
		errors = {};
		apiError = '';

		if (!formData.username.trim()) {
			errors.username = 'Username is required';
		}

		if (!formData.password) {
			errors.password = 'Password is required';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		if (!validateForm()) {
			return;
		}

		isLoading = true;
		apiError = '';
		const token = localStorage.getItem('auth_token');

		try {
			const response = await fetch('http://localhost:3000/api/users', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (response.ok) {
				// Login successful - store token and user data
				if (data.token) {
					localStorage.setItem('auth_token', data.token);
				}
				if (data.user) {
					localStorage.setItem('user', JSON.stringify(data.user));
				}

				// Redirect to dashboard or home page
				await goto('/dashboard');
			} else {
				// Handle login errors
				apiError = data.message || data.error || 'Login failed';
			}
		} catch (error) {
			console.error('Login error:', error);
			apiError = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function goToRegister() {
		goto('/register');
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<h1>Welcome Back</h1>
		<p class="subtitle">Sign in to your account</p>

		{#if apiError}
			<div class="alert alert-error">
				{apiError}
			</div>
		{/if}

		<form on:submit={handleSubmit} class="auth-form">
			<div class="form-group">
				<label for="username">Username</label>
				<input
					id="username"
					name="username"
					type="text"
					bind:value={formData.username}
					class:error={errors.username}
					placeholder="Enter your username"
					required
				/>
				{#if errors.username}
					<span class="error-message">{errors.username}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					id="password"
					type="password"
					bind:value={formData.password}
					class:error={errors.password}
					placeholder="Enter your password"
					required
				/>
				{#if errors.password}
					<span class="error-message">{errors.password}</span>
				{/if}
			</div>

			<button type="submit" class="submit-btn" disabled={isLoading}>
				{isLoading ? 'Signing In...' : 'Sign In'}
			</button>
		</form>

		<div class="auth-footer">
			<p>
				Don't have an account? <a href="/register" on:click|preventDefault={goToRegister}>Sign Up</a
				>
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

	input {
		padding: 12px;
		border: 2px solid #e1e5e9;
		border-radius: 6px;
		font-size: 16px;
		transition: border-color 0.3s ease;
	}

	input:focus {
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
