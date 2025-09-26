import * as turf from '@turf/turf';

import { OperationNotSupported, isGeometryType, toString, transform } from './helpers';

import { GeometryType } from './types';
import { Point } from 'geojson';
import booleanEqual from "@turf/boolean-equal"

export namespace BuiltInFunctions {

    const getPointsList = (value: any) => {
        let points;
        if (isGeometryType(GeometryType.GeometryCollection, value)) {
            points = value?.geometries.map((f: any) => f.coordinates);
        } else if (
            isGeometryType(GeometryType.LineString, value) ||
            isGeometryType(GeometryType.MultiPoint, value)
        ) {
            points = value?.coordinates;
        }
        if (points) {
            return points;
        }
        throw new Error("Expected geometry with points list");
    }

    export const ToLineString = (value: any) => {
        const pointsList = getPointsList(value);
        return turf.lineString(pointsList).geometry;
    };

    export const ToMultiPoint = (value: any) => {
        const pointsList = getPointsList(value);
        return turf.multiPoint(pointsList).geometry;
    };

    export const ToPolygon = (value: any) => {
        const pointsList = getPointsList(value);
        // Auto-close polygon
        if (pointsList.length > 0) {
            if (!booleanEqual(
                turf.point(pointsList[0]).geometry,
                turf.point(pointsList[pointsList.length - 1]).geometry
            )) {
                pointsList.push(pointsList[0]);
            }
        }
        return turf.polygon([pointsList]).geometry;
    };

    export const ToGeometryCollection = (value: any) => {
        const pointsList = getPointsList(value);
        return turf.geometryCollection(pointsList.map((p: any) => turf.point(p).geometry)).geometry;
    };

    export const Round = (precision = 0, val: any): any => {
        if (typeof val === 'number') {
            return +val.toFixed(precision);
        }
        if (isGeometryType(GeometryType.Point, val)) {
            const coords = val.coordinates;
            return turf.point([
                Round(precision, coords[0]),
                Round(precision, coords[1]),
            ]).geometry;
        }
        throw new OperationNotSupported(`Unable to round value: ${toString(val)}`)
    }
}
