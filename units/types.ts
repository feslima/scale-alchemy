type Dimensionless = "Dimensionless";
type Length = "Length";
type Mass = "Mass";
type Time = "Time";
type Energy = "Energy";
type Volume = "Volume";
type Density = "Density";
type Quantity =
  | Dimensionless
  | Length
  | Mass
  | Time
  | Energy
  | Volume
  | Density;
type Dimension = number[];

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

type SystemBase = Map<Quantity, Dimension>;
