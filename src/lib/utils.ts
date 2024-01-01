import { twMerge } from "tailwind-merge";
import { type ClassValue, clsx } from "clsx";
import { PRODUCT_CATEGORIES } from "../config";
import { Product } from "../payload-types";
import { Metadata } from "next";

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

export function constructMetadata({
  title = "DigitalHippo - the marketplace for digital assets",
  description = "DigitalHippo is an open-source marketplace for high-quality digital goods.",
  image = "/thumbnail.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@joshtriedcoding",
    },
    icons,
    metadataBase: new URL("https://somedeployment.url"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
