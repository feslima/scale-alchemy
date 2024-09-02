import {
  Adimensional,
  convert,
  divideUnits,
  isUnitDimensionless,
  multiplyUnits,
} from "../units";
import {
  ExpressionNode,
  IdentifierExpressionNode,
  InfixExpressionNode,
  NumberLiteralNode,
  PrefixExpressionNode,
} from "./ast";

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
  private _base: SystemBase;
  private static _supportedOperators = new Set(["+", "-", "*", "/", "^"]);

  private _unit: Unit<Quantity[]>;
  public get unit(): Unit<Quantity[]> {
    return this._unit;
  }

  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(
    value: number,
    unit: Unit<Quantity[]>,
    base: SystemBase,
    precision = 7,
  ) {
    super(ObjectWithUnitType.NUMBER);
    this._value = value;
    this._precision = precision;
    this._unit = unit;
    this._base = base;
  }

  public equals(other: object): boolean {
    if (other instanceof NumberWithUnitValue) {
      const factor = convert(this.unit, other.unit, this._base);
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
      case "+": {
        const factor = convert(left.unit, right.unit, left._base);
        if (isNaN(factor)) {
          return new ErrorValue(
            `units '${left.unit.name}' and '${right.unit.name}' are incompatible`,
          );
        }
        const result = left.value * factor + right.value;
        return new NumberWithUnitValue(result, right.unit, right._base);
      }
      case "-": {
        const factor = convert(left.unit, right.unit, left._base);
        if (isNaN(factor)) {
          return new ErrorValue(
            `units '${left.unit.name}' and '${right.unit.name}' are incompatible`,
          );
        }
        const result = left.value * factor - right.value;
        return new NumberWithUnitValue(result, right.unit, right._base);
      }
      case "*": {
        const result = left.value * right.value;
        const unit = multiplyUnits(left.unit, right.unit);
        return new NumberWithUnitValue(result, unit, right._base);
      }
      case "/": {
        const result = left.value / right.value;
        const unit = divideUnits(left.unit, right.unit);
        return new NumberWithUnitValue(result, unit, right._base);
      }
      default: {
        if (!isUnitDimensionless(right.unit, right._base)) {
          return new ErrorValue(
            "exponentiation only allowed if exponent is dimensionless",
          );
        }
        const result = Math.pow(left.value, right.value);
        return new NumberWithUnitValue(result, left.unit, left._base);
      }
    }
  }
}

export type EvaluationWithUnitEnvironmentType = Map<
  string,
  NumberWithUnitValue
>;

export class EvaluatorWithUnits {
  private _systemBase: SystemBase;
  private _environment: EvaluationWithUnitEnvironmentType;
  constructor(
    unitSystemBase: SystemBase,
    environment: EvaluationWithUnitEnvironmentType,
  ) {
    (this._systemBase = unitSystemBase), (this._environment = environment);
  }

  public evaluate(node: ExpressionNode): ValueObject {
    switch (node.type) {
      case "Number": {
        if (!(node instanceof NumberLiteralNode)) {
          return new ErrorValue(
            "node type does not match with number literal node",
          );
        }

        return new NumberWithUnitValue(
          node.value,
          Adimensional,
          this._systemBase,
        );
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
        const n = node as PrefixExpressionNode;
        const right = this.evaluate(n.right);
        if (right instanceof ErrorValue) {
          return right;
        }
        return this.evalPrefixNode(n.operator, right);
      }
      case "Infix": {
        const n = node as InfixExpressionNode;

        const left = this.evaluate(n.left);
        if (left instanceof ErrorValue) {
          return left;
        }

        const right = this.evaluate(n.right);
        if (right instanceof ErrorValue) {
          return right;
        }

        return this.evalInfixNode(n.operator, left, right);
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
          ? new NumberWithUnitValue(-right.value, right.unit, this._systemBase)
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
