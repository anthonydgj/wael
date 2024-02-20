import { defaultEval } from "./test-utils";

test('should concatenate geometries', () => {
    let result;
    result = defaultEval(`LineString(1 1, 2 2) ++ LineString(3 3, 4 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3], [4, 4]])

    result = defaultEval(`LineString(1 1, 2 2) ++ Point(3 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`MultiPoint(1 1, 2 2) ++ MultiPoint(3 3, 4 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3], [4, 4]])

    result = defaultEval(`MultiPoint(1 1, 2 2) ++ Point(3 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);
    
    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2)) ++ GeometryCollection(Point(3 3), Point(4 4))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2)) ++ Point(3 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2)) ++ Point(3 3)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2)) ++ Point(3 3) ++ Point(4 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`LineString(1 1, 2 2) ++ MultiPoint(3 3, 4 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.type).toBe('LineString');
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`MultiPoint(1 1, 2 2) ++ LineString(3 3, 4 4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.type).toBe('MultiPoint');
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3], [4, 4]]);

    result = defaultEval(`Point(1 1) ++ Point(2 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2]]);

    result = defaultEval(`Point(2 2) ++ GeometryCollection(Point(3 3), Point(4 4))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries[0].coordinates).toStrictEqual([2, 2]);
    expect(result.geometry.geometries[1].geometries.map((f: any) => f.coordinates)).toStrictEqual([[3, 3], [4, 4]]);
});
