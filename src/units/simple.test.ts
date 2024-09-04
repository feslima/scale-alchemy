import { expect, test } from "vitest";
import { QuantitySytem } from "./quantities";

const unitSystem = new QuantitySytem();

const Meter = unitSystem.newSimpleUnit("meter", ["m", "meters"], "Length", 1.0);

const Centimeter = unitSystem.newSimpleUnit(
  "centimeter",
  ["cm", "centimeters"],
  "Length",
  1.0e-2,
);

const Foot = unitSystem.newSimpleUnit("foot", ["ft", "feet"], "Length", 0.3048);

const Gram = unitSystem.newSimpleUnit("gram", ["g", "grams"], "Mass", 1.0);

const Kilogram = unitSystem.newSimpleUnit(
  "kilogram",
  ["kg", "kilograms"],
  "Mass",
  1.0e3,
);

const MegaWattHour = unitSystem.newSimpleUnit(
  "megawatt-hour",
  ["MHh", "megawatt-hours"],
  "Energy",
  3.6e9,
);

const Joule = unitSystem.newSimpleUnit("joule", ["J", "joules"], "Energy", 1.0);

const Terajoule = unitSystem.newSimpleUnit(
  "terajoule",
  ["TJ", "terajoules"],
  "Energy",
  1.0e12,
);

const CubicMeter = unitSystem.newSimpleUnit(
  "cubic meter",
  ["m^3", "cubic meters"],
  "Volume",
  1.0,
);

const Second = unitSystem.newSimpleUnit("second", ["s", "seconds"], "Time", 1);

unitSystem.add("Length", Meter);
unitSystem.add("Mass", Gram);
unitSystem.add("Time", Second);
unitSystem.add("Energy", Joule);
unitSystem.add("Volume", CubicMeter);
unitSystem.initialize();

test.each([
  {
    source: unitSystem.adimensional,
    destination: unitSystem.adimensional,
    expected: 1,
  },
  { source: unitSystem.adimensional, destination: Meter, expected: NaN },
  { source: Meter, destination: unitSystem.adimensional, expected: NaN },
  { source: Foot, destination: Centimeter, expected: 30.48 },
  { source: Meter, destination: Foot, expected: 3.280839 },
  { source: Meter, destination: Meter, expected: 1 },
  { source: Kilogram, destination: Meter, expected: NaN },
  { source: Terajoule, destination: MegaWattHour, expected: 1e6 / 3600 },
])(
  "simple conversion: $source.name to $destination.name -> %f",
  ({ source, destination, expected }) => {
    const result = source.convertTo(destination);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);
