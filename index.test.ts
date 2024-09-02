import { expect, test } from "vitest";
import { Lexer } from "./interpreter/lexer";
import { Parser } from "./interpreter/parser";
import {
  ErrorValue,
  EvaluationWithUnitEnvironmentType,
  EvaluatorWithUnits,
  NumberWithUnitValue,
} from "./interpreter/unit-evaluator";
import { QuantitySytem } from "./units";

interface EmissionFactorCalculationTestCase {
  input: string;
  environment?: EvaluationWithUnitEnvironmentType;
  expected: NumberWithUnitValue;
}

type Dimensionless = "Dimensionless";
type Length = "Length";
type Mass = "Mass";
type Energy = "Energy";
type Volume = "Volume";

const unitSystem = new QuantitySytem();
unitSystem.add("Length");
unitSystem.add("Mass");
unitSystem.add("Energy");
unitSystem.add("Volume");
unitSystem.add("Density");
unitSystem.initialize();

const Adimensional: SimpleUnit<Dimensionless> = {
  name: "adimensional",
  quantity: "Dimensionless",
  factor: 1.0,
  synonyms: [],
};

const Meter: SimpleUnit<Length> = {
  name: "meter",
  quantity: "Length",
  factor: 1.0,
  synonyms: ["m", "meters"],
};

const Kilometer: SimpleUnit<Length> = {
  name: "kilometer",
  quantity: "Length",
  factor: 1e3,
  synonyms: ["km", "kilometers"],
};

const Kilogram: SimpleUnit<Mass> = {
  name: "kilogram",
  quantity: "Mass",
  factor: 1.0e3,
  synonyms: ["kg", "kilograms"],
};

const Ton: SimpleUnit<Mass> = {
  name: "ton",
  quantity: "Mass",
  factor: 1.0e6,
  synonyms: ["ton", "mg", "tonnes", "megagrams"],
};

const Gigagram: SimpleUnit<Mass> = {
  name: "gigagram",
  quantity: "Mass",
  factor: 1.0e9,
  synonyms: ["Gg", "gigagrams"],
};

const MegaWattHour: SimpleUnit<Energy> = {
  name: "megawatt-hour",
  quantity: "Energy",
  factor: 3.6e9,
  synonyms: ["MHh", "megawatt-hours"],
};

const Terajoule: SimpleUnit<Energy> = {
  name: "terajoule",
  quantity: "Energy",
  factor: 1.0e12,
  synonyms: ["TJ", "terajoules"],
};

const Stere: SimpleUnit<Volume> = {
  name: "stere",
  synonyms: ["st", "steres"],
  quantity: "Volume",
  factor: 1.0,
};

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

const Kilocalorie: SimpleUnit<Energy> = {
  name: "kilocalorie",
  synonyms: ["kcal", "kilocalories"],
  quantity: "Energy",
  factor: 4186.8,
};

const KilometerPerLiter: CompositeUnit<[Length], [Volume]> = {
  name: "kilometer per liter",
  synonyms: ["km/L", "kilometers per liter"],
  dividend: [Kilometer],
  divisor: [Liter],
};

const KilogramPerCubicMeter: CompositeUnit<[Mass], [Volume]> = {
  name: "kilogram per cubic meter",
  synonyms: ["kg/m^3", "kg*m^-3"],
  dividend: [Kilogram],
  divisor: [CubicMeter],
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

const KilocaloriePerKilogram: CompositeUnit<[Energy], [Mass]> = {
  name: "kcal per kg",
  synonyms: ["kcal/kg"],
  dividend: [Kilocalorie],
  divisor: [Kilogram],
};

test.each([
  {
    input: "a + b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter, unitSystem.base)],
      ["b", new NumberWithUnitValue(5, Meter, unitSystem.base)],
    ]),
    expected: new NumberWithUnitValue(10, Meter, unitSystem.base),
  },
  {
    input: "a ^ b",
    environment: new Map([
      ["a", new NumberWithUnitValue(5, Meter, unitSystem.base)],
      ["b", new NumberWithUnitValue(2, Adimensional, unitSystem.base)],
    ]),
    expected: new NumberWithUnitValue(25, Meter, unitSystem.base),
  },
  {
    input: "c ^ d",
    environment: new Map([
      ["c", new NumberWithUnitValue(5, Meter, unitSystem.base)],
      ["d", new NumberWithUnitValue(2, Meter, unitSystem.base)],
    ]),
    expected: new ErrorValue(
      "exponentiation only allowed if exponent is dimensionless",
    ),
  },
  {
    input: "e ^ f",
    environment: new Map([
      ["e", new NumberWithUnitValue(5, Adimensional, unitSystem.base)],
      ["f", new NumberWithUnitValue(2, Adimensional, unitSystem.base)],
    ]),
    expected: new NumberWithUnitValue(25, Adimensional, unitSystem.base),
  },
  {
    input: "g ^ h",
    environment: new Map([
      ["g", new NumberWithUnitValue(5, Adimensional, unitSystem.base)],
      ["h", new NumberWithUnitValue(2, Meter, unitSystem.base)],
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
      unitSystem.base,
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
        new NumberWithUnitValue(390, KilogramPerStere, unitSystem.base),
      ],
      [
        "NCV",
        new NumberWithUnitValue(15.6, TerajoulePerGigaGram, unitSystem.base),
      ],
    ]),
    expected: new NumberWithUnitValue(
      1.69,
      MegawatthourPerStere,
      unitSystem.base,
    ),
  },
  {
    input: "NCV * Density * EFCH4",
    environment: new Map([
      [
        "Density",
        new NumberWithUnitValue(390, KilogramPerStere, unitSystem.base),
      ],
      [
        "NCV",
        new NumberWithUnitValue(15.6, TerajoulePerGigaGram, unitSystem.base),
      ],
      [
        "EFCH4",
        new NumberWithUnitValue(300, KilogramPerTerajoule, unitSystem.base),
      ],
    ]),
    expected: new NumberWithUnitValue(1.8252e-3, TonPerStere, unitSystem.base),
  },
  {
    input: "((1 - FracBio) * EFCO2Diesel)/FuelEfficiency",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(
          2.578168115,
          KilometerPerLiter,
          unitSystem.base,
        ),
      ],
      [
        "EFCO2Diesel",
        new NumberWithUnitValue(2.603, TonPerCubicMeter, unitSystem.base),
      ],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional, unitSystem.base)],
    ]),
    expected: new NumberWithUnitValue(
      888.4758083357,
      TonPerGigameter,
      unitSystem.base,
    ),
  },
  {
    input:
      "(FracBio * EFCH4biodiesel)/FuelEfficiency + (((1 - FracBio) * DensityDiesel * NCVDiesel * EFCH4Diesel)/FuelEfficiency)",
    environment: new Map([
      [
        "FuelEfficiency",
        new NumberWithUnitValue(
          2.578168115,
          KilometerPerLiter,
          unitSystem.base,
        ),
      ],
      [
        "EFCH4Diesel",
        new NumberWithUnitValue(3.9, KilogramPerTerajoule, unitSystem.base),
      ],
      [
        "NCVDiesel",
        new NumberWithUnitValue(10100, KilocaloriePerKilogram, unitSystem.base),
      ],
      [
        "DensityDiesel",
        new NumberWithUnitValue(840, KilogramPerCubicMeter, unitSystem.base),
      ],
      ["FracBio", new NumberWithUnitValue(0.12, Adimensional, unitSystem.base)],
      [
        "EFCH4biodiesel",
        new NumberWithUnitValue(
          0.0003315946,
          TonPerCubicMeter,
          unitSystem.base,
        ),
      ],
    ]),
    expected: new NumberWithUnitValue(
      0.0627184764,
      TonPerGigameter,
      unitSystem.base,
    ),
  },
] as EmissionFactorCalculationTestCase[])(
  "realistic evaluation with units of: $input",
  ({ input, environment, expected }) => {
    const expressionTree = new Parser(new Lexer(input)).parse();
    const evaluator = new EvaluatorWithUnits(
      unitSystem.base,
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
