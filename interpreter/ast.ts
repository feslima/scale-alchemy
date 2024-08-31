import { Token, TokenType } from "./lexer";

type InvalidNode = "Invalid";
type IntegerNode = "Integer";
type IdentifierNode = "Identifier";
type PrefixNode = "Prefix";
type InfixNode = "Infix";
type ExpressionNodeType =
  | InvalidNode
  | IntegerNode
  | IdentifierNode
  | PrefixNode
  | InfixNode;

export abstract class ExpressionNode {
  private _type: ExpressionNodeType;
  public get type(): ExpressionNodeType {
    return this._type;
  }

  private _token: Token;
  public get token(): Token {
    return this._token;
  }

  constructor(token: Token, nodeType: ExpressionNodeType = "Invalid") {
    this._token = token;
    this._type = nodeType;
  }

  public abstract toString(): string;
}

export class InvalidExpressionNode extends ExpressionNode {
  constructor() {
    super({ type: TokenType.ILLEGAL, literal: "" }, "Invalid");
  }
  public toString(): string {
    return "(null)";
  }
}

export class IntegerLiteralNode extends ExpressionNode {
  private _value: number;
  public get value(): number {
    return this._value;
  }

  constructor(token: Token, value: number) {
    super(token, "Integer");
    this._value = value;
  }

  public toString(): string {
    return this._value.toString();
  }
}

export class IdentifierExpressionNode extends ExpressionNode {
  private _value: string;

  constructor(token: Token, value: string) {
    super(token, "Identifier");
    this._value = value;
  }

  public toString(): string {
    return this._value;
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
    super(token, "Prefix");
    this._operator = operator;
    this._right = new InvalidExpressionNode();
  }

  public toString(): string {
    return `(${this.operator}${this.right?.toString()})`;
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
    super(token, "Infix");
    this._operator = operator;
    this._left = left;
    this._right = new InvalidExpressionNode();
  }

  public toString(): string {
    return `(${this.left.toString()} ${this.operator} ${this.right?.toString() ?? ""})`;
  }
}
