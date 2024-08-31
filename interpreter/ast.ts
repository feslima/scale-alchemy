import { Token, TokenType } from "./lexer";

export abstract class ExpressionNode {
  private _token: Token;
  public get token(): Token {
    return this._token;
  }

  constructor(token: Token) {
    this._token = token;
  }

  public abstract toString(): string;
}

export class InvalidExpressionNode extends ExpressionNode {
  constructor() {
    super({ type: TokenType.ILLEGAL, literal: "" });
  }
  public toString(): string {
    return "(null)";
  }
}

export class IntegerLiteralNode extends ExpressionNode {
  private _value: number;

  constructor(token: Token, value: number) {
    super(token);
    this._value = value;
  }

  public toString(): string {
    return this._value.toString();
  }
}

export class IdentifierNode extends ExpressionNode {
  private _value: string;

  constructor(token: Token, value: string) {
    super(token);
    this._value = value;
  }

  public toString(): string {
    return this._value;
  }
}

export class InfixExpressionNode extends ExpressionNode {
  private _operator: string;
  public get operator(): string {
    return this._operator;
  }

  private _left: ExpressionNode;
  public get left(): ExpressionNode {
    return this._left;
  }

  private _right: ExpressionNode;
  public get right(): ExpressionNode {
    return this._right;
  }

  public set right(v: ExpressionNode) {
    this._right = v;
  }

  constructor(token: Token, operator: string, left: ExpressionNode) {
    super(token);
    this._operator = operator;
    this._left = left;
    this._right = new InvalidExpressionNode();
  }

  public toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right?.toString() ?? ""})`;
  }
}

export class PrefixExpressionNode extends ExpressionNode {
  private _operator: string;
  public get operator(): string {
    return this._operator;
  }

  private _right: ExpressionNode;
  public get right(): ExpressionNode {
    return this._right;
  }
  public set right(v: ExpressionNode) {
    this._right = v;
  }

  constructor(token: Token, operator: string) {
    super(token);
    this._operator = operator;
    this._right = new InvalidExpressionNode();
  }

  public toString(): string {
    return `(${this.operator}${this.right?.toString()})`;
  }
}
