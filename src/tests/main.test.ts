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
    let result = defaultEval(`Import("./src/tests/test.wael"):Default`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([1, 1]);

    result = defaultEval(`a = Import("./src/tests/test.wael"):Default; a + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    result = defaultEval(`a = Import("./src/tests/test.json"):Default; a + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    result = defaultEval(`a = Import("./src/tests/test.geojson"):Default; a + Point(1 1)`);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 2]);

    try {
        defaultEval(`a = Import("./src/tests/test-invalid.wael"):Default; a + Point(1 1)`);
        fail(`Expected an error.`);
    } catch(err) {
        // pass
    }

});

it('should support function scope import/export', () => {
    let result;
    const importAllExp = `Lib = Import(Function(() => (export a = 3; export b = 4))())`;
    result = defaultEval(`${importAllExp}; Lib:a`)
    expect(result).toBe(3);
    result = defaultEval(`${importAllExp}; Lib:b`)
    expect(result).toBe(4);
    const importUsingExp = `Lib = Import(Function(() => (export a = 3; export b = 4))()) Using (a)`;
    result = defaultEval(`${importUsingExp}; a`)
    expect(result).toBe(3);
    result = defaultEval(`${importUsingExp}; b`)
    expect(result).toBe(undefined);
    
});

it('should allow closures', () => {
    let result;
    const exp = `
        UseLib = Function(() => (
        # Number Library
        Export Num = Function(val => if (val:type == Point) then (val:x) else (Point(val val)));
        Export Get = Function((n, g) => g:geometryN(n));

        # Data Structures
        Export List = Function(val => if (val:type == GeometryCollection) then (val) else (Generate val Num(0)));
        Export Seq = Function(n => Generate n Function(i => Point(i i)));
        Export Slice = Function((start, end, g)=> (
            g |~ Function((p, i) => (lowerBound = i >= start; higherBound = i < end; if (lowerBound And higherBound) then (true) else (false)))
        ));

        # Stack
        Export Stack = Function(() => GeometryCollection());
        Export Push = Function((v, g) => g ++v);
        Export Pop = Function(g => Slice(0, g:numGeometries()-1, g));

        true
        ));
        Lib = Import(UseLib());
        stack = Lib:Stack();
        stack = Lib:Push(Lib:Num(2), stack);
        stack = Lib:Push(Lib:Num(3), stack);
        stack = Lib:Pop(stack);
    `
    result = defaultEval(`${exp} Lib:Stack; stack`);
    expect(result.geometry.geometries).toStrictEqual([ { type: 'Point', coordinates: [ 2, 2 ] } ]);
});