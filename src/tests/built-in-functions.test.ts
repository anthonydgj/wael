import { defaultEval } from "./test-utils";
/*
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
*/
test('should rotate points', () => {
    let result = defaultEval(`Rotate(23, Point(0 0), MultiPoint(1 1, 2 2, 3 3))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([
        [1.3112079320509338, 0.5297935627181312],
        [2.6222475634657485, 1.0597061640553413],
        [3.9329505871284027, 1.589856903111244]
    ]);

    result = defaultEval(`LINESTRING (10 10, 11 10, 12 10, 13 10, 14 10) |* Rotate:bind(23, Point(180 180))`);
    expect(result).toBeTruthy();
    // expect(result.geometry.coordinates).toStrictEqual([
    //     [1.3112079320509338, 0.5297935627181312],
    //     [2.6222475634657485, 1.0597061640553413],
    //     [3.9329505871284027, 1.589856903111244]
    // ]);

});
/*
test('should round number values', () => {
    let result = defaultEval(`Round(0, 1.255)`);
    expect(result).toBe(1);
    result = defaultEval(`Round(1, 1.255)`);
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
*/