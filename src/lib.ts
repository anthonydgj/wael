export const STD_LIB = String.raw`
export let StdLib = () => (
    export let Flatten = (collection) => (
        collection |> (total, g) => (
            total ++ if (g:type == GeometryCollection)
            then (Flatten(g))
            else (g)
        )
    );
    export let PointCircle = (radius, count) => (
        (2 * Math:PI) / count | (angleIncrement => (
            Generate count (i => (
                (i * angleIncrement) | (angle) => (
                    Point(
                        (radius * Math:cos(angle))
                        (radius * Math:sin(angle))
                    )
                )
            ))
        ))
    );
    export let PointGrid = (x, y, spacing) => (
        Generate x (xCoord => (
            Generate y (yCoord => (
                (xCoord yCoord) * spacing))))
    );
    export let _Rotate = (angleDegrees, origin, geometry) => (
        origin = if (origin == undefined) then (0 0) else (origin);
        geometry |* (p) => (
            (angleDegrees * Math:PI) / -180 | (angleRadians) => (
                Point(
                    ((origin:x + (p:x - origin:x) * Math:cos(angleRadians) - (p:y - origin:y) * Math:sin(angleRadians)))
                    ((origin:y + (p:x - origin:x) * Math:sin(angleRadians) + (p:y - origin:y) * Math:cos(angleRadians)))
                )
            )
        )
    );
    export let Rotate = ((deg, origin) => (val => _Rotate(deg, origin, val)));
    export let _Round = (precision, value) => (
        if (value:type == undefined) then (
            let factor = 10 ^ precision;
            Math:round(value * factor) / factor
        ) else (
            value |* (p) => (Point(_Round(p:x) _Round(p:y)))
        )
    );
    export let Round = ((precision) => (val => _Round(precision, val)));
    let getPoints = (value) => (GeometryCollection() ++ value |> (cur, total) => (cur ++ total));
    export let ToLineString = (value) => (getPoints(value) | (p) => LineString(...p));
    "StdLib"
)
`