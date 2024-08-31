import { expect, test } from "vitest";
import {
  Centimeter,
  convert,
  Foot,
  Kilogram,
  KilogramPerStere,
  KiloMeterPerHour,
  MegaWattHour,
  Meter,
  MeterPerSecond,
  Terajoule,
  TonPerStere,
} from ".";

const testSystemBase: SystemBase = new Map();
testSystemBase.set("Length", [1, 0, 0, 0]);
testSystemBase.set("Mass", [0, 1, 0, 0]);
testSystemBase.set("Time", [0, 0, 1, 0]);
testSystemBase.set("Energy", [0, 0, 0, 1]);

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
