import { defaultEval } from "./test-utils";

test('should generate geometries', () => {
    let result;
    result = defaultEval(`Generate 3 Point(0 0)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [0, 0], [0, 0]]);

    result = defaultEval(`Generate 3 Function(x => Point(x x))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);

    result = defaultEval(`a = (Generate 3 Function(x => Point(x x))); a`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);

    result = defaultEval(`
        Generate 3 Function(x => Point(x x))
            || Function(p => Generate 3 Function(x => p + Point(x x)))
            | Flatten
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([
        [0, 0], [1, 1], [2, 2],
        [1, 1], [2, 2], [3, 3],
        [2, 2], [3, 3], [4, 4],
    ]);

    result = defaultEval(`Point(1 1) - (Generate 3 Function(x => Point(x x)))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [0, 0], [-1, -1]]);

    result = defaultEval(`(Generate 3 Function(x => Point(x x))) + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

});
