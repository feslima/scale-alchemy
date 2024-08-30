import { expect, test } from "vitest";
import {
  convert,
  Foot,
  Centimeter,
  Meter,
  Kilogram,
  KiloMeterPerHour,
  MeterPerSecond,
} from ".";

test.each([
  [Foot, Centimeter, 30.48],
  [Meter, Foot, 3.280839],
  [Meter, Meter, 1],
  [MeterPerSecond, KiloMeterPerHour, 3.6],
  [KiloMeterPerHour, MeterPerSecond, 1 / 3.6],
])("simple conversion: convert(%j, %j) -> %f", (a, b, expected) => {
  expect(convert(a, b)).to.be.closeTo(expected, 1e-6);
});

test.each([
  [MeterPerSecond, KiloMeterPerHour, 3.6],
  [KiloMeterPerHour, MeterPerSecond, 1 / 3.6],
  [Kilogram, Meter, NaN],
])("composite conversion: convert(%j, %j) -> %i", (a, b, expected) => {
  expect(convert(a, b)).to.be.closeTo(expected, 1e-6);
});
