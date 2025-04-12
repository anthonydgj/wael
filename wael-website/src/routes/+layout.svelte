<!-- @migration-task Error while migrating Svelte code: Expected a `@` character immediately following the opening bracket
https://svelte.dev/e/block_unexpected_character -->
<script lang="ts">
	let { children } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
</nav>

{@render children()}