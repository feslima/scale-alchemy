import {
  ExpressionNode,
  IdentifierNode,
  InfixExpressionNode,
  IntegerLiteralNode,
  InvalidExpressionNode,
  PrefixExpressionNode,
} from "./ast";
import { Lexer, Token, TokenType } from "./lexer";

enum Precedence {
  LOWEST = 0,
  SUM = 1,
  PRODUCT = 2,
  PREFIX = 3, // -X
}

const precedences = new Map<TokenType, Precedence>([
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.ASTERISK, Precedence.PRODUCT],
  [TokenType.SLASH, Precedence.PRODUCT],
]);

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

  constructor(lexer: Lexer) {
    this._lexer = lexer;
    this.nextToken();
    this.nextToken();

    this._prefixParsers.set(
      TokenType.MINUS,
      this.parsePrefixExpression.bind(this),
    );
    this._prefixParsers.set(TokenType.INTEGER, this.parseInteger.bind(this));
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
  }

  parse(): ExpressionNode {
    return this.parseExpression(Precedence.LOWEST);
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

  private parseInteger(): ExpressionNode {
    return new IntegerLiteralNode(
      this._currentToken,
      parseInt(this._currentToken.literal),
    );
  }

  private parseIdentifier(): ExpressionNode {
    return new IdentifierNode(this._currentToken, this._currentToken.literal);
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

  private parseExpression(precedence: Precedence): ExpressionNode {
    const prefixParser = this._prefixParsers.get(this._currentToken.type);
    if (prefixParser === undefined) {
      this._errors.push(
        `no prefix parse function for ${this._currentToken.literal} found`,
      );
      return new InvalidExpressionNode();
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

  private expectPeek(token: TokenType): boolean {
    if (this.peekTokenIs(token)) {
      this.nextToken();
      return true;
    }

    this._errors.push(
      `expected next token to be ${token}, got ${this._peekToken.type} instead`,
    );
    return false;
  }

  private parseGroupedExpression(): ExpressionNode {
    this.nextToken();
    const exp = this.parseExpression(Precedence.LOWEST);
    if (!this.expectPeek(TokenType.RIGHT_PARENTHESIS)) {
      return new InvalidExpressionNode();
    }
    return exp;
  }
}
