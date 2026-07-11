export const UPPER_PERMANENT = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
export const LOWER_PERMANENT = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
export const UPPER_DECIDUOUS = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65] as const;
export const LOWER_DECIDUOUS = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75] as const;

export const ALL_ODONTOGRAM_TEETH = [
  ...UPPER_PERMANENT,
  ...LOWER_PERMANENT,
  ...UPPER_DECIDUOUS,
  ...LOWER_DECIDUOUS,
] as const;

export type OdontogramDentition = "permanente" | "decidua";

export function toothImagePath(number: number) {
  return `/odontogram/${number}.png`;
}

export function toothSizeClass(number: number, compact = false) {
  const n = number % 10;
  const isDeciduous = number >= 51 && number <= 85;
  if (compact) {
    if (isDeciduous) {
      if (n >= 4) return "max-h-[34px] max-w-[14px]";
      if (n === 3) return "max-h-[36px] max-w-[12px]";
      return "max-h-[32px] max-w-[10px]";
    }
    if (n >= 6) return "max-h-[38px] max-w-[18px]";
    if (n >= 4) return "max-h-[36px] max-w-[15px]";
    if (n === 3) return "max-h-[40px] max-w-[13px]";
    return "max-h-[34px] max-w-[11px]";
  }
  if (isDeciduous) {
    if (n >= 4) return "max-h-[46px] max-w-[18px] sm:max-h-[52px] sm:max-w-[22px]";
    if (n === 3) return "max-h-[48px] max-w-[16px] sm:max-h-[54px] sm:max-w-[18px]";
    return "max-h-[42px] max-w-[14px] sm:max-h-[48px] sm:max-w-[16px]";
  }
  if (n >= 6) return "max-h-[52px] max-w-[24px] sm:max-h-[60px] sm:max-w-[28px]";
  if (n >= 4) return "max-h-[48px] max-w-[20px] sm:max-h-[56px] sm:max-w-[24px]";
  if (n === 3) return "max-h-[54px] max-w-[18px] sm:max-h-[62px] sm:max-w-[22px]";
  return "max-h-[44px] max-w-[14px] sm:max-h-[52px] sm:max-w-[18px]";
}
