import type { Scene, BrandTemplateSnapshot } from "../../lib/manifest-types";

export type SceneProps = {
  scene: Scene;
  brand: BrandTemplateSnapshot;
  fonts: { headingFamily: string; bodyFamily: string };
};

export function colorForEmphasis(
  brand: BrandTemplateSnapshot,
  emphasis: Scene["emphasisColor"],
): string {
  switch (emphasis) {
    case "primary":
      return brand.primaryColor;
    case "secondary":
      return brand.secondaryColor;
    case "accent":
      return brand.accentColor;
  }
}
