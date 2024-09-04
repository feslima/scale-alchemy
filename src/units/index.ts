export class SimpleUnit<Q extends Quantity> implements ISimpleUnit<Q> {
  private _quantity: Q;
  public get quantity(): Q {
    return this._quantity;
  }

  private _factor: number;
  public get factor(): number {
    return this._factor;
  }

  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _synonyms: string[];
  public get synonyms(): string[] {
    return this._synonyms;
  }

  constructor(name: string, synonyms: string[], quantity: Q, factor: number) {
    this._name = name;
    this._synonyms = synonyms;
    this._quantity = quantity;
    this._factor = factor;
  }

  public convertTo(to: Unit<Quantity[]>, base: SystemBase): number {
    return convert(this, to, base);
  }

  public convertFrom(from: Unit<Quantity[]>, base: SystemBase): number {
    return convert(from, this, base);
  }
}

export class CompositeUnit implements ICompositeUnit<Quantity[], Quantity[]> {
  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _synonyms: string[];
  public get synonyms(): string[] {
    return this._synonyms;
  }

  private _dividend: ISimpleUnit<Quantity>[];
  public get dividend(): ISimpleUnit<Quantity>[] {
    return this._dividend;
  }

  private _divisor: ISimpleUnit<Quantity>[];
  public get divisor(): ISimpleUnit<Quantity>[] {
    return this._divisor;
  }

  constructor(
    name: string,
    synonyms: string[],
    dividend: ISimpleUnit<Quantity>[],
    divisor: ISimpleUnit<Quantity>[],
  ) {
    this._name = name;
    this._synonyms = synonyms;
    this._dividend = dividend;
    this._divisor = divisor;
  }
  public convertTo(to: Unit<Quantity[]>, base: SystemBase): number {
    return convert(this, to, base);
  }

  public convertFrom(from: Unit<Quantity[]>, base: SystemBase): number {
    return convert(from, this, base);
  }
}

function isSimpleUnit<T extends Quantity[]>(
  obj: Unit<T>,
): obj is ISimpleUnit<OneOf<T>> {
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

type Dimensionless = "Dimensionless";
/**
 * Remember to call `.initialize()` after adding your quantities.
 */
export class QuantitySytem {
  readonly adimensional: ISimpleUnit<Dimensionless> = new SimpleUnit(
    "adimensional",
    [],
    "Dimensionless",
    1.0,
  );

  private _initialized: boolean = false;
  private _dimensions: Set<Quantity> = new Set();

  private _defaultUnits: Map<Quantity, ISimpleUnit<Quantity>> = new Map();
  private _base: SystemBase = new Map();
  public get base(): SystemBase {
    if (!this._initialized) {
      throw "Quantity system was not initialized.";
    }
    return this._base;
  }

  constructor() {
    this._dimensions.add("Dimensionless");
    this._defaultUnits.set("Dimensionless", this.adimensional);
  }

  private throwIfInitialized() {
    if (this._initialized) {
      throw "Can't perform this operation after system is initialized";
    }
  }

  public add(quantity: Quantity, defaultUnit: ISimpleUnit<Quantity>) {
    this.throwIfInitialized();
    this._dimensions.add(quantity);
    this._defaultUnits.set(quantity, defaultUnit);
  }

  public initialize() {
    this.throwIfInitialized();

    const nDimensions = this._dimensions.size;
    this._dimensions.delete("Dimensionless");
    const dimensions: Quantity[] = ["Dimensionless" as Quantity].concat(
      Array.from(this._dimensions),
    );
    for (let i = 0; i < nDimensions; i++) {
      for (let j = 0; j < nDimensions; j++) {
        if (i === j) {
          const vector = Array(nDimensions).fill(0);
          const dimension = dimensions[i];
          if (dimension !== "Dimensionless") {
            vector[i] = 1;
          }
          this._base.set(dimension, vector);
        }
      }
    }

    this._initialized = true;
  }
}

function extractUnits(
  unit: Unit<Quantity[]>,
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

export function multiplyUnits(
  first: Unit<Quantity[]>,
  second: Unit<Quantity[]>,
  base: SystemBase,
): ICompositeUnit<Quantity[], Quantity[]> {
  const [dividendFirst, divisorFirst] = extractUnits(first, base);
  const [dividendSecond, divisorSecond] = extractUnits(second, base);

  const dividend: ISimpleUnit<Quantity>[] = [];
  const divisor: ISimpleUnit<Quantity>[] = [];

  dividendFirst.forEach((unit) => dividend.push(unit));
  dividendSecond.forEach((unit) => dividend.push(unit));

  divisorFirst.forEach((unit) => divisor.push(unit));
  divisorSecond.forEach((unit) => divisor.push(unit));

  return new CompositeUnit("generated", ["to be done"], dividend, divisor);
}

export function divideUnits(
  first: Unit<Quantity[]>,
  second: Unit<Quantity[]>,
  base: SystemBase,
): ICompositeUnit<Quantity[], Quantity[]> {
  const [dividendFirst, divisorFirst] = extractUnits(first, base);
  const [dividendSecond, divisorSecond] = extractUnits(second, base);

  const dividend: ISimpleUnit<Quantity>[] = [];
  const divisor: ISimpleUnit<Quantity>[] = [];

  dividendFirst.forEach((unit) => dividend.push(unit));
  divisorSecond.forEach((unit) => dividend.push(unit));

  divisorFirst.forEach((unit) => divisor.push(unit));
  dividendSecond.forEach((unit) => divisor.push(unit));

  return new CompositeUnit("generated", ["to be done"], dividend, divisor);
}

export function isUnitDimensionless(
  unit: Unit<Quantity[]>,
  systemBase: SystemBase,
): boolean {
  if (isSimpleUnit(unit)) {
    return unit.quantity === "Dimensionless";
  }
  return getDimensionFromCompositeUnit(unit, systemBase).every((d) => d === 0);
}

export function getDimensionFromCompositeUnit<
  QDividend extends Quantity[],
  QDivisor extends Quantity[],
>(unit: ICompositeUnit<QDividend, QDivisor>, base: SystemBase): Dimension {
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
 * @param base - base of dimensional vectors that represents the system of units
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

export function convert<S extends Quantity, D extends Quantity>(
  source: Unit<S[]>,
  destination: Unit<D[]>,
  base: SystemBase,
  skipValidation = false,
): number {
  if (!skipValidation && !analyze(source, destination, base)) {
    return NaN;
  }
  return getFactor(source) / getFactor(destination);
}
