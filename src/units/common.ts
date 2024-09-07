import type {
  Dimension,
  IBasicUnitInfo,
  ICompositeUnit,
  IUnit,
  Quantity,
  SystemBase,
} from "./types";

export abstract class Unit implements IBasicUnitInfo {
  protected readonly _base: SystemBase;

  readonly dimension?: Dimension;
  public get isDimensionless(): boolean {
    return this.dimension?.every((d) => d === 0) || false;
  }

  private _name: string;
  public get name(): string {
    return this._name;
  }

  private _symbol: string;
  public get symbol(): string {
    return this._symbol;
  }

  private _synonyms: string[];
  public get synonyms(): string[] {
    return this._synonyms;
  }

  constructor(
    name: string,
    symbol: string,
    synonyms: string[],
    base: SystemBase,
    dimension?: Dimension,
  ) {
    this._name = name;
    this._symbol = symbol;
    this._synonyms = synonyms;
    this._base = base;
    this.dimension = dimension;
  }

  public abstract convertTo(to: IUnit<Quantity[]>): number;
  public abstract convertFrom(from: IUnit<Quantity[]>): number;
  public abstract multiply(
    unit: IUnit<Quantity[]>,
  ): ICompositeUnit<Quantity[], Quantity[]>;
  public abstract divide(
    unit: IUnit<Quantity[]>,
  ): ICompositeUnit<Quantity[], Quantity[]>;
}
