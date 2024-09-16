import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";
import {
  ErrorValue,
  EvaluationWithUnitEnvironmentType,
  EvaluatorWithUnits,
  NumberWithUnitValue,
} from "./interpreter/unit-evaluator";
import {
  analyze,
  CompositeUnit,
  convert,
  isSimpleUnit,
  type Quantity,
  QuantitySytem,
  SimpleUnit,
  type SystemBase,
  Unit,
} from "./units";

interface EvaluationResult {
  value: NumberWithUnitValue;
  error?: string;
}
function evaluate(
  input: string,
  system: QuantitySytem,
  environment: EvaluationWithUnitEnvironmentType,
): EvaluationResult {
  const expressionTree = new Parser(new Lexer(input)).parse();
  const evaluator = new EvaluatorWithUnits(system, environment);

  const result = evaluator.evaluate(expressionTree);
  if (result instanceof NumberWithUnitValue) {
    return { value: result };
  }
  if (result instanceof ErrorValue) {
    return {
      value: new NumberWithUnitValue(NaN, system.adimensional),
      error: result.message,
    };
  }

  return {
    value: new NumberWithUnitValue(NaN, system.adimensional),
    error: "could not evaluate expression",
  };
}

export {
  analyze,
  CompositeUnit,
  convert,
  evaluate,
  EvaluationResult,
  EvaluationWithUnitEnvironmentType,
  isSimpleUnit,
  NumberWithUnitValue,
  QuantitySytem,
  SimpleUnit,
  Unit,
  type Quantity,
  type SystemBase
};
