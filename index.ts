type Length = "Length";
type Mass = "Mass";
type Time = "Time";
type Quantity = Length | Mass | Time;
type Dimension = number[];

export interface SimpleUnit<TQuantity extends Quantity> {
  readonly name: string;
  readonly quantity: TQuantity;
  readonly factor: number;
  readonly synonyms: string[];
}
type OneOf<T extends any[]> = T extends (infer U)[] ? U : never;

export interface CompositeUnit<
  TDividend extends Quantity[],
  TDivisor extends Quantity[],
> {
  dividend: SimpleUnit<OneOf<TDividend>>[];
  divisor: SimpleUnit<OneOf<TDivisor>>[];
}

export type Unit<Q extends Quantity[]> =
  | SimpleUnit<OneOf<Q>>
  | CompositeUnit<Q, Q>;

const SystemBase = new Map<Quantity, Dimension>();
SystemBase.set("Length", [1, 0, 0]);
SystemBase.set("Mass", [0, 1, 0]);
SystemBase.set("Time", [0, 0, 1]);

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

/* ------------------------ Composite Units ------------------------*/

// Velocity
export const KiloMeterPerHour: CompositeUnit<[Length], [Time]> = {
  dividend: [Kilometer],
  divisor: [Hour],
};

export const MeterPerSecond: CompositeUnit<[Length], [Time]> = {
  dividend: [Meter],
  divisor: [Second],
};

// Force
export const Newton: CompositeUnit<[Length, Mass], [Time]> = {
  dividend: [Kilogram, Meter],
  divisor: [Second],
};

function isSimpleUnit<T extends Quantity[]>(
  obj: Unit<T>,
): obj is SimpleUnit<OneOf<T>> {
  return "name" in obj;
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

function analyze<S extends Quantity[], D extends Quantity[]>(
  source: Unit<S>,
  destination: Unit<D>,
): boolean {
  return false;
}

export function convert<S extends Quantity, D extends Quantity>(
  source: Unit<S[]>,
  destination: Unit<D[]>,
): number {
  return getFactor(source) / getFactor(destination);
}
