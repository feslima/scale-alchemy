import { EvaluationEnvironmentType, Evaluator } from "./interpreter/evaluator";
import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";

export class EmissionFactor {
  private _environment: EvaluationEnvironmentType;
  private _rawEquation: string;

  private _base: SystemBase;

  constructor(
    input: string,
    environment: EvaluationEnvironmentType,
    unitSystemBase: SystemBase,
  ) {
    this._rawEquation = input;
    this._environment = environment;
    this._base = unitSystemBase;
  }

  public calculate(amount: number, unit: Unit<Quantity[]>): number {
    const parser = new Parser(new Lexer(this._rawEquation));
    const evaluator = new Evaluator(this._environment);

    return NaN;
  }
}
