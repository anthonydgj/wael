import { defaultEval } from "./test-utils";

test('should access point coordinates', () => {
    let result;
    result = defaultEval(`Point(2 3):x()`);
    expect(result).toBe(2);
    result = defaultEval(`Point(2 3):y()`);
    expect(result).toBe(3);
    result = defaultEval(`a = Point(2 3); a:x()`);
    expect(result).toBe(2);
    result = defaultEval(`a = Point(2 3); a:y()`);
    expect(result).toBe(3);
});

test('should update point coordinates', () => {
    let result;
    result = defaultEval(`Point(2 3):x(4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([4, 3]);
    result = defaultEval(`Point(2 3):y(5)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 5]);

    result = defaultEval(`a = Point(2 3); a:x(4)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([4, 3]);
    result = defaultEval(`a = Point(2 3); a:y(5)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 5]);
});

test('should have immutable updates using copies', () => {
    let result;
    result = defaultEval(`a = Point(2 3); a:x(4); a`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 3]);
    result = defaultEval(`a = Point(2 3); a:y(5); a`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 3]);
});

test('should access geometry collection values', () => {
    let result;
    result = defaultEval(`GeometryCollection(Point(1 2), Point(3 4)):numGeometries()`);
    expect(result).toBe(2);
    result = defaultEval(`g = GeometryCollection(Point(1 2), Point(3 4)); g:numGeometries()`);
    expect(result).toBe(2);

    result = defaultEval(`GeometryCollection(Point(1 2), Point(3 4)):geometryN(1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 4]);
    result = defaultEval(`g = GeometryCollection(Point(1 2), Point(3 4)); g:geometryN(1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 4]);
});

test('should access line string values', () => {
    let result;
    result = defaultEval(`LineString(1 2, 3 4):numPoints()`);
    expect(result).toBe(2);
    result = defaultEval(`l = LineString(1 2, 3 4); l:numPoints()`);
    expect(result).toBe(2);

    result = defaultEval(`LineString(1 2, 3 4):pointN(1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 4]);
    result = defaultEval(`l = LineString(1 2, 3 4); l:pointN(1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 4]);
    result = defaultEval(`l = LineString(1 2, 3 4); l:pointN(l:numPoints() - 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 4]);

});

test('should access geometry types', () => {
    let result;
    result = defaultEval(`GeometryCollection():type()`);
    expect(result).toBe('GeometryCollection');
    result = defaultEval(`GeometryCollection():type() == GeometryCollection`);
    expect(result).toBe(true);
    result = defaultEval(`GeometryCollection():type() == Point`);
    expect(result).toBe(false);
    result = defaultEval(`GeometryCollection():type() != Point`);
    expect(result).toBe(true);
    result = defaultEval(`Point(1 1):type() == Point`);
    expect(result).toBe(true);
    result = defaultEval(`LineString(1 1, 2 2):type() == LineString`);
    expect(result).toBe(true);
    result = defaultEval(`MultiPoint(1 1, 2 2):type() == MultiPoint`);
    expect(result).toBe(true);
    result = defaultEval(`MultiLineString((1 1, 2 2)):type() == MultiLineString`);
    expect(result).toBe(true);
    result = defaultEval(`Polygon((1 1, 2 2, 3 3, 1 1)):type() == Polygon`);
    expect(result).toBe(true);
});
