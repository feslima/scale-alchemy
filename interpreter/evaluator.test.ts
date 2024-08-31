import { expect, expectTypeOf, test } from "vitest";
import {
  ErrorValue,
  EvaluationEnvironmentType,
  Evaluator,
  IntegerValue,
  ValueObject,
} from "./evaluator";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

interface EvaluatorTestCase {
  input: string;
  environment?: EvaluationEnvironmentType;
  expected: ValueObject;
}

test.each([
  { input: "5", expected: new IntegerValue(5) },
  { input: "10", expected: new IntegerValue(10) },
  {
    input: "-",
    expected: new ErrorValue("invalid syntax for evaluation"),
  },
  { input: "-5", expected: new IntegerValue(-5) },
  { input: "-10", expected: new IntegerValue(-10) },
  { input: "5 + 5 + 5 + 5 - 10", expected: new IntegerValue(10) },
  { input: "2 * 2 * 2 * 2 * 2", expected: new IntegerValue(32) },
  { input: "-50 + 100 + -50", expected: new IntegerValue(0) },
  { input: "5 * 2 + 10", expected: new IntegerValue(20) },
  { input: "5 + 2 * 10", expected: new IntegerValue(25) },
  { input: "20 + 2 * -10", expected: new IntegerValue(0) },
  { input: "50 / 2 * 2 + 10", expected: new IntegerValue(60) },
  { input: "2 * (5 + 10)", expected: new IntegerValue(30) },
  { input: "3 * 3 * 3 + 10", expected: new IntegerValue(37) },
  { input: "3 * (3 * 3) + 10", expected: new IntegerValue(37) },
  { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: new IntegerValue(50) },
  {
    input: "a + b + 5",
    environment: new Map([
      ["a", new IntegerValue(5)],
      ["b", new IntegerValue(5)],
    ]),
    expected: new IntegerValue(15),
  },
  {
    input: "tCH + b + 5",
    environment: new Map([["b", new IntegerValue(5)]]),
    expected: new ErrorValue("identifier 'tCH' not found"),
  },
] as EvaluatorTestCase[])(
  "evaluation of: $input",
  ({ input, environment, expected }) => {
    const expressionTree = new Parser(new Lexer(input)).parse();
    const evaluator = new Evaluator(
      environment !== undefined ? environment : new Map(),
    );

    const result = evaluator.evaluate(expressionTree);
    expectTypeOf(result).toEqualTypeOf(expected);
    if (expected instanceof ErrorValue) {
      expect(result).instanceof(ErrorValue);
      expect(result).to.have.property("message").be.equal(expected.message);
    } else {
      expect(result.equals(expected)).to.be.true;
    }
  },
);
