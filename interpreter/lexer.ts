export enum TokenType {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  IDENTIFIER = "IDENTIFIER",
  INTEGER = "INTEGER",
  PLUS = "+",
  MINUS = "-",
  ASTERISK = "*",
  SLASH = "/",
  LEFT_PARENTHESIS = "(",
  RIGHT_PARENTHESIS = ")",
}

export interface Token {
  type: TokenType;
  literal: string;
}

export class Lexer {
  private input: string;
  private position: number;
  private readPosition: number;
  private currentChar: string;

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.currentChar = "";

    this.readChar();
  }

  next(): Token {
    this.skipWhitespace();

    let result: Token;
    switch (this.currentChar) {
      case "+":
        result = { type: TokenType.PLUS, literal: this.currentChar };
        break;

      case "-":
        result = { type: TokenType.MINUS, literal: this.currentChar };
        break;

      case "*":
        result = { type: TokenType.ASTERISK, literal: this.currentChar };
        break;

      case "/":
        result = { type: TokenType.ASTERISK, literal: this.currentChar };
        break;

      case "(":
        result = {
          type: TokenType.LEFT_PARENTHESIS,
          literal: this.currentChar,
        };
        break;

      case ")":
        result = {
          type: TokenType.RIGHT_PARENTHESIS,
          literal: this.currentChar,
        };
        break;

      case "":
        result = { type: TokenType.EOF, literal: this.currentChar };
        break;
      default:
        if (this.isLetter(this.currentChar)) {
          result = {
            type: TokenType.IDENTIFIER,
            literal: this.readIdentifier(),
          };
          return result;
        } else if (this.isDigit(this.currentChar)) {
          result = {
            type: TokenType.INTEGER,
            literal: this.readNumber(),
          };
          return result;
        } else {
          result = { type: TokenType.ILLEGAL, literal: this.currentChar };
        }
    }

    this.readChar();
    return result;
  }

  private readChar() {
    this.currentChar =
      this.readPosition >= this.input.length
        ? ""
        : this.input[this.readPosition];

    this.position = this.readPosition;
    this.readPosition++;
  }

  private readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.currentChar)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.currentChar)) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
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

  private skipWhitespace() {
    while (this.currentChar === " ") {
      this.readChar();
    }
  }
}
