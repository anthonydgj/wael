import { DEFAULT_OPTIONS, defaultEval } from "./test-utils";

import { Interpreter } from "../interpreter/interpreter";
import { Wael } from "../main";

test('should declare variables', () => {
    let result = defaultEval(`a = Point(1 2)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 2]);

    // support valid variable name characters
    result = defaultEval(`
        a = Point(1 1);
        b2 = Point(2 2);
        c_3 = Point(3 3);
        GeometryCollection(a, b2, c_3)
    `);
    expect(result).toBeTruthy();

    // support variable names that include a keyword
    result = defaultEval(`pointA = Point(1 2); pointA`);
    expect(result).toBeTruthy();
});

test('should evaluate variables', () => {
    let result = defaultEval(`
        a = 2 * 42;
        b = 8 / 2;
        a + b
    `);
    expect(result).toBeTruthy();
    expect(result).toBe(88);


    result = defaultEval(`
        c = Point(1 2);
        c + Point(3 4)
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([4, 6]);
});

test('should reassign variables', () => {
    let result = defaultEval(`
        a = 1;
        b = 2;
        a = a + b;
        Point(a b)
    `);
    expect(result.geometry.coordinates).toStrictEqual([3, 2]);
});

// Last expression result variable

test('should return last evaluated value using $?', () => {

    // Provide custom scope
    const scope = Interpreter.createGlobalScope();
    defaultEval(`Point(2 3)`, { scope });
    let result = defaultEval(`$?`, { scope });
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 3]);

    // Use Interpreter object
    const wael = new Wael(DEFAULT_OPTIONS);
    wael.evaluate(`Point(2 3)`);
    result = wael.evaluate(`$?`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 3]);

});

// Indexed expression result variables

test('should return indexed evaluated values', () => {
    let result;

    // Provide custom scope
    const scope = Interpreter.createGlobalScope();
    defaultEval(`Point(2 3)`, { scope });
    result = defaultEval(`$0`, { scope });
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 3]);
    result = defaultEval(`$0 + 2`, { scope });
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([4, 5]);

    // Use Interpreter object
    const wael = new Wael(DEFAULT_OPTIONS);
    wael.evaluate(`Point(2 3)`);
    result = wael.evaluate(`$0`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 3]);
    result = defaultEval(`$0 + 2`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([4, 5]);

});
