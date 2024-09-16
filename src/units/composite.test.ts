import { expect, test } from "vitest";
import { QuantitySytem } from "./quantities";

const unitSystem = new QuantitySytem();

const Gram = unitSystem.newSimpleUnit("gram", "g", ["grams"], "Mass", 1.0);
const Meter = unitSystem.newSimpleUnit("meter", "m", ["meters"], "Length", 1.0);
const Second = unitSystem.newSimpleUnit("second", "s", ["seconds"], "Time", 1);
const Hour = unitSystem.newSimpleUnit("hour", "h", ["hours"], "Time", 3600);
const Joule = unitSystem.newSimpleUnit("joule", "J", ["joules"], "Energy", 1.0);
const CubicMeter = unitSystem.newSimpleUnit(
  "cubic meter",
  "m^3",
  ["cubic meters"],
  "Volume",
  1.0,
);
const Kilogram = unitSystem.newSimpleUnit(
  "kilogram",
  "kg",
  ["kilograms"],
  "Mass",
  1.0e3,
);
const Ton = unitSystem.newSimpleUnit(
  "ton",
  "ton",
  ["Mg", "tonnes", "megagrams"],
  "Mass",
  1.0e6,
);
const Gigagram = unitSystem.newSimpleUnit(
  "gigagram",
  "Gg",
  ["gigagrams"],
  "Mass",
  1.0e9,
);

const MegaWattHour = unitSystem.newSimpleUnit(
  "megawatt-hour",
  "MHh",
  ["megawatt-hours"],
  "Energy",
  3.6e9,
);
const Terajoule = unitSystem.newSimpleUnit(
  "terajoule",
  "TJ",
  ["terajoules"],
  "Energy",
  1.0e12,
);
const Stere = unitSystem.newSimpleUnit(
  "stere",
  "st",
  ["steres"],
  "Volume",
  1.0,
);

const MeterPerSecond = unitSystem.newCompositeUnit(
  "meter per second",
  ["meters per second"],
  [Meter],
  [Second],
);

const Kilometer = unitSystem.newSimpleUnit(
  "kilometer",
  "km",
  ["kilometers"],
  "Length",
  1e3,
);

const KilometerPerHour = unitSystem.newCompositeUnit(
  "kilometer per hour",
  ["kilometers per hour"],
  [Kilometer],
  [Hour],
);

unitSystem.addQuantity(Meter);
unitSystem.addQuantity(Gram);
unitSystem.addQuantity(Second);
unitSystem.initialize();

test.each([
  { source: MeterPerSecond, destination: KilometerPerHour, expected: 3.6 },
  { source: KilometerPerHour, destination: MeterPerSecond, expected: 1 / 3.6 },
  {
    source: MeterPerSecond,
    destination: unitSystem.adimensional,
    expected: NaN,
  },
  {
    source: unitSystem.adimensional,
    destination: KilometerPerHour,
    expected: NaN,
  },
  {
    source: unitSystem.newCompositeUnit(
      "composite adimensional",
      [],
      [Meter],
      [Meter],
    ),
    destination: unitSystem.adimensional,
    expected: 1,
  },
])(
  "composite conversion: $source.name to $destination.name -> %i",
  ({ source, destination, expected }) => {
    const result = source.convertTo(destination);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);

test("tCH4/st", () => {
  const system = new QuantitySytem();
  system.addQuantity(Meter);
  system.addQuantity(Gram);
  system.addQuantity(Second);
  system.addQuantity(Joule);
  system.addQuantity(CubicMeter);
  system.initialize();

  const inputUnit = system.newCompositeUnit(
    "unit we have",
    [""],
    [Kilogram, Kilogram, Terajoule],
    [Terajoule, Stere, Gigagram],
    "kg^2*TJ*TJ^-1*st^-1*Gg^-1",
  );
  const desiredUnit = system.newCompositeUnit(
    "unit we want",
    [""],
    [Ton],
    [Stere],
  );

  const result = 300 * 390 * 15.6 * inputUnit.convertTo(desiredUnit);
  expect(result).to.be.closeTo(1.8252e-3, 1e-6);
});

test("MWh/st", () => {
  const system = new QuantitySytem();
  system.addQuantity(Meter);
  system.addQuantity(Gram);
  system.addQuantity(Second);
  system.addQuantity(Joule);
  system.addQuantity(CubicMeter);
  system.initialize();

  const inputUnit = system.newCompositeUnit(
    "unit we have",
    [""],
    [Kilogram, Terajoule],
    [Gigagram, Stere],
  );
  const desiredUnit = system.newCompositeUnit(
    "unit we want",
    [],
    [MegaWattHour],
    [Stere],
  );

  const result = 390 * 15.6 * inputUnit.convertTo(desiredUnit);
  expect(result).to.be.closeTo(1.69, 1e-6);
});
