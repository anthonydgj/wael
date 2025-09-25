export const STD_LIB = String.raw`
export let StdLib = () => (
    export let Flatten = (collection) => (
        collection |> (total, g) => (
            total ++ if (g:type == GeometryCollection)
            then (Flatten(g))
            else (g)
        )
    );
    export let Rotate = ((deg, origin) => (val => _Rotate(deg, origin, val)));
    export let Round = ((precision) => (val => _Round(precision, val)));
    "StdLib"
)
`