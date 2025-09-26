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

    export const ToGeometryCollection = (value: any) => {
        const pointsList = getPointsList(value);
        return turf.geometryCollection(pointsList.map((p: any) => turf.point(p).geometry)).geometry;
    };
}
