import { OutputFormat } from '../main';
import { defaultEval } from './test-utils';

const fs = require('fs');

// Example files

test('should evaluate reference programs', () => {
    let content = fs.readFileSync('./examples/reference.wael', 'utf-8');
    let result = defaultEval(content);
    expect(result).toBeTruthy();
});


// Sequential expressions

test('should evaluate sequential expressions and return the last value', () => {
    let result = defaultEval(`Point(2 5) ^ (3 0); 1 + 3; (Point(1 2) * Point(3 3))`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 6]);
});


// Comments

test('should evaluate expressions with surrounding comments', () => {
    let result = defaultEval(`# just a comment`);
    expect(result).toBeUndefined();

    result = defaultEval(`
    # comment on one line
    # comment on another line
    `);
    expect(result).toBeUndefined();

    result = defaultEval(`
    # comment
    Point(1 2) # inline comment
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 2]);

    result = defaultEval(`
    # comment
    Point(1 2); # inline comment

    # Additional comment
    Point(3 4)

    # Trailing comment
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([3, 4]);

});


// End

test('should run without return value', () => {
    let result = defaultEval(``);
    expect(result).toBeUndefined();

    result = defaultEval(`# just a comment`);
    expect(result).toBeUndefined();
});

test('should return last value', () => {
    let result = defaultEval(`Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`Point(1 1);`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);
});

test('should support imports', () => {
    let result = defaultEval(`Use("./src/tests/test.wael")`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`a = Use("./src/tests/test.wael"); a + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    result = defaultEval(`a = Use("./src/tests/test.json"); a + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    result = defaultEval(`a = Use("./src/tests/test.geojson"); a + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    try {
        defaultEval(`a = Use("./src/tests/test-invalid.wael"); a + Point(1 1)`);
        fail(`Expected an error.`);
    } catch (err) {
        // pass
    }

});

it('should support function scope import/export', () => {
    let result;
    const importAllExp = `Lib = Use(Function(() => (export a = 3; export b = 4))())`;
    result = defaultEval(`${importAllExp}; Lib`, { outputNonGeoJSON: true })
    expect(result).toBeTruthy();
    expect(result['a']).toBe(3);
    expect(result['b']).toBe(4);
    result = defaultEval(`${importAllExp}; Lib()`)
    expect(result).toBe(4);
    result = defaultEval(`${importAllExp}; Lib:a`)
    expect(result).toBe(3);
    result = defaultEval(`${importAllExp}; Lib:b`)
    expect(result).toBe(4);
    result = defaultEval(`${importAllExp}; Lib:Round`)
    expect(result).toBeUndefined();
    const importUsingExp = `lib = Use(Function(() => (export a = 3; export b = 4))()) With (a)`;
    result = defaultEval(`${importUsingExp}; a`)
    expect(result).toBe(3);
    result = defaultEval(`${importUsingExp}; b`)
    expect(result).toBe(undefined);
    result = defaultEval(`${importUsingExp}; lib:a`)
    expect(result).toBe(3);
    const importUsingAllExp = `Use(Function(() => (export a = 3; export b = 4))()) With (*)`;
    result = defaultEval(`${importUsingAllExp}; a`)
    expect(result).toBe(3);
    result = defaultEval(`${importUsingAllExp}; b`)
    expect(result).toBe(4);
});

it('should import embedded modules', () => {
    let result;
    result = defaultEval(`
        Lib = () => (
            export let a = () => (
                export let b = 4
            )
        );
        MyLib = Use(Lib());
        lib = Use(MyLib:a());
        lib()
    `)
    expect(result).toBe(4)
});

it('should return default values', () => {
    let result;
    result = defaultEval(`
        Lib = () => (let a = 1; let b = 2; a);
        lib = Use(Lib());
        lib()
    `);
    expect(result).toBe(1);

    result = defaultEval(`
        Lib = (() => let a = 1; let b = 2; () => a);
        lib = Use(Lib());
        lib()
    `);
    expect(result).toBe(1);
})

it('should require explicit scope binding export', () => {
    let result;

    // No explicit export
    result = defaultEval(`Use(Function(() => (Use(Function(() => (export a = 4))()) With (a)))()) With (a); a`);
    expect(result).toBe(undefined);

    // Explicit export
    result = defaultEval(`Use(Function(() => (Use(Function(() => (export a = 4))()) With (a); export a=a))()) With (a); a`);
    expect(result).toBe(4);
});

it('should support network imports', () => {
    let result;
    result = defaultEval(`Use("https://raw.githubusercontent.com/anthonydgj/wael/refs/heads/main/src/tests/test.wael")`)
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`path = "https://raw.githubusercontent.com/anthonydgj/wael/refs/heads/main/src/tests/test.wael"; Use(path)`)
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`Use("https://gist.githubusercontent.com/anthonydgj/29dd64c93e0656475e01bf228f117144/raw/70f007bc469b07ee7b56f17a8df842e167679cec/ext.wael") With (Num); Num(2)`)
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);
});

// Variables 

it('should support variable declaration and assignment', () => {
    let result;

    // Global scope
    result = defaultEval(`a = 1`);
    expect(result).toBe(1)
    result = defaultEval(`a = 1; a`);
    expect(result).toBe(1)
    result = defaultEval(`let a = 1`);
    expect(result).toBe(1)
    result = defaultEval(`let a = 1; a`);
    expect(result).toBe(1)

    // Function scope
    result = defaultEval(`a = 1; (() => a)()`);
    expect(result).toBe(1)
    result = defaultEval(`a = 1; (() => a = 2; a)()`);
    expect(result).toBe(2)
    result = defaultEval(`a = 1; (() => a = 2; a)(); a`);
    expect(result).toBe(2)
    result = defaultEval(`a = 1; (() => let a = 2; a)(); a`);
    expect(result).toBe(1)
});

it('should support example data structures', () => {
    let result;
    result = defaultEval(`
        Stack = () => (
            let value = GeometryCollection();
            let size = 0;

            export let push = (n) => (
                let num = n;
                value = if (size % 2 == 0) then (
                    value ++ (n 0)
                ) else (
                    value || (p, i) => (if (i == (size - 1) / 2) then (p:y(num)) else (p))
                );
                size = size + 1;
                undefined
            );

            export let pop = () => (
                let popVal = undefined;
                value = if (size % 2 == 0) then (
                    value || (v, i) => (if (i == (size / 2) - 1) then (
                        popVal = v:y;
                        v:y(0)
                    ) else (v))
                ) else (
                    value |~ (v, i) => (if (i == value:numGeometries() - 1) then (
                        popVal = v:x;
                        false
                    ) else (true))
                );
                size = size - 1;
                popVal
            );
            
            () => (value)
        );
        stack = Use(Stack());
        stack:push(1);
        stack:push(2);
        stack:push(3);
        stack:push(4);
        stack:push(5);
        stack:pop();
        stack:pop()
    `, {
        outputNonGeoJSON: true
    });
    expect(result).toBe(4)
});
