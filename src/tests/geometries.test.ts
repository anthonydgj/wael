import { defaultEval } from "./test-utils";

test('should create points', () => {
    let result = defaultEval(`Point (4 ((((12))) + (3 * 2.5) + 4))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates[0]).toBe(4);
    expect(result.geometry.coordinates[1]).toBe(23.5);

    result = defaultEval(`Point (2 (1 + (3^9) * 14894.5325 / -24.53))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates[0]).toBe(2);
    expect(result.geometry.coordinates[1]).toBe(-11951449.599164288);
});

test('should create lines', () => {
    let result = defaultEval(`LineString (4 (12 + (3 * 2.5) + 4), 24.56 85.24, POINT(2 3), Point(5 5) + Point(25 5))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[4, 23.5], [24.56, 85.24], [2, 3], [30, 10]]);
});

test('should create polygon', () => {
    let result = defaultEval(`Polygon ((30 10, 40 40, 20 40, 10 20, (30+1) (10/2), Point(5 5) + Point(25 5)))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[[30, 10], [40, 40], [20, 40], [10, 20], [31, 5], [30, 10]]]);
});

test('should create multi point', () => {
    let result = defaultEval(`MULTIPOINT ((10 40), (40 30), (20 20), (30 10))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[10, 40], [40, 30], [20, 20], [30, 10]]);

    result = defaultEval(`MULTIPOINT (10 40, 40 30, 20 20, 30 10)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[10, 40], [40, 30], [20, 20], [30, 10]]);

    result = defaultEval(`MULTIPOINT ((10 40), Point(40 30), Point(10 10) + Point(10 10), 30 10)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[10, 40], [40, 30], [20, 20], [30, 10]]);
});

test('should create multi polygon', () => {
    let result = defaultEval(`MULTIPOLYGON (((30 20, (45 40), Point(10 40), Point((15 * 2) (25 - 5)))),
        ((15 5, Point(4 1) * Point(10 10), 10 20, 5 10, 15 5)))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([
        [[[30, 20], [45, 40], [10, 40], [30, 20]]],
        [[[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]]]
    ]);
});

test('should create multi line string', () => {
    let result = defaultEval(`MULTILINESTRING ((10 10, Point(20 (10 * 2)), Point(10 10) * Point(1 4)),
        (40 40, 30 30, 40 20, 30 10))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([
        [[10, 10], [20, 20], [10, 40]],
        [[40, 40], [30, 30], [40, 20], [30, 10]]
    ]);
});

test('should create collection', () => {
    let result = defaultEval(`
        GeometryCollection(
            Point (4 (12 + (3 * 2.5) + 4)),
            LineString (4 (12 + (3 * 2.5) + 4), 24.56 85.24),
            Polygon ((1 2, 3 4, 5 6, 1 2))
        )
    `);
    expect(result).toBeTruthy();

    const point = result.geometry.geometries[0];
    expect(point.coordinates).toStrictEqual([4, 23.5]);

    const lineString = result.geometry.geometries[1];
    expect(lineString.coordinates).toStrictEqual([[4, 23.5], [24.56, 85.24]]);

    const polygon = result.geometry.geometries[2];
    expect(polygon.coordinates).toStrictEqual([[[1, 2], [3, 4], [5, 6], [1, 2]]]);
});

test('should handle empty geometries', () => {
    let result;
    result = defaultEval(`GeometryCollection()`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.length).toBe(0);

    result = defaultEval(`GeometryCollection() ++ Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual(([[1, 1]]))
});
