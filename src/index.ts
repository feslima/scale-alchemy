import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";
import {
  ErrorValue,
  EvaluationWithUnitEnvironmentType,
  EvaluatorWithUnits,
  INumber,
  isNumberValue,
  NumberValue,
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

interface EvaluationResult<N extends INumber> {
  value: NumberWithUnitValue<N>;
  error?: string;
}

type LexerParameters = ConstructorParameters<typeof Lexer>;
type ParserParameters = ConstructorParameters<typeof Parser>;
interface EvaluationOptions {
  isValidVariableMatcher: LexerParameters[1];
  variableValidator: ParserParameters[1];
}

function evaluate<N extends INumber>(
  input: string,
  system: QuantitySytem,
  environment: EvaluationWithUnitEnvironmentType,
  numberConstructor: (n: number) => N,
  opts?: EvaluationOptions,
): EvaluationResult<N> {
  let lexer: Lexer;
  let parser: Parser;
  if (opts) {
    lexer = new Lexer(input, opts.isValidVariableMatcher);
    parser = new Parser(lexer, opts.variableValidator);
  } else {
    lexer = new Lexer(input);
    parser = new Parser(lexer);
  }

  const expressionTree = parser.parse();
  const evaluator = new EvaluatorWithUnits(system, environment);

  const result = evaluator.evaluate(expressionTree);
  if (result instanceof NumberWithUnitValue) {
    return { value: result };
  }
  if (result instanceof ErrorValue) {
    return {
      value: new NumberWithUnitValue(
        numberConstructor(NaN),
        system.adimensional,
      ),
      error: result.message,
    };
  }

  return {
    value: new NumberWithUnitValue(numberConstructor(NaN), system.adimensional),
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
  INumber,
  isNumberValue,
  isSimpleUnit,
  NumberValue,
  NumberWithUnitValue,
  QuantitySytem,
  SimpleUnit,
  Unit,
  type Quantity,
  type SystemBase
};
