import { expect, test } from "vitest";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

test.each([
  { input: "-a * b", expected: "((-a) * b)" },
  { input: "a ^ b", expected: "(a ^ b)" },
  { input: "a ^ -b", expected: "(a ^ (-b))" },
  { input: "-a ^ b", expected: "((-a) ^ b)" },
  { input: "a + b + c", expected: "((a + b) + c)" },
  { input: "a + b - c", expected: "((a + b) - c)" },
  { input: "a * b * c", expected: "((a * b) * c)" },
  { input: "a * b ^ c", expected: "(a * (b ^ c))" },
  { input: "a / b ^ c", expected: "(a / (b ^ c))" },
  { input: "a * b / c", expected: "((a * b) / c)" },
  { input: "a + b / c", expected: "(a + (b / c))" },
  {
    input: "a + b * c + d / e - f",
    expected: "(((a + (b * c)) + (d / e)) - f)",
  },
  { input: "1 + (2 + 3) + 4", expected: "((1 + (2 + 3)) + 4)" },
  { input: "(5 + 5) * 2", expected: "((5 + 5) * 2)" },
  { input: "2 / (5 + 5)", expected: "(2 / (5 + 5))" },
  { input: "(5 + 5) * 2 * (5 + 5)", expected: "(((5 + 5) * 2) * (5 + 5))" },
  { input: "-(5 + 5)", expected: "(-(5 + 5))" },
  {
    input: "a*b*(1-c) + d*e*c",
    expected: "(((a * b) * (1 - c)) + ((d * e) * c))",
  },
])("test operator precedence parsing: $input", ({ input, expected }) => {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const expression = parser.parse();
  expect(parser.errors).to.be.empty;
  expect(expression).to.not.be.null;
  expect(expression!.toString()).to.be.equal(expected);
});

test.each([
  {
    input: "(4_CH4 + kg_CH4)",
    expected: "(null)",
    error: "expected next token to be ), got IDENTIFIER instead",
  },
  {
    input: "(CH4 + kg_CH4)",
    expected: "(CH4 + kg_CH4)",
  },
  {
    input: "(_CH4 + kg_CH4)",
    expected: "((null) + kg_CH4)",
    error: "_CH4 is not a valid variable name",
  },
])("test variable parsing: $input", ({ input, expected, error }) => {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const expression = parser.parse();
  expect(expression).to.not.be.null;
  expect(expression!.toString()).to.be.equal(expected);
  if (error) {
    expect(parser.errors).to.have.lengthOf(1);
    expect(parser.errors[0]).to.be.equal(error);
  }
});

test.each([
  {
    input: "(a * b",
    expected: "(null)",
    error:
      "expected next token to be ), got ILLEGAL instead because parenthesis missing matching pair",
  },
  {
    input: "a * b)",
    expected: "(null)",
    error:
      "expected next token to be EOF, got ILLEGAL instead because parenthesis missing matching pair",
  },
  {
    input: "a + b * c + d) / e - f",
    expected: "(null)",
    error:
      "expected next token to be EOF, got ILLEGAL instead because parenthesis missing matching pair",
  },
])("test parenthesis validation: $input", ({ input, expected, error }) => {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const expression = parser.parse();
  expect(expression).to.not.be.null;
  expect(expression!.toString()).to.be.equal(expected);

  expect(parser.errors).to.have.lengthOf(1);
  expect(parser.errors[0]).to.be.equal(error);
});
