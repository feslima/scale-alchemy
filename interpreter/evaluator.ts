import {
  ExpressionNode,
  InfixExpressionNode,
  IntegerLiteralNode,
  PrefixExpressionNode,
} from "./ast";

enum ObjectType {
  ERROR = 0,
  INTEGER = 1,
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

export class IntegerValue extends ValueObject {
  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(value: number) {
    super(ObjectType.INTEGER);
    this._value = value;
  }

  public equals(other: object): boolean {
    return other instanceof IntegerValue ? this._value === other._value : false;
  }
}

export class Evaluator {
  constructor() {}

  public evaluate(node: ExpressionNode): ValueObject {
    switch (node.type) {
      case "Integer":
        return new IntegerValue((node as IntegerLiteralNode).value);

      case "Prefix": {
        const n = node as PrefixExpressionNode;
        const right = this.evaluate(n.right);
        return this.evalPrefixNode(n.operator, right);
      }
      case "Infix": {
        const n = node as InfixExpressionNode;
        const left = this.evaluate(n.left);
        const right = this.evaluate(n.right);
        return this.evalInfixNode(n.operator, left, right);
      }
      case "Invalid": {
        return new ErrorValue("invalid expression node for evaluation");
      }
      default:
        return new ErrorValue(
          `unrecognized expression node type: ${node.type}`,
        );
    }
  }

  private evalPrefixNode(operator: string, right: ValueObject): ValueObject {
    switch (operator) {
      case "-":
        return right instanceof IntegerValue
          ? new IntegerValue(-right.value)
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
    if (!(left instanceof IntegerValue) || !(right instanceof IntegerValue)) {
      return new ErrorValue(
        `both objects must be numbers. Left type: ${left.type}, right type: ${right.type}`,
      );
    }

    return this.evalNumberInfixExpression(operator, left, right);
  }

  private evalNumberInfixExpression(
    operator: string,
    left: IntegerValue,
    right: IntegerValue,
  ): ValueObject {
    switch (operator) {
      case "+":
        return new IntegerValue(left.value + right.value);
      case "-":
        return new IntegerValue(left.value - right.value);
      case "*":
        return new IntegerValue(left.value * right.value);
      case "/":
        return new IntegerValue(left.value / right.value);

      default:
        return new ErrorValue(`invalid infix operator provided ${operator}`);
    }
  }
}
