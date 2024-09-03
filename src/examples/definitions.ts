export const Meter = {
  name: "meter",
  quantity: "Length",
  factor: 1.0,
  synonyms: ["m", "meters"],
};

export const Kilometer = {
  name: "kilometer",
  quantity: "Length",
  factor: 1e3,
  synonyms: ["km", "kilometers"],
};

export const Kilogram = {
  name: "kilogram",
  quantity: "Mass",
  factor: 1.0e3,
  synonyms: ["kg", "kilograms"],
};

export const Ton = {
  name: "ton",
  quantity: "Mass",
  factor: 1.0e6,
  synonyms: ["ton", "mg", "tonnes", "megagrams"],
};

export const Gigagram = {
  name: "gigagram",
  quantity: "Mass",
  factor: 1.0e9,
  synonyms: ["Gg", "gigagrams"],
};

export const MegaWattHour = {
  name: "megawatt-hour",
  quantity: "Energy",
  factor: 3.6e9,
  synonyms: ["MHh", "megawatt-hours"],
};

export const Terajoule = {
  name: "terajoule",
  quantity: "Energy",
  factor: 1.0e12,
  synonyms: ["TJ", "terajoules"],
};

export const Stere = {
  name: "stere",
  synonyms: ["st", "steres"],
  quantity: "Volume",
  factor: 1.0,
};

export const Gigameter = {
  name: "gigameter",
  quantity: "Length",
  factor: 1e9,
  synonyms: ["gm", "gigameters"],
};

export const CubicMeter = {
  name: "cubic meter",
  synonyms: ["m^3", "cubic meters"],
  quantity: "Volume",
  factor: 1,
};

export const Liter = {
  name: "liter",
  synonyms: ["L", "liters"],
  quantity: "Volume",
  factor: 1e-3,
};

export const Kilocalorie = {
  name: "kilocalorie",
  synonyms: ["kcal", "kilocalories"],
  quantity: "Energy",
  factor: 4186.8,
};

/* ------------------------- Composite units -------------------------*/
export const KilometerPerLiter = {
  name: "kilometer per liter",
  synonyms: ["km/L", "kilometers per liter"],
  dividend: [Kilometer],
  divisor: [Liter],
};

export const KilogramPerCubicMeter = {
  name: "kilogram per cubic meter",
  synonyms: ["kg/m^3", "kg*m^-3"],
  dividend: [Kilogram],
  divisor: [CubicMeter],
};

export const KilogramPerStere = {
  name: "kilogram per stere",
  synonyms: ["kg/st", "kg*st^-1"],
  dividend: [Kilogram],
  divisor: [Stere],
};

export const TonPerCubicMeter = {
  name: "ton per cubic meter",
  synonyms: ["ton/m^3", "ton*m^-3"],
  dividend: [Ton],
  divisor: [CubicMeter],
};

export const TonPerStere = {
  name: "ton per stere",
  synonyms: ["ton/st", "ton*st^-1"],
  dividend: [Ton],
  divisor: [Stere],
};

export const TonPerGigameter = {
  name: "ton per gigameter",
  synonyms: ["ton/Gm", "ton*Gm^-1"],
  dividend: [Ton],
  divisor: [Gigameter],
};

export const KilogramPerTerajoule = {
  name: "kilogram per terajoule",
  synonyms: ["kg/TJ", "kg*TJ^-1"],
  dividend: [Kilogram],
  divisor: [Terajoule],
};

export const TerajoulePerGigaGram = {
  name: "terajoule per gigagram",
  synonyms: ["TJ * Gg^-1"],
  dividend: [Terajoule],
  divisor: [Gigagram],
};

export const MegawatthourPerStere = {
  name: "MWh per st",
  synonyms: ["MHh * st^-1"],
  dividend: [MegaWattHour],
  divisor: [Stere],
};

export const KilocaloriePerKilogram = {
  name: "kcal per kg",
  synonyms: ["kcal/kg"],
  dividend: [Kilocalorie],
  divisor: [Kilogram],
};
