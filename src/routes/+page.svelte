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

    // const c = require('ansi-colors');
    import * as c from 'ansi-colors';

	let terminal: Terminal;
    const PROMPT = `> `
    const END_TEXT = ';;'
    let rl: Readline | undefined = undefined;
    const interpreter = new Wael({
        outputNonGeoJSON: true,
        storeHistoricalEvaluations: true
    });

	let options: ITerminalOptions & ITerminalInitOnlyOptions = {
        cursorBlink: true,
        
	};

    onMount(async () => {
        rl = new Readline();
        rl.setCtrlCHandler(() => {
            // Do nothing
        });
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
                    rl.read(`[${interpreter.getEvaluationCount()}]${PROMPT}`).then(processLine);
                }
            }

            function processLine(text: string) {
                if (rl) {
                    const trimmed = text.trim();
                    try {
                        const result = interpreter.evaluate(trimmed.slice(0, trimmed.length - 2))
                        rl.println(`${c.blueBright(result + '')}` + '\n')
                    } catch(err: any) {
                        console.log(err)
                        rl.println(`${c.redBright(err)}` + '\n')
                    }
                    setTimeout(readLine);
                }
            }

            readLine();

        }

	}
</script>


<Xterm bind:terminal style="height:100%; opacity: 0.6;" {options} {onLoad} />
