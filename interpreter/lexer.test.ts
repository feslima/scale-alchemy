import { expect, test } from "vitest";
import { Token, TokenType, Lexer } from "./lexer";

interface TestCase {
  input: string;
  expectedSequence: Token[];
}

test.each([
  {
    input: "(t_CH + kg_CH)",
    expectedSequence: [
      { type: TokenType.LEFT_PARENTHESIS, literal: "(" },
      { type: TokenType.IDENTIFIER, literal: "t_CH" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.IDENTIFIER, literal: "kg_CH" },
      { type: TokenType.RIGHT_PARENTHESIS, literal: ")" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
  {
    input: "5 + 10",
    expectedSequence: [
      { type: TokenType.INTEGER, literal: "5" },
      { type: TokenType.PLUS, literal: "+" },
      { type: TokenType.INTEGER, literal: "10" },
      { type: TokenType.EOF, literal: "" },
    ],
  },
] as TestCase[])("lexing: $input", ({ input, expectedSequence }) => {
  const lexer = new Lexer(input);

  expectedSequence.forEach((expected) => {
    expect(lexer.next()).toMatchObject(expected);
  });
});
