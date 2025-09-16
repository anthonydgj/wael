import { defaultEval } from "./test-utils";

test('should convert from geometry collection', () => {
    let result;
    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2), Point(3 3)) | ToLineString`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2), Point(3 3)) | ToMultiPoint`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`GeometryCollection(Point(1 1), Point(2 2), Point(3 3)) | ToGeometryCollection`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);
});

test('should convert from line string', () => {
    let result;
    result = defaultEval(`LineString(1 1, 2 2, 3 3) | ToLineString`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`LineString(1 1, 2 2, 3 3) | ToMultiPoint`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`LineString(1 1, 2 2, 3 3) | ToGeometryCollection`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);
});

test('should convert from multi point', () => {
    let result;
    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3) | ToLineString`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3) | ToMultiPoint`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`MultiPoint(1 1, 2 2, 3 3) | ToGeometryCollection`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);
});

test('should rotate points', () => {
    let result = defaultEval(`_Rotate(23, Point(0 0), MultiPoint(1 1, 2 2, 3 3))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([
        [1.311235981941714, 0.5297737249631667],
        [2.622471963883428, 1.0595474499263333],
        [3.9337079458251423, 1.5893211748894998]
    ]);

    result = defaultEval(`LINESTRING (210 210, 311 310, 412 410, 513 510) |* Rotate(23, Point(180 180))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([
        [219.33707945825142, 195.893211748895],
        [351.3811825058753, 248.47985311672238],
        [483.4252855534991, 301.0664944845498],
        [615.469388601123, 353.6531358523772]
    ]);

    result = defaultEval(`_Rotate(23, undefined, MultiPoint(1 1, 2 2, 3 3))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([
        [1.311235981941714, 0.5297737249631667],
        [2.622471963883428, 1.0595474499263333],
        [3.9337079458251423, 1.5893211748894998]
    ]);
});

test('should round number values', () => {
    let result = defaultEval(`_Round(0, 1.255)`);
    expect(result).toBe(1);
    result = defaultEval(`_Round(1, 1.255)`);
    expect(result).toBe(1.3);
});

test('should access Math object properties', () => {
    let result = defaultEval(`Math:PI`);
    expect(+result.toFixed(5)).toBe(3.14159);

    result = defaultEval(`Math:round(Math:PI)`);
    expect(result).toBe(3);

    result = defaultEval(`Math:random()`);
    expect(typeof result === 'number').toBeTruthy();

    result = defaultEval(`random = Math:random; random()`);
    expect(typeof result === 'number').toBeTruthy();
});
