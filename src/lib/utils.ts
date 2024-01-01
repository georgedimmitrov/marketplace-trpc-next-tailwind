import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { PRODUCT_CATEGORIES } from "../config";
import { Product } from "../payload-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: "USD" | "EUR" | "GBP" | "BDT";
    notation?: Intl.NumberFormatOptions["notation"];
  } = {}
) {
  const { currency = "USD", notation = "compact" } = options;

  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export function extractProductLabel(product: Product) {
  return PRODUCT_CATEGORIES.find(({ value }) => value === product.category)
    ?.label;
}

export function extractProductImageUrls(product: Product) {
  return product.images
    .map(({ image }) => {
      if (typeof image === "string") {
        return image;
      }
      return image.url;
    })
    .filter(Boolean) as string[];
}
