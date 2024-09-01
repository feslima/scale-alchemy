import { expect, test } from "vitest";
import {
  ErrorValue,
  EvaluationEnvironmentType,
  Evaluator,
  NumberWithUnitValue,
} from "./interpreter/evaluator";
import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";
import {
  Gigagram,
  Kilogram,
  MegaWattHour,
  Meter,
  Stere,
  Terajoule,
  Ton,
} from "./units";

interface EmissionFactorCalculationTestCase {
  input: string;
  environment?: EvaluationEnvironmentType;
  expected: NumberWithUnitValue;
}

const testSystemBase: SystemBase = new Map();
testSystemBase.set("Dimensionless", [0, 0, 0, 0]);
testSystemBase.set("Mass", [1, 0, 0, 0]);
testSystemBase.set("Energy", [0, 1, 0, 0]);
testSystemBase.set("Volume", [0, 0, 1, 0]);
testSystemBase.set("Length", [0, 0, 0, 1]);

const KilogramPerStere: CompositeUnit<[Mass], [Volume]> = {
  name: "kilogram per stere",
  synonyms: ["kg/st", "kg*st^-1"],
  dividend: [Kilogram],
  divisor: [Stere],
};

const TonPerStere: CompositeUnit<[Mass], [Volume]> = {
  name: "ton per stere",
  synonyms: ["ton/st", "ton*st^-1"],
  dividend: [Ton],
  divisor: [Stere],
};

const KilogramPerTerajoule: CompositeUnit<[Mass], [Energy]> = {
  name: "kilogram per terajoule",
  synonyms: ["kg/TJ", "kg*TJ^-1"],
  dividend: [Kilogram],
  divisor: [Terajoule],
};

const TerajoulePerGigaGram: CompositeUnit<[Energy], [Mass]> = {
  name: "terajoule per gigagram",
  synonyms: ["TJ * Gg^-1"],
  dividend: [Terajoule],
  divisor: [Gigagram],
};

const MegawatthourPerStere: CompositeUnit<[Energy], [Volume]> = {
  name: "MWh per st",
  synonyms: ["MHh * st^-1"],
  dividend: [MegaWattHour],
  divisor: [Stere],
};

test.each([
  {
    input: "a + b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter, testSystemBase)],
      ["b", new NumberWithUnitValue(5, Meter, testSystemBase)],
    ]),
    expected: new NumberWithUnitValue(10, Meter, testSystemBase),
  },
  {
    input: "NCV * Density",
    environment: new Map([
      [
        "Density",
        new NumberWithUnitValue(390, KilogramPerStere, testSystemBase),
      ],
      [
        "NCV",
        new NumberWithUnitValue(15.6, TerajoulePerGigaGram, testSystemBase),
      ],
    ]),
    expected: new NumberWithUnitValue(
      1.69,
      MegawatthourPerStere,
      testSystemBase,
    ),
  },
  {
    input: "NCV * Density * EFCH4",
    environment: new Map([
      [
        "Density",
        new NumberWithUnitValue(390, KilogramPerStere, testSystemBase),
      ],
      [
        "NCV",
        new NumberWithUnitValue(15.6, TerajoulePerGigaGram, testSystemBase),
      ],
      [
        "EFCH4",
        new NumberWithUnitValue(300, KilogramPerTerajoule, testSystemBase),
      ],
    ]),
    expected: new NumberWithUnitValue(1.8252e-3, TonPerStere, testSystemBase),
  },
] as EmissionFactorCalculationTestCase[])(
  "evaluation with units of: $input",
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
