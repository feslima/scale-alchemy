import { QuantitySytem } from "../src";

export const UnitSystem = new QuantitySytem();

export const Meter = UnitSystem.newSimpleUnit(
  "meter",
  ["m", "meters"],
  "Length",
  1.0,
);

export const Kilometer = UnitSystem.newSimpleUnit(
  "kilometer",
  ["km", "kilometers"],
  "Length",
  1e3,
);

export const Gram = UnitSystem.newSimpleUnit(
  "gram",
  ["g", "grams"],
  "Mass",
  1.0,
);

export const Kilogram = UnitSystem.newSimpleUnit(
  "kilogram",
  ["kg", "kilograms"],
  "Mass",
  1.0e3,
);

export const Ton = UnitSystem.newSimpleUnit(
  "ton",
  ["ton", "mg", "tonnes", "megagrams"],
  "Mass",
  1.0e6,
);

export const Gigagram = UnitSystem.newSimpleUnit(
  "gigagram",
  ["Gg", "gigagrams"],
  "Mass",
  1.0e9,
);

export const Joule = UnitSystem.newSimpleUnit(
  "joule",
  ["J", "joules"],
  "Energy",
  1.0,
);

export const MegaWattHour = UnitSystem.newSimpleUnit(
  "megawatt-hour",
  ["MHh", "megawatt-hours"],
  "Energy",
  3.6e9,
);

export const Terajoule = UnitSystem.newSimpleUnit(
  "terajoule",
  ["TJ", "terajoules"],
  "Energy",
  1.0e12,
);

export const Stere = UnitSystem.newSimpleUnit(
  "stere",
  ["st", "steres"],
  "Volume",
  1.0,
);

export const Gigameter = UnitSystem.newSimpleUnit(
  "gigameter",
  ["gm", "gigameters"],
  "Length",
  1e9,
);

export const CubicMeter = UnitSystem.newSimpleUnit(
  "cubic meter",
  ["m^3", "cubic meters"],
  "Volume",
  1,
);

export const Liter = UnitSystem.newSimpleUnit(
  "liter",
  ["L", "liters"],
  "Volume",
  1e-3,
);

export const Kilocalorie = UnitSystem.newSimpleUnit(
  "kilocalorie",
  ["kcal", "kilocalories"],
  "Energy",
  4186.8,
);

/* ------------------------- Composite units -------------------------*/
export const KilometerPerLiter = UnitSystem.newCompositeUnit(
  "kilometer per liter",
  ["km/L", "kilometers per liter"],
  [Kilometer],
  [Liter],
);

export const KilogramPerCubicMeter = UnitSystem.newCompositeUnit(
  "kilogram per cubic meter",
  ["kg/m^3", "kg*m^-3"],
  [Kilogram],
  [CubicMeter],
);

export const KilogramPerStere = UnitSystem.newCompositeUnit(
  "kilogram per stere",
  ["kg/st", "kg*st^-1"],
  [Kilogram],
  [Stere],
);

export const TonPerCubicMeter = UnitSystem.newCompositeUnit(
  "ton per cubic meter",
  ["ton/m^3", "ton*m^-3"],
  [Ton],
  [CubicMeter],
);

export const TonPerStere = UnitSystem.newCompositeUnit(
  "ton per stere",
  ["ton/st", "ton*st^-1"],
  [Ton],
  [Stere],
);

export const TonPerGigameter = UnitSystem.newCompositeUnit(
  "ton per gigameter",
  ["ton/Gm", "ton*Gm^-1"],
  [Ton],
  [Gigameter],
);

export const KilogramPerTerajoule = UnitSystem.newCompositeUnit(
  "kilogram per terajoule",
  ["kg/TJ", "kg*TJ^-1"],
  [Kilogram],
  [Terajoule],
);

export const TerajoulePerGigaGram = UnitSystem.newCompositeUnit(
  "terajoule per gigagram",
  ["TJ * Gg^-1"],
  [Terajoule],
  [Gigagram],
);

export const MegawatthourPerStere = UnitSystem.newCompositeUnit(
  "MWh per st",
  ["MHh * st^-1"],
  [MegaWattHour],
  [Stere],
);

export const KilocaloriePerKilogram = UnitSystem.newCompositeUnit(
  "kcal per kg",
  ["kcal/kg"],
  [Kilocalorie],
  [Kilogram],
);
