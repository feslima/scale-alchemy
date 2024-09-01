import {
  ExpressionNode,
  IdentifierExpressionNode,
  InfixExpressionNode,
  NumberLiteralNode,
  PrefixExpressionNode,
} from "./ast";

enum ObjectType {
  ERROR = 0,
  NUMBER = 1,
}

export abstract class ValueObject {
  private _type: ObjectType;
  public get type(): ObjectType {
    return this._type;
  }

  constructor(type: ObjectType) {
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
    super(ObjectType.ERROR);
    this._message = message;
  }

  public equals(other: object): boolean {
    return other instanceof ErrorValue && this._message === other.message;
  }
}

export class NumberValue extends ValueObject {
  private _precision: number;

  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(value: number, precision = 7) {
    super(ObjectType.NUMBER);
    this._value = value;
    this._precision = precision;
  }

  public equals(other: object): boolean {
    return other instanceof NumberValue
      ? Math.abs(this._value - other._value) <= this._precision
      : false;
  }
}

export type EvaluationEnvironmentType = Map<string, ValueObject>;

export class Evaluator {
  private _environment: EvaluationEnvironmentType;
  constructor(environment: EvaluationEnvironmentType) {
    this._environment = environment;
  }

  public evaluate(node: ExpressionNode): ValueObject {
    switch (node.type) {
      case "Number":
        return new NumberValue((node as NumberLiteralNode).value);

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
        return right instanceof NumberValue
          ? new NumberValue(-right.value)
          : new ErrorValue(
              "object to the right of operator is not integer type",
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
    if (!(left instanceof NumberValue) || !(right instanceof NumberValue)) {
      return new ErrorValue(
        `both objects must be numbers. Left type: ${ObjectType[left.type]}, right type: ${ObjectType[right.type]}`,
      );
    }

    return this.evalNumberInfixExpression(operator, left, right);
  }

  private evalNumberInfixExpression(
    operator: string,
    left: NumberValue,
    right: NumberValue,
  ): ValueObject {
    switch (operator) {
      case "+":
        return new NumberValue(left.value + right.value);
      case "-":
        return new NumberValue(left.value - right.value);
      case "*":
        return new NumberValue(left.value * right.value);
      case "/":
        return new NumberValue(left.value / right.value);

      default:
        return new ErrorValue(`invalid infix operator provided ${operator}`);
    }
  }
}
