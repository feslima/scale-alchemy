import {
  ExpressionNode,
  IdentifierExpressionNode,
  InfixExpressionNode,
  NumberLiteralNode,
  PrefixExpressionNode,
} from "./ast";
import { TokenType } from "./lexer";

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

  public static evaluate(
    operator: string,
    left: NumberValue,
    right: NumberValue,
  ): ValueObject {
    switch (operator) {
      case TokenType.PLUS:
        return new NumberValue(left.value + right.value);
      case TokenType.MINUS:
        return new NumberValue(left.value - right.value);
      case TokenType.ASTERISK:
        return new NumberValue(left.value * right.value);
      case TokenType.SLASH:
        return new NumberValue(left.value / right.value);
      case TokenType.CARET:
        return new NumberValue(Math.pow(left.value, right.value));

      default:
        return new ErrorValue(`invalid infix operator provided ${operator}`);
    }
  }
}

export type EvaluationEnvironmentType = Map<string, NumberValue>;

export class Evaluator {
  private _environment: EvaluationEnvironmentType;
  constructor(environment: EvaluationEnvironmentType) {
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

        return new NumberValue(node.value);
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
    if (left instanceof NumberValue && right instanceof NumberValue) {
      return NumberValue.evaluate(operator, left, right);
    }
    return new ErrorValue(
      `both objects must be numbers with units. Left type: ${ObjectType[left.type]}, right type: ${ObjectType[right.type]}`,
    );
  }
}
