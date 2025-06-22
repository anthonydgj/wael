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

test('should evaluate functions with parameters', () => {
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
