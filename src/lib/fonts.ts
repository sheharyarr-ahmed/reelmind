export const FONT_WHITELIST = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Poppins",
  "Montserrat",
  "Raleway",
  "Playfair Display",
  "Merriweather",
  "Lora",
  "Source Serif Pro",
  "Bebas Neue",
  "Oswald",
] as const;

export type WhitelistedFont = (typeof FONT_WHITELIST)[number];

export function isWhitelistedFont(value: string): value is WhitelistedFont {
  return (FONT_WHITELIST as readonly string[]).includes(value);
}
