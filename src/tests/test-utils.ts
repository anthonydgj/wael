import { Options, OutputFormat, Wael } from '../main';

export const DEFAULT_OPTIONS: Options = {
    outputFormat: OutputFormat.GeoJSON,
    outputNonGeoJSON: true,
    useStdLib: true
};

export const defaultEval = (input: string, opts = {}) => {
    const options = { ...DEFAULT_OPTIONS, ...opts }
    return new Wael().evaluate(input, options);
}
