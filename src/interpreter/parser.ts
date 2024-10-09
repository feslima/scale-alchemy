import {
  ExpressionNode,
  IdentifierExpressionNode,
  InfixExpressionNode,
  InvalidExpressionNode,
  NumberLiteralNode,
  PrefixExpressionNode,
} from "./ast";
import { Lexer, Token, TokenType } from "./lexer";

enum Precedence {
  LOWEST = 0,
  SUM = 1,
  PRODUCT = 2,
  EXPONENT = 3,
  PREFIX = 4, // -X
}

const precedences = new Map<TokenType, Precedence>([
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.ASTERISK, Precedence.PRODUCT],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.CARET, Precedence.EXPONENT],
]);

const defaultIdentifierValidator = (literal: string) =>
  /^[a-zA-Z][a-zA-Z_0-9]*$/.test(literal);

export class Parser {
  private _lexer: Lexer;
  private _currentToken: Token = { type: TokenType.ILLEGAL, literal: "" };
  private _peekToken: Token = { type: TokenType.ILLEGAL, literal: "" };

  private _prefixParsers = new Map<TokenType, () => ExpressionNode>();
  private _infixParsers = new Map<
    TokenType,
    (expression: ExpressionNode) => ExpressionNode
  >();

  private _errors: string[] = [];
  public get errors(): string[] {
    return this._errors;
  }

  private readonly _identifierValidator: (literal: string) => boolean;

  constructor(lexer: Lexer, identifierValidator = defaultIdentifierValidator) {
    this._lexer = lexer;
    this._identifierValidator = identifierValidator;
    this.nextToken();
    this.nextToken();

    this._prefixParsers.set(
      TokenType.MINUS,
      this.parsePrefixExpression.bind(this),
    );
    this._prefixParsers.set(TokenType.NUMBER, this.parseNumber.bind(this));
    this._prefixParsers.set(
      TokenType.IDENTIFIER,
      this.parseIdentifier.bind(this),
    );
    this._prefixParsers.set(
      TokenType.LEFT_PARENTHESIS,
      this.parseGroupedExpression.bind(this),
    );

    this._infixParsers.set(
      TokenType.PLUS,
      this.parseInfixExpression.bind(this),
    );
    this._infixParsers.set(
      TokenType.MINUS,
      this.parseInfixExpression.bind(this),
    );
    this._infixParsers.set(
      TokenType.ASTERISK,
      this.parseInfixExpression.bind(this),
    );
    this._infixParsers.set(
      TokenType.SLASH,
      this.parseInfixExpression.bind(this),
    );
    this._infixParsers.set(
      TokenType.CARET,
      this.parseInfixExpression.bind(this),
    );
  }

  parse(): ExpressionNode {
    const expression = this.parseExpression(Precedence.LOWEST);

    if (this.errors.length !== 0) {
      return expression;
    }

    if (!this.expectPeek(TokenType.EOF)) {
      return new InvalidExpressionNode(this._peekToken.literal);
    }
    return expression;
  }

  private parseExpression(precedence: Precedence): ExpressionNode {
    const prefixParser = this._prefixParsers.get(this._currentToken.type);
    if (prefixParser === undefined) {
      this._errors.push(
        `no prefix parse function for ${this._currentToken.literal} found`,
      );
      return new InvalidExpressionNode(this._currentToken.literal);
    }

    let leftExpression = prefixParser();
    while (
      !this.peekTokenIs(TokenType.EOF) &&
      precedence < this.peekPrecedence()
    ) {
      const infixParser = this._infixParsers.get(this._peekToken.type);
      if (infixParser === undefined) {
        return leftExpression;
      }

      this.nextToken();
      leftExpression = infixParser(leftExpression);
    }

    return leftExpression;
  }

  private nextToken() {
    this._currentToken = this._peekToken;
    this._peekToken = this._lexer.next();
  }

  private peekTokenIs(typ: TokenType): boolean {
    return this._peekToken.type === typ;
  }

  private peekPrecedence(): Precedence {
    const p = precedences.get(this._peekToken.type);
    return p !== undefined ? p : Precedence.LOWEST;
  }

  private currentPrecedence(): Precedence {
    const p = precedences.get(this._currentToken.type);
    return p !== undefined ? p : Precedence.LOWEST;
  }

  private expectPeek(token: TokenType): boolean {
    if (this.peekTokenIs(token)) {
      this.nextToken();
      return true;
    }

    let msg = `expected next token to be ${token}, got ${this._peekToken.type} instead`;
    if (this.peekTokenIs(TokenType.ILLEGAL)) {
      msg = `${msg} because ${this._peekToken.literal}`;
    }

    this._errors.push(msg);
    return false;
  }

  private parseNumber(): ExpressionNode {
    return new NumberLiteralNode(
      this._currentToken,
      this.parseNumberMaybeExponent(this._currentToken.literal),
    );
  }

  private parseNumberMaybeExponent(raw: string): number {
    if (raw.indexOf(TokenType.CARET) > -1) {
      const split = raw.split(TokenType.CARET);
      if (split.length !== 2) {
        return NaN;
      }

      const base = parseFloat(split[0]);
      const exponent = parseFloat(split[1]);
      return Number(Math.pow(base, exponent));
    }
    return parseFloat(raw);
  }

  private parseIdentifier(): ExpressionNode {
    if (!this._identifierValidator(this._currentToken.literal)) {
      this._errors.push(
        `${this._currentToken.literal} is not a valid variable name`,
      );
      return new InvalidExpressionNode(this._currentToken.literal);
    }
    return new IdentifierExpressionNode(
      this._currentToken,
      this._currentToken.literal,
    );
  }

  private parsePrefixExpression(): ExpressionNode {
    const exp = new PrefixExpressionNode(
      this._currentToken,
      this._currentToken.literal,
    );
    this.nextToken();

    exp.right = this.parseExpression(Precedence.PREFIX);

    return exp;
  }

  private parseInfixExpression(left: ExpressionNode): ExpressionNode {
    const exp = new InfixExpressionNode(
      this._currentToken,
      this._currentToken.literal,
      left,
    );
    const precedence = this.currentPrecedence();
    this.nextToken();

    exp.right = this.parseExpression(precedence);
    return exp;
  }

  private parseGroupedExpression(): ExpressionNode {
    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
      return new InvalidExpressionNode(this._peekToken.literal);
    }
    return exp;
  }
}
