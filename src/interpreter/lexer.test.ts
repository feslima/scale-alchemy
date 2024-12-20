import { expect, test } from "vitest";
import { Lexer, Token, TokenType } from "./lexer";

interface TestCase {
  input: string;
  expectedSequence: Token[];
}

test.each([
  {
    input: "(t_CH4 + kg_CH4)",
    expectedSequence: [
      { type: TokenType.LEFT_PARENTHESIS, literal: "(" },
      { type: TokenType.IDENTIFIER, literal: "t_CH4" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.IDENTIFIER, literal: "kg_CH4" },
      { type: TokenType.RIGHT_PARENTHESIS, literal: ")" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "10^3",
    expectedSequence: [
      { type: TokenType.NUMBER, literal: "10^3" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "10^-3",
    expectedSequence: [
      { type: TokenType.NUMBER, literal: "10^-3" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "5 + 10",
    expectedSequence: [
      { type: TokenType.NUMBER, literal: "5" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.NUMBER, literal: "10" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "5.6 + 10.456",
    expectedSequence: [
      { type: TokenType.NUMBER, literal: "5.6" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.NUMBER, literal: "10.456" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "(4_CH4 + kg_CH4)",
    expectedSequence: [
      { type: TokenType.LEFT_PARENTHESIS, literal: "(" },
      { type: TokenType.NUMBER, literal: "4" },
      { type: TokenType.IDENTIFIER, literal: "_CH4" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.IDENTIFIER, literal: "kg_CH4" },
      { type: TokenType.RIGHT_PARENTHESIS, literal: ")" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "a*b*(1-c) + d*e*c",
    expectedSequence: [
      { type: TokenType.IDENTIFIER, literal: "a" },
      { type: TokenType.ASTERISK, literal: "*" },
      { type: TokenType.IDENTIFIER, literal: "b" },
      { type: TokenType.ASTERISK, literal: "*" },
      { type: TokenType.LEFT_PARENTHESIS, literal: "(" },
      { type: TokenType.NUMBER, literal: "1" },
      { type: TokenType.MINUS, literal: "-" },
      { type: TokenType.IDENTIFIER, literal: "c" },
      { type: TokenType.RIGHT_PARENTHESIS, literal: ")" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.IDENTIFIER, literal: "d" },
      { type: TokenType.ASTERISK, literal: "*" },
      { type: TokenType.IDENTIFIER, literal: "e" },
      { type: TokenType.ASTERISK, literal: "*" },
      { type: TokenType.IDENTIFIER, literal: "c" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
] as TestCase[])("lexing: $input", ({ input, expectedSequence }) => {
  const lexer = new Lexer(input);

  expectedSequence.forEach((expected) => {
    expect(lexer.next()).toMatchObject(expected);
  });
});
