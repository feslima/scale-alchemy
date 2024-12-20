import { expect, test } from "vitest";
import {
  evaluate,
  EvaluationWithUnitEnvironmentType,
  NumberValue,
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
  environment: EvaluationWithUnitEnvironmentType;
  expected: NumberWithUnitValue<NumberValue> | string;
}

UnitSystem.addQuantity(Meter);
UnitSystem.addQuantity(Gram);
UnitSystem.addQuantity(Joule);
UnitSystem.addQuantity(CubicMeter);
UnitSystem.initialize();

const Adimensional = UnitSystem.adimensional;
const nv = (n: number) => new NumberValue(n);

test.each([
  {
    input: "a + b",
    environment: new Map([
      ["a", new NumberWithUnitValue(nv(5), Meter)],
      ["b", new NumberWithUnitValue(nv(5), Meter)],
    ]),
    expected: new NumberWithUnitValue(nv(10), Meter),
  },
  {
    input: "a ^ b",
    environment: new Map([
      ["a", new NumberWithUnitValue(nv(5), Meter)],
      ["b", new NumberWithUnitValue(nv(2), Adimensional)],
    ]),
    expected: new NumberWithUnitValue(nv(25), Meter),
  },
  {
    input: "c ^ d",
    environment: new Map([
      ["c", new NumberWithUnitValue(nv(5), Meter)],
      ["d", new NumberWithUnitValue(nv(2), Meter)],
    ]),
    expected: "exponentiation only allowed if exponent is dimensionless",
  },
  {
    input: "e ^ f",
    environment: new Map([
      ["e", new NumberWithUnitValue(nv(5), Adimensional)],
      ["f", new NumberWithUnitValue(nv(2), Adimensional)],
    ]),
    expected: new NumberWithUnitValue(nv(25), Adimensional),
  },
  {
    input: "g ^ h",
    environment: new Map([
      ["g", new NumberWithUnitValue(nv(5), Adimensional)],
      ["h", new NumberWithUnitValue(nv(2), Meter)],
    ]),
    expected: "exponentiation only allowed if exponent is dimensionless",
  },
] as EmissionFactorCalculationTestCase[])(
  "basic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const result = evaluate(input, UnitSystem, environment, nv);

    if (typeof expected === "string") {
      expect(result).to.have.property("error").be.equal(expected);
    } else {
      const actual = result.value.convertTo(expected.unit).value;
      expect(actual).to.be.closeTo(expected.number.value, 1e-6);
    }
  },
);

test.each([
  {
    input: "NCV * Density",
    environment: new Map([
      ["Density", new NumberWithUnitValue(nv(390), KilogramPerStere)],
      ["NCV", new NumberWithUnitValue(nv(15.6), TerajoulePerGigaGram)],
    ]),
    expected: new NumberWithUnitValue(nv(1.69), MegawatthourPerStere),
  },
  {
    input: "NCV * Density * EFCH4",
    environment: new Map([
      ["Density", new NumberWithUnitValue(nv(390), KilogramPerStere)],
      ["NCV", new NumberWithUnitValue(nv(15.6), TerajoulePerGigaGram)],
      ["EFCH4", new NumberWithUnitValue(nv(300), KilogramPerTerajoule)],
    ]),
    expected: new NumberWithUnitValue(nv(1.8252e-3), TonPerStere),
  },
  {
    input: "((1 - FracBio) * EFCO2Diesel)/FuelEfficiency",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(nv(2.578168115), KilometerPerLiter),
      ],
      ["EFCO2Diesel", new NumberWithUnitValue(nv(2.603), TonPerCubicMeter)],
      ["FracBio", new NumberWithUnitValue(nv(0.12), Adimensional)],
    ]),
    expected: new NumberWithUnitValue(nv(888.4758083357), TonPerGigameter),
  },
  {
    input:
      "(FracBio * EFCH4biodiesel)/FuelEfficiency + (((1 - FracBio) * DensityDiesel * NCVDiesel * EFCH4Diesel)/FuelEfficiency)",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(nv(2.578168115), KilometerPerLiter),
      ],
      ["EFCH4Diesel", new NumberWithUnitValue(nv(3.9), KilogramPerTerajoule)],
      ["NCVDiesel", new NumberWithUnitValue(nv(10100), KilocaloriePerKilogram)],
      [
        "DensityDiesel",
        new NumberWithUnitValue(nv(840), KilogramPerCubicMeter),
      ],
      ["FracBio", new NumberWithUnitValue(nv(0.12), Adimensional)],
      [
        "EFCH4biodiesel",
        new NumberWithUnitValue(nv(0.0003315946), TonPerCubicMeter),
      ],
    ]),
    expected: new NumberWithUnitValue(nv(0.0627184764), TonPerGigameter),
  },
  {
    input:
      "DensityDiesel*EF_Diesel*(1-FracBio) + DensityBiodiesel*EF_Biodiesel*FracBio",
    environment: new Map([
      [
        "DensityDiesel",
        new NumberWithUnitValue(nv(840), KilogramPerCubicMeter),
      ],
      [
        "DensityBiodiesel",
        new NumberWithUnitValue(nv(880), KilogramPerCubicMeter),
      ],
      ["FracBio", new NumberWithUnitValue(nv(0.12), Adimensional)],
      ["EF_Diesel", new NumberWithUnitValue(nv(0.65389), Adimensional)],
      ["EF_Biodiesel", new NumberWithUnitValue(nv(3.00778), Adimensional)],
    ]),
    expected: new NumberWithUnitValue(nv(0.800977056), TonPerCubicMeter),
  },
] as EmissionFactorCalculationTestCase[])(
  "realistic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const result = evaluate(input, UnitSystem, environment, nv);

    if (typeof expected === "string") {
      expect(result).to.have.property("error").be.equal(expected);
    } else {
      expect(result.error).to.be.undefined;
      const actual = result.value.convertTo(expected.unit).value;
      expect(actual).to.be.closeTo(expected.number.value, 1e-6);
    }
  },
);
