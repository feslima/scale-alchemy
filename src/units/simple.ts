import { CompositeUnit } from "..";
import { AbstractUnit } from "./common";
import { convert, extractUnits } from "./utils";

export class SimpleUnit<Q extends Quantity>
  extends AbstractUnit
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
    synonyms: string[],
    quantity: Q,
    factor: number,
    base: SystemBase,
  ) {
    super(name, synonyms, base, name, base.get(quantity));
    this._quantity = quantity;
    this._factor = factor;
  }

  public convertTo(to: Unit<Quantity[]>): number {
    return convert(this, to, this._base);
  }

  public convertFrom(from: Unit<Quantity[]>): number {
    return convert(from, this, this._base);
  }

  multiply(unit: Unit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]> {
    const dividend: ISimpleUnit<Quantity>[] = [];
    const divisor: ISimpleUnit<Quantity>[] = [];

    if (this.quantity !== "Dimensionless") {
      dividend.push(this);
    }

    const [dividendSecond, divisorSecond] = extractUnits(unit, this._base);
    dividendSecond.forEach((unit) => dividend.push(unit));
    divisorSecond.forEach((unit) => divisor.push(unit));

    return new CompositeUnit(
      "generated",
      ["to be done"],
      dividend,
      divisor,
      this._base,
    );
  }

  divide(unit: Unit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]> {
    const dividend: ISimpleUnit<Quantity>[] = [];
    const divisor: ISimpleUnit<Quantity>[] = [];

    if (this.quantity !== "Dimensionless") {
      dividend.push(this);
    }

    const [dividendSecond, divisorSecond] = extractUnits(unit, this._base);
    dividendSecond.forEach((unit) => divisor.push(unit));
    divisorSecond.forEach((unit) => dividend.push(unit));

    return new CompositeUnit(
      "generated",
      ["to be done"],
      dividend,
      divisor,
      this._base,
    );
  }
}
