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
        let angleIncrement = (2 * Math:PI) / count;
        count >> (i => (
            let angle = i * angleIncrement;
            Point(
                (radius * Math:cos(angle))
                (radius * Math:sin(angle))
            )
        ))
    );

    # Create a grid of points
    export let PointGrid = (x, y, spacing) => (
        let spacing = if (spacing == undefined) then (1) else (spacing);
        x >> (xCoord => (
            y >> (yCoord => (
                (xCoord yCoord) * spacing))))
    );

    # Rotate a geometry
    export let _Rotate = (angleDegrees, origin, geometry) => (
        let origin = if (origin == undefined) then (0 0) else (origin);
        geometry |* (p) => (
            let angleRadians = (angleDegrees * Math:PI) / -180;
            Point(
                ((origin:x + (p:x - origin:x) * Math:cos(angleRadians) - (p:y - origin:y) * Math:sin(angleRadians)))
                ((origin:y + (p:x - origin:x) * Math:sin(angleRadians) + (p:y - origin:y) * Math:cos(angleRadians)))
            )
        )
    );

    # Return a function that rotates a geometry
    export let Rotate = (deg, origin) => (
        let _rotate = _Rotate;
        (val) => (_rotate(deg, origin, val))
    );
    
    # Round number or coordinate values 
    export let _Round = (precision, value) => (
        let precision = if (precision == undefined) then (0) else (precision);
        if (value:type == undefined) then (
            let factor = 10 ^ precision;
            Math:round(value * factor) / factor
        ) else (
            value |* (p) => (Point(_Round(precision, p:x) _Round(precision, p:y)))
        )
    );

    # Return a function that rounds a number
    export let Round = (precision) => (
        let _round = _Round;
        (val) => (_round(precision, val))
    );
    
    # Check if two points have equal coordinates
    export let PointsEqual = (p1, p2) => (
        if (p1 == undefined or p2 == undefined) then (false) else (
            if (p1:x == p2:x and p1:y == p2:y) 
                then (true)
                else (false)
        ) 
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
    export let ToGeometryCollection = getPoints;

    # Generate geometries
    export let _Generate = (c, fn) => (c >> fn);
    export let Generate = (c) => (let count = c; (fn) => (_Generate(count, fn)));

    "StdLib"
)
`