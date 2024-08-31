type Length = "Length";
type Mass = "Mass";
type Time = "Time";
type Energy = "Energy";
type Quantity = Length | Mass | Time | Energy;
type Dimension = number[];

interface BasicUnitInfo {
  readonly name: string;
  readonly synonyms: string[];
}

export interface SimpleUnit<TQuantity extends Quantity> extends BasicUnitInfo {
  readonly quantity: TQuantity;
  readonly factor: number;
}
type OneOf<T extends any[]> = T extends (infer U)[] ? U : never;

export interface CompositeUnit<
  TDividend extends Quantity[],
  TDivisor extends Quantity[],
> extends BasicUnitInfo {
  dividend: SimpleUnit<OneOf<TDividend>>[];
  divisor: SimpleUnit<OneOf<TDivisor>>[];
}

export type Unit<Q extends Quantity[]> =
  | SimpleUnit<OneOf<Q>>
  | CompositeUnit<Q, Q>;

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
  factor: 1.0,
  synonyms: ["kg", "kilograms"],
};

export const Ton: SimpleUnit<Mass> = {
  name: "ton",
  quantity: "Mass",
  factor: 1.0e3,
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

/* ------------------------ Composite Units ------------------------*/
type VolumeQuantity = [Length, Length, Length];
type Volume = CompositeUnit<VolumeQuantity, []>;
type Velocity = CompositeUnit<[Length], [Time]>;
type Force = CompositeUnit<[Length, Mass], [Time]>;
type Density = CompositeUnit<[Mass], VolumeQuantity>;

export const MegaWattHour: CompositeUnit<[Energy, Time], [Time]> = {
  name: "megawatthour",
  synonyms: ["MWh", "megawatthours"],
  dividend: [Megajoule, Hour],
  divisor: [Second],
};

export const Stere: Volume = {
  name: "stere",
  synonyms: ["st", "steres"],
  dividend: [Meter, Meter, Meter],
  divisor: [],
};

export const KilogramPerStere: Density = {
  name: "kilogram per stere",
  synonyms: ["kg/st", "kg*st^-1"],
  dividend: [Kilogram],
  divisor: [Meter, Meter, Meter],
};

export const TonPerStere: Density = {
  name: "ton per stere",
  synonyms: ["ton/st", "ton*st^-1"],
  dividend: [Ton],
  divisor: [Meter, Meter, Meter],
};

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

const SystemBase = new Map<Quantity, Dimension>();
SystemBase.set("Length", [1, 0, 0, 0]);
SystemBase.set("Mass", [0, 1, 0, 0]);
SystemBase.set("Time", [0, 0, 1, 0]);
SystemBase.set("Energy", [0, 0, 0, 1]);

function getDimensionFromCompositeUnit<
  QDividend extends Quantity[],
  QDivisor extends Quantity[],
>(unit: CompositeUnit<QDividend, QDivisor>): Dimension {
  let result: Dimension = [];
  let dividendDimension: Dimension = [];
  let divisorDimension: Dimension = [];

  unit.dividend.forEach((u) => {
    const dim = SystemBase.get(u.quantity);
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
    const dim = SystemBase.get(u.quantity);
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

/**
 * It can be verified that the conversion from one unit to another
 * is legitimate by showing that the dimension vectors of the two
 * units are equal (i.e.: their difference is a zero vector).
 * @param source - unit to be converted from;
 * @param destination - unit to convert into;
 * @returns true if the conversion is allowed, otherwise false.
 */
function analyze<S extends Quantity[], D extends Quantity[]>(
  source: Unit<S>,
  destination: Unit<D>,
): boolean {
  const isSourceSimple = isSimpleUnit<S>(source);
  const isDestinationSimple = isSimpleUnit<D>(destination);

  let sDim: Dimension;
  let dDim: Dimension;

  if (!isSourceSimple) {
    sDim = getDimensionFromCompositeUnit(source);
  } else {
    const dim = SystemBase.get(source.quantity);
    if (dim === undefined) {
      return false;
    }
    sDim = dim;
  }

  if (!isDestinationSimple) {
    dDim = getDimensionFromCompositeUnit(destination);
  } else {
    const dim = SystemBase.get(destination.quantity);
    if (dim === undefined) {
      return false;
    }
    dDim = dim;
  }

  let sum = Array(sDim.length ?? dDim.length).fill(0);
  for (let i = 0; i < sDim.length; i++) {
    sum[i] = sDim[i] - dDim[i];
  }
  return sum.every((e) => e === 0);
}

export function convert<S extends Quantity, D extends Quantity>(
  source: Unit<S[]>,
  destination: Unit<D[]>,
): number {
  if (!analyze(source, destination)) {
    return NaN;
  }
  return getFactor(source) / getFactor(destination);
}
