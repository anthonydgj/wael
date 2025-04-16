<script lang="ts">
	let { children } = $props();
</script>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		background-color: #222225;
		color: #adaeb3;

		a {
			color: #a0a0ff;
			text-decoration: none;
		}
		a:visited {
			color: #a4abee;
		}

		.header {
			padding: 1rem;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.title {
				margin: 0
			}

			.intro-text {
				max-width: 70rem;
				padding-left: 1rem;
			}
		}

		.content-container {
			flex-grow: 1;
			margin: 0.5rem;
		}
	}
</style>

<div class="container">
	<div class="header">
		<h2 class="title">
			<a href="https://github.com/anthonydgj/wael" target="_blank">WAEL</a>
			Interpreter
		</h2>
		<div class="intro-text">
			Type <pre style="display: inline;">&semi;&semi;</pre> then Enter 
			to evaluate WAEL expressions.
		</div>
	</div>

	<div class="content-container">
		{@render children()}
	</div>
</div>
