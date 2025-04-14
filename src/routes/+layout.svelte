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
			padding: 0 0.5rem;

			.intro-text {
				max-width: 70rem;
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
		<h2>WAEL Interpreter</h2>
		<div class="intro-text">
			Type <pre style="display: inline;">&semi;&semi;</pre> then Enter 
			to evaluate WAEL expressions. See the project 
			<a href="https://github.com/anthonydgj/wael/blob/main/README.md" target="_blank">README</a> 
			for details about the language syntax.
		</div>
	</div>

	<div class="content-container">
		{@render children()}
	</div>
</div>
