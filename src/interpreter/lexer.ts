export enum TokenType {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  PLUS = "+",
  MINUS = "-",
  ASTERISK = "*",
  SLASH = "/",
  CARET = "^",
  LEFT_PARENTHESIS = "(",
  RIGHT_PARENTHESIS = ")",
}

class LexerError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export interface Token {
  type: TokenType;
  literal: string;
}

const MISSING_PARENTHESIS_TOKEN: Token = {
  type: TokenType.ILLEGAL,
  literal: "parenthesis missing matching pair",
};

export class Lexer {
  private _input: string;
  private _position: number;
  private _readPosition: number;
  private _currentChar: string;

  private _parenthesisTracker: number[] = [];

  /* NOTE: next char for number has to be one of operator, EOF, .
   * or closing parenthesis to constitute a valid number
   */
  private _validCharSetForNumber = new Set([
    "+",
    "-",
    "*",
    "/",
    "^",
    ")",
    "",
    ".",
  ]);

  constructor(input: string) {
    this._input = input;
    this._position = 0;
    this._readPosition = 0;
    this._currentChar = "";

    this.readChar();
  }

  next(): Token {
    this.skipWhitespace();

    let result: Token;
    switch (this._currentChar) {
      case "+":
        result = { type: TokenType.PLUS, literal: this._currentChar };
        break;

      case "-":
        result = { type: TokenType.MINUS, literal: this._currentChar };
        break;

      case "*":
        result = { type: TokenType.ASTERISK, literal: this._currentChar };
        break;

      case "/":
        result = { type: TokenType.ASTERISK, literal: this._currentChar };
        break;

      case "^":
        result = { type: TokenType.CARET, literal: this._currentChar };
        break;

      case "(":
        result = {
          type: TokenType.LEFT_PARENTHESIS,
          literal: this._currentChar,
        };
        this._parenthesisTracker.push(1);
        break;

      case ")":
        if (this._parenthesisTracker.length !== 0) {
          result = {
            type: TokenType.RIGHT_PARENTHESIS,
            literal: this._currentChar,
          };
          this._parenthesisTracker.pop();
        } else {
          result = MISSING_PARENTHESIS_TOKEN;
        }
        break;

      case "":
        if (this._parenthesisTracker.length === 0) {
          result = { type: TokenType.EOF, literal: this._currentChar };
        } else {
          result = MISSING_PARENTHESIS_TOKEN;
        }
        break;
      default:
        if (this.isLetter(this._currentChar)) {
          result = {
            type: TokenType.IDENTIFIER,
            literal: this.readIdentifier(),
          };
          return result;
        } else if (this.isDigit(this._currentChar)) {
          try {
            result = {
              type: TokenType.NUMBER,
              literal: this.readNumber(),
            };
          } catch (error: unknown) {
            result = {
              type: TokenType.ILLEGAL,
              literal: error instanceof LexerError ? error.message : "",
            };
          }
          return result;
        } else {
          result = { type: TokenType.ILLEGAL, literal: this._currentChar };
        }
    }

    this.readChar();
    return result;
  }

  private readChar() {
    this._currentChar =
      this._readPosition >= this._input.length
        ? ""
        : this._input[this._readPosition];

    this._position = this._readPosition;
    this._readPosition++;
  }

  private peekChar(): string {
    if (this._readPosition >= this._input.length) {
      return "";
    }

    return this._input[this._readPosition];
  }

  private readIdentifier(): string {
    const position = this._position;
    while (
      this.isLetter(this._currentChar) ||
      this.isDigit(this._currentChar)
    ) {
      this.readChar();
    }
    return this._input.slice(position, this._position);
  }

  /**
   * @returns the token string that represents a number, if valid.
   * @throws Will throw if the token is not a valid number
   */
  private readNumber(): string {
    const position = this._position;
    while (
      this.isDigit(this._currentChar) ||
      this.isDecimalSeparator(this._currentChar) ||
      this.isExponent(this._currentChar)
    ) {
      this.readChar();

      if (this.isExponent(this._currentChar)) {
        this.readChar(); // skip the exponent symbol
        this.readNumberExponent();
      }

      const nextChar = this.peekChar();
      if (this.isDigit(nextChar) || this.isWhiteSpace(nextChar)) {
        continue;
      }
      if (!this.isNextCharValidForNumber(nextChar)) {
        throw new LexerError(
          `invalid number '${this._input.slice(position, this._readPosition)}'`,
        );
      }
    }
    return this._input.slice(position, this._position);
  }

  private readNumberExponent() {
    if (this.isValidExponentPrefix(this._currentChar)) {
      this.readChar(); // means that the exponent begins with either + or -
    }

    while (this.isDigit(this._currentChar)) {
      this.readChar();
    }
  }

  private isNextCharValidForNumber(char: string): boolean {
    return this._validCharSetForNumber.has(char);
  }

  private isDecimalSeparator(char: string): boolean {
    return char === ".";
  }

  private isExponent(char: string): boolean {
    return char === "^";
  }

  private isValidExponentPrefix(char: string): boolean {
    return char === "-" || char === "+";
  }

  private isLetter(char: string): boolean {
    return (
      ("a" <= char && char <= "z") ||
      ("A" <= char && char <= "Z") ||
      char === "_"
    );
  }

  private isDigit(char: string): boolean {
    return "0" <= char && char <= "9";
  }

  private isWhiteSpace(char: string): boolean {
    return char === " ";
  }

  private skipWhitespace() {
    while (this.isWhiteSpace(this._currentChar)) {
      this.readChar();
    }
  }
}
