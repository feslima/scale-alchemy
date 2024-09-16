export type Quantity = string;
export type Dimensionless = "Dimensionless";
export type Dimension = number[];
export interface UnitBase {
  defaultUnit: ISimpleUnit<Quantity>;
  dimension: Dimension;
}
export type SystemBase = Map<Quantity, UnitBase>;

export interface IBasicUnitInfo {
  readonly symbol: string;
  readonly name: string;
  readonly synonyms: string[];
  readonly dimension?: Dimension;
  readonly isDimensionless: boolean;

  convertTo(to: IUnit<Quantity[]>): number;
  convertFrom(from: IUnit<Quantity[]>): number;
  multiply(unit: IUnit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]>;
  divide(unit: IUnit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]>;
}

export interface ISimpleUnit<TQuantity extends Quantity>
  extends IBasicUnitInfo {
  readonly quantity: TQuantity;
  readonly factor: number;
}

export interface ICompositeUnit<
  TDividend extends Quantity[],
  TDivisor extends Quantity[],
> extends IBasicUnitInfo {
  dividend: ISimpleUnit<OneOf<TDividend>>[];
  divisor: ISimpleUnit<OneOf<TDivisor>>[];
}

export type IUnit<Q extends Quantity[]> =
  | ISimpleUnit<OneOf<Q>>
  | ICompositeUnit<Q, Q>;

type OneOf<T extends any[]> = T extends (infer U)[] ? U : never;
