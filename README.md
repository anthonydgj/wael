# Well-Known Text Arithmetic Expression Language (WAEL)

The Well-Known Text Arithmetic Expression Language (WAEL) is an experimental, domain-specific language for generating and manipulating geometry patterns. The language syntax aims to be a superset of [Well-Known Text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) with added support for programming features like variables, basic arithmetic, functions and comments. Geometries can be transformed using [array programming](https://en.wikipedia.org/wiki/Array_programming) features like geometry arithmetic and pipe transformations (see the [Syntax](#syntax) section below for details).

Basic support is currently available for the following 2D geometries: `POINT`, `LINESTRING`, `POLYGON`, `MULTIPOINT`, `MULTILINESTRING`, `GEOMETRYCOLLECTION`. Sections with an `⚠ experimental feature` label indicate features that could be updated or modified in future versions.

**Try out the language in a CLI interpreter at [anthonydgj.github.io/wael](https://anthonydgj.github.io/wael/)**

**Use the language with an interactive map view at [geojsonscript.io](https://geojsonscript.io?lang=WAEL) with the `WAEL` code editor option selected.**


## Usage

Install dependency:
```
npm install wael-lib
```

Evaluate code using the `evaluate()` method:
```
import { Wael } from 'wael-lib';

const result = Wael.evaluate(`Point(1 1) + Point(2 2)`); // POINT (3 3)
```

See the [Terminal Usage](#terminal-usage) section for instructions using the CLI program.

## Examples

The following examples use language constructs and built-in functions to generate geometry patterns.

**Create a 20x10 grid of points with 2-unit spacing starting from coordinates -110, 38:**
```
Point(-110 38) + PointGrid(20, 10, 2)
```

<image src="examples/grid.jpg" alt="Point grid" width="700px" />

<br>

**Create the same grid and introduce random offsets:**
```
Point(-110 38) + PointGrid(20, 10, 2)
    || Function(p => (
        xOffset = 1 - Math:random() * 2;
        yOffset = 1 - Math:random() * 2;
        p + Point(xOffset yOffset)
    ))
```
<image src="examples/grid_random.jpg" alt="Randomized point grid" width="700px" />

<br>

**Rotate a 20x10 grid of points around origin by 23 degrees:**
```
PointGrid(20, 10, 4) | Rotate:bind(23, Point(0 0))
```

<image src="examples/grid_rotated.jpg" alt="Rotated point grid" width="700px" />

<br>

**Create several nested circle polygons:**
```
numRings = 5;
Generate numRings Function(i => (
    ring = numRings - i;
    PointCircle((ring * 2), (ring * 10)) | ToPolygon
))
```
<image src="examples/circles.jpg" alt="Nested circular polygons" width="700px" />

<br>


## Terminal Usage

The `wael.ts` script can be used to evaluate code and output the resulting WKT:
```
npx ts-node ./scripts/wael.ts --help
```

Following the [build instructions](#build-instructions), a `wael` binary application can be used:
```
wael --help
```

To evaluate code and output the resulting WKT, specify one or more input files:
```
wael ./myScript.wael
```

To output GeoJSON instead of WKT, add the `--geojson` flag:
```
wael ./myScript.wael --geojson
```

To evaluate expressions interactively in a read-eval-print loop (REPL), use the `--interactive` (or `-i`) flag.
```
wael -i
```

<br>

<image src="examples/usage.gif" alt="Terminal usage" width="700px" />

All evaluated files, including the interactive environment, will share the same scope. This means that any variables defined in a script file will be accessible in following scripts and the interactive environment, if specified. For example, in the following command, `myConstants.wael` variables will be accessible to `myFunctions.wael`, and variables in both scripts will be accessible in the interactive environment.
```
wael ./myConstants.wael ./myFunctions.wael -i
```

<br>

Expressions can be passed in directly with the `--evaluate` (or `-e`) flag.
```
wael -e "Point(1 1) + Point(2 2)"
```

Any variables defined in the `--evaluate` script can be used in following script files. For example, the following `path.wael` script references an undefined `start` variable:
```
start ++ GeometryCollection(Point(2 2), Point(3 3), Point(4 4))
```

When evaluated with the following command:
```
wael -e "start = Point(1 1)" path.wael
```

The `start` variable will be defined in the `--evaluate` argument and the output will be:
```
GEOMETRYCOLLECTION (POINT (1 1), POINT (2 2), POINT (3 3), POINT (4 4))
```

<br>


## Syntax

Define geometries using WKT syntax expressions:
```
GEOMETRYCOLLECTION(
    POINT (30 10),
    LINESTRING (30 10, 10 30, 40 40),
    POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10)),
    POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10),
        (20 30, 35 35, 30 20, 20 30))
)
```

Multiple expressions are separated by a semi-colon (`;`) and the last expression is returned after evaluation. For example, evaluating the code:
```
POINT (1 2);
LINESTRING (1 2, 3 4) 
```
will result in `LINESTRING (1 2, 3 4)`

Expressions are white-space insensitive and case-insensitive, so the following syntax is also valid:
```
LineString (
    1  2 , 
    3  4
)
```

### Comments

Comments begin with the `#` character:
```
# Napoli, Italy
Point(14.19 40.828)
```

### Arithmetic

Coordinate values can be expressed using basic numeric arithmetic (`+ - * / ^ %`):
```
Point((8 * 3) (-12 + 5)) # POINT (24 -7)
```

Geometries also support basic arithmetic:
```
Point(1 2) + Point(3 4) # POINT (4 6)
```

Array-like geometries support array programming operations:
```
LineString(1 1, 2 2, 3 3) + LineString(10 10, 10 10, 10 10); # LINESTRING (11 11, 12 12, 13 13)
LineString(1 1, 2 2, 3 3) - Point(10 10); # LINESTRING (-9 -9, -8 -8, -7 -7)
```

### Concatenation

`⚠ experimental feature`

Array-like geometries can be combined using the concatenate (`++`) operator:
```
LineString(1 1, 2 2) ++ LineString(3 3, 4 4); # LINESTRING (1 1, 2 2, 3 3, 4 4)
MultiPoint(1 1, 2 2) ++ MultiPoint(3 3, 4 4); # MULTIPOINT (1 1, 2 2, 3 3, 4 4)
GeometryCollection(Point(1 1)) ++ GeometryCollection(Point(2 2)); # GEOMETRYCOLLECTION(POINT (1 1),POINT (2 2))
```

Points can be appended to point array-like geometries:
```
LineString(1 1, 2 2) ++ Point(3 3); # LINESTRING (1 1, 2 2, 3 3)
MultiPoint(1 1, 2 2) ++ Point(3 3); # MULTIPOINT (1 1, 2 2, 3 3)
GeometryCollection(Point(1 1)) ++ Point(2 2); # GEOMETRYCOLLECTION(POINT (1 1),POINT (2 2))
```

Non array-like geometries are concatenated into a `GEOMETRYCOLLECTION`:
```
Point(1 1) ++ Point(2 2); # GEOMETRYCOLLECTION(POINT (1 1),POINT (2 2))
Point(1 1) ++ Polygon((2 2, 3 3, 4 4, 2 2)); # GEOMETRYCOLLECTION(POINT (1 1),POLYGON ((2 2, 3 3, 4 4, 2 2)))
```

### Variables

Variables are defined using the equal (`=`) operator. Supported data types include: 
* Number
* Boolean: `True`, `False`
* Geometry: `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon`, `GeometryCollection`
* Function

```
longitude = 2;              # number
bool = True;                # boolean
p = Point(longitude 3);     # geometry
fn = Function(p => p + 1);  # function
```

### Functions

Functions are first-class and declared using the `Function` keyword:
```
getEquatorPoint = Function(longitude => Point(longitude 0));
```

They can be invoked using parentheses `()`:
```
getEquatorPoint(14.19) # POINT (14.19 0)
```

Functions can also accept multiple parameters and have function bodies spanning multiple lines. Similar to top-level expressions outside of a function, the last expression in the function body is used as the return value.
```
myFn = Function((x, y, last) => (
    first = Point(x y);
    LineString(first, last)
));

myFn(1, 2, Point(3 4)) # LINESTRING (1 2, 3 4)
```

Functions can have parameters bound using the `bind()` method:
```
Generate 10 Function(i => ( x = Math:random() * 100; Point(x x) )) 
    || Round:bind(2)   

# GEOMETRYCOLLECTION (POINT (18.98 18.98), POINT (14.26 14.26), ...)
```

### Properties and Methods

Geometry properties and methods can be accessed using the accessor (`:`) operator:
```
p = Point(3 4);
p:type; # Point
p:x; # 3
p:y; # 4

g = GeometryCollection(Point(1 2), Point(3 4));
g:type; # GeometryCollection
g:numGeometries; # 2
g:geometryN(1); # POINT (3 4)

l = LineString(1 2, 3 4);
l:type; # LineString
l:numPoints; # 2
l:pointN(1); # POINT (3 4)
```

Geometry properties can be set by calling a method with an appropriate parameter. Since geometries are immutable, a new geometry instance is returned using the updated value:
```
p = Point(3 4);
p:x(5); # POINT (5 4)
p:y(6); # POINT (3 6)
p # POINT (3 4)
```

### Conditional Expressions

Boolean values `True` and `False` can be used in logical `And`, `Or` or negation `!` expressions:
```
a = True;
b = False;
a And b; # False
a Or b; # True
!a; # False
``` 

Numeric values can be used in comparison expressions `< <= > >= == !=`, which return a `boolean` value:
```
a = Point(1 2);
b = Point(3 4);
a:x < b:x # true
```

Control flow can be dictated using `If-Then-Else` expressions:
```
result = If (Point(1 2):x < 3)
         Then (LineString(1 1, 2 2, 3 3))
         Else (Point(0 0));
result # LINESTRING(1 1, 2 2, 3 3)
```

All three parts of the `If-Then-Else` expression are required. The `Then` and `Else` blocks can contain multiple lines, similar to a function body.
```
points = GeometryCollection(Point(0 0), Point(0 0), Point(0 0), Point(0 0), Point(0 0));
If (points:numGeometries > 3) Then (
    a = Point(1 2);
    b = Point(3 4);
    a + b
) Else (
    a = LineString(1 1, 2 2);
    b = LineString(3 3, 4 4);
    a + b
) # POINT (4 6)
```

### Generate Expressions

`⚠ experimental feature`

Multiple geometries can be generated using the `Generate` expression by specifying an iteration count and either a geometry or a function that returns a geometry. The set of all geometries returned from a `Generate` expression are collected into a `GEOMETRYCOLLECTION`.
```
Generate 3 Point(0 0); # GEOMETRYCOLLECTION(POINT (0 0),POINT (0 0),POINT (0 0))
Generate 3 Function(x => Point(x x)) # GEOMETRYCOLLECTION(POINT (0 0),POINT (1 1),POINT (2 2))
```

The iteration count can also be specified as a variable:
```
count = 3;
Generate count Point(0 0) # GEOMETRYCOLLECTION(POINT (0 0),POINT (0 0),POINT (0 0))
```

### Pipe Transformations

#### Mapping

`⚠ experimental feature`

The output from any expression can be used as the input to another function with the pipe (`|`) operator:
```
Point(1 1) | Function(x => LineString(x, 2 2)) # LINESTRING (1 1, 2 2)
```

Each item in an array-like geometry can be mapped using a function with the double-pipe (`||`) operator:
```
LineString(1 1, 2 2, 3 3) || Function(x => x * x) # LINESTRING (1 1, 4 4, 9 9)
```

The array map index is also available as function parameter:
```
LineString(1 1, 2 2, 3 3) || Function((x, i) => x * i) # LINESTRING (0 0, 2 2, 6 6)
```

Each point in a geometry can be transformed using the pipe-all (`|*`) operator:
```
LineString(1.4325 1.5325, 2.23525 2.7453, 3.26474 3.34643) |* Round:bind(1) # LINESTRING (1.4 1.5, 2.2 2.7, 3.3 3.3)
```

#### Filtering

`⚠ experimental feature`

Array-like geometries can be filtered using the filter (`|~`) operator:
```
LineString(1 1, 2 2, 3 3) |~ Function((p, i) => p:x <= 2) # LINESTRING (1 1, 2 2)
```

#### Reducing

`⚠ experimental feature`

Array-like geometries can be reduced using the reduce (`|>`) operator:
```
LineString(1 1, 2 2, 3 3) |> Function((total, current, index) => total + current) # Point(6 6)
```

### Importing

`⚠ experimental feature`

Data can be imported using `Import` expressions. For example, if the file `etna.wael` contains `Point(14.99 37.75)`, it can be imported using:
```
data = Import('etna.wael'):Default;
data # POINT (14.99 37.75)
```

Supported data formats include WKT, GeoJSON, and WAEL.

### Built-In Functions

`⚠ experimental feature`

Several built-in functions are provided to support geometry generation and transformation. 

#### `Math` proerties and methods

All JavaScript `Math` [static properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math#static_properties) and [static functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math#static_methods) are accessible from the `Math` variable:

```
pi = Math:PI;   # 3.141592653589793
Math:round(pi)  # 3
```

#### Flatten
`Flatten(g)` - flatten all geometries in a `GEOMETRYCOLLECTION`
```
Flatten(GeometryCollection(Point(1 1), GeometryCollection(Point(2 2)))) # GEOMETRYCOLLECTION(POINT (1 1),POINT (2 2))
```

#### PointGrid
`PointGrid(x, y, spacing)` - create a grid of points with the given X and Y count, and (optional) spacing
```
PointGrid(20, 10, 2) # GEOMETRYCOLLECTION(POINT (0 0),POINT (0 2), ... POINT (38 18))
```

#### PointCircle
`PointCircle(radius, count)` - create a circle of points with a given radius and point count
```
PointCircle(5, 50) # GEOMETRYCOLLECTION(POINT (5 0),POINT (4.9605735065723895 0.6266661678215213), ... )
```

#### Rotate
`Rotate(angleDegrees, originPoint, geometry)` - rotate a geometry by the specified degrees around an origin point
```
Rotate(23, Point(0 0), MultiPoint(1 1, 2 2, 3 3)) # MULTIPOINT (1.3112079320509338 0.5297935627181312, ... )
```

#### Round
`Round(precision, val)` - round a number or `Point` coordinates with a given precision (defaults to 0)
```
Round(1, 1.255) # 1.3
```

#### ToX

`ToLineString(g)`, `ToMultiPoint(g)`, `ToPolygon(g)`, `ToGeometryCollection(g)` - convert an array-like geometry of points to a different geometry type
```
list = GeometryCollection(Point(1 1), Point(2 2), Point(3 3));
ToLineString(list); # LINESTRING (1 1, 2 2, 3 3)
ToMultiPoint(list); # MULTIPOINT (1 1, 2 2, 3 3)
ToPolygon(list); # POLYGON ((1 1, 2 2, 3 3, 1 1))
ToGeometryCollection(list) # GEOMETRYCOLLECTION(POINT (1 1),POINT (2 2),POINT (3 3))
```

## Build Instructions

```
npm install
npm run build
```

To build the CLI binary, run:
```
npm run build-binary
```

The binary will be available at:
```
dist/bin/wael
```

## Testing Instructions

```
npm test
```

## Implementation Details

WAEL is implemented with TypeScript using [Ohm](https://ohmjs.org/). When code is evaluated, geometries are stored in an intermediate representation (IR) as GeoJSON objects, which can then be transformed to either WKT or GeoJSON as output.

## License

This project is made publicly available under the MIT license (see the [LICENSE](./LICENSE) file).
