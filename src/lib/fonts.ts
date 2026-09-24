import { Cormorant_Garamond, Manrope, Noto_Sans_Kannada, Noto_Serif_Kannada } from "next/font/google";

export const displayLatin = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display-latin",
  display: "swap",
});

export const sansLatin = Manrope({
  subsets: ["latin"],
  variable: "--font-sans-latin",
  display: "swap",
});

export const displayKannada = Noto_Serif_Kannada({
  subsets: ["kannada"],
  weight: ["500", "600", "700"],
  variable: "--font-display-kannada",
  display: "swap",
});

export const sansKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-kannada",
  display: "swap",
});

export const fontClassNames = [displayLatin.variable, sansLatin.variable, displayKannada.variable, sansKannada.variable].join(" ");
