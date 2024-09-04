import { expect, test } from "vitest";
import {
  ErrorValue,
  EvaluationWithUnitEnvironmentType,
  EvaluatorWithUnits,
  Lexer,
  NumberWithUnitValue,
  Parser,
  QuantitySytem,
} from "../src";
import {
  CubicMeter,
  Gram,
  Joule,
  KilocaloriePerKilogram,
  KilogramPerCubicMeter,
  KilogramPerStere,
  KilogramPerTerajoule,
  KilometerPerLiter,
  MegawatthourPerStere,
  Meter,
  TerajoulePerGigaGram,
  TonPerCubicMeter,
  TonPerGigameter,
  TonPerStere,
} from "./definitions";

interface EmissionFactorCalculationTestCase {
  input: string;
  environment?: EvaluationWithUnitEnvironmentType;
  expected: NumberWithUnitValue;
}

const unitSystem = new QuantitySytem();
unitSystem.add("Length", Meter);
unitSystem.add("Mass", Gram);
unitSystem.add("Energy", Joule);
unitSystem.add("Volume", CubicMeter);
unitSystem.initialize();

const Adimensional = unitSystem.adimensional;

test.each([
  {
    input: "a + b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter, unitSystem)],
      ["b", new NumberWithUnitValue(5, Meter, unitSystem)],
    ]),
    expected: new NumberWithUnitValue(10, Meter, unitSystem),
  },
  {
    input: "a ^ b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter, unitSystem)],
      ["b", new NumberWithUnitValue(2, Adimensional, unitSystem)],
    ]),
    expected: new NumberWithUnitValue(25, Meter, unitSystem),
  },
  {
    input: "c ^ d",
    environment: new Map([
      ["c", new NumberWithUnitValue(5, Meter, unitSystem)],
      ["d", new NumberWithUnitValue(2, Meter, unitSystem)],
    ]),
    expected: new ErrorValue(
      "exponentiation only allowed if exponent is dimensionless",
    ),
  },
  {
    input: "e ^ f",
    environment: new Map([
      ["e", new NumberWithUnitValue(5, Adimensional, unitSystem)],
      ["f", new NumberWithUnitValue(2, Adimensional, unitSystem)],
    ]),
    expected: new NumberWithUnitValue(25, Adimensional, unitSystem),
  },
  {
    input: "g ^ h",
    environment: new Map([
      ["g", new NumberWithUnitValue(5, Adimensional, unitSystem)],
      ["h", new NumberWithUnitValue(2, Meter, unitSystem)],
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
      unitSystem,
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
      ["Density", new NumberWithUnitValue(390, KilogramPerStere, unitSystem)],
      ["NCV", new NumberWithUnitValue(15.6, TerajoulePerGigaGram, unitSystem)],
    ]),
    expected: new NumberWithUnitValue(1.69, MegawatthourPerStere, unitSystem),
  },
  {
    input: "NCV * Density * EFCH4",
    environment: new Map([
      ["Density", new NumberWithUnitValue(390, KilogramPerStere, unitSystem)],
      ["NCV", new NumberWithUnitValue(15.6, TerajoulePerGigaGram, unitSystem)],
      ["EFCH4", new NumberWithUnitValue(300, KilogramPerTerajoule, unitSystem)],
    ]),
    expected: new NumberWithUnitValue(1.8252e-3, TonPerStere, unitSystem),
  },
  {
    input: "((1 - FracBio) * EFCO2Diesel)/FuelEfficiency",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(2.578168115, KilometerPerLiter, unitSystem),
      ],
      [
        "EFCO2Diesel",
        new NumberWithUnitValue(2.603, TonPerCubicMeter, unitSystem),
      ],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional, unitSystem)],
    ]),
    expected: new NumberWithUnitValue(
      888.4758083357,
      TonPerGigameter,
      unitSystem,
    ),
  },
  {
    input:
      "(FracBio * EFCH4biodiesel)/FuelEfficiency + (((1 - FracBio) * DensityDiesel * NCVDiesel * EFCH4Diesel)/FuelEfficiency)",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(2.578168115, KilometerPerLiter, unitSystem),
      ],
      [
        "EFCH4Diesel",
        new NumberWithUnitValue(3.9, KilogramPerTerajoule, unitSystem),
      ],
      [
        "NCVDiesel",
        new NumberWithUnitValue(10100, KilocaloriePerKilogram, unitSystem),
      ],
      [
        "DensityDiesel",
        new NumberWithUnitValue(840, KilogramPerCubicMeter, unitSystem),
      ],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional, unitSystem)],
      [
        "EFCH4biodiesel",
        new NumberWithUnitValue(0.0003315946, TonPerCubicMeter, unitSystem),
      ],
    ]),
    expected: new NumberWithUnitValue(
      0.0627184764,
      TonPerGigameter,
      unitSystem,
    ),
  },
] as EmissionFactorCalculationTestCase[])(
  "realistic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const expressionTree = new Parser(new Lexer(input)).parse();
    const evaluator = new EvaluatorWithUnits(
      unitSystem,
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
