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
  DOT = ".",
  NOTHING = "",
}

export interface Token {
  type: TokenType;
  literal: string;
}

const MISSING_PARENTHESIS_TOKEN: Token = {
  type: TokenType.ILLEGAL,
  literal: "parenthesis missing matching pair",
};

const isLetter = (char: string): boolean => {
  return (
    ("a" <= char && char <= "z") || ("A" <= char && char <= "Z") || char === "_"
  );
};

const isDigit = (char: string): boolean => {
  return "0" <= char && char <= "9";
};

const isValidForIdentifier = (char: string): boolean => {
  return isLetter(char) || isDigit(char);
};

export class Lexer {
  private _input: string;
  private _position: number;
  private _readPosition: number;
  private _currentChar: string;

  private _parenthesisTracker: number[] = [];

  private _isIdentifierMatch: (char: string) => boolean;
  private _isValidForIdentifierMatch: (char: string) => boolean;
  private _isDigitMatch: (char: string) => boolean;

  /**
   * @param input - raw string;
   * @param isIdentifierMatcher - function that is called to check if the
   * first char of identifier token is valid.
   * @param isValidForIdentifierMatcher - function that is called to check
   * if the subsequent chars after a identifer match are valid
   */
  constructor(
    input: string,
    isIdentifierMatcher = isLetter,
    isValidForIdentifierMatcher = isValidForIdentifier,
    isDigitMatcher = isDigit,
  ) {
    this._input = input;
    this._position = 0;
    this._readPosition = 0;
    this._currentChar = "";
    this._isIdentifierMatch = isIdentifierMatcher;
    this._isValidForIdentifierMatch = isValidForIdentifierMatcher;
    this._isDigitMatch = isDigitMatcher;

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
        if (this._isIdentifierMatch(this._currentChar)) {
          result = {
            type: TokenType.IDENTIFIER,
            literal: this.readIdentifier(),
          };
          return result;
        } else if (this._isDigitMatch(this._currentChar)) {
          result = {
            type: TokenType.NUMBER,
            literal: this.readNumber(),
          };
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

  private readIdentifier(): string {
    const position = this._position;
    while (this._isValidForIdentifierMatch(this._currentChar)) {
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
    while (this._isDigitMatch(this._currentChar)) {
      this.readChar();

      if (this.isExponent(this._currentChar)) {
        this.readChar(); // skip the exponent symbol
        this.readNumberExponent();
        continue;
      } else if (this.isDecimalSeparator(this._currentChar)) {
        this.readChar();
        continue;
      }
    }
    return this._input.slice(position, this._position);
  }

  private readNumberExponent() {
    if (this.isValidExponentPrefix(this._currentChar)) {
      this.readChar(); // means that the exponent begins with either + or -
    }

    while (this._isDigitMatch(this._currentChar)) {
      this.readChar();
    }
  }

  private isDecimalSeparator(char: string): boolean {
    return char === TokenType.DOT;
  }

  private isExponent(char: string): boolean {
    return char === TokenType.CARET;
  }

  private isValidExponentPrefix(char: string): boolean {
    return char === TokenType.PLUS || char === TokenType.MINUS;
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
