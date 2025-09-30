import * as turf from '@turf/turf';
import * as wellknown from 'wellknown';

import { Interpreter } from "./interpreter/interpreter";
import { STD_LIB } from './lib';
import { Scope } from "./interpreter/scope";
import { moduleToString } from './interpreter/helpers';

export enum OutputFormat {
    WKT = 'WKT',
    GeoJSON = 'GeoJSON'
}

export interface Options {
    outputFormat?: OutputFormat,
    outputNonGeoJSON?: boolean;
    scope?: Scope;
    storeHistoricalEvaluations?: boolean;
    workingDirectory?: string;
    useStdLib?: boolean
}

export const DEFAULT_OPTIONS: Options = {
    outputFormat: OutputFormat.WKT,
    storeHistoricalEvaluations: true
}

export class Wael {
    private options: Options;
    private evaluationCount = 0;
    static IDENTIFIER_LAST = '$?';

    constructor(
        initialOptions?: Options
    ) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...initialOptions,
            scope: initialOptions?.scope ?? Interpreter.createGlobalScope(),
        };

        // Import standard library
        Interpreter.evaluateInput(`${STD_LIB}`, this.options.scope);
        if (this.options?.useStdLib) {
            this.useStdLib();
        }

    }

    getEvaluationCount(): number {
        return this.evaluationCount;
    }

    evaluate(input: string, overrideOptions?: Partial<Options>) {
        const options = {
            ...this.options,
            ...overrideOptions
        };

        if (!this.options?.useStdLib && overrideOptions?.useStdLib) {
            this.useStdLib();
        }

        const result = Interpreter.evaluateInput(input, options.scope, options.workingDirectory);

        // Track evaluations
        options.scope?.store(Wael.IDENTIFIER_LAST, result);
        if (options.storeHistoricalEvaluations) {
            const indexedResultLabel = `$${this.evaluationCount}`;
            options.scope?.store(indexedResultLabel, result);
        }
        this.evaluationCount++;

        if (typeof result === 'object' && typeof result?.type === 'string') {
            switch (options?.outputFormat) {
                case OutputFormat.WKT:
                    return wellknown.stringify(result);
                case OutputFormat.GeoJSON:
                    return turf.feature(result) as any;
                default:
                    break;
            }
        }

        const output = Wael.getOutputString(result, options.outputFormat);
        if (options.outputNonGeoJSON) {
            if (options.outputFormat === OutputFormat.GeoJSON) {
                return result ?? undefined;
            }
            return output;
        } else {
            const outputString = typeof output === 'string' ? output : JSON.stringify(output, undefined, 2)
            throw new Error(`Invalid '${options.outputFormat}' evaluation result: ${outputString}`)
        }
    }

    private useStdLib() {
        Interpreter.evaluateInput(`Use(StdLib()) With (*)`, this.options.scope)
    }

    static evaluate(input: string, options?: Partial<Options>) {
        return new Wael(options).evaluate(input);
    }

    private static getOutputString(result: any, outputFormat?: OutputFormat) {
        if (!result?.hasOwnProperty('toString')) {
            if (typeof result === 'object') {
                return moduleToString(result);
            }
            if (typeof result === 'string') {
                return `"${result}"`;
            }
        }
        return `${result}`;
    }
}

