import { expect, test } from "vitest";
import { CompositeUnit, QuantitySytem, SimpleUnit } from ".";
const Meter = new SimpleUnit("meter", ["m", "meters"], "Length", 1.0);

const Centimeter = new SimpleUnit(
  "centimeter",
  ["cm", "centimeters"],
  "Length",
  1.0e-2,
);

const Foot = new SimpleUnit("foot", ["ft", "feet"], "Length", 0.3048);

const Kilometer = new SimpleUnit(
  "kilometer",
  ["km", "kilometers"],
  "Length",
  1e3,
);

const Gram = new SimpleUnit("gram", ["g", "grams"], "Mass", 1.0);

const Kilogram = new SimpleUnit("kilogram", ["kg", "kilograms"], "Mass", 1.0e3);

const Ton = new SimpleUnit(
  "ton",
  ["ton", "mg", "tonnes", "megagrams"],
  "Mass",
  1.0e6,
);

const Gigagram = new SimpleUnit("gigagram", ["Gg", "gigagrams"], "Mass", 1.0e9);

const MegaWattHour = new SimpleUnit(
  "megawatt-hour",
  ["MHh", "megawatt-hours"],
  "Energy",
  3.6e9,
);

const Joule = new SimpleUnit("joule", ["J", "joules"], "Energy", 1.0);

const Terajoule = new SimpleUnit(
  "terajoule",
  ["TJ", "terajoules"],
  "Energy",
  1.0e12,
);

const CubicMeter = new SimpleUnit(
  "cubic meter",
  ["m^3", "cubic meters"],
  "Volume",
  1.0,
);

const Stere = new SimpleUnit("stere", ["st", "steres"], "Volume", 1.0);

const Second = new SimpleUnit("second", ["s", "seconds"], "Time", 1);

const Hour = new SimpleUnit("hour", ["h", "hours"], "Time", 3600);

const MeterPerSecond = new CompositeUnit(
  "meter per second",
  ["m/s", "meters per second"],
  [Meter],
  [Second],
);

const KilometerPerHour = new CompositeUnit(
  "kilometer per hour",
  ["km/h", "kilometers per hour"],
  [Kilometer],
  [Hour],
);

const unitSystem = new QuantitySytem();
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
    const result = source.convertTo(destination, unitSystem.base);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);

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
    source: new CompositeUnit("composite adimensional", [], [Meter], [Meter]),
    destination: unitSystem.adimensional,
    expected: 1,
  },
])(
  "composite conversion: $source.name to $destination.name -> %i",
  ({ source, destination, expected }) => {
    const result = source.convertTo(destination, unitSystem.base);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);

test("tCH4/st", () => {
  const system = new QuantitySytem();
  system.add("Length", Meter);
  system.add("Mass", Gram);
  system.add("Time", Second);
  system.add("Energy", Joule);
  system.add("Volume", CubicMeter);
  system.initialize();

  const base = system.base;

  const inputUnit = new CompositeUnit(
    "unit we have",
    ["kg^2*TJ*TJ^-1*st^-1*Gg^-1"],
    [Kilogram, Kilogram, Terajoule],
    [Terajoule, Stere, Gigagram],
  );
  const desiredUnit = new CompositeUnit(
    "unit we want",
    ["ton * st^-1"],
    [Ton],
    [Stere],
  );

  const result = 300 * 390 * 15.6 * inputUnit.convertTo(desiredUnit, base);
  expect(result).to.be.closeTo(1.8252e-3, 1e-6);
});

test("MWh/st", () => {
  const system = new QuantitySytem();
  system.add("Length", Meter);
  system.add("Mass", Gram);
  system.add("Time", Second);
  system.add("Energy", Joule);
  system.add("Volume", CubicMeter);
  system.initialize();

  const base = system.base;

  const inputUnit = new CompositeUnit(
    "unit we have",
    ["TJ * st^-1"],
    [Kilogram, Terajoule],
    [Gigagram, Stere],
  );
  const desiredUnit = new CompositeUnit(
    "unit we want",
    ["MWh * st^-1"],
    [MegaWattHour],
    [Stere],
  );

  const result = 390 * 15.6 * inputUnit.convertTo(desiredUnit, base);
  expect(result).to.be.closeTo(1.69, 1e-6);
});
