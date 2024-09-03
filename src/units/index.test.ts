import { expect, test } from "vitest";
import { convert, QuantitySytem } from ".";

const Meter = {
  name: "meter",
  quantity: "Length",
  factor: 1.0,
  synonyms: ["m", "meters"],
};

const Centimeter = {
  name: "centimeter",
  quantity: "Length",
  factor: 1.0e-2,
  synonyms: ["cm", "centimeters"],
};

const Foot = {
  name: "foot",
  quantity: "Length",
  factor: 0.3048,
  synonyms: ["ft", "feet"],
};

const Kilometer = {
  name: "kilometer",
  quantity: "Length",
  factor: 1e3,
  synonyms: ["km", "kilometers"],
};

const Kilogram = {
  name: "kilogram",
  quantity: "Mass",
  factor: 1.0e3,
  synonyms: ["kg", "kilograms"],
};

const Ton = {
  name: "ton",
  quantity: "Mass",
  factor: 1.0e6,
  synonyms: ["ton", "mg", "tonnes", "megagrams"],
};

const Gigagram = {
  name: "gigagram",
  quantity: "Mass",
  factor: 1.0e9,
  synonyms: ["Gg", "gigagrams"],
};

const MegaWattHour = {
  name: "megawatt-hour",
  quantity: "Energy",
  factor: 3.6e9,
  synonyms: ["MHh", "megawatt-hours"],
};

const Terajoule = {
  name: "terajoule",
  quantity: "Energy",
  factor: 1.0e12,
  synonyms: ["TJ", "terajoules"],
};

const Stere = {
  name: "stere",
  synonyms: ["st", "steres"],
  quantity: "Volume",
  factor: 1.0,
};

const Second = {
  name: "second",
  synonyms: ["s", "seconds"],
  quantity: "Time",
  factor: 1,
};

const Hour = {
  name: "hour",
  synonyms: ["h", "hours"],
  quantity: "Time",
  factor: 3600,
};

const MeterPerSecond = {
  name: "meter per second",
  synonyms: ["m/s", "meters per second"],
  dividend: [Meter],
  divisor: [Second],
};

const KilometerPerHour = {
  name: "kilometer per hour",
  synonyms: ["km/h", "kilometers per hour"],
  dividend: [Kilometer],
  divisor: [Hour],
};

const unitSystem = new QuantitySytem();
unitSystem.add("Length");
unitSystem.add("Mass");
unitSystem.add("Time");
unitSystem.add("Energy");
unitSystem.add("Volume");
unitSystem.add("Density");
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
    const result = convert(source, destination, unitSystem.base);
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
    source: {
      name: "composite adimensional",
      synonyms: [],
      dividend: [Meter],
      divisor: [Meter],
    },
    destination: unitSystem.adimensional,
    expected: 1,
  },
])(
  "composite conversion: $source.name to $destination.name -> %i",
  ({ source, destination, expected }) => {
    const result = convert(source, destination, unitSystem.base);
    if (isNaN(expected)) {
      expect(result).to.be.NaN;
    } else {
      expect(result).to.be.closeTo(expected, 1e-6);
    }
  },
);

test("tCH4/st", () => {
  const system = new QuantitySytem();
  system.add("Length");
  system.add("Mass");
  system.add("Time");
  system.add("Energy");
  system.add("Volume");
  system.add("Density");
  system.initialize();

  const base = system.base;

  const inputUnit = {
    name: "unit we have",
    synonyms: ["kg^2*TJ*TJ^-1*st^-1*Gg^-1"],
    dividend: [Kilogram, Kilogram, Terajoule],
    divisor: [Terajoule, Stere, Gigagram],
  };
  const desiredUnit = {
    name: "unit we want",
    synonyms: ["ton * st^-1"],
    dividend: [Ton],
    divisor: [Stere],
  };

  const result = 300 * 390 * 15.6 * convert(inputUnit, desiredUnit, base);
  expect(result).to.be.closeTo(1.8252e-3, 1e-6);
});

test("MWh/st", () => {
  const system = new QuantitySytem();
  system.add("Length");
  system.add("Mass");
  system.add("Time");
  system.add("Energy");
  system.add("Volume");
  system.add("Density");
  system.initialize();

  const base = system.base;

  const inputUnit = {
    name: "unit we have",
    synonyms: ["TJ * st^-1"],
    dividend: [Kilogram, Terajoule],
    divisor: [Gigagram, Stere],
  };
  const desiredUnit = {
    name: "unit we want",
    synonyms: ["MWh * st^-1"],
    dividend: [MegaWattHour],
    divisor: [Stere],
  };

  const result = 390 * 15.6 * convert(inputUnit, desiredUnit, base);
  expect(result).to.be.closeTo(1.69, 1e-6);
});
