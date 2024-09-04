type Quantity = string;
type Dimension = number[];
type SystemBase = Map<Quantity, Dimension>;

interface IBasicUnitInfo {
  readonly id: string;
  readonly name: string;
  readonly synonyms: string[];

  convertTo(to: Unit<Quantity[]>, base: SystemBase): number;
  convertFrom(from: Unit<Quantity[]>, base: SystemBase): number;
  isDimensionless(base: SystemBase): boolean;
  multiply(
    unit: Unit<Quantity[]>,
    base: SystemBase,
  ): ICompositeUnit<Quantity[], Quantity[]>;
  divide(
    unit: Unit<Quantity[]>,
    base: SystemBase,
  ): ICompositeUnit<Quantity[], Quantity[]>;
}

interface ISimpleUnit<TQuantity extends Quantity> extends IBasicUnitInfo {
  readonly quantity: TQuantity;
  readonly factor: number;
}
type OneOf<T extends any[]> = T extends (infer U)[] ? U : never;

interface ICompositeUnit<
  TDividend extends Quantity[],
  TDivisor extends Quantity[],
> extends IBasicUnitInfo {
  dividend: ISimpleUnit<OneOf<TDividend>>[];
  divisor: ISimpleUnit<OneOf<TDivisor>>[];
}

type Unit<Q extends Quantity[]> = ISimpleUnit<OneOf<Q>> | ICompositeUnit<Q, Q>;
