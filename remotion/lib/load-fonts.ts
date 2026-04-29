import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadOpenSans } from "@remotion/google-fonts/OpenSans";
import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";
import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadMerriweather } from "@remotion/google-fonts/Merriweather";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import type { WhitelistedFont } from "@/src/lib/fonts";

const LOADERS: Record<WhitelistedFont, () => { fontFamily: string }> = {
  Inter: loadInter,
  Roboto: loadRoboto,
  "Open Sans": loadOpenSans,
  Poppins: loadPoppins,
  Montserrat: loadMontserrat,
  Raleway: loadRaleway,
  "Playfair Display": loadPlayfair,
  Merriweather: loadMerriweather,
  Lora: loadLora,
  "Source Serif 4": loadSourceSerif,
  "Bebas Neue": loadBebas,
  Oswald: loadOswald,
};

export type LoadedFonts = {
  headingFamily: string;
  bodyFamily: string;
};

export function loadBrandFonts(
  headingFont: string,
  bodyFont: string,
): LoadedFonts {
  const headingLoader = LOADERS[headingFont as WhitelistedFont] ?? loadInter;
  const bodyLoader = LOADERS[bodyFont as WhitelistedFont] ?? loadInter;

  const heading = headingLoader();
  const body = bodyLoader();

  return {
    headingFamily: heading.fontFamily,
    bodyFamily: body.fontFamily,
  };
}
