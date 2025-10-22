import { defaultEval } from "./test-utils";

test('should generate geometries', () => {
    let result;
    result = defaultEval(`3 >> Point(0 0)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [0, 0], [0, 0]]);

    result = defaultEval(`3 >> Function(x => Point(x x))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);

    result = defaultEval(`a = (3 >> Function(x => Point(x x))); a`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);

    result = defaultEval(`
        3 >> Function(x => Point(x x))
            || Function(p => 3 >> Function(x => p + Point(x x)))
            | Flatten
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([
        [0, 0], [1, 1], [2, 2],
        [1, 1], [2, 2], [3, 3],
        [2, 2], [3, 3], [4, 4],
    ]);

    result = defaultEval(`Point(1 1) - (3 >> Function(x => Point(x x)))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [0, 0], [-1, -1]]);

    result = defaultEval(`(3 >> Function(x => Point(x x))) + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);
});

test('should generate with function count provider', () => {
    let result;
    result = defaultEval(`(i => i < 3) >> Point(1 1)`)
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [1, 1], [1, 1]]);

    result = defaultEval(`(i => i < 3) >> (i => Point(i i))`)
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);

    result = defaultEval(`a = 0; ((i) => a < 3) >> (i => (a = a + 1; Point(i i)))`)
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);
});

test('should exclude undefined values', () => {
    let result;
    result = defaultEval(`5 >> (i) => (if (i % 2 == 0) then (Point(i i)) else (undefined))`)
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [2, 2], [4, 4]]);

    result = defaultEval(`(i => i < 6) >> (i) => (if (i % 2 == 0) then (Point(i i)) else (undefined))`)
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [2, 2], [4, 4]]);
});
