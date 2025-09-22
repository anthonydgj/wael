# Spatial Data Stack-Based Virtual Machine 

A program is encoded in a GeoJON `GEOMETRYCOLLECTION` of `POINT` values that is interpreted as a list of bytes. For example, the program `GeometryCollection(1 3, 1 4, 10 0, 1 7, 10 0)` is interpreted as bytes `1, 2, 1, 4, 10, 0, 1, 7, 10, 0`.

This program can be run with the following command:
```
ts-node ./scripts/wael.ts --outputNonGeoJSON ./examples/stack-vm/prog1.wael ./examples/stack-vm/stack-machine.wael
```

The output from this command is:
```
GEOMETRYCOLLECTION (POINT (14 0))
```

### Instruction Transformation

Instructions encoded in spatial data formats can be transformed by providing a `TRANSFORM` function.

For example, if the instructions are encoded as follows:
```
GeometryCollection(1 3, 1 4, 10 0, 1 7, 10 0) | Rotate(47)
```

They can be transformed to instructions understood by the VM with the command:
```
ts-node ./scripts/wael.ts --bind-import="PROGRAM=./examples/stack-vm/prog1.wael" -e "TRANSFORM = (v) => (v | Rotate(-47) | Round(1))" ./examples/stack-vm/stack-machine.wael --outputNonGeoJSON
```

Which will output the same result as above:
```
GEOMETRYCOLLECTION (POINT (14 0))
```