import { expect, test } from "vitest";
import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";
import {
  ErrorValue,
  EvaluationWithUnitEnvironmentType,
  EvaluatorWithUnits,
  NumberWithUnitValue,
} from "./interpreter/unit-evaluator";
import {
  Adimensional,
  Gigagram,
  Kilogram,
  Kilometer,
  MegaWattHour,
  Meter,
  Stere,
  Terajoule,
  Ton,
} from "./units";

interface EmissionFactorCalculationTestCase {
  input: string;
  environment?: EvaluationWithUnitEnvironmentType;
  expected: NumberWithUnitValue;
}

const testSystemBase: SystemBase = new Map();
testSystemBase.set("Dimensionless", [0, 0, 0, 0]);
testSystemBase.set("Mass", [1, 0, 0, 0]);
testSystemBase.set("Energy", [0, 1, 0, 0]);
testSystemBase.set("Volume", [0, 0, 1, 0]);
testSystemBase.set("Length", [0, 0, 0, 1]);

const Gigameter: SimpleUnit<Length> = {
  name: "gigameter",
  quantity: "Length",
  factor: 1e9,
  synonyms: ["gm", "gigameters"],
};

const CubicMeter: SimpleUnit<Volume> = {
  name: "cubic meter",
  synonyms: ["m^3", "cubic meters"],
  quantity: "Volume",
  factor: 1,
};

const Liter: SimpleUnit<Volume> = {
  name: "liter",
  synonyms: ["L", "liters"],
  quantity: "Volume",
  factor: 1e-3,
};

const KilometerPerLiter: CompositeUnit<[Length], [Volume]> = {
  name: "kilometer per liter",
  synonyms: ["km/L", "kilometers per liter"],
  dividend: [Kilometer],
  divisor: [Liter],
};

const KilogramPerStere: CompositeUnit<[Mass], [Volume]> = {
  name: "kilogram per stere",
  synonyms: ["kg/st", "kg*st^-1"],
  dividend: [Kilogram],
  divisor: [Stere],
};

const TonPerCubicMeter: CompositeUnit<[Mass], [Volume]> = {
  name: "ton per cubic meter",
  synonyms: ["ton/m^3", "ton*m^-3"],
  dividend: [Ton],
  divisor: [CubicMeter],
};

const TonPerStere: CompositeUnit<[Mass], [Volume]> = {
  name: "ton per stere",
  synonyms: ["ton/st", "ton*st^-1"],
  dividend: [Ton],
  divisor: [Stere],
};

const TonPerGigameter: CompositeUnit<[Mass], [Length]> = {
  name: "ton per gigameter",
  synonyms: ["ton/Gm", "ton*Gm^-1"],
  dividend: [Ton],
  divisor: [Gigameter],
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
    input: "a ^ b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter, testSystemBase)],
      ["b", new NumberWithUnitValue(2, Adimensional, testSystemBase)],
    ]),
    expected: new NumberWithUnitValue(25, Meter, testSystemBase),
  },
  {
    input: "c ^ d",
    environment: new Map([
      ["c", new NumberWithUnitValue(5, Meter, testSystemBase)],
      ["d", new NumberWithUnitValue(2, Meter, testSystemBase)],
    ]),
    expected: new ErrorValue(
      "exponentiation only allowed if exponent is dimensionless",
    ),
  },
  {
    input: "e ^ f",
    environment: new Map([
      ["e", new NumberWithUnitValue(5, Adimensional, testSystemBase)],
      ["f", new NumberWithUnitValue(2, Adimensional, testSystemBase)],
    ]),
    expected: new NumberWithUnitValue(25, Adimensional, testSystemBase),
  },
  {
    input: "g ^ h",
    environment: new Map([
      ["g", new NumberWithUnitValue(5, Adimensional, testSystemBase)],
      ["h", new NumberWithUnitValue(2, Meter, testSystemBase)],
    ]),
    expected: new ErrorValue(
      "exponentiation only allowed if exponent is dimensionless",
    ),
  },
] as EmissionFactorCalculationTestCase[])(
  "basic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const expressionTree = new Parser(new Lexer(input)).parse();
    const evaluator = new EvaluatorWithUnits(
      testSystemBase,
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

test.each([
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
  {
    input: "((1 - FracBio) * EFCO2Diesel)/FuelEfficiency",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(2.578168115, KilometerPerLiter, testSystemBase),
      ],
      [
        "EFCO2Diesel",
        new NumberWithUnitValue(2.603, TonPerCubicMeter, testSystemBase),
      ],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional, testSystemBase)],
    ]),
    expected: new NumberWithUnitValue(
      888.4758083357,
      TonPerGigameter,
      testSystemBase,
    ),
  },
] as EmissionFactorCalculationTestCase[])(
  "realistic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const expressionTree = new Parser(new Lexer(input)).parse();
    const evaluator = new EvaluatorWithUnits(
      testSystemBase,
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
