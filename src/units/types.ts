type Quantity = string;
type Dimension = number[];
type SystemBase = Map<Quantity, Dimension>;

interface BasicUnitInfo {
  readonly name: string;
  readonly synonyms: string[];
}

interface SimpleUnit<TQuantity extends Quantity> extends BasicUnitInfo {
  readonly quantity: TQuantity;
  readonly factor: number;
}
type OneOf<T extends any[]> = T extends (infer U)[] ? U : never;

interface CompositeUnit<
  TDividend extends Quantity[],
  TDivisor extends Quantity[],
> extends BasicUnitInfo {
  dividend: SimpleUnit<OneOf<TDividend>>[];
  divisor: SimpleUnit<OneOf<TDivisor>>[];
}

type Unit<Q extends Quantity[]> = SimpleUnit<OneOf<Q>> | CompositeUnit<Q, Q>;
