<script lang="ts">
    import { onMount } from 'svelte';
	import { Xterm, XtermAddon } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalOptions,
		ITerminalInitOnlyOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
    import { Readline } from "xterm-readline";
    import { Wael } from 'wael-lib';

	let terminal: Terminal;
    const INTRO = `# WAEL Interpreter`
    const PROMPT = '> '
    const END_TEXT = ';;'
    let rl: Readline | undefined = undefined;
    const interpreter = new Wael();

	let options: ITerminalOptions & ITerminalInitOnlyOptions = {
        cursorBlink: true,
        
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
                    const trimmed = text.trim();
                    try {
                        const result = interpreter.evaluate(trimmed.slice(0, trimmed.length - 2))
                        rl.println(result)
                    } catch(err: any) {
                        console.log(err)
                        rl.println(err.message)
                    }
                    setTimeout(readLine);
                }
            }

            readLine();

        }

	}
</script>


<Xterm bind:terminal style="height:100%" {options} {onLoad} />
