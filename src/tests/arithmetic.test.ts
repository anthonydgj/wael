import { defaultEval } from "./test-utils";

test('should support point arithmetic', () => {
    let result = defaultEval(`Point(1 2) + Point(1 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates[0]).toBe(2);
    expect(result.geometry.coordinates[1]).toBe(4);

    result = defaultEval(`Point(1 2) - Point(1 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([0, 0]);

    result = defaultEval(`Point(1 2) * Point(3 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 8]);

    result = defaultEval(`Point(5 10) / Point(5 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 5]);

    result = defaultEval(`Point(2 5) ^ Point(3 0)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([8, 1]);
    
    result = defaultEval(`Point(2 5) % Point(3 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 1]);
});

test('should support line string arithmetic', () => {
    let result = defaultEval(`LineString(0 0, 1 1, 2 2) + LineString(0 0, 1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[0, 0], [2, 2], [4, 4]]);

    result = defaultEval(`LineString(10 0, 1 1, 2 2) - LineString(0 1, 2 3, 4 5)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[10, -1], [-1, -2], [-2, -3]]);

    result = defaultEval(`LineString(10 0, 1 1, 2 2) * LineString(0 1, 2 3, 4 5)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[0, 0], [2, 3], [8, 10]]);

    result = defaultEval(`LineString(10 0, 1 6, 10 20) / LineString(1 1, 2 3, 2 5)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[10, 0], [0.5, 2], [5, 4]]);

    result = defaultEval(`LineString(0 0, 1 1, 2 2) ^ LineString(1 2, 3 4, 4 5)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[0, 0], [1, 1], [16, 32]]);

    result = defaultEval(`LineString(2 2, 5 5) % LineString(3 3, 2 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 2], [1, 1]]);
});

test('should support line string and point arithmetic', () => {
    let result = defaultEval(`LineString(0 0, 1 1, 2 2) + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);
    result = defaultEval(`Point(1 1) + LineString(0 0, 1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`LineString(10 0, 1 1, 2 2) - Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[9, -1], [0, 0], [1, 1]]);
    result = defaultEval(`Point(1 1) - LineString(10 0, 1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[-9, 1], [0, 0], [-1, -1]]);

    result = defaultEval(`LineString(10 0, 1 1, 2 2) * Point(2 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[20, 0], [2, 3], [4, 6]]);
    result = defaultEval(`Point(2 3) * LineString(10 0, 1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[20, 0], [2, 3], [4, 6]]);

    result = defaultEval(`LineString(10 0, 1 6, 10 21) / Point(2 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[5, 0], [0.5, 2], [5, 7]]);
    result = defaultEval(`Point(8 9) / LineString(2 1, 16 3, 4 -18)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[4, 9], [0.5, 3], [2, -0.5]]);

    result = defaultEval(`LineString(1 2, 3 4) ^ Point(2 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 8], [9, 64]]);
    result = defaultEval(`Point(2 3) ^ LineString(1 2, 3 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 9], [8, 81]]);

    result = defaultEval(`LineString(2 5, 2 5) % Point(3 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 1], [2, 1]]);
    result = defaultEval(`Point(2 5) % LineString(3 2, 3 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 1], [2, 1]]);

});

test('should support polygon and point arithmetic', () => {
    let result = defaultEval(`Polygon((1 1, 2 2, 3 3, 1 1)) + Point(1 1)`);
    expect(result.geometry.coordinates).toStrictEqual([[[2, 2], [3, 3], [4, 4], [2, 2]]]);
    result = defaultEval(`Point(1 1) + Polygon((1 1, 2 2, 3 3, 1 1))`);
    expect(result.geometry.coordinates).toStrictEqual([[[2, 2], [3, 3], [4, 4], [2, 2]]]);
    result = defaultEval(`Polygon((1 1, 2 2, 3 3, 1 1)) - Point(-1 -1)`);
    expect(result.geometry.coordinates).toStrictEqual([[[2, 2], [3, 3], [4, 4], [2, 2]]]);
    result = defaultEval(`Point(3 3) - Polygon((1 1, 2 2, 3 3, 1 1))`);
    expect(result.geometry.coordinates).toStrictEqual([[[2, 2], [1, 1], [0, 0], [2, 2]]]);
    result = defaultEval(`Polygon((8 8, 8 0, 0 0, 0 8, 8 8), (6 6, 6 2, 2 2, 2 6, 6 6)) + Point(1 1)`)
    expect(result.geometry.coordinates).toStrictEqual([
        [[9, 9], [9, 1], [1, 1], [1, 9], [9, 9]],
        [[7, 7], [7, 3], [3, 3], [3, 7], [7, 7]]
    ]);
});

test('should support variable type arithmetic', () => {
    let result;
    result = defaultEval(`Point(1 2) + 3`);
    expect(result).toBeTruthy();
    expect(result?.geometry?.coordinates).toStrictEqual([4, 5]);
    result = defaultEval(`44 / Point(1 2)`);
    expect(result).toBeTruthy();
    expect(result?.geometry?.coordinates).toStrictEqual([44, 22]);

    result = defaultEval(`LineString(1 1, 2 2) + 3`);
    expect(result).toBeTruthy();
    expect(result?.geometry?.coordinates).toStrictEqual([[4, 4], [5, 5]]);
    result = defaultEval(`44 / LineString(1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result?.geometry?.coordinates).toStrictEqual([[44, 44], [22, 22]]);

    result = defaultEval(`MultiPoint(1 1, 2 2) + 3`);
    expect(result).toBeTruthy();
    expect(result?.geometry?.coordinates).toStrictEqual([[4, 4], [5, 5]]);
    result = defaultEval(`44 / MultiPoint(1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result?.geometry?.coordinates).toStrictEqual([[44, 44], [22, 22]]);

    result = defaultEval(`GeometryCollection(1 1, 2 2) + 3`);
    expect(result).toBeTruthy();
    expect(result?.geometry.geometries?.map((f: any) => f.coordinates)).toStrictEqual([[4, 4], [5, 5]]);
    result = defaultEval(`44 / GeometryCollection(1 1, 2 2)`);
    expect(result).toBeTruthy();
    expect(result?.geometry.geometries?.map((f: any) => f.coordinates)).toStrictEqual([[44, 44], [22, 22]]);

    result = defaultEval(`
    GeometryCollection(
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
    ) + 3
    `);
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
