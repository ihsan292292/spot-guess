import type { Plugin } from "vite";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import subsetFont from "subset-font";
import { Property } from "csstype";

type SupportedTargetFonts = "woff" | "woff2" | "truetype";
const DEFAULT_TARGET_FONT: SupportedTargetFonts = "woff2";

type Injection =
  | { type: "placeholder"; placeholder: string }
  | { type: "inject"; styleId?: string };

interface FontSubsetPluginOptions {
  fontPath: string;
  fontFaceOptions: {
    fontFamily: Property.FontFamily;
    fontWeight?: Property.FontWeight;
    fontStyle?: Property.FontStyle;
    fontDisplay?: "auto" | "block" | "swap" | "fallback" | "optional";
  };
  subsetChars: string;
  injection: Injection;
  targetFormat?: SupportedTargetFonts;
}

export function fontSubsetPlugin(options: FontSubsetPluginOptions): Plugin {
  const {
    fontPath,
    subsetChars,
    fontFaceOptions,
    injection,
    targetFormat = DEFAULT_TARGET_FONT,
  } = options;

  let cachedHash = "";
  let cachedCss = "";

  async function generateFontCss(): Promise<string> {
    const fontBuffer = await fs.readFile(fontPath);

    const hash = crypto
      .createHash("sha256")
      .update(fontBuffer)
      .update(subsetChars)
      .digest("hex");

    if (hash === cachedHash) return cachedCss;

    cachedHash = hash;

    const subsetBuffer = await subsetFont(fontBuffer, subsetChars, {
      targetFormat,
    });

    const base64 = subsetBuffer.toString("base64");

    const css = `
        @font-face {
            font-family: '${fontFaceOptions.fontFamily}';
            src: url(data:font/${targetFormat};charset=utf-8;base64,${base64}) format('${targetFormat}');
            font-weight: ${fontFaceOptions.fontWeight ?? 400};
            font-style: ${fontFaceOptions.fontStyle ?? "normal"};
            font-display: ${fontFaceOptions.fontDisplay ?? "auto"};
        }
    `;

    cachedCss = css;
    return css;
  }

  return {
    name: "vite-plugin-subset-font",
    enforce: "pre",

    async transformIndexHtml(html) {
      const fontCss = await generateFontCss();
      if (injection.type === "placeholder") {
        if (!html.includes(injection.placeholder)) {
          console.warn(
            `[vite-plugin-subset-font] Placeholder "${injection.placeholder}" not found in index.html`
          );
          throw Error(
            `If injection type is set to ${injection.type} the placeholder "${injection.placeholder}" has to be inside the index.html file.`
          );
        }
        return html.replace(injection.placeholder, fontCss);
      } else if (injection.type === "inject") {
        return {
          html,
          tags: [
            {
              tag: "style",
              attrs: injection.styleId ? { id: injection.styleId } : {},
              children: fontCss,
              injectTo: "head",
            },
          ],
        };
      }
      return html;
    },

    async handleHotUpdate(ctx) {
      if (ctx.file === path.resolve(fontPath)) {
        cachedHash = "";
        cachedCss = "";
      }
    },
  };
}
