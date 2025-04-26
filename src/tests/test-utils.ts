import { Options, OutputFormat, Wael } from '../main';

export const DEFAULT_OPTIONS: Options = {
    outputFormat: OutputFormat.GeoJSON,
    outputNonGeoJSON: true
};

export const defaultEval = (input: string, opts = DEFAULT_OPTIONS) => 
    new Wael().evaluate(input, {...DEFAULT_OPTIONS, ...opts});
