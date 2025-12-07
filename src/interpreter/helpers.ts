import * as turf from '@turf/turf';

import { Feature, Point } from 'geojson';

import { GeometryType } from "./types";

const INDENT = '  ';

export const isAnyGeometryType = (value: any) => {
    const types = Object.values(GeometryType);
    for (const type of types) {
        if (isGeometryType(type, value)) {
            return true;
        }
    }
    return false;
}

export const isGeometryType = (type: GeometryType, ...values: any) => {
    for (const value of values) {
        const isType = typeof value === 'object' &&
            (
                (value?.type === 'Feature' && value?.geometry.type === type) ||
                (value?.type === 'FeatureCollection' && type === GeometryType.GeometryCollection)
            )
        if (!isType) {
            return false;
        }
    }
    return true;
};

export const getGeometryType = (value: any, isForDisplay = false): GeometryType | undefined => {
    if (typeof value === 'object') {
        const type = value?.geometry?.type || value?.type
        if (isForDisplay && type === GeometryType.GeometryCollection) {
            return GeometryType.GeometryCollection;
        }
        return type;
    }
    return undefined;
}


export const isAGeometryType = (value: any, ...types: GeometryType[]) => {
    for (const type of types) {
        if (isGeometryType(type, value)) {
            return true;
        }
    }
    return false;
};

export const getArrayLikeItems = (value: any) => {
    if (
        isGeometryType(GeometryType.LineString, value) ||
        isGeometryType(GeometryType.MultiPoint, value)
    ) {
        return value.geometry.coordinates;
    } else if (isGeometryType(GeometryType.GeometryCollection, value)) {
        return value.geometry.geometries;
    }
    return undefined;
};

export const isNumber = (...values: any) => {
    return isType('number', ...values);
}

export const isString = (...values: any) => {
    return isType('string', ...values);
};

export const isType = (type: string, ...values: any) => {
    for (const value of values) {
        const isType = typeof value === type;
        if (!isType) {
            return false;
        }
    }
    return true;
}

export const arithmeticOperationExp = (a: any, b: any, op: (a: any, b: any) => any) => {
    return arithmeticOperation(a.eval(), b.eval(), op);
}

export const arithmeticOperation = (A: any, B: any, op: (a: any, b: any) => any): any => {
    if (isNumber(A, B)) {
        return op(A, B);
    }
    if (isNumber(A) && isAnyGeometryType(B)) {
        return arithmeticOperation(turf.point([A, A]), B, op);
    }
    if (isNumber(B) && isAnyGeometryType(A)) {
        return arithmeticOperation(A, turf.point([B, B]), op);
    }
    if (isGeometryType(GeometryType.Point, A, B)) {
        return pointOperation(A, B, op);
    }
    if (isGeometryType(GeometryType.LineString, A, B)) {
        return lineStringOperation(A, B, op);
    }
    if (isGeometryType(GeometryType.MultiPoint, A, B)) {
        return multiPointOperation(A, B, op);
    }
    if (isGeometryType(GeometryType.Point, A)) {
        return transform(B, (b => pointOperation(A, b, op)))
    }
    if (isGeometryType(GeometryType.Point, B)) {
        return transform(A, (a => pointOperation(a, B, op)))
    }
    return undefined;
}

export const pointOperation = (
    A: GeoJSON.Feature<Point>,
    B: GeoJSON.Feature<Point>,
    computeFn: (a: number, b: number) => number
) => {
    return turf.point([
        computeFn(A.geometry.coordinates[0], B.geometry.coordinates[0]),
        computeFn(A.geometry.coordinates[1], B.geometry.coordinates[1]),
    ]);
}


export const lineStringOperation = (
    A: any,
    B: any,
    computeFn: (a: number, b: number) => number
) => {
    return turf.lineString(A.geometry.coordinates.map((p: number[], index: number) => {
        return [
            computeFn(p[0], B.geometry.coordinates[index][0]),
            computeFn(p[1], B.geometry.coordinates[index][1]),
        ];
    }));
}

export const multiPointOperation = (
    A: any,
    B: any,
    computeFn: (a: number, b: number) => number
) => {
    return turf.multiPoint(A.geometry.coordinates.map((p: number[], index: number) => {
        return [
            computeFn(p[0], B.geometry.coordinates[index][0]),
            computeFn(p[1], B.geometry.coordinates[index][1]),
        ];
    }));
}

export class OperationNotSupported extends Error {
    constructor(message: string) {
        super(`Operation not supported: ${message}`);
    }
}

export function toString(value: any) {
    try {
        return `${JSON.stringify(value)}`;
    } catch (err) {
        return `${value}`;
    }
}

export function transformPoints(coords: any[], coordsMapFn: (g: GeoJSON.Feature<Point>) => any): any {
    if (!!coords) {
        if (Array.isArray(coords)) {
            if (coords.length > 0) {
                const firstElement = coords[0];
                if (Array.isArray(firstElement)) {
                    return coords.map((c: any) => transformPoints(c, coordsMapFn));
                } else {
                    // coords is a point
                    const point = turf.point(coords);
                    return coordsMapFn(point).geometry.coordinates;
                }

            }
        }
    }
    return coords
}

export function transform(geoJson: GeoJSON.Feature | GeoJSON.FeatureCollection, coordsMapFn: (g: GeoJSON.Feature<Point>) => any): any {
    if (!!geoJson) {
        if (geoJson.type === 'FeatureCollection') {
            return {
                ...geoJson,
                features: geoJson.features.map((feature: any) => transform(feature, coordsMapFn))
            };
        }

        if (geoJson.type === 'Feature') {
            if (geoJson.geometry.type === 'GeometryCollection') {
                return {
                    ...geoJson,
                    geometry: {
                        ...geoJson.geometry,
                        geometries: geoJson.geometry.geometries.map((geometry: any) => transform(geometry, coordsMapFn))
                    }
                }
            }

            if (geoJson.geometry.coordinates) {
                return {
                    ...geoJson,
                    geometry: {
                        ...geoJson.geometry,
                        coordinates: transformPoints(geoJson.geometry.coordinates, coordsMapFn)
                    }
                }
            }

            // const coordinates = geoJson.coordinates;
            // if (!!coordinates) {
            //     return {
            //         ...geoJson,
            //         coordinates: transformPoints(coordinates, coordsMapFn)
            //     }
            // }

        }

    }
    return geoJson;
}

export function convertToGeometry(json: any): any {
    return json;
    if (json.type === 'Feature') {
        return json.geometry;
    } else if (json.type === 'FeatureCollection') {
        return {
            type: 'GeometryCollection',
            geometries: json.features.map((f: any) => convertToGeometry(f))
        }
    } else if (Array.isArray(json)) {
        return {
            type: 'GeometryCollection',
            geometries: json.map((f: any) => convertToGeometry(f))
        }
    }
    return json;
}

export function geometryAccessor(v: any, p: any, params: any[]) {
    const value = v.eval();
    const property = p.sourceString;

    if (!isAnyGeometryType(value)) {
        throw new Error(`Expected a geometry type for value "${v.sourceString}" but got: ${toString(value)}`);
    }

    switch (property.toLocaleLowerCase()) {
        case 'type':
            if (params?.length > 1) {
                throw new Error(`Expected no parameters for "${property}" for ${v.sourceString}`)
            }
            return getGeometryType(value, true);
    }

    if (isGeometryType(GeometryType.Point, value)) {
        switch (property.toLocaleLowerCase()) {
            case 'x':
                if (params?.length > 0) {
                    // setter
                    if (params.length === 1) {
                        return turf.point([
                            params[0],
                            value.geometry.coordinates[1]
                        ]);
                    }
                    throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
                }
                // getter
                return value.geometry.coordinates[0];
            case 'y':
                if (params?.length > 0) {
                    // setter
                    if (params.length === 1) {
                        return turf.point([
                            value.geometry.coordinates[0],
                            params[0]
                        ]);
                    }
                    throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
                }
                // getter
                return value.geometry.coordinates[1];
        }
    } else if (isGeometryType(GeometryType.GeometryCollection, value)) {
        switch (property.toLocaleLowerCase()) {
            case 'geometryn':
                if (params.length === 1) {
                    const index = parseInt(params[0]);
                    return value.geometry.geometries[index];
                }
                throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
            case 'numgeometries':
                return value.geometry.geometries.length;
        }
    } else if (isGeometryType(GeometryType.LineString, value)) {
        switch (property.toLocaleLowerCase()) {
            case 'pointn':
                if (params.length === 1) {
                    const index = parseInt(params[0]);
                    return turf.point(value.geometry.coordinates[index]);
                }
                throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
            case 'numpoints':
                return value.geometry.coordinates.length;
        }
    }

    throw new Error(`Property "${property}" not accessible on object: ${toString(value)}`);
}

export const objectToString = (obj: any, includeHistory = true) => {
    const bindings = Object.keys(obj ?? {})
        .filter(identifier => {
            return identifier !== 'toString' &&
                (includeHistory || !identifier?.startsWith('$')) &&
                (obj[identifier] ?? null) !== null
        })
        .map(identifier => {
            const value = obj[identifier];
            let strValue;
            if (value?.toStringShort) {
                strValue = value.toStringShort();
            } else if (typeof value === 'object') {
                if (isAnyGeometryType(value)) {
                    strValue = value?.type;
                } else {
                    strValue = `Module(...)`;
                }
            } else if (typeof value === 'string') {
                strValue = `"${value}"`
            } else if (typeof value === 'function') {
                strValue = `<Native Function>`
            } else {
                strValue = value;
            }
            return `${INDENT}${identifier} = ${strValue}`;
        });
    return `Module(\n${bindings.join('\n')}\n)`;
}

export const generateGeometries = (numExp: any, valueExp: any) => {
    const num = numExp.eval();
    if (!Number.isInteger(num) && typeof num !== 'function') {
        throw new Error(`Expected integer but got: ${toString(num)}`);
    }
    let value = valueExp.eval();
    let mapFn;
    if (typeof value === 'function') {
        mapFn = value;
    } else if (isAnyGeometryType(value)) {
        mapFn = () => value;
    } else {
        throw new Error(`Expected geometry type or function but got: ${toString(value)}`);
    }
    const items: any[] = [];
    if (typeof num === 'function') {
        let i = 0;
        let condition = num(i, num);
        while (condition) {
            const result = mapFn(i);
            if (result !== undefined) {
                if (!isAnyGeometryType(result)) {
                    throw new Error(`Expected geometry type return value but got: ${toString(result)}`);
                }
                items.push(result);
            }
            condition = num(++i);
        }
    } else {
        for (let i = 0; i < num; i++) {
            const result = mapFn(i, num);
            if (result !== undefined) {
                if (!isAnyGeometryType(result)) {
                    throw new Error(`Expected geometry type return value but got: ${toString(result)}`);
                }
                items.push(result);
            }
        }
    }
    return turf.geometryCollection(items);
}
