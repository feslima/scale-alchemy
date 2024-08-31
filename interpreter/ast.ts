import { Token, TokenType } from "./lexer";

export abstract class Expression {
  private _token: Token;
  private _isNull: boolean;

  constructor(token: Token, isNull = false) {
    this._token = token;
    this._isNull = isNull;
  }

  public get token(): Token {
    return this._token;
  }
  public get isNull(): boolean {
    return this._isNull;
  }

  public abstract toString(): string;
}

export class NullExpression extends Expression {
  constructor() {
    super({ type: TokenType.ILLEGAL, literal: "" }, true);
  }
  public toString(): string {
    return "(null)";
  }
}

export class IntegerLiteral extends Expression {
  private _value: number;

  constructor(token: Token, value: number) {
    super(token);
    this._value = value;
  }

  public toString(): string {
    return this._value.toString();
  }
}

export class Identifier extends Expression {
  private _value: string;

  constructor(token: Token, value: string) {
    super(token);
    this._value = value;
  }

  public toString(): string {
    return this._value;
  }
}

export class InfixExpression extends Expression {
  private _operator: string;
  public get operator(): string {
    return this._operator;
  }

  private _left: Expression;
  public get left(): Expression {
    return this._left;
  }

  private _right: Expression | null;
  public get right(): Expression | null {
    return this._right;
  }

  public set right(v: Expression | null) {
    this._right = v;
  }

  constructor(token: Token, operator: string, left: Expression) {
    super(token);
    this._operator = operator;
    this._left = left;
    this._right = null;
  }

  public toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right?.toString() ?? ""})`;
  }
}

export class PrefixExpression extends Expression {
  private _operator: string;
  public get operator(): string {
    return this._operator;
  }

  private _right: Expression | null;
  public get right(): Expression | null {
    return this._right;
  }
  public set right(v: Expression | null) {
    this._right = v;
  }

  constructor(token: Token, operator: string) {
    super(token);
    this._operator = operator;
    this._right = null;
  }

  public toString(): string {
    return `(${this.operator}${this.right?.toString()})`;
  }
}
