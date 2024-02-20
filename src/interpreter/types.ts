export type GeoJSON = any; // TODO -- use GeoJSON type

export enum GeometryType {
    Point = 'Point',
    LineString = 'LineString',
    Polygon = 'Polygon',
    MultiPoint = 'MultiPoint',
    MultiLineString = 'MultiLineString',
    MultiPolygon = 'MultiPolygon',
    GeometryCollection = 'GeometryCollection'
}

export type Unit = null;
export const UNIT: Unit = null;

