import { defaultEval } from "./test-utils";

test('should evaluate functions with keyword', () => {
    let result;
    result = defaultEval(`
        fn = Function(() => 3);
        fn()
    `);
    expect(result).toBe(3);

    result = defaultEval(`
        Function(() => 3 ;
        4 ; 6)()
    `);
    expect(result).toBe(6);

    result = defaultEval(`
        createPoint = Function(() => Point(2 3));
        LineString(createPoint(), createPoint())
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 3], [2, 3]]);
});

test('should evaluate functions without keyword', () => {
    let result;

    result = defaultEval(`
        fn = (() => (3));
        fn()
    `);
    expect(result).toBe(3);

    result = defaultEval(`
        fn = () => (3);
        fn()
    `);
    expect(result).toBe(3);

    result = defaultEval(`
        (() => (3 ;
        4 ; 6))()
    `);
    expect(result).toBe(6);

    result = defaultEval(`
        () => (3 ;
        4 ; 6)()
    `);
    expect(result).toBe(6);

    result = defaultEval(`
        createPoint = (() => (Point(2 3)));
        LineString(createPoint(), createPoint())
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[2, 3], [2, 3]]);
});

it('should evaluate functions with parameters', () => {
    let result;

    result = defaultEval(`
        fn = Function(a => a + 1);
        fn(2)
    `);
    expect(result).toBe(3);

    result = defaultEval(`
        fn1 = Function(a => (
            a + 1;
            fn2 = Function(b => a + b);
            fn2(3)
        ));
        fn1(2)
    `);
    expect(result).toBe(5);

    result = defaultEval(`
        x = 2;
        fn1 = Function(a => (
            let x = 5;
            a = a + x;
            fn2 = Function(b => a + b);
            fn2(3)
        ));
        y = fn1(x);
        Point(x y)
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 10]);

    result = defaultEval(`
        x = 2;
        fn1 = Function((a, c) => (
            let x = 5;
            a = a + x;
            fn2 = Function(b => a + b);
            fn2(3)
        ));
        y = fn1(x, 5);
        Point(x y)
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([2, 10]);

    result = defaultEval(`
        getLatitude = Function(() => 55);
        createPointOneArg = Function(x => Point(x getLatitude()));
        createPointTwoArgs = Function((x, y) => Point(x y));
        otherLine = LineString(
            createPointOneArg(10),
            createPointTwoArgs(20, 55)
        );
        otherLine # LINESTRING(10 55, 20 55)
    `);
    expect(result).toBeTruthy();
    expect(result.geometry.coordinates).toStrictEqual([[10, 55], [20, 55]]);

});

it('should handle recursion', () => {
    let result = defaultEval(`
        build_list = Function(n => (
            # Base case
            if (n == 0) then (
                GeometryCollection()
            ) else (
                # Recursive call to build the rest of the list
                rest_of_list = build_list(n - 1);
                
                # Add the current element to the list
                current_element = Point(n n);
                
                # Combine the current element with the rest of the list
                rest_of_list ++ GeometryCollection(current_element)
            )
        ));
        build_list(3)
    `);
    expect(result?.geometry.geometries?.map((f: any) => f.coordinates))
        .toStrictEqual([[1, 1], [2, 2], [3, 3]]);
});

it('should handle immediately invoked function expressions', () => {
    let result = defaultEval(`Function(a => a + 1)(2)`);
    expect(result).toBe(3);
})

it('should handle function calls of function calls', () => {
    let result;
    result = defaultEval(`(() => 3 ; 4 ; 5)()`);
    expect(result).toBe(5);

    result = defaultEval(`(() => 3 ; 4 ; 5)()`);
    expect(result).toBe(5);

    result = defaultEval(`fn = (a) => (a); fn(fn(fn(3)))`);
    expect(result).toBe(3);

    result = defaultEval(`f = () => (() => (() => 3)); f()()()`);
    expect(result).toBe(3);
});

it('should handle the spread operator parameter', () => {
    let result;
    result = defaultEval(`((...g) => g)(1 1, 2 2, 3 3)`)
    expect(result?.geometry.geometries?.map((f: any) => f.coordinates))
        .toStrictEqual([[1, 1], [2, 2], [3, 3]])
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
            Export Slice = Function((start, end, g) => (
                g |~ Function((p, i) => (lowerBound = i >= start; higherBound = i < end; if (lowerBound And higherBound) then (true) else (false)))
            ));

            # Stack
            Export Stack = Function(() => GeometryCollection());
            Export Push = Function((v, g) => g ++v);
            Export Pop = Function(g => Slice(0, g:numGeometries()-1, g));

            true
        ));
        Lib = Use(UseLib());
        stack = Lib:Stack();
        stack = Lib:Push(Lib:Num(2), stack);
        stack = Lib:Push(Lib:Num(3), stack);
        stack = Lib:Pop(stack);
    `
    result = defaultEval(`${exp} Lib:Stack; stack`);
    expect(result.geometry.geometries).toStrictEqual([{ type: 'Point', coordinates: [2, 2] }]);
});

it('should support closure state', () => {
    let result;
    result = defaultEval(`Counter = () => (let count = 0; () => count = count + 1); counter = Counter(); counter(); counter()`);
    expect(result).toBe(2);
})

it('should support imports with state', () => {
    let result;
    result = defaultEval(`
        List = () => (
            let _value = GeometryCollection();
            export let value = () => (_value);
            export let append = (g) => (_value = _value ++ g);
            export let remove = (index) => (_value = value() |~ (v, i) => (i != index));
            value 
        );
        list = Use(List());
        list:append(1 1);
        list:append(2 2);
        list:append(3 3);
        list:remove(1);
        list:value()
    `);
    expect(result.geometry.geometries.map((p: any) => p.coordinates)).toStrictEqual([[1, 1], [3, 3]]);
});

it('should support multiple imports', () => {
    let result = defaultEval(`
        let e1 = () => (export let a = 4);
        let e2 = () => (export let b = 5);
        let i1 = Use(e1());
        let i2 = Use(e2());
        Point(i1() i2())
    `);
    expect(result.geometry.coordinates).toStrictEqual([4, 5]);
});

it('should support multiple usage instances of the same module', () => {
    let result = defaultEval(`
        Counter = () => (let count = 0; export let inc = () => (count = count + 1); () => count);
        c1 = Use(Counter());
        c2 = Use(Counter());
        c1:inc();
        c1:inc();
        c1:inc();
        c2:inc();
        c2:inc();
        c1();

        Point(c1() c2())
    `);
    expect(result.geometry.coordinates).toStrictEqual([3, 2]);
})