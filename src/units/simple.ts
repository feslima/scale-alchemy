import { CompositeUnit } from "..";
import { Unit } from "./common";
import type {
  Dimension,
  ICompositeUnit,
  ISimpleUnit,
  IUnit,
  Quantity,
  SystemBase,
} from "./types";
import { convert, extractUnits } from "./utils";

export class SimpleUnit<Q extends Quantity>
  extends Unit
  implements ISimpleUnit<Q>
{
  private _quantity: Q;
  public get quantity(): Q {
    return this._quantity;
  }

  private _factor: number;
  public get factor(): number {
    return this._factor;
  }

  constructor(
    name: string,
    symbol: string,
    synonyms: string[],
    quantity: Q,
    factor: number,
    base: SystemBase,
    dimension?: Dimension,
  ) {
    super(
      name,
      symbol,
      synonyms,
      base,
      dimension ?? base.get(quantity)?.dimension,
    );
    this._quantity = quantity;
    this._factor = factor;
  }

  public convertTo(to: IUnit<Quantity[]>): number {
    return convert(this, to, this._base);
  }

  public convertFrom(from: IUnit<Quantity[]>): number {
    return convert(from, this, this._base);
  }

  multiply(unit: IUnit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]> {
    const dividend: ISimpleUnit<Quantity>[] = [];
    const divisor: ISimpleUnit<Quantity>[] = [];

    if (this.quantity !== "Dimensionless") {
      dividend.push(this);
    }

    const [dividendSecond, divisorSecond] = extractUnits(unit, this._base);
    dividendSecond.forEach((unit) => dividend.push(unit));
    divisorSecond.forEach((unit) => divisor.push(unit));

    return new CompositeUnit("generated", [], dividend, divisor, this._base);
  }

  divide(unit: IUnit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]> {
    const dividend: ISimpleUnit<Quantity>[] = [];
    const divisor: ISimpleUnit<Quantity>[] = [];

    if (this.quantity !== "Dimensionless") {
      dividend.push(this);
    }

    const [dividendSecond, divisorSecond] = extractUnits(unit, this._base);
    dividendSecond.forEach((unit) => divisor.push(unit));
    divisorSecond.forEach((unit) => dividend.push(unit));

    return new CompositeUnit("generated", [], dividend, divisor, this._base);
  }
}
