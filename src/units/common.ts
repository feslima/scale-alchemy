export abstract class AbstractUnit implements IBasicUnitInfo {
  protected readonly _base: SystemBase;

  readonly dimension: Maybe<Dimension>;
  public get isDimensionless(): boolean {
    return this.dimension?.every((d) => d === 0) || false;
  }

  private _id: string;
  public get id(): string {
    return this._id;
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
    id: string,
    dimension: Maybe<Dimension>,
  ) {
    this._id = id;
    this._name = name;
    this._symbol = symbol;
    this._synonyms = synonyms;
    this._base = base;
    this.dimension = dimension;
  }

  public abstract convertTo(to: Unit<Quantity[]>): number;
  public abstract convertFrom(from: Unit<Quantity[]>): number;
  public abstract multiply(
    unit: Unit<Quantity[]>,
  ): ICompositeUnit<Quantity[], Quantity[]>;
  public abstract divide(
    unit: Unit<Quantity[]>,
  ): ICompositeUnit<Quantity[], Quantity[]>;
}
