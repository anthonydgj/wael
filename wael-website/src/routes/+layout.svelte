<!-- @migration-task Error while migrating Svelte code: Expected a `@` character immediately following the opening bracket
https://svelte.dev/e/block_unexpected_character -->
<script lang="ts">
	let { children } = $props();
	export const prerender = true;
</script>

<style>
	.container {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		background-color: #2b2e37;
		color: #bbbcc0;

		a {
			color: #a0a0ff;
			text-decoration: none;
		}
		a:visited {
			color: #a4abee;
		}

		.header {
			padding: 0 0.5rem
		}

		.content-container {
			flex-grow: 1;
			margin: 0.5rem;
		}
	}
</style>

<div class="container">
	<div class="header">
		<h2>Well-Known Text Arithmetic Language (WAEL) Interpreter</h2>
		<div>
			The terminal below can be used to evaluate WAEL expressions. Type <pre style="display: inline;">&semi;&semi;</pre> then press Enter to evaluate expresions. See the project 
			<a href="https://github.com/anthonydgj/wael/blob/main/README.md" target="_blank">README</a> 
			for details about the language syntax.
		</div>
	</div>

	<div class="content-container">
		{@render children()}
	</div>
</div>
