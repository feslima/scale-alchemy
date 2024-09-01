import { expect, test } from "vitest";
import {
  ErrorValue,
  EvaluationEnvironmentType,
  Evaluator,
  NumberValue,
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
  { input: "5", expected: new NumberValue(5) },
  { input: "5.6784283", expected: new NumberValue(5.6784283) },
  { input: "10", expected: new NumberValue(10) },
  {
    input: "-",
    expected: new ErrorValue("invalid syntax for evaluation"),
  },
  { input: "-5", expected: new NumberValue(-5) },
  { input: "-10", expected: new NumberValue(-10) },
  { input: "5 + 5 + 5 + 5 - 10", expected: new NumberValue(10) },
  { input: "5 + 5.53 + 5.47 + 5 - 10", expected: new NumberValue(12) },
  { input: "2 * 2 * 2 * 2 * 2", expected: new NumberValue(32) },
  { input: "-50 + 100 + -50", expected: new NumberValue(0) },
  { input: "5 * 2 + 10", expected: new NumberValue(20) },
  { input: "5 + 2 * 10", expected: new NumberValue(25) },
  { input: "20 + 2 * -10", expected: new NumberValue(0) },
  { input: "50 / 2 * 2 + 10", expected: new NumberValue(60) },
  { input: "2 * (5 + 10)", expected: new NumberValue(30) },
  { input: "3 * 3 * 3 + 10", expected: new NumberValue(37) },
  { input: "3 * (3 * 3) + 10", expected: new NumberValue(37) },
  { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: new NumberValue(50) },
  {
    input: "a + b + 5",
    environment: new Map([
      ["a", new NumberValue(5)],
      ["b", new NumberValue(5)],
    ]),
    expected: new NumberValue(15),
  },
  {
    input: "tCH + b + 5",
    environment: new Map([["b", new NumberValue(5)]]),
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
    if (expected instanceof ErrorValue) {
      expect(result).instanceof(ErrorValue);
      expect(result).to.have.property("message").be.equal(expected.message);
    } else {
      expect(result.constructor.name).to.be.equal(expected.constructor.name);
      expect(result.equals(expected)).to.be.true;
    }
  },
);
