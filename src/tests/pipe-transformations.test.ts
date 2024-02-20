import { defaultEval } from "./test-utils";

test('should map array-like geometries', () => {
    let result;
    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3) || Function(x => x + Point(1 1))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 2], [3, 3], [4, 4]]);
    result = defaultEval(`LineString(1 1, 2 2, 3 3) || Function(x => x + Point(1 1))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2), Point(3 3)) || Function(x => x + Point(1 1))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`Generate 3 Function(x => {x = x+1; Point(x x)}) || Function(x => LineString(x, (x + Point(1 1))))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([
        [[1, 1], [2, 2]],
        [[2, 2], [3, 3]],
        [[3, 3], [4, 4]],
    ]);

    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3)
        || Function((x, i) => x + Point(i 1))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 2], [3, 3], [5, 4]]);

    result = defaultEval(`Function(() => MultiPoint(1 1, 2 2, 3 3)
        || Function((x, i) => x + Point(i 1)))()`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 2], [3, 3], [5, 4]]);

    result = defaultEval(`
        CreateCircles = Function(() => {
            Generate 5 Function(i => {
                ring = i + 1;
                PointCircle((ring * 2), (ring * 10))
            }) | Flatten        
        });
        CreateCircles()
            || Function(x => If (x:x() <= 0) Then (x + Point(0 10)) Else (x - Point(0 10)))
            || Function(x => GeometryCollection(x, (x + Point(11 0))))
            | Flatten
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.length).toBe(300);
});

test('should filter array-like geometries', () => {
    let result;
    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3) |> Function(x => x:x() <= 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2]]);

    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3) |> Function((x, i) => i < 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2]]);

});

test('should error when attempting to generate non-geometries', () => {
    try {
        defaultEval(`
           Generate 100 Function(x => x)
        `);
        fail('Expected an error.');
    } catch (err) {
        // Do nothing
    }
});

test('should map coordinates', () => {
    let result = defaultEval(`Point(1 1) |* Function(p => p + 1)`);
    expect(result?.geometry.coordinates).toStrictEqual([2, 2]);

    result = defaultEval(`LineString(1 1, 2 2, 3 3) |* Function(p => p + 1)`);
    expect(result?.geometry.coordinates).toStrictEqual([[2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`Polygon((1 1, 2 2, 3 3, 1 1), (4 4, 5 5, 6 6, 4 4)) |* Function(p => p + 1)`);
    expect(result?.geometry.coordinates).toStrictEqual([[[2, 2], [3, 3], [4, 4], [2, 2]], [[5, 5], [6, 6], [7, 7], [5, 5]]]);

    result = defaultEval(`GeometryCollection(
        Point(1 1),
        MultiPoint(1 1, 2 2),
        LineString(1 1, 2 2, 3 3),
        MultiLineString((1 1, 2 2, 3 3), (4 4, 5 5, 6 6)),
        Polygon((1 1, 2 2, 3 3, 1 1), (7 7, 8 8, 9 9, 7 7)),
        GeometryCollection(
            Point(1 1),
            MultiPoint(1 1, 2 2),
            LineString(1 1, 2 2, 3 3),
            MultiLineString((1 1, 2 2, 3 3), (4 4, 5 5, 6 6)),
            Polygon((1 1, 2 2, 3 3, 1 1), (7 7, 8 8, 9 9, 7 7))
        )        
    ) |* Function(p => p + 3)`);
    expect(result).toBeTruthy();
    let geometries = result?.geometry.geometries;
    expect(geometries[0].coordinates).toStrictEqual([4, 4]);
    expect(geometries[1].coordinates).toStrictEqual([[4, 4], [5, 5]]);
    expect(geometries[2].coordinates).toStrictEqual([[4, 4], [5, 5], [6, 6]]);
    expect(geometries[3].coordinates).toStrictEqual([[[4, 4], [5, 5], [6, 6]], [[7, 7], [8, 8], [9, 9]]]);
    expect(geometries[4].coordinates).toStrictEqual([[[4, 4], [5, 5], [6, 6], [4, 4]], [[10, 10], [11, 11], [12, 12], [10, 10]]]);
    geometries = geometries[5].geometries;
    expect(geometries[0].coordinates).toStrictEqual([4, 4]);
    expect(geometries[1].coordinates).toStrictEqual([[4, 4], [5, 5]]);
    expect(geometries[2].coordinates).toStrictEqual([[4, 4], [5, 5], [6, 6]]);
    expect(geometries[3].coordinates).toStrictEqual([[[4, 4], [5, 5], [6, 6]], [[7, 7], [8, 8], [9, 9]]]);
    expect(geometries[4].coordinates).toStrictEqual([[[4, 4], [5, 5], [6, 6], [4, 4]], [[10, 10], [11, 11], [12, 12], [10, 10]]]);
});

test('should bind parameters to functions', () => {
    let result = defaultEval(`
        2.345325 | Round:bind(2)
    `);
    expect(result).toBe(2.35);

    result = defaultEval(`
        TripleAdd = Function((g1, g2, g3) => g1 + g2 + g3);
        4 | TripleAdd:bind(2):bind(3)
    `);
    expect(result).toBe(9);

    result = defaultEval(`
        myFn = Function((x, y, last) => {
            first = Point(x y);
            LineString(first, last)
        });
        myFnPartial = myFn:bind(1, 2);
        myFnPartial(Point(3 4))
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 2],[3, 4]])
});
