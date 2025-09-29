export const STD_LIB = String.raw`
export let StdLib = () => (
    # Flatten any nested GeometryCollection values
    export let Flatten = (collection) => (
        collection |> (total, g) => (
            total ++ if (g:type == GeometryCollection)
            then (Flatten(g))
            else (g)
        )
    );

    # Create a circle of points
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

    # Create a grid of points
    export let PointGrid = (x, y, spacing) => (
        Generate x (xCoord => (
            Generate y (yCoord => (
                (xCoord yCoord) * spacing))))
    );

    # Rotate a geometry
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
    
    # Round number or coordinate values 
    export let _Round = (precision, value) => (
        let prec = if (precision == undefined) then (1) else (precision);
        if (value:type == undefined) then (
            let factor = 10 ^ prec;
            Math:round(value * factor) / factor
        ) else (
            value |* (p) => (Point(_Round(p:x) _Round(p:y)))
        )
    );
    export let Round = ((precision) => (val => _Round(precision, val)));
    
    # Check if two points have equal coordinates
    export let PointsEqual = (p1, p2) => (
        if (p1:x == p2:x and p1:y == p2:y) 
            then (true)
            else (false)
    );

    let getPoints = (value) => (GeometryCollection() ++ value |> (cur, total) => (cur ++ total));
    
    # Convert an array-like geometry to a LineString
    export let ToLineString = (value) => (getPoints(value) | (p) => (LineString(...p)));
    
    # Convert an array-like geometry to a MultiPoint
    export let ToMultiPoint = (value) => (getPoints(value) | (p) => (MultiPoint(...p)));
   
    # Convert an array-like geometry to a Polygon
    export let ToPolygon = (value) => (
        getPoints(value) | (p) => (
            if (PointsEqual(p:geometryN(0), p:geometryN(p:numGeometries - 1)) == true) then (
                Polygon((...p))
            ) else (
                let closed = p ++ p:geometryN(0);
                Polygon((...closed))
            )
        )
    );

    # Convert an array-like geometry to a GeometryCollection
    export let ToGeometryCollection = (v) => (v |> (total, curr) => (total ++ curr));

    "StdLib"
)
`