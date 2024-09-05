import { CompositeUnit } from "./composite";
import { SimpleUnit } from "./simple";
import { DIMENSIONLESS, Dimensionless } from "./utils";

/**
 * Remember to call `.initialize()` after adding your quantities.
 */
export class QuantitySytem {
  readonly adimensional: ISimpleUnit<Dimensionless>;

  private _initialized: boolean = false;
  private _dimensions: Set<Quantity>;

  private _defaultUnits: Map<Quantity, ISimpleUnit<Quantity>> = new Map();
  private _base: SystemBase;
  public get base(): SystemBase {
    if (!this._initialized) {
      throw "Quantity system was not initialized.";
    }
    return this._base;
  }

  constructor() {
    this._dimensions = new Set([DIMENSIONLESS]);
    this._base = new Map([[DIMENSIONLESS, [0]]]);
    this.adimensional = new SimpleUnit(
      "adimensional",
      "",
      [],
      DIMENSIONLESS,
      1.0,
      this._base,
    );

    this._defaultUnits.set(DIMENSIONLESS, this.adimensional);
  }

  private throwIfInitialized() {
    if (this._initialized) {
      throw "Can't perform this operation after system is initialized";
    }
  }

  public add(quantity: Quantity, defaultUnit: ISimpleUnit<Quantity>) {
    this.throwIfInitialized();
    this._dimensions.add(quantity);
    this._defaultUnits.set(quantity, defaultUnit);
  }

  private buildSystemMatrix() {
    const nDimensions = this._dimensions.size;
    this._dimensions.delete(DIMENSIONLESS);
    const dimensions: Quantity[] = [DIMENSIONLESS as Quantity].concat(
      Array.from(this._dimensions),
    );
    for (let i = 0; i < nDimensions; i++) {
      for (let j = 0; j < nDimensions; j++) {
        if (i === j) {
          const vector = Array(nDimensions).fill(0);
          const dimension = dimensions[i];
          if (dimension !== DIMENSIONLESS) {
            vector[i] = 1;
          }
          this._base.set(dimension, vector);
        }
      }
    }
  }

  public initialize() {
    this.throwIfInitialized();

    this.buildSystemMatrix();

    this._base = Object.freeze(this._base); // this is global to the unit system
    this._initialized = true;
  }

  public newSimpleUnit<Q extends Quantity>(
    name: string,
    symbol: string,
    synonyms: string[],
    quantity: Q,
    factor: number,
  ): SimpleUnit<Q> {
    return new SimpleUnit(name, symbol, synonyms, quantity, factor, this._base);
  }

  public newCompositeUnit<
    QDividend extends Quantity,
    QDivisor extends Quantity,
  >(
    name: string,
    symbol: string,
    synonyms: string[],
    dividend: ISimpleUnit<QDividend>[],
    divisor: ISimpleUnit<QDivisor>[],
    id?: string,
  ): CompositeUnit {
    return new CompositeUnit(
      name,
      symbol,
      synonyms,
      dividend,
      divisor,
      this._base,
      id,
    );
  }
}
