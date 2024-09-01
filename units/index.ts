export const Meter: SimpleUnit<Length> = {
  name: "meter",
  quantity: "Length",
  factor: 1.0,
  synonyms: ["m", "meters"],
};

export const Kilometer: SimpleUnit<Length> = {
  name: "kilometer",
  quantity: "Length",
  factor: 1e3,
  synonyms: ["km", "kilometers"],
};

export const Foot: SimpleUnit<Length> = {
  name: "foot",
  quantity: "Length",
  factor: 0.3048,
  synonyms: ["ft", "feet"],
};

export const Centimeter: SimpleUnit<Length> = {
  name: "centimeter",
  quantity: "Length",
  factor: 1e-2,
  synonyms: ["cm", "centimeters"],
};

export const Kilogram: SimpleUnit<Mass> = {
  name: "kilogram",
  quantity: "Mass",
  factor: 1.0e3,
  synonyms: ["kg", "kilograms"],
};

export const Ton: SimpleUnit<Mass> = {
  name: "ton",
  quantity: "Mass",
  factor: 1.0e6,
  synonyms: ["ton", "mg", "tonnes", "megagrams"],
};

export const Gigagram: SimpleUnit<Mass> = {
  name: "gigagram",
  quantity: "Mass",
  factor: 1.0e9,
  synonyms: ["Gg", "gigagrams"],
};

export const Second: SimpleUnit<Time> = {
  name: "second",
  quantity: "Time",
  factor: 1.0,
  synonyms: ["s", "seconds"],
};

export const Hour: SimpleUnit<Time> = {
  name: "hour",
  quantity: "Time",
  factor: 3.6e3,
  synonyms: ["h", "hours"],
};

export const MegaWattHour: SimpleUnit<Energy> = {
  name: "megawatt-hour",
  quantity: "Energy",
  factor: 3.6e9,
  synonyms: ["MHh", "megawatt-hours"],
};

export const Megajoule: SimpleUnit<Energy> = {
  name: "megajoule",
  quantity: "Energy",
  factor: 1.0e6,
  synonyms: ["MJ", "megajoules"],
};

export const Terajoule: SimpleUnit<Energy> = {
  name: "terajoule",
  quantity: "Energy",
  factor: 1.0e12,
  synonyms: ["TJ", "terajoules"],
};

export const Stere: SimpleUnit<Volume> = {
  name: "stere",
  synonyms: ["st", "steres"],
  quantity: "Volume",
  factor: 1.0,
};

export const KilogramPerStere: SimpleUnit<Density> = {
  name: "kilogram per stere",
  synonyms: ["kg/st", "kg*st^-1"],
  quantity: "Density",
  factor: 1.0,
};

export const TonPerStere: SimpleUnit<Density> = {
  name: "ton per stere",
  synonyms: ["ton/st", "ton*st^-1"],
  quantity: "Density",
  factor: 1.0e3,
};

/* ------------------------ Composite Units ------------------------*/
type Velocity = CompositeUnit<[Length], [Time]>;
type Force = CompositeUnit<[Length, Mass], [Time]>;

export const KiloMeterPerHour: Velocity = {
  name: "kilometer per hour",
  synonyms: ["km/h", "km*h^-1"],
  dividend: [Kilometer],
  divisor: [Hour],
};

export const MeterPerSecond: Velocity = {
  name: "meter per second",
  synonyms: ["m/s", "m*s^-1"],
  dividend: [Meter],
  divisor: [Second],
};

export const Newton: Force = {
  name: "newton",
  synonyms: ["N", "newtons"],
  dividend: [Kilogram, Meter],
  divisor: [Second],
};

function isSimpleUnit<T extends Quantity[]>(
  obj: Unit<T>,
): obj is SimpleUnit<OneOf<T>> {
  return "factor" in obj;
}

function getFactor<T extends Quantity[]>(unit: Unit<T>): number {
  if (isSimpleUnit<T>(unit)) {
    return unit.factor;
  }

  const dividendFactor = unit.dividend.reduce(
    (factor, unit) => factor * unit.factor,
    1.0,
  );
  const divisorFactor = unit.divisor.reduce(
    (factor, unit) => factor * unit.factor,
    1.0,
  );

  return dividendFactor / divisorFactor;
}

export function getDimensionFromCompositeUnit<
  QDividend extends Quantity[],
  QDivisor extends Quantity[],
>(unit: CompositeUnit<QDividend, QDivisor>, base: SystemBase): Dimension {
  let result: Dimension = [];
  let dividendDimension: Dimension = [];
  let divisorDimension: Dimension = [];

  unit.dividend.forEach((u) => {
    const dim = base.get(u.quantity);
    if (dividendDimension.length === 0 && dim !== undefined) {
      dividendDimension = Array(dim.length).fill(0);
    }
    dim?.forEach((d, index) => {
      if (d !== 0) {
        dividendDimension[index] += d;
      }
    });
  });

  unit.divisor.forEach((u) => {
    const dim = base.get(u.quantity);
    if (divisorDimension.length === 0 && dim !== undefined) {
      divisorDimension = Array(dim.length).fill(0);
    }
    dim?.forEach((d, index) => {
      if (d !== 0) {
        divisorDimension[index] += d;
      }
    });
  });

  result = Array(dividendDimension.length ?? divisorDimension.length).fill(0);
  for (let i = 0; i < dividendDimension.length; i++) {
    result[i] += dividendDimension[i];
    result[i] -= divisorDimension[i];
  }

  return result;
}

export function getDimensionFromUnit<Q extends Quantity[]>(
  unit: Unit<Q>,
  base: SystemBase,
): Dimension | undefined {
  const isSimple = isSimpleUnit<Q>(unit);
  let dim: Dimension = Array(base.size).fill(0);

  if (!isSimple) {
    dim = getDimensionFromCompositeUnit(unit, base);
  } else {
    const tmpDim = base.get(unit.quantity);
    if (tmpDim === undefined) {
      return tmpDim;
    }
    dim = tmpDim;
  }

  return dim;
}

/**
 * It can be verified that the conversion from one unit to another
 * is legitimate by showing that the dimension vectors of the two
 * units are equal (i.e.: their difference is a zero vector).
 * @param source - unit to be converted from;
 * @param destination - unit to convert into;
 * @returns true if the conversion is allowed, otherwise false.
 */
export function analyze<S extends Quantity[], D extends Quantity[]>(
  source: Unit<S>,
  destination: Unit<D>,
  base: SystemBase,
): boolean {
  const sDim = getDimensionFromUnit<S>(source, base);
  const dDim = getDimensionFromUnit<D>(destination, base);
  if (sDim === undefined || dDim === undefined) {
    return false;
  }

  let sum = Array(base.size).fill(0);
  for (let i = 0; i < sDim.length; i++) {
    sum[i] = sDim[i] - dDim[i];
  }
  return sum.every((e) => e === 0);
}

export class Converter {
  private _systemBase: SystemBase = new Map();

  constructor() {
    this._systemBase.set("Length", [1, 0, 0, 0]);
    this._systemBase.set("Mass", [0, 1, 0, 0]);
    this._systemBase.set("Time", [0, 0, 1, 0]);
    this._systemBase.set("Energy", [0, 0, 0, 1]);
  }
}

export function convert<S extends Quantity, D extends Quantity>(
  source: Unit<S[]>,
  destination: Unit<D[]>,
  base: SystemBase,
): number {
  if (!analyze(source, destination, base)) {
    return NaN;
  }
  return getFactor(source) / getFactor(destination);
}
