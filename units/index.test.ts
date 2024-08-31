import { expect, test } from "vitest";
import {
  Centimeter,
  convert,
  Foot,
  Kilogram,
  KilogramPerStere,
  KiloMeterPerHour,
  Meter,
  MeterPerSecond,
  TonPerStere,
} from ".";

test.each([
  [Foot, Centimeter, 30.48],
  [Meter, Foot, 3.280839],
  [Meter, Meter, 1],
  [MeterPerSecond, KiloMeterPerHour, 3.6],
  [KiloMeterPerHour, MeterPerSecond, 1 / 3.6],
])("simple conversion: convert(%j, %j) -> %f", (a, b, expected) => {
  const result = convert(a, b);
  if (isNaN(expected)) {
    expect(result).to.be.NaN;
  } else {
    expect(result).to.be.closeTo(expected, 1e-6);
  }
});

test.each([
  [MeterPerSecond, KiloMeterPerHour, 3.6],
  [KiloMeterPerHour, MeterPerSecond, 1 / 3.6],
  [Kilogram, Meter, NaN],
])("composite conversion: convert(%j, %j) -> %i", (a, b, expected) => {
  const result = convert(a, b);
  if (isNaN(expected)) {
    expect(result).to.be.NaN;
  } else {
    expect(result).to.be.closeTo(expected, 1e-6);
  }
});

test("tCH4/st", () => {
  expect(convert(KilogramPerStere, TonPerStere)).to.be.closeTo(1e-3, 1e-6);
});
