type Quantity = string;
type Dimensionless = "Dimensionless";
type Dimension = number[];
type SystemBase = Map<Quantity, Dimension>;

interface IBasicUnitInfo {
  readonly id: string;
  readonly name: string;
  readonly synonyms: string[];
  readonly dimension: Dimension | undefined;
  readonly isDimensionless: boolean;

  convertTo(to: Unit<Quantity[]>): number;
  convertFrom(from: Unit<Quantity[]>): number;
  multiply(unit: Unit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]>;
  divide(unit: Unit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]>;
}

interface ISimpleUnit<TQuantity extends Quantity> extends IBasicUnitInfo {
  readonly quantity: TQuantity;
  readonly factor: number;
}

interface ICompositeUnit<
  TDividend extends Quantity[],
  TDivisor extends Quantity[],
> extends IBasicUnitInfo {
  dividend: ISimpleUnit<OneOf<TDividend>>[];
  divisor: ISimpleUnit<OneOf<TDivisor>>[];
}

type Unit<Q extends Quantity[]> = ISimpleUnit<OneOf<Q>> | ICompositeUnit<Q, Q>;

type OneOf<T extends any[]> = T extends (infer U)[] ? U : never;
type Maybe<T> = T | undefined;
