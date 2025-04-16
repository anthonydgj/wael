import * as fs from 'fs';

import { Options, OutputFormat, Wael } from "../src/main";

import { Interpreter } from '../src/interpreter/interpreter';
import chalk from 'chalk';
import { toString } from '../src/interpreter/helpers';
import yargs from 'yargs'

const readline = require('readline');
const packageJson = require('../package.json')

const input_files = 'input_files';
const version = packageJson.version;
const args = (yargs as any).command('$0', `${packageJson.description}\nVersion: ${version}`)
    .positional(input_files, {
        array: true,
        description: 'List of 1 or more input files'
    })
    .option('format', {
        choices: Object.values(OutputFormat) as OutputFormat[],
        description: 'Output format'
    })
    .option('geojson', {
        boolean: true,
        description: 'Output as GeoJSON'
    })
    .option('interactive', {
        alias: 'i',
        boolean: true,
        description: 'Launch an interactive session'
    })
    .option('evaluate', {
        alias: ['e', 'pre-evaluate'],
        string: true,
        description: `Evaluate the specified script text before [${input_files}]`
    })
    .option('post-evaluate', {
        string: true,
        description: `Evaluate the specified script text after [${input_files}]`
    })
    .option('bind-import', {
        alias: 'b',
        type: 'array',
        string: true,
        description: 'Bind imported data to a variable'
    })
    .version(version)
    .parseSync();

const getJsonString = (json: any) => {
    return JSON.stringify(json);
}

const outputFormat = args.geojson ? OutputFormat.GeoJSON : 
    args.format ? args.format : OutputFormat.WKT;
const options: Options = {
    outputFormat: outputFormat,
    scope: Interpreter.createGlobalScope()
};

const evaluateScript = args.evaluate;
const postEvaluateScript = args.postEvaluate;
const inputFiles = args._;
const isInteractive = args.interactive;
const bindImports = args.bindImport;
const highlightText = chalk.hex(`#1f91cf`);
const errorText = chalk.hex(`#bd3131`);
const subtleText = chalk.hex(`#777`);
const wael = new Wael(options);
let result: any;
let hasEvaluated = false;

const errorExit = (message: string) => {
    console.log(errorText(message));
    process.exit(-1);
}

const getSectionHeading = (label: string) => {
    const cols = process.stdout.columns;
    const filler = cols - label.length;
    const splitCount = (filler % 2 === 0 ? filler : filler - 1) / 2;
    const splitLabel = '-'.repeat(splitCount);
    let line = splitLabel + label + splitLabel;
    if (line.length < cols) {
        line += '-';
    }
    return line;
}

const printOutput = (output: string) => {
    let result = options.outputFormat === OutputFormat.GeoJSON ? getJsonString(output) : output;
    console.log(subtleText(result));
};

const prompt = (details: string = '', script = '') => {
    const line = getSectionHeading(` [${wael.getEvaluationCount()}] ${details}`);
    console.log(highlightText(line))
    if (!!script) {
        console.log(script);
    }
}

const evaluate = (script: string, heading: string) => {
    if (isInteractive) {
        prompt(heading, script);
    }
    let result = wael.evaluate(script);
    if (isInteractive) {
        printOutput(result);
    }
    return result;
}

const EXIT_CMD = `exit()`;
const END_TOKEN = `;;`;

if (isInteractive) {
const instructions = 
`Starting WAEL interactive session...

End expressions with ;; to evaluate.
The last evaluation result is stored in the ${Wael.IDENTIFIER_LAST} variable.
Previous evaluation results are stored in indexed variables $0, $1, $2, ...
`;
console.log(subtleText(instructions));
}


// Evaluate import bindings
if (bindImports) {
    for (const bindImport of bindImports) {
        const [identifier, uri] = bindImport.split('=');
        if (identifier && uri) {
            try {
                result = evaluate(`${identifier} = import('${uri.trim()}')`, `import ${identifier}`);
            } catch (err: any) {
                errorExit(`Unable to evaluate import binding "${bindImport}" \n\t${err.message}`);
            }
        } else {
            errorExit(`Unable to evaluate import binding "${bindImport}"`);
        }
    }
}

// Evaluate initial script
if (evaluateScript) {
    try {
        result = evaluate(evaluateScript, `pre-evaluate`);
    } catch (err: any) {
        errorExit(`Unable to evaluate pre-evaluate script: \n\t${err}`);
    }
    hasEvaluated = true;
}

// Evaluate files
if (inputFiles && inputFiles.length > 0) {
    inputFiles.forEach(inputFile => {
        const input = fs.readFileSync(inputFile, 'utf-8');
        result = evaluate(input, inputFile.toString())
        if (options.outputFormat === OutputFormat.GeoJSON) {
            try {
                result = getJsonString(result);
                hasEvaluated = true;
            } catch(err) {
                // return raw output
            }
        }
    });
}

// Evaluate initial script
if (postEvaluateScript) {
    try {
        result = evaluate(postEvaluateScript, `post-evaluate`);
    } catch (err: any) {
        errorExit(`Unable to evaluate 'post-evaluate' script: \n\t${err}`);
    }
    hasEvaluated = true;
}

// Run interactive mode
if (isInteractive) {
    let currentInput = ``;

    prompt();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '',
      terminal: true
    });
    
    rl.on('line', (line: string) => {
        if (line.toLocaleLowerCase() === EXIT_CMD) {
            rl.close();
        } else {
            currentInput += `${line.trim()}\n`;
            const inputEndIndex = currentInput.indexOf(END_TOKEN);
            if (inputEndIndex >= 0) {
                try {
                    let result = wael.evaluate(currentInput.substring(0, inputEndIndex), options);
                    printOutput(result);
                } catch (err) {
                    console.error(errorText(err));
                }
                prompt();
                currentInput = '';
            }
        }
    });
    
    rl.once('close', () => {
         // end of input
     });
} else {
    if (hasEvaluated) {
        if (typeof result !== 'undefined') {
            if (typeof result === 'object') {
                result = toString(result);    
            }
            console.log(result);
        }
    } else {
        yargs.showHelp();
    }
}
