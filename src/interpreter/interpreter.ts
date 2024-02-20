// import ohm from 'ohm-js';
import * as ohm from 'ohm-js';
import * as turf from '@turf/turf'

import { GeometryType, UNIT } from './types';
import {
    OperationNotSupported,
    arithmeticOperationExp,
    convertToGeometry,
    geometryAccessor,
    getArrayLikeItems,
    getGeometryType,
    isAnyGeometryType,
    isGeometryType,
    isNumber,
    toString,
    transform
} from './helpers';
import { Scope, ScopeBindings } from './scope';

import { BuiltInFunctions } from './built-in-functions';
import { GRAMMAR } from './grammar';
import { readFileSync } from 'fs';

// Used for local development
// const fs = require('fs');
// const grammarString = fs.readFileSync('./src/interpreter/grammar.ohm', 'utf-8');

const grammarString = GRAMMAR;

export namespace Interpreter {

    export const IDENTIFIER_LAST = '$?';
    
    export const STANDARD_LIBRARY: ScopeBindings = {};

    Object.getOwnPropertyNames(Math).forEach(prop => {
        STANDARD_LIBRARY[prop] = (Math as any)[prop];
    });
    STANDARD_LIBRARY['Flatten'] = BuiltInFunctions.Flatten;
    STANDARD_LIBRARY['PointCircle'] = BuiltInFunctions.PointCircle;
    STANDARD_LIBRARY['PointGrid'] = BuiltInFunctions.PointGrid;
    STANDARD_LIBRARY['ToLineString'] = BuiltInFunctions.ToLineString;
    STANDARD_LIBRARY['ToMultiPoint'] = BuiltInFunctions.ToMultiPoint;
    STANDARD_LIBRARY['ToPolygon'] = BuiltInFunctions.ToPolygon;
    STANDARD_LIBRARY['ToGeometryCollection'] = BuiltInFunctions.ToGeometryCollection;
    STANDARD_LIBRARY['Rotate'] = BuiltInFunctions.Rotate;
    STANDARD_LIBRARY['Round'] = BuiltInFunctions.Round;

    export const createGlobalScope = () => new Scope(undefined, undefined, STANDARD_LIBRARY);
        
    export function evaluateInput(input: string, initialScope?: Scope): any {
        const GLOBAL_SCOPE = createGlobalScope();
        let currentScope = initialScope || GLOBAL_SCOPE;
        const grammar = ohm.grammar(grammarString);
        const semantics = grammar.createSemantics();
        semantics.addOperation('eval', {
            stringLiteral(_leftQuote, str, _rightQuote) {
                return str.sourceString;
            },
            ImportExpression(_keyword, _lp, importUri, _rp) {
                const uri = importUri.eval();
                const file = readFileSync(uri, 'utf8');
                try {
                    return convertToGeometry(JSON.parse(file));
                } catch { }
                try {
                    return evaluateInput(file);
                } catch { }
                throw new Error(`Unable to import file: ${uri}`);
            },
            IfThenElseExp(_if, c, _then, exp1, _else, exp2) {
                const condition = c.eval();
                if (condition) {
                    return exp1.eval();
                }
                return exp2.eval();
            },
            booleanValue(val) {
                const value = val.sourceString.toLocaleLowerCase();
                if (value === 'true') {
                    return true;
                }
                if (value === 'false') {
                    return false;
                }
                throw new Error(`Invalid boolean value: ${val.sourceString}`);
            },
            EqualityExp(v1, op, v2) {
                const value1 = v1.eval();
                const operator = op.sourceString;
                const value2 = v2.eval();
                switch (operator.trim().toLocaleLowerCase()) {
                    case "==":
                        return value1 === value2;
                    case "!=":
                        return value1 !== value2;
                    case "and":
                        return value1 && value2;
                    case "or":
                        return value1 || value2;
                }
                throw new Error(`Operator not supported: ${operator}`);
            },
            NotExp(_, exp) {
                return !exp.eval();
            },
            geometryKeyword(keyword) {
                return keyword.sourceString;
            },
            CompareExp(v1, op, v2) {
                const value1 = v1.eval();
                if (!isNumber(value1)) {
                    throw new Error(`Expected a number for ${v1.sourceString} but got: ${toString(value1)}`)
                }
                const operator = op.sourceString;
                const value2 = v2.eval();
                if (!isNumber(value2)) {
                    throw new Error(`Expected a number for ${v2.sourceString} but got: ${toString(value2)}`)
                }
                switch (operator.trim()) {
                    case "<":
                        return value1 < value2;
                    case "<=":
                        return value1 <= value2;
                    case ">":
                        return value1 > value2;
                    case ">=":
                        return value1 >= value2;
                }
                throw new Error(`Operator not supported: ${operator}`);
            },
            ConcatExp(g1, _op, g2) {
                const geom1 = g1.eval();
                const geom2 = g2.eval();

                const type1 = getGeometryType(geom1);
                const type2 = getGeometryType(geom2);
                if (!type1 || !type2) {
                    throw new Error(`Expected geometry types for concatenation but found geom1: ${toString(geom1)} and geom2: ${toString(geom2)}`);
                }
                
                if (type1 === type2) {

                    const list1: any[] = getArrayLikeItems(geom1);
                    const list2: any[] = getArrayLikeItems(geom2);
                    
                    // Point collections
                    if (
                        type1 === GeometryType.LineString || 
                        type1 === GeometryType.MultiPoint || 
                        type1 === GeometryType.GeometryCollection     
                    ) {
                        const combined = list1.concat(list2);
                        if (type1 === GeometryType.LineString) {
                            return turf.lineString(combined).geometry;
                        }
                        if (type1 === GeometryType.MultiPoint) {
                            return turf.multiPoint(combined).geometry;
                        }
                        if (type1 === GeometryType.GeometryCollection) {
                            return turf.geometryCollection(combined).geometry;
                        }
                    }
                }
                
                if (
                    type1 === GeometryType.LineString || 
                    type1 === GeometryType.MultiPoint   
                ) {
                    const list1: any[] = getArrayLikeItems(geom1);
                    let list2: any;
                    if (
                        type2 === GeometryType.LineString || 
                        type2 === GeometryType.MultiPoint   
                    ) {
                        list2 = getArrayLikeItems(geom2);
                    } else {
                        if (type2 === GeometryType.Point) {
                            list2 = [geom2.coordinates];
                        }
                    }
                    if (list2) {
                        const combined = list1.concat(list2);
                        if (type1 === GeometryType.LineString) {
                            return turf.lineString(combined).geometry;
                        }
                        if (type1 === GeometryType.MultiPoint) {
                            return turf.multiPoint(combined).geometry;
                        }
                        if (type1 === GeometryType.GeometryCollection) {
                            return turf.geometryCollection(combined).geometry;
                        }
                    }
                }

                if (type1 === GeometryType.GeometryCollection) {
                    return turf.geometryCollection(geom1.geometries.concat([geom2])).geometry;
                }

                return turf.geometryCollection([geom1, geom2]).geometry;
            },
            PipeExp(a, op, f) {
                const operator = op.sourceString;
                const val = a.eval();
                const fn = f.eval();

                if (operator === '|') {
                    return fn(val);
                }

                if (operator === '|*') {
                    return transform(val, fn);
                }

                const list: any[] = getArrayLikeItems(val);
                let listFn: any;
                switch (operator) {
                    case '||':
                        listFn = Array.prototype.map;
                        break;
                    case '|>':
                        listFn = Array.prototype.filter;
                        break;
                    default:
                        throw new Error(`Operator ${operator} not supported`)
                }

                if (isGeometryType(GeometryType.GeometryCollection, val)) {
                    const mappedList = listFn.call(list, (v: any, i: number) => fn(v, i));
                    return turf.geometryCollection(mappedList).geometry;
                }

                if (isGeometryType(GeometryType.LineString, val)) {
                    const mappedList = listFn.call(
                        list.map(coords => turf.point(coords).geometry),
                        (v: any, i: number) => fn(v, i)
                    )
                    .map((v: any) => v.coordinates);
                    return turf.lineString(mappedList).geometry;
                }

                if (isGeometryType(GeometryType.MultiPoint, val)) {
                    const mappedList = listFn.call(
                        list.map(coords => turf.point(coords).geometry),
                        (v: any, i: number) => fn(v, i)
                    )
                    .map((v: any) => v.coordinates);
                    return turf.multiPoint(mappedList).geometry;
                }

                // TODO -- Line types (Polygon, MultiLineString)

                throw Error(`Error mapping values to geometries`);
            },
            TopLevel(scopedExpressions, _end) {
                let lastValue = scopedExpressions.eval();
                return lastValue;
            },
            GenerateExp(_keyword, numExp, valueExp) {
                const num = numExp.eval();
                if (!Number.isInteger(num)) {
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
                for (let i=0; i<num; i++) {
                    const result = mapFn(i);
                    if (!isAnyGeometryType(result)) {
                        throw new Error(`Expected geometry type return value but got: ${toString(result)}`);
                    }
                    items.push(result);
                }
                return turf.geometryCollection(items).geometry;
            },
            FunctionCallExp(callable, p) {
                const fn = callable.eval();
                const params = p.eval();
                if (!fn) {
                    throw new Error(`${callable.sourceString} is: ${fn}`);
                }
                const value = fn(...params);
                return value;
            },
            AccessibleExp_method(val, _accessOp, prop, p) {
                const value = val.eval();
                const params = p.eval();
                const identifier = prop.sourceString;
                if (typeof value === 'function') {
                    if (identifier === 'bind') {
                        return value.bind(undefined, ...params)
                    }
                } else if (isAnyGeometryType(value)) {
                    return geometryAccessor(val, prop, p);
                }
                return value;
            },
            Invocation(_leftParen, list, _rightParen) {
                return list.asIteration().children.map(c => c.eval());
            },
            FunctionExp(p, _, body) {
                let params = p.eval();
                params = Array.isArray(params) ? params : [params];
                const fn = (...values: any[]) => {
                    // Create new scope per function call.
                    currentScope = currentScope.push();
                    const _this = this;
                    params.forEach((paramName: any, index: number) => {
                        currentScope.store(paramName, values[index])
                    });
                    const ret = body.eval();
                    currentScope = currentScope.pop() || GLOBAL_SCOPE;
                    return ret;
                };
                return fn.bind(currentScope);
            },
            FunctionParameters_multipleParams(_leftParen, identifierList, _rightParen) {
                const params = identifierList.asIteration().children.map(c => c.sourceString);
                return params;
            },
            FunctionParameters_single(identifier) {
                return [identifier.sourceString];
            },
            FunctionTextExp(_keyword, _leftParen, exp, _rightParen) {
                return exp.eval();
            },
            id(first, rest) {
                const key = first.sourceString + rest.sourceString;
                return currentScope.resolve(key);
            },
            Declaration(identifier, _, value) {
                const variableName = identifier.sourceString;
                const variableValue = value.eval();
                const scope = currentScope;
                scope.store(variableName, variableValue);
                return UNIT;
            },
            ScopedExpressions_list(list) {
                const expressions = list.asIteration().children.map(c => c.eval());
                return expressions[expressions.length - 1];
            },
            GeneralExpression_rightComment(exp, _) {
                return exp.eval();
            },
            GeneralExpression_leftComment(_, exp) {
                return exp.eval();
            },
            Paren(_leftParen, exp, _rightParen) {
                return exp.eval();
            },
            OptionallyParen_paren(_leftParen, exp, _rightParen) {
                return exp.eval();
            },
            OptionallyBraced_brace(_leftBrace, exp, _rightBrace) {
                return exp.eval();
            },
            GeometryTaggedText(_keyword, exp) {
                return exp.eval();
            },
            GeometryCollectionText_present(_leftParen, list, _rightParen) {
                const geometries = ((list || []) as any).asIteration().children.map((c: any) => c.eval());
                return turf.geometryCollection(geometries).geometry;
            },
            MultiPolygonText_present(_leftParen, list, _rightParen) {
                const polygons = list.asIteration().children.map(c => c.eval());
                return turf.multiPolygon(polygons.map(p => p.coordinates)).geometry;
            },
            MultiLineStringText_present(_leftParen, list, _rightParen) {
                const lineStrings = list.asIteration().children.map(c => c.eval());
                return turf.multiLineString(lineStrings.map(p => p.coordinates)).geometry;
            },
            MultiPointText_present(_leftParen, list, _rightParen) {
                const points = list.eval();
                return turf.multiPoint(points.map((p: any) => p.coordinates)).geometry;
            },
            PolygonText_present(_leftParen, list, _rightParen) {
                const points = list.asIteration().children.map(c => c.eval());
                return turf.polygon(points.map(p => p.coordinates)).geometry;
            },
            LineStringText_present(_leftParen, list, _rightParen) {
                const points = list.eval();
                return turf.lineString(points.map((p: any) => p.coordinates)).geometry;
            },
            PointList(list) {
                return list.asIteration().children.map(c => c.eval());
            },
            PointTaggedText(_, point) {
                return point.eval();
            },
            PointText_present(_leftParen, point, _rightParen) {
                return point.eval();
            },
            Point(x, y) {
                return turf.point([x.eval(), y.eval()]).geometry;
            },
            PointNumberValue_expression(_leftParen, exp, _rightParen) {
                return exp.eval();
            },
            ArithmeticAddExp_plus(a, _, b) {
                const result = arithmeticOperationExp(a, b, (a, b) => a + b);
                if (result !== undefined) {
                    return result;
                }
                throw new OperationNotSupported(`${toString(a.eval())} + ${toString(b.eval())}`);
            },
            ArithmeticAddExp_minus(a, _, b) {
                const result = arithmeticOperationExp(a, b, (a, b) => a - b);
                if (result !== undefined) {
                    return result;
                }
                throw new OperationNotSupported(`${toString(a.eval())} - ${toString(b.eval())}`);
            },
            ArithmeticMulExp_times(a, _, b) {
                const result = arithmeticOperationExp(a, b, (a, b) => a * b);
                if (result !== undefined) {
                    return result;
                }
                throw new OperationNotSupported(`${toString(a.eval())} * ${toString(b.eval())}`);
            },
            ArithmeticMulExp_divide(a, _, b) {
                const result = arithmeticOperationExp(a, b, (a, b) => a / b);
                if (result !== undefined) {
                    return result;
                }
                throw new OperationNotSupported(`${toString(a.eval())} / ${toString(b.eval())}`);
            },
            ArithmeticMulExp_mod(a, _, b) {
                const result = arithmeticOperationExp(a, b, (a, b) => a % b);
                if (result !== undefined) {
                    return result;
                }
                throw new OperationNotSupported(`${toString(a.eval())} % ${toString(b.eval())}`);
            },
            ArithmeticExpExp_power(a, _, b) {
                const result = arithmeticOperationExp(a, b, (a, b) => Math.pow(a, b));
                if (result !== undefined) {
                    return result;
                }
                throw new OperationNotSupported(`${toString(a.eval())} ^ ${toString(b.eval())}`);
            },
            ArithmeticPriExp_paren(_l, exp, _r) {
                return exp.eval();
            },
            exactNumericLiteral_decimalWithWholeNumber(whole, _, decimal) {
                return parseFloat(`${whole.sourceString}.${decimal.sourceString}`);
            },
            exactNumericLiteral_decimalWithoutWholeNumber(_, decimal) {
                return parseFloat(`.${decimal.sourceString}`);
            },
            exactNumericLiteral_wholeNumber(whole) {
                return parseInt(`${whole.sourceString}`);
            },
            approximateNumericLiteral(mantissa, e, exponent) {
                return parseFloat(`${mantissa.eval()}${e}${exponent.eval()}`);
            },
            signedNumericLiteral_signPresent(sign, numericLiteral) {
                return parseFloat(`${sign.sourceString}${numericLiteral.eval()}`);
            },
            signedNumericLiteral_signMissing(numericLiteral) {
                return numericLiteral.eval();
            },
            comment(_a, _b, _c, _d, _e) {
                return UNIT;
            },
            emptySet(_val) {
                return UNIT;
            }
        });
    
        const matchResult = grammar.match(input);
        if (matchResult.message) {
            console.error(`Message: ${matchResult.message}`)
        }
        const sem = semantics(matchResult);
        const result = sem.eval();
        currentScope.store(IDENTIFIER_LAST, result);
        return result;
    }
    
}