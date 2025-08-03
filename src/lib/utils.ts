import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const LBS_TO_KGS = 0.453592;
export const KGS_TO_LBS = 2.20462;

export const convertToKgs = (lbs: number) => lbs * LBS_TO_KGS;
export const convertToLbs = (kgs: number) => kgs * KGS_TO_LBS;
