export enum TokenType {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  PLUS = "+",
  MINUS = "-",
  ASTERISK = "*",
  SLASH = "/",
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

export class Lexer {
  private _input: string;
  private _position: number;
  private _readPosition: number;
  private _currentChar: string;

  /* NOTE: next char has to be one of operator, EOF or
   * closing parenthesis to constitute a valid number */
  private _validCharSetForNumber = new Set(["+", "-", "*", "/", ")", "", "."]);

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

      case "(":
        result = {
          type: TokenType.LEFT_PARENTHESIS,
          literal: this._currentChar,
        };
        break;

      case ")":
        result = {
          type: TokenType.RIGHT_PARENTHESIS,
          literal: this._currentChar,
        };
        break;

      case "":
        result = { type: TokenType.EOF, literal: this._currentChar };
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
    while (this.isDigit(this._currentChar) || this._currentChar === ".") {
      this.readChar();
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

  private isNextCharValidForNumber(char: string): boolean {
    return this._validCharSetForNumber.has(char);
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
