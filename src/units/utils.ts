import type {
  Dimension,
  ICompositeUnit,
  ISimpleUnit,
  IUnit,
  OneOf,
  Quantity,
  SystemBase,
} from "./types";
export type Dimensionless = "Dimensionless";
export const DIMENSIONLESS = "Dimensionless" as Dimensionless;

export function convert<S extends Quantity, D extends Quantity>(
  source: IUnit<S[]>,
  destination: IUnit<D[]>,
  base: SystemBase,
  skipValidation = false,
): number {
  if (!skipValidation && !analyze(source, destination, base)) {
    return NaN;
  }
  return getFactor(source) / getFactor(destination);
}

function getFactor<T extends Quantity[]>(unit: IUnit<T>): number {
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

/**
 * It can be verified that the conversion from one unit to another
 * is legitimate by showing that the dimension vectors of the two
 * units are equal (i.e.: their difference is a zero vector).
 * @param source - unit to be converted from;
 * @param destination - unit to convert into;
 * @param base - base of dimensional vectors that represents the system of units
 * @returns true if the conversion is allowed, otherwise false.
 */
export function analyze<S extends Quantity[], D extends Quantity[]>(
  source: IUnit<S>,
  destination: IUnit<D>,
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

export function extractUnits(
  unit: IUnit<Quantity[]>,
  base: SystemBase,
): [ISimpleUnit<Quantity>[], ISimpleUnit<Quantity>[]] {
  const dividend: ISimpleUnit<Quantity>[] = [];
  const divisor: ISimpleUnit<Quantity>[] = [];

  if (isSimpleUnit(unit)) {
    if (!isUnitDimensionless(unit, base)) {
      dividend.push(unit);
    }
  } else {
    unit.dividend
      .filter((u) => !isUnitDimensionless(u, base))
      .forEach((u) => dividend.push(u));
    unit.divisor
      .filter((u) => !isUnitDimensionless(u, base))
      .forEach((u) => divisor.push(u));
  }

  return [dividend, divisor];
}

function isUnitDimensionless(
  unit: IUnit<Quantity[]>,
  systemBase: SystemBase,
): boolean {
  if (isSimpleUnit(unit)) {
    return unit.quantity === "Dimensionless";
  }
  return getDimensionFromCompositeUnit(unit, systemBase).every((d) => d === 0);
}

function isSimpleUnit<T extends Quantity[]>(
  obj: IUnit<T>,
): obj is ISimpleUnit<OneOf<T>> {
  return "factor" in obj;
}

export function getDimensionFromCompositeUnit<
  QDividend extends Quantity[],
  QDivisor extends Quantity[],
>(
  unit: Pick<ICompositeUnit<QDividend, QDivisor>, "dividend" | "divisor">,
  base: SystemBase,
): Dimension {
  let result: Dimension = [];
  let dividendDimension: Dimension = Array(base.size).fill(0);
  let divisorDimension: Dimension = Array(base.size).fill(0);

  unit.dividend.forEach((u) => {
    const dim = base.get(u.quantity);
    dim?.forEach((d, index) => {
      if (d !== 0) {
        dividendDimension[index] += d;
      }
    });
  });

  unit.divisor.forEach((u) => {
    const dim = base.get(u.quantity);
    dim?.forEach((d, index) => {
      if (d !== 0) {
        divisorDimension[index] += d;
      }
    });
  });

  result = Array(base.size).fill(0);
  for (let i = 0; i < dividendDimension.length; i++) {
    result[i] += dividendDimension[i];
    result[i] -= divisorDimension[i];
  }

  return result;
}

function getDimensionFromUnit<Q extends Quantity[]>(
  unit: IUnit<Q>,
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
