import * as turf from '@turf/turf';
import * as wellknown from 'wellknown';

import { Interpreter } from "./interpreter/interpreter";
import { Scope } from "./interpreter/scope";

export enum OutputFormat {
    WKT = 'WKT',
    GeoJSON = 'GeoJSON'
}

export interface Options {
    outputFormat?: OutputFormat,
    scope?: Scope;
    storeHistoricalEvaluations?: boolean;
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
            scope: Interpreter.createGlobalScope()
        };
    }

    getEvaluationCount(): number {
        return this.evaluationCount;
    }

    evaluate(input: string, overrideOptions?: Partial<Options>) {
        const options = {
            ...this.options,
            ...overrideOptions
        };
        const result = Interpreter.evaluateInput(input, options.scope);

        // Track evaluations
        options.scope?.store(Wael.IDENTIFIER_LAST, result);
        if (options.storeHistoricalEvaluations) {
            const indexedResultLabel = `$${this.evaluationCount}`;
            options.scope?.store(indexedResultLabel, result);
        }
        this.evaluationCount++;

        // Return result
        if (result === null) {
            return undefined;
        }
        if (typeof result === 'object') {
            switch(options?.outputFormat) {
                case OutputFormat.WKT:
                    return wellknown.stringify(result);
                case OutputFormat.GeoJSON:
                    return turf.feature(result) as any;
                default:
                    break;
            }
        }

        return result;
    }

    static evaluate(input: string, options?: Partial<Options>) {
        return new Wael(options).evaluate(input);
    }
}
