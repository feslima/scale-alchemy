import { expect, test } from "vitest";
import {
  Centimeter,
  convert,
  Foot,
  Gigagram,
  Kilogram,
  KilogramPerStere,
  KiloMeterPerHour,
  MegaWattHour,
  Meter,
  MeterPerSecond,
  Stere,
  Terajoule,
  TonPerStere,
} from ".";

const testSystemBase: SystemBase = new Map();
testSystemBase.set("Length", [1, 0, 0, 0, 0, 0]);
testSystemBase.set("Mass", [0, 1, 0, 0, 0, 0]);
testSystemBase.set("Time", [0, 0, 1, 0, 0, 0]);
testSystemBase.set("Energy", [0, 0, 0, 1, 0, 0]);
testSystemBase.set("Volume", [0, 0, 0, 0, 1, 0, 0]);
testSystemBase.set("Density", [0, 0, 0, 0, 0, 1]);

test.each([
  { source: Foot, destination: Centimeter, expected: 30.48 },
  { source: Meter, destination: Foot, expected: 3.280839 },
  { source: Meter, destination: Meter, expected: 1 },
])(
  "simple conversion: $source.name to $destination.name -> %f",
  ({ source, destination, expected }) => {
    const result = convert(source, destination, testSystemBase);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);

test.each([
  { source: MeterPerSecond, destination: KiloMeterPerHour, expected: 3.6 },
  { source: KiloMeterPerHour, destination: MeterPerSecond, expected: 1 / 3.6 },
  { source: Kilogram, destination: Meter, expected: NaN },
  { source: Terajoule, destination: MegaWattHour, expected: 1e6 / 3600 },
])(
  "composite conversion: $source.name to $destination.name -> %i",
  ({ source, destination, expected }) => {
    const result = convert(source, destination, testSystemBase);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);

test("tCH4/st from kg/st", () => {
  const result = convert(KilogramPerStere, TonPerStere, testSystemBase);
  expect(result).to.be.closeTo(1e-3, 1e-6);
});

test("MWh/st", () => {
  const base: SystemBase = new Map();
  base.set("Length", [1, 0, 0, 0, 0]);
  base.set("Mass", [0, 1, 0, 0, 0]);
  base.set("Time", [0, 0, 1, 0, 0]);
  base.set("Energy", [0, 0, 0, 1, 0]);
  base.set("Volume", [0, 0, 0, 0, 1]);

  const inputUnit: CompositeUnit<[Mass, Energy], [Mass, Volume]> = {
    name: "emission factor we have",
    synonyms: ["TJ * st^-1"],
    dividend: [Kilogram, Terajoule],
    divisor: [Gigagram, Stere],
  };
  const desiredUnit: CompositeUnit<[Energy], [Volume]> = {
    name: "emission factor we want",
    synonyms: ["MWh * st^-1"],
    dividend: [MegaWattHour],
    divisor: [Stere],
  };

  const result = 390 * 15.6 * convert(inputUnit, desiredUnit, base);
  expect(result).to.be.closeTo(1.69, 1e-6);
});
