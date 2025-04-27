export const STD_LIB =  String.raw`
() => (
    export Rotate = ((deg, origin) => (val => _Rotate(deg, origin, val)));
    export Round = ((precision) => (val => _Round(precision, val)));
    true
)
`