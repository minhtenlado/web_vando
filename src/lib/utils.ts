import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalized(val: any, locale: string = "vi"): string {
  if (val === null || val === undefined) return ""
  if (typeof val === "string") return val
  if (typeof val === "object") {
    const loc = locale === "en" ? "en" : "vi"
    const fallbackLoc = loc === "en" ? "vi" : "en"
    if (val[loc] && typeof val[loc] === "string" && val[loc].trim() !== "") return val[loc]
    if (val[fallbackLoc] && typeof val[fallbackLoc] === "string" && val[fallbackLoc].trim() !== "") return val[fallbackLoc]
    const firstKey = Object.keys(val)[0]
    if (firstKey && typeof val[firstKey] === "string") return val[firstKey]
  }
  return String(val)
}

