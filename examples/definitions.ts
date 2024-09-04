import { CompositeUnit, SimpleUnit } from "../src";

export const Meter = new SimpleUnit("meter", ["m", "meters"], "Length", 1.0);

export const Kilometer = new SimpleUnit(
  "kilometer",
  ["km", "kilometers"],
  "Length",
  1e3,
);

export const Gram = new SimpleUnit("gram", ["g", "grams"], "Mass", 1.0);

export const Kilogram = new SimpleUnit(
  "kilogram",
  ["kg", "kilograms"],
  "Mass",
  1.0e3,
);

export const Ton = new SimpleUnit(
  "ton",
  ["ton", "mg", "tonnes", "megagrams"],
  "Mass",
  1.0e6,
);

export const Gigagram = new SimpleUnit(
  "gigagram",
  ["Gg", "gigagrams"],
  "Mass",
  1.0e9,
);

export const Joule = new SimpleUnit("joule", ["J", "joules"], "Energy", 1.0);

export const MegaWattHour = new SimpleUnit(
  "megawatt-hour",
  ["MHh", "megawatt-hours"],
  "Energy",
  3.6e9,
);

export const Terajoule = new SimpleUnit(
  "terajoule",
  ["TJ", "terajoules"],
  "Energy",
  1.0e12,
);

export const Stere = new SimpleUnit("stere", ["st", "steres"], "Volume", 1.0);

export const Gigameter = new SimpleUnit(
  "gigameter",
  ["gm", "gigameters"],
  "Length",
  1e9,
);

export const CubicMeter = new SimpleUnit(
  "cubic meter",
  ["m^3", "cubic meters"],
  "Volume",
  1,
);

export const Liter = new SimpleUnit("liter", ["L", "liters"], "Volume", 1e-3);

export const Kilocalorie = new SimpleUnit(
  "kilocalorie",
  ["kcal", "kilocalories"],
  "Energy",
  4186.8,
);

/* ------------------------- Composite units -------------------------*/
export const KilometerPerLiter = new CompositeUnit(
  "kilometer per liter",
  ["km/L", "kilometers per liter"],
  [Kilometer],
  [Liter],
);

export const KilogramPerCubicMeter = new CompositeUnit(
  "kilogram per cubic meter",
  ["kg/m^3", "kg*m^-3"],
  [Kilogram],
  [CubicMeter],
);

export const KilogramPerStere = new CompositeUnit(
  "kilogram per stere",
  ["kg/st", "kg*st^-1"],
  [Kilogram],
  [Stere],
);

export const TonPerCubicMeter = new CompositeUnit(
  "ton per cubic meter",
  ["ton/m^3", "ton*m^-3"],
  [Ton],
  [CubicMeter],
);

export const TonPerStere = new CompositeUnit(
  "ton per stere",
  ["ton/st", "ton*st^-1"],
  [Ton],
  [Stere],
);

export const TonPerGigameter = new CompositeUnit(
  "ton per gigameter",
  ["ton/Gm", "ton*Gm^-1"],
  [Ton],
  [Gigameter],
);

export const KilogramPerTerajoule = new CompositeUnit(
  "kilogram per terajoule",
  ["kg/TJ", "kg*TJ^-1"],
  [Kilogram],
  [Terajoule],
);

export const TerajoulePerGigaGram = new CompositeUnit(
  "terajoule per gigagram",
  ["TJ * Gg^-1"],
  [Terajoule],
  [Gigagram],
);

export const MegawatthourPerStere = new CompositeUnit(
  "MWh per st",
  ["MHh * st^-1"],
  [MegaWattHour],
  [Stere],
);

export const KilocaloriePerKilogram = new CompositeUnit(
  "kcal per kg",
  ["kcal/kg"],
  [Kilocalorie],
  [Kilogram],
);
