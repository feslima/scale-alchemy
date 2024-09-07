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

export class NumberWithUnitValue extends ValueObject {
  private _precision: number;
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

  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(value: number, unit: IUnit<Quantity[]>, precision = 7) {
    super(ObjectWithUnitType.NUMBER);
    this._value = value;
    this._precision = precision;
    this._unit = unit;
  }

  public convertTo(unit: IUnit<Quantity[]>): number {
    const factor = this.unit.convertTo(unit);
    return this.value * factor;
  }

  public equals(other: object): boolean {
    if (other instanceof NumberWithUnitValue) {
      const factor = this.unit.convertTo(other.unit);
      if (isNaN(factor)) {
        return false;
      }

      return Math.abs(this.value * factor - other.value) <= this._precision;
    }

    return false;
  }

  public static evaluate(
    operator: string,
    left: NumberWithUnitValue,
    right: NumberWithUnitValue,
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
        const result = left.value * factor + right.value;
        return new NumberWithUnitValue(result, right.unit);
      }
      case TokenType.MINUS: {
        const factor = left.unit.convertTo(right.unit);
        if (isNaN(factor)) {
          return new ErrorValue(
            `units '${left.unit.name}' and '${right.unit.name}' are incompatible`,
          );
        }
        const result = left.value * factor - right.value;
        return new NumberWithUnitValue(result, right.unit);
      }
      case TokenType.ASTERISK: {
        const result = left.value * right.value;
        const unit = left.unit.multiply(right.unit);
        return new NumberWithUnitValue(result, unit);
      }
      case TokenType.SLASH: {
        const result = left.value / right.value;
        const unit = left.unit.divide(right.unit);
        return new NumberWithUnitValue(result, unit);
      }
      default: {
        if (!right.unit.isDimensionless) {
          return new ErrorValue(
            "exponentiation only allowed if exponent is dimensionless",
          );
        }
        const result = Math.pow(left.value, right.value);
        return new NumberWithUnitValue(result, left.unit);
      }
    }
  }
}

export type EvaluationWithUnitEnvironmentType = Map<
  string,
  NumberWithUnitValue
>;

export class EvaluatorWithUnits {
  private _system: QuantitySytem;
  private _environment: EvaluationWithUnitEnvironmentType;
  constructor(
    quantitySystem: QuantitySytem,
    environment: EvaluationWithUnitEnvironmentType,
  ) {
    this._system = quantitySystem;
    this._environment = environment;
  }

  public evaluate(node: ExpressionNode): ValueObject {
    switch (node.type) {
      case "Number": {
        if (!(node instanceof NumberLiteralNode)) {
          return new ErrorValue(
            "node type does not match with number literal node",
          );
        }

        return new NumberWithUnitValue(node.value, this._system.adimensional);
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
          ? new NumberWithUnitValue(-right.value, right.unit)
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
