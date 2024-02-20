import { defaultEval } from "./test-utils";

test('should support conditionals', () => {
    let result;
    result = defaultEval(`false`);
    expect(result).toBe(false);
    result = defaultEval(`true`);
    expect(result).toBe(true);

    result = defaultEval(`1 > 2`);
    expect(result).toBe(false);
    result = defaultEval(`2 > 1`);
    expect(result).toBe(true);

    result = defaultEval(`1 >= 2`);
    expect(result).toBe(false);
    result = defaultEval(`1 >= 1`);
    expect(result).toBe(true);

    result = defaultEval(`1 < 2`);
    expect(result).toBe(true);
    result = defaultEval(`2 < 1`);
    expect(result).toBe(false);

    result = defaultEval(`2 <= 2`);
    expect(result).toBe(true);
    result = defaultEval(`2 <= 1`);
    expect(result).toBe(false);

    result = defaultEval(`1 == 2`);
    expect(result).toBe(false);
    result = defaultEval(`1 == 1`);
    expect(result).toBe(true);

    result = defaultEval(`1 != 2`);
    expect(result).toBe(true);
    result = defaultEval(`1 != 1`);
    expect(result).toBe(false);

    result = defaultEval(`Point(1 1):x() == 2`);
    expect(result).toBe(false);
    result = defaultEval(`Point(1 1):x() == 1`);
    expect(result).toBe(true);

});

test('should support If-Then-Else expressions', () => {
    let result;
    result = defaultEval(`If (3 > 4) Then (Point(1 1)) Else (Point(2 2))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    result = defaultEval(`If (3 < 4) Then (Point(1 1)) Else (Point(2 2))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`Function(x => If (3 < 4) Then (Point(1 1)) Else ( Point(2 2)))()`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`If (3 < 4) Then (Point(1 1)) Else (Point(2 2))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`
        If (3 < 4) Then
            (Generate 3 Function(x => Point(x x)))
        Else (Point(2 2))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[0, 0], [1, 1], [2, 2]]);

    result = defaultEval(`
        If (3 < 4) Then (
            Generate 3 Function(x => Point(x x))
                || Function(p => p + 1)
        )
        Else (Point(2 2))`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

    result = defaultEval(`
        a = If (3 < 4) Then (
            Generate 3 Function(x => Point(x x))
                || Function(p => p + 1)
        ) Else (Point(2 2));
        a`);
    expect(result).toBeTruthy();
    expect(result.geometry.geometries.map((f: any) => f.coordinates)).toStrictEqual([[1, 1], [2, 2], [3, 3]]);

});

test('should support logical operators', () => {
    let result;
    result = defaultEval(`true AND true`);
    expect(result).toBe(true);

    result = defaultEval(`true AND false`);
    expect(result).toBe(false);

    result = defaultEval(`false AND true`);
    expect(result).toBe(false);

    result = defaultEval(`false AND false`);
    expect(result).toBe(false);

    result = defaultEval(`true OR true`);
    expect(result).toBe(true);

    result = defaultEval(`true OR false`);
    expect(result).toBe(true);

    result = defaultEval(`false OR true`);
    expect(result).toBe(true);

    result = defaultEval(`false OR false`);
    expect(result).toBe(false);

    result = defaultEval(`!true`);
    expect(result).toBe(false);

    result = defaultEval(`!false`);
    expect(result).toBe(true);
});
