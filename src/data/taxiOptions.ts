export type TaxiVehicleClass = "comfort" | "business" | "limuzin";
export type TaxiSeatCount = 4 | 7 | 9 | 13 | 20 | 30 | 40;

export const taxiSeatOptions: TaxiSeatCount[] = [4, 7, 9, 13, 20, 30, 40];

export const taxiClassOptions: { value: TaxiVehicleClass; label: string; description: string }[] = [
  {
    value: "comfort",
    label: "Comfort",
    description: "Qulay salon va kundalik safarlar uchun mos."
  },
  {
    value: "business",
    label: "Business",
    description: "Premium xizmat, uchrashuv va delegatsiyalar uchun."
  },
  {
    value: "limuzin",
    label: "Limuzin",
    description: "Tantanali tadbirlar va katta guruhlar uchun."
  }
];
