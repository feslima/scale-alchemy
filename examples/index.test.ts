import { expect, test } from "vitest";
import {
  evaluate,
  EvaluationWithUnitEnvironmentType,
  NumberWithUnitValue,
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
  UnitSystem,
} from "./definitions";

interface EmissionFactorCalculationTestCase {
  input: string;
  environment?: EvaluationWithUnitEnvironmentType;
  expected: NumberWithUnitValue | string;
}

UnitSystem.add("Length", Meter);
UnitSystem.add("Mass", Gram);
UnitSystem.add("Energy", Joule);
UnitSystem.add("Volume", CubicMeter);
UnitSystem.initialize();

const Adimensional = UnitSystem.adimensional;

test.each([
  {
    input: "a + b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter)],
      ["b", new NumberWithUnitValue(5, Meter)],
    ]),
    expected: new NumberWithUnitValue(10, Meter),
  },
  {
    input: "a ^ b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter)],
      ["b", new NumberWithUnitValue(2, Adimensional)],
    ]),
    expected: new NumberWithUnitValue(25, Meter),
  },
  {
    input: "c ^ d",
    environment: new Map([
      ["c", new NumberWithUnitValue(5, Meter)],
      ["d", new NumberWithUnitValue(2, Meter)],
    ]),
    expected: "exponentiation only allowed if exponent is dimensionless",
  },
  {
    input: "e ^ f",
    environment: new Map([
      ["e", new NumberWithUnitValue(5, Adimensional)],
      ["f", new NumberWithUnitValue(2, Adimensional)],
    ]),
    expected: new NumberWithUnitValue(25, Adimensional),
  },
  {
    input: "g ^ h",
    environment: new Map([
      ["g", new NumberWithUnitValue(5, Adimensional)],
      ["h", new NumberWithUnitValue(2, Meter)],
    ]),
    expected: "exponentiation only allowed if exponent is dimensionless",
  },
] as EmissionFactorCalculationTestCase[])(
  "basic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const result = evaluate(
      input,
      UnitSystem,
      environment !== undefined ? environment : new Map(),
    );

    if (typeof expected === "string") {
      expect(result).to.have.property("error").be.equal(expected);
    } else {
      const actual = result.value.convertTo(expected.unit);
      expect(actual).to.be.closeTo(expected.value, 1e-6);
    }
  },
);

test.each([
  {
    input: "NCV * Density",
    environment: new Map([
      ["Density", new NumberWithUnitValue(390, KilogramPerStere)],
      ["NCV", new NumberWithUnitValue(15.6, TerajoulePerGigaGram)],
    ]),
    expected: new NumberWithUnitValue(1.69, MegawatthourPerStere),
  },
  {
    input: "NCV * Density * EFCH4",
    environment: new Map([
      ["Density", new NumberWithUnitValue(390, KilogramPerStere)],
      ["NCV", new NumberWithUnitValue(15.6, TerajoulePerGigaGram)],
      ["EFCH4", new NumberWithUnitValue(300, KilogramPerTerajoule)],
    ]),
    expected: new NumberWithUnitValue(1.8252e-3, TonPerStere),
  },
  {
    input: "((1 - FracBio) * EFCO2Diesel)/FuelEfficiency",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(2.578168115, KilometerPerLiter),
      ],
      ["EFCO2Diesel", new NumberWithUnitValue(2.603, TonPerCubicMeter)],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional)],
    ]),
    expected: new NumberWithUnitValue(888.4758083357, TonPerGigameter),
  },
  {
    input:
      "(FracBio * EFCH4biodiesel)/FuelEfficiency + (((1 - FracBio) * DensityDiesel * NCVDiesel * EFCH4Diesel)/FuelEfficiency)",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(2.578168115, KilometerPerLiter),
      ],
      ["EFCH4Diesel", new NumberWithUnitValue(3.9, KilogramPerTerajoule)],
      ["NCVDiesel", new NumberWithUnitValue(10100, KilocaloriePerKilogram)],
      ["DensityDiesel", new NumberWithUnitValue(840, KilogramPerCubicMeter)],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional)],
      [
        "EFCH4biodiesel",
        new NumberWithUnitValue(0.0003315946, TonPerCubicMeter),
      ],
    ]),
    expected: new NumberWithUnitValue(0.0627184764, TonPerGigameter),
  },
] as EmissionFactorCalculationTestCase[])(
  "realistic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const result = evaluate(
      input,
      UnitSystem,
      environment !== undefined ? environment : new Map(),
    );

    if (typeof expected === "string") {
      expect(result).to.have.property("error").be.equal(expected);
    } else {
      const actual = result.value.convertTo(expected.unit);
      expect(actual).to.be.closeTo(expected.value, 1e-6);
    }
  },
);
