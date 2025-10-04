<script lang="ts">
	import { goto } from '$app/navigation';
	function gotoRegister() {
		goto('/register');
	}

	function gotoLogin() {
		goto('/login');
	}
</script>

<nav>
	<div class="nav-container">
		<a href="#brand" class="brand">SmartPet</a>
		<ul class="nav-menu">
			<li><a href="#home">Home</a></li>
			<li><a href="#about">About</a></li>
			<li><a href="#contact">Contact</a></li>
		</ul>
		<div class="nav-btn-container">
			<button class="btn-signup" onclick={gotoRegister}>Sign Up</button>
			<button class="btn-login" onclick={gotoLogin}>Login</button>
		</div>
	</div>
</nav>

<main class="main">
	<div class="right-main">
		<h1 class="right-header">Software that will make your tail wag</h1>
		<p class="right-paragraph">
			Sofware designed for pet groomers, daycare, providers, and boarding facilities
		</p>
	</div>
</main>

<style>
	nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background-color: whitesmoke;
		z-index: 1000;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}
	.brand {
		margin: 50px;
		font-size: 30px;
		font-weight: bold;
	}
	.nav-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 50px;
	}

	ul li a {
		font-family: 'Courier New', Courier, monospace;
		font-size: 20px;
	}

	.nav-menu {
		display: flex;
	}

	.nav-menu * {
		margin: 50px;
	}

	.nav-btn-container * {
		margin: 20px;
	}

	.btn-signup {
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		font-size: 20px;
	}

	.btn-login {
		cursor: pointer;
		font-family: 'Courier New', Courier, monospace;
		font-size: 20px;
	}

	.main {
		background-image: url(/src/lib/assets/Pet.png);
		background-size: cover;
		background-repeat: no-repeat;
		background-position: center;
		background-attachment: fixed;
		height: 100vh;
		width: 100%;
		margin-top: 50px;
		display: flex;
		justify-content: space-between;
	}

	.right-main {
		padding: 20px;
		width: 50%;
	}

	.right-header {
		font-size: 50px;
		font-weight: bold;
		font-family: 'Courier New', Courier, monospace;
		text-wrap: wrap;
		margin: auto;
		line-height: normal;
		margin-top: 20rem;
	}

	.right-paragraph {
		font-size: 20px;
		font-family: 'Courier New', Courier, monospace;
	}
</style>
