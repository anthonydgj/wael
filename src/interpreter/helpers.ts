import * as turf from '@turf/turf';

import { GeometryType } from "./types";

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
            value?.type === type ||
            value?.geometry?.type === type;
        if (!isType) {
            return false;
        }
    }
    return true;
};

export const getGeometryType = (value: any, isForDisplay = false): GeometryType | undefined => {
    if(typeof value === 'object') {
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
        if(isGeometryType(type, value)) {
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
        return value.coordinates;
    } else if (isGeometryType(GeometryType.GeometryCollection, value)) {
        return value.geometries;
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
        return arithmeticOperation(turf.point([A, A]).geometry, B, op);
    }
    if (isNumber(B) && isAnyGeometryType(A)) {
        return arithmeticOperation(A, turf.point([B, B]).geometry, op);
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
    A: any,
    B: any,
    computeFn: (a: number, b: number) => number
) => {
    return turf.point([
        computeFn(A.coordinates[0], B.coordinates[0]),
        computeFn(A.coordinates[1], B.coordinates[1]),
    ]).geometry;
}


export const lineStringOperation = (
    A: any,
    B: any,
    computeFn: (a: number, b: number) => number
) => {
    return turf.lineString(A.coordinates.map((p: number[], index: number) => {
        return [
            computeFn(p[0], B.coordinates[index][0]),
            computeFn(p[1], B.coordinates[index][1]),
        ];
    })).geometry;
}

export const multiPointOperation = (
    A: any,
    B: any,
    computeFn: (a: number, b: number) => number
) => {
    return turf.multiPoint(A.coordinates.map((p: number[], index: number) => {
        return [
            computeFn(p[0], B.coordinates[index][0]),
            computeFn(p[1], B.coordinates[index][1]),
        ];
    })).geometry;
}

export class OperationNotSupported extends Error {
    constructor(message: string) {
        super(`Operation not supported: ${message}`);
    }
}

export function toString(value: any) {
    try {
        return JSON.stringify(value);
    } catch (err) {
        return value;
    }
}

export function transformPoints(coords: any[], coordsMapFn: (g: turf.Point) => any): any {
    if (!!coords) {
        if (Array.isArray(coords)) {
            if (coords.length > 0) {
                const firstElement = coords[0];
                if (Array.isArray(firstElement)) {
                    return coords.map((c: any) => transformPoints(c, coordsMapFn));
                } else {
                    // coords is a point
                    const point = turf.point(coords).geometry;
                    return coordsMapFn(point).coordinates;
                }
                
            }
        }
    }
    return coords
}

export function transform(geoJson: any, coordsMapFn: (g: turf.Point) => any): any {    
    if (!!geoJson) {

        if (!!geoJson.features) {
            return {
                ...geoJson,
                features: geoJson.features.map((feature: any) => transform(feature, coordsMapFn))
            };
        }

        if (!!geoJson.geometries) {
            return {
                ...geoJson,
                geometries: geoJson.geometries.map((geometry: any) => transform(geometry, coordsMapFn))
            }
        }

        const geometry: any = geoJson.geometry;
        if (!!geometry) {
            if (geoJson.coordinates) {
                return {
                    ...geoJson,
                    geometry: {
                        ...geometry,
                        coordinates: transformPoints(geometry.coordinates, coordsMapFn)
                    }
                }
            }
        }

        const coordinates = geoJson.coordinates;
        if (!!coordinates) {
            return {
                ...geoJson,
                coordinates: transformPoints(coordinates, coordsMapFn)
            }
        }
    }
    return geoJson;
}

export function convertToGeometry(json: any): any {
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

export function geometryAccessor(v: any, p: any, par: any) {
    const value = v.eval();
    const property = p.sourceString;
    const params = par.eval();

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
                            value.coordinates[1]
                        ]).geometry;
                    }
                    throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
                }
                // getter
                return value.coordinates[0];
            case 'y':
                if (params?.length > 0) {
                    // setter
                    if (params.length === 1) {
                        return turf.point([
                            value.coordinates[0],
                            params[0]
                        ]).geometry;
                    }
                    throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
                }
                // getter
                return value.coordinates[1];
        }
    } else if (isGeometryType(GeometryType.GeometryCollection, value)) {
        switch (property.toLocaleLowerCase()) {
            case 'geometryn':
                if (params.length === 1) {
                    const index = parseInt(params[0]);
                    return value.geometries[index];
                }
                throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
            case 'numgeometries':
                return value.geometries.length;
            }
    } else if (isGeometryType(GeometryType.LineString, value)) {
        switch (property.toLocaleLowerCase()) {
            case 'pointn':
                if (params.length === 1) {
                    const index = parseInt(params[0]);
                    return turf.point(value.coordinates[index]).geometry;
                }
                throw Error(`Expected one value in "${property}" setter for "${v.sourceString}" but got: ${toString(params)}`)
            case 'numpoints':
                return value.coordinates.length;
            }
    }

    throw new Error(`Property "${property}" not accessible on object: ${toString(value)}`);

}