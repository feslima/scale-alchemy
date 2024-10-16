## Scale alchemy
General purpose typescript library for evaluation (and dimensional analysis) of
mathemathical expressions.

### What is the problem this library solves?
Suppose you have an equation `((1 - FracBio) * EFCO2Diesel)/FuelEfficiency` that
you wish to know its value and unit of measure for any known values of its
variables. You can do this in the following manner:
```typescript
import {
    evaluate,
    EvaluationWithUnitEnvironmentType,
    NumberValue,
    NumberWithUnitValue,
    QuantitySystem
} from "scale-alchemy";

// Define and initialize your quantity system with your default units of measurement
const UnitSystem = new QuantitySytem();

const Meter = UnitSystem.newSimpleUnit(
  "meter",
  "m",
  ["meters"],
  "Length",
  1.0,
);

const Gram = UnitSystem.newSimpleUnit(
  "gram",
  "g",
  ["grams"],
  "Mass",
  1.0,
);

const CubicMeter = UnitSystem.newSimpleUnit(
  "cubic meter",
  "m^3",
  ["cubic meters"],
  "Volume",
  1,
);

UnitSystem.addQuantity(Meter); // default unit for Length quantities
UnitSystem.addQuantity(Gram); // default unit for Mass quantities
UnitSystem.addQuantity(CubicMeter); // default unit for Volume quantities

UnitSystem.initialize(); // You must always call this only once

// Add more units with conversion factors in relation to the default units
// for the quantities you registered.
const Kilometer = UnitSystem.newSimpleUnit(
  "kilometer",
  "km",
  ["kilometers"],
  "Length",
  1e3,
);

const Ton = UnitSystem.newSimpleUnit(
  "ton",
  "t",
  ["Mg", "tonnes", "megagrams"],
  "Mass",
  1.0e6,
);

const Liter = UnitSystem.newSimpleUnit(
  "liter",
  "L",
  ["liters"],
  "Volume",
  1e-3,
);

// define composite units
const KilometerPerLiter = UnitSystem.newCompositeUnit(
  "kilometer per liter",
  ["kilometers per liter"],
  [Kilometer],
  [Liter],
);
const TonPerCubicMeter = UnitSystem.newCompositeUnit(
  "ton per cubic meter",
  ["ton*m^-3"],
  [Ton],
  [CubicMeter],
);

const KilogramPerLiter = UnitSystem.newCompositeUnit(
  "kilogram per liter",
  ["kilograms per liter"],
  [Kilogram],
  [Liter],
);

const Adimensional = UnitSystem.adimensional; // default in every instance of unit system
const nv = (n: number) => new NumberValue(n);

// define your mathemathical expression
const input = "((1 - FracBio) * EFCO2Diesel) / FuelEfficiency"

// define your inputs
const environment = new Map([
    [
    "FuelEfficiency",
    new NumberWithUnitValue(nv(2.578168115), KilometerPerLiter),
    ],
    ["EFCO2Diesel", new NumberWithUnitValue(nv(2.603), TonPerCubicMeter)],
    ["FracBio", new NumberWithUnitValue(nv(0.12), Adimensional)],
])

// evaluate the result
const result = evaluate(input, UnitSystem, environment, nv);

// convert the result for the unit you want. If the conversion is not possible, the following result will print NaN
console.log(result.value.convertTo(KilogramPerLiter).number.value)
```

### Whats the rationale behind the evaluation process?
There are 2 main pieces involved when calculating these physical/mathemathical expressions:
1. A simplified tree-walking interpreter with Pratt-parsing is responsible for
    crunching the numbers in the expression.
2. Mixed with the interpreter evaluation it is implemented a general approach for dimensional
    analysis and conversions of units of measurement that is described [here](https://www.cs.utexas.edu/~ai-lab/?novak:ieeetse95).

### Which mathemathical operators are supported?
For now, these are the operators implemented:
- addition `+`;
- subtraction `-`;
- multiplication `*`;
- division `/`;
- exponentiation `^`;
