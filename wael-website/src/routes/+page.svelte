<script lang="ts">
    import { onMount } from 'svelte';
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalOptions,
		ITerminalInitOnlyOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
    import { Readline } from "xterm-readline";

	let terminal: Terminal;
    const PROMPT = '> '
    const END_TEXT = ';;'
    let rl: Readline | undefined = undefined;

	let options: ITerminalOptions & ITerminalInitOnlyOptions = {
        cursorBlink: true
	};

    onMount(async () => {
        rl = new Readline();
    });

	async function onLoad() {

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal.loadAddon(fitAddon);
		fitAddon.fit();


        if (rl) {
            terminal.loadAddon(rl);

            rl.setCheckHandler((text) => {
                let trimmedText = text.trimEnd();
                if (trimmedText.endsWith(END_TEXT)) {
                    return true;
                }
                return false;
            });

            function readLine() {
                if (rl) {
                    rl.read(PROMPT).then(processLine);
                }
            }

            function processLine(text: string) {
                if (rl) {
                    setTimeout(readLine);
                }
            }

            readLine();

        }

	}
</script>

<Xterm bind:terminal {options} {onLoad} />
