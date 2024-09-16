import { CompositeUnit } from "./composite";
import { SimpleUnit } from "./simple";
import type { ISimpleUnit, Quantity, SystemBase } from "./types";
import { DIMENSIONLESS, Dimensionless } from "./utils";

/**
 * Remember to call `.initialize()` after adding your quantities.
 */
export class QuantitySytem {
  readonly adimensional: ISimpleUnit<Dimensionless>;

  private _dimensions: Set<Quantity> = new Set();

  private _initialized: boolean = false;
  public get isInitialized(): boolean {
    return this._initialized;
  }

  private _defaultUnits: Map<Quantity, ISimpleUnit<Quantity>> = new Map();
  private _base: SystemBase = new Map();
  public get base(): SystemBase {
    if (!this._initialized) {
      throw "Quantity system was not initialized.";
    }
    return this._base;
  }

  constructor() {
    this.initializeBaseMap();
    this.addQuantity(this._base.get(DIMENSIONLESS)?.defaultUnit!);
    this.adimensional = this._defaultUnits.get(
      DIMENSIONLESS,
    ) as ISimpleUnit<Dimensionless>;
  }

  private initializeBaseMap() {
    this._base = new Map();

    const dim = [0];
    const adimensional = new SimpleUnit(
      "adimensional",
      "",
      [],
      DIMENSIONLESS,
      1.0,
      this._base,
      dim,
    );
    this._base.set(DIMENSIONLESS, {
      defaultUnit: adimensional,
      dimension: dim,
    });
  }

  private throwIfInitialized() {
    if (this._initialized) {
      throw "Can't perform this operation after system is initialized";
    }
  }

  public addQuantity(defaultUnit: ISimpleUnit<Quantity>) {
    this.throwIfInitialized();
    this._dimensions.add(defaultUnit.quantity);
    this._defaultUnits.set(defaultUnit.quantity, defaultUnit);
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
          const defaultUnit = this._defaultUnits.get(dimension);
          if (defaultUnit === undefined) {
            throw `default unit for ${dimension} not found`;
          }
          this._base.set(dimension, {
            defaultUnit: defaultUnit,
            dimension: vector,
          });
        }
      }
    }
  }

  public reset() {
    this._dimensions = new Set();
    this._defaultUnits = new Map();
    this.initializeBaseMap();
    this.addQuantity(this._base.get(DIMENSIONLESS)?.defaultUnit!);
    this._initialized = false;
  }

  public initialize() {
    this.throwIfInitialized();

    this.buildSystemMatrix();

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
    synonyms: string[],
    dividend: ISimpleUnit<QDividend>[],
    divisor: ISimpleUnit<QDivisor>[],
    symbol?: string,
  ): CompositeUnit {
    return new CompositeUnit(
      name,
      synonyms,
      dividend,
      divisor,
      this._base,
      symbol,
    );
  }
}
