import { QuantitySytem } from "../units";
import type { IUnit, Quantity } from "../units/types";
import {
  ExpressionNode,
  IdentifierExpressionNode,
  InfixExpressionNode,
  NumberLiteralNode,
  PrefixExpressionNode,
} from "./ast";
import { TokenType } from "./lexer";

enum ObjectWithUnitType {
  ERROR = 0,
  NUMBER = 1,
}

export abstract class ValueObject {
  private _type: ObjectWithUnitType;
  public get type(): ObjectWithUnitType {
    return this._type;
  }

  constructor(type: ObjectWithUnitType) {
    this._type = type;
  }

  public abstract equals(other: object): boolean;
}

export class ErrorValue extends ValueObject {
  private _message: string;
  public get message(): string {
    return this._message;
  }
  constructor(message = "not initiated") {
    super(ObjectWithUnitType.ERROR);
    this._message = message;
  }

  public equals(other: object): boolean {
    return other instanceof ErrorValue && this._message === other.message;
  }
}

/**
 * Number representation. One must implement this
 * interface.
 *
 * Why this? In case the user wants a specific number representation,
 * e.g. dealing with monetary values often demands the use of a
 * decimal number representation where rounding and precision are
 * required to have a fine grained control.
 */
export interface INumber {
  readonly value: number;
  add(other: INumber | number): INumber;
  minus(other: INumber | number): INumber;
  multiply(other: INumber | number): INumber;
  divide(other: INumber | number): INumber;
  power(other: INumber | number): INumber;
  equals(other: INumber | number): boolean;
  toString(): string;
}

export function isNumberValue(obj: INumber | number): obj is INumber {
  return typeof obj !== "number";
}

export class NumberValue implements INumber {
  readonly value: number;
  static precision: number = 7;

  constructor(value: number) {
    this.value = value;
  }

  public add(other: INumber | number): INumber {
    const o = isNumberValue(other) ? other.value : other;
    return new NumberValue(this.value + o);
  }
  public minus(other: INumber | number): INumber {
    const o = isNumberValue(other) ? other.value : other;
    return new NumberValue(this.value - o);
  }
  public multiply(other: INumber | number): INumber {
    const o = isNumberValue(other) ? other.value : other;
    return new NumberValue(this.value * o);
  }
  public divide(other: INumber | number): INumber {
    const o = isNumberValue(other) ? other.value : other;
    return new NumberValue(this.value / o);
  }
  public power(other: INumber | number): INumber {
    const o = isNumberValue(other) ? other.value : other;
    return new NumberValue(Math.pow(this.value, o));
  }
  public equals(other: INumber | number): boolean {
    const o = isNumberValue(other) ? other.value : other;
    return Math.abs(this.value - o) <= NumberValue.precision;
  }
  public toString(): string {
    return this.value.toString();
  }
}

export class NumberWithUnitValue<N extends INumber> extends ValueObject {
  private static _supportedOperators = new Set<string>([
    TokenType.PLUS,
    TokenType.MINUS,
    TokenType.ASTERISK,
    TokenType.SLASH,
    TokenType.CARET,
  ]);

  private _unit: IUnit<Quantity[]>;
  public get unit(): IUnit<Quantity[]> {
    return this._unit;
  }

  private _number: N;
  public get number(): N {
    return this._number;
  }

  constructor(value: N, unit: IUnit<Quantity[]>) {
    super(ObjectWithUnitType.NUMBER);
    this._number = value;
    this._unit = unit;
  }

  public convertTo(unit: IUnit<Quantity[]>): INumber {
    const factor = this.unit.convertTo(unit);
    return this.number.multiply(factor);
  }

  public equals(other: object): boolean {
    if (other instanceof NumberWithUnitValue) {
      const factor = this.unit.convertTo(other.unit);
      if (isNaN(factor)) {
        return false;
      }

      return this.number.multiply(factor).equals(other.number);
    }

    return false;
  }

  public static evaluate(
    operator: string,
    left: NumberWithUnitValue<INumber>,
    right: NumberWithUnitValue<INumber>,
  ): ValueObject {
    if (!this._supportedOperators.has(operator)) {
      return new ErrorValue(`operator '${operator}' not supported`);
    }

    switch (operator) {
      case TokenType.PLUS: {
        const factor = left.unit.convertTo(right.unit);
        if (isNaN(factor)) {
          return new ErrorValue(
            `units '${left.unit.name}' and '${right.unit.name}' are incompatible`,
          );
        }
        const result = left.number.multiply(factor).add(right.number);
        return new NumberWithUnitValue(result, right.unit);
      }
      case TokenType.MINUS: {
        const factor = left.unit.convertTo(right.unit);
        if (isNaN(factor)) {
          return new ErrorValue(
            `units '${left.unit.name}' and '${right.unit.name}' are incompatible`,
          );
        }
        const result = left.number.multiply(factor).minus(right.number);
        return new NumberWithUnitValue(result, right.unit);
      }
      case TokenType.ASTERISK: {
        const result = left.number.multiply(right.number);
        const unit = left.unit.multiply(right.unit);
        return new NumberWithUnitValue(result, unit);
      }
      case TokenType.SLASH: {
        const result = left.number.divide(right.number);
        const unit = left.unit.divide(right.unit);
        return new NumberWithUnitValue(result, unit);
      }
      default: {
        if (!right.unit.isDimensionless) {
          return new ErrorValue(
            "exponentiation only allowed if exponent is dimensionless",
          );
        }
        const result = left.number.power(right.number);
        return new NumberWithUnitValue(result, left.unit);
      }
    }
  }
}

export type EvaluationWithUnitEnvironmentType = Map<
  string,
  NumberWithUnitValue<INumber>
>;

export class EvaluatorWithUnits {
  private _system: QuantitySytem;
  private _environment: EvaluationWithUnitEnvironmentType;
  private _numberConstructor: (n: number) => INumber;
  constructor(
    quantitySystem: QuantitySytem,
    environment: EvaluationWithUnitEnvironmentType,
    numberConstructor = (n: number) => new NumberValue(n),
  ) {
    this._system = quantitySystem;
    this._environment = environment;
    this._numberConstructor = numberConstructor;
  }

  public evaluate(node: ExpressionNode): ValueObject {
    switch (node.type) {
      case "Number": {
        if (!(node instanceof NumberLiteralNode)) {
          return new ErrorValue(
            "node type does not match with number literal node",
          );
        }
        const n = this._numberConstructor(node.value);
        return new NumberWithUnitValue(n, this._system.adimensional);
      }
      case "Identifier": {
        if (!(node instanceof IdentifierExpressionNode)) {
          return new ErrorValue(
            "node type does not match with identifier expression node",
          );
        }
        return this.evalIdentifierNode(node);
      }
      case "Prefix": {
        if (!(node instanceof PrefixExpressionNode)) {
          return new ErrorValue(
            "node type does not match with prefix expression node",
          );
        }
        const right = this.evaluate(node.right);
        if (right instanceof ErrorValue) {
          return right;
        }
        return this.evalPrefixNode(node.operator, right);
      }
      case "Infix": {
        if (!(node instanceof InfixExpressionNode)) {
          return new ErrorValue(
            "node type does not match with prefix expression node",
          );
        }

        const left = this.evaluate(node.left);
        if (left instanceof ErrorValue) {
          return left;
        }

        const right = this.evaluate(node.right);
        if (right instanceof ErrorValue) {
          return right;
        }

        return this.evalInfixNode(node.operator, left, right);
      }
      case "Invalid": {
        return new ErrorValue("invalid syntax for evaluation");
      }
      default:
        return new ErrorValue(
          `unrecognized expression node type: ${node.type}`,
        );
    }
  }

  private evalIdentifierNode(node: IdentifierExpressionNode): ValueObject {
    const value = this._environment.get(node.value);
    if (value === undefined) {
      return new ErrorValue(`identifier '${node.value}' not found`);
    }

    return value;
  }

  private evalPrefixNode(operator: string, right: ValueObject): ValueObject {
    switch (operator) {
      case "-":
        return right instanceof NumberWithUnitValue
          ? new NumberWithUnitValue(
              this._numberConstructor(-right.number),
              right.unit,
            )
          : new ErrorValue(
              "object to the right of operator is not number type",
            );

      default:
        return new ErrorValue(`invalid prefix operator provided ${operator}`);
    }
  }

  private evalInfixNode(
    operator: string,
    left: ValueObject,
    right: ValueObject,
  ): ValueObject {
    if (
      left instanceof NumberWithUnitValue &&
      right instanceof NumberWithUnitValue
    ) {
      return NumberWithUnitValue.evaluate(operator, left, right);
    }

    return new ErrorValue(
      `both objects must be numbers with units. Left type: ${ObjectWithUnitType[left.type]}, right type: ${ObjectWithUnitType[right.type]}`,
    );
  }
}
