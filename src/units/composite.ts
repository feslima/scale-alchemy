import { AbstractUnit } from "./common";
import { convert, extractUnits, getDimensionFromCompositeUnit } from "./utils";

export class CompositeUnit
  extends AbstractUnit
  implements ICompositeUnit<Quantity[], Quantity[]>
{
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
    symbol: string,
    synonyms: string[],
    dividend: ISimpleUnit<Quantity>[],
    divisor: ISimpleUnit<Quantity>[],
    base: SystemBase,
  ) {
    super(
      name,
      symbol,
      synonyms,
      base,
      getDimensionFromCompositeUnit({ dividend, divisor }, base),
    );
    this._dividend = dividend;
    this._divisor = divisor;
  }

  public convertTo(to: Unit<Quantity[]>): number {
    return convert(this, to, this._base);
  }

  public convertFrom(from: Unit<Quantity[]>): number {
    return convert(from, this, this._base);
  }

  multiply(unit: Unit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]> {
    const [dividendFirst, divisorFirst] = extractUnits(this, this._base);
    const [dividendSecond, divisorSecond] = extractUnits(unit, this._base);

    const dividend: ISimpleUnit<Quantity>[] = [];
    const divisor: ISimpleUnit<Quantity>[] = [];

    dividendFirst.forEach((unit) => dividend.push(unit));
    dividendSecond.forEach((unit) => dividend.push(unit));

    divisorFirst.forEach((unit) => divisor.push(unit));
    divisorSecond.forEach((unit) => divisor.push(unit));

    return new CompositeUnit(
      "generated",
      "generated",
      ["to be done"],
      dividend,
      divisor,
      this._base,
    );
  }

  divide(unit: Unit<Quantity[]>): ICompositeUnit<Quantity[], Quantity[]> {
    const [dividendFirst, divisorFirst] = extractUnits(this, this._base);
    const [dividendSecond, divisorSecond] = extractUnits(unit, this._base);

    const dividend: ISimpleUnit<Quantity>[] = [];
    const divisor: ISimpleUnit<Quantity>[] = [];

    dividendFirst.forEach((unit) => dividend.push(unit));
    divisorSecond.forEach((unit) => dividend.push(unit));

    divisorFirst.forEach((unit) => divisor.push(unit));
    dividendSecond.forEach((unit) => divisor.push(unit));

    return new CompositeUnit(
      "generated",
      "generated",
      ["to be done"],
      dividend,
      divisor,
      this._base,
    );
  }
}
