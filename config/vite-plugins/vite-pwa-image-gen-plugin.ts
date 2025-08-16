// The following code was inspired by vites assets-generator (https://github.com/vite-pwa/assets-generator)
// License: MIT (https://github.com/vite-pwa/assets-generator/blob/main/LICENSE)

import { Plugin } from "vite";
import sharp, { ResizeOptions, type PngOptions, type WebpOptions } from "sharp";
import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ImageKinds = ["transparent", "maskable", "apple"] as const;
type ImageKind = (typeof ImageKinds)[number];
export type ImageSourceInput = Parameters<typeof sharp>[0];

export type AssetSize = number | { width: number; height: number };
export function assetSizeToString(size: AssetSize): string {
  if (typeof size === "number") {
    return `${size}x${size}`;
  } else {
    return `${size.width}x${size.height}`;
  }
}

export interface ResolvedAssetSize {
  original: AssetSize;
  width: number;
  height: number;
}

export function toResolvedSize(size: AssetSize) {
  return {
    original: size,
    width: typeof size === "number" ? size : size.width,
    height: typeof size === "number" ? size : size.height,
  } satisfies ResolvedAssetSize;
}

export function extractAssetSize(size: ResolvedAssetSize, padding: number) {
  const width =
    typeof size.original === "number" ? size.original : size.original.width;
  const height =
    typeof size.original === "number" ? size.original : size.original.height;

  return {
    width: Math.round(width * (1 - padding)),
    height: Math.round(height * (1 - padding)),
  };
}

export type GenerateOptionsType = "png" | "webp" | "none";
export type GenerateOptionsOptionType<T> = T extends "png"
  ? GenerateOutputOptions<PngOptions>
  : T extends "webp"
  ? GenerateOutputOptions<WebpOptions>
  : T extends "none"
  ? GenerateOutputOptions<never>
  : never;

export interface GenerateOutputOptions<T> {
  padding?: number;
  resizeOptions?: sharp.ResizeOptions;
  outputOptions: T;
}
export async function createSharp<OutputType extends GenerateOptionsType>(
  type: OutputType,
  image: Parameters<typeof sharp>[0],
  size: AssetSize,
  background: sharp.Colour,
  options?: GenerateOptionsOptionType<OutputType>,
  channels: sharp.CreateChannels = 4
): Promise<sharp.Sharp> {
  const { padding = 0, resizeOptions, outputOptions } = options ?? {};

  const useSize = toResolvedSize(size);
  const { width, height } = extractAssetSize(useSize, padding);

  const resizedImageBuffer = await sharp(image)
    .resize(width, height, resizeOptions)
    .toBuffer();

  const baseSharpInstance = sharp({
    create: {
      width: useSize.width,
      height: useSize.height,
      channels,
      background,
    },
  }).composite([{ input: resizedImageBuffer }]);

  if (type === "none" || !options) return baseSharpInstance;

  return type === "png"
    ? baseSharpInstance.png(outputOptions)
    : baseSharpInstance.webp(outputOptions);
}

export async function generateTransparentAsset<
  OutputType extends GenerateOptionsType
>(
  type: OutputType,
  image: ImageSourceInput,
  size: AssetSize,
  options?: GenerateOptionsOptionType<OutputType>
): Promise<sharp.Sharp> {
  return createSharp<OutputType>(
    type,
    image,
    size,
    { r: 0, g: 0, b: 0, alpha: 0 },
    options,
    4
  );
}

export async function generateMaskableAsset<
  OutputType extends GenerateOptionsType
>(
  type: OutputType,
  image: ImageSourceInput,
  size: AssetSize,
  options?: GenerateOptionsOptionType<OutputType>
): Promise<sharp.Sharp> {
  return createSharp<OutputType>(
    type,
    image,
    size,
    options?.resizeOptions?.background ?? "white",
    options,
    4
  );
}

async function generateAsset(
  type: "ico" | "png",
  icon: { name: string; buffer: () => Promise<Buffer> },
  folder: string,
  overrideAssets: boolean
) {
  const filePath = resolve(folder, icon.name);
  if (!overrideAssets && existsSync(filePath)) {
    console.info(`Skipping, .${type} file already exists: ${filePath}`);
    return;
  }

  const buffer = await icon.buffer();
  await writeFile(filePath, new Uint8Array(buffer));
  console.info(`Generated .${type} file: ${filePath}`);
}

export const defaultPngOptions: Record<
  ImageKind,
  { padding: number; resizeOptions: ResizeOptions }
> = {
  transparent: {
    padding: 0.05,
    resizeOptions: { fit: "contain", background: "transparent" },
  },
  maskable: {
    padding: 0.3,
    resizeOptions: { fit: "contain", background: "white" },
  },
  apple: {
    padding: 0.04,
    resizeOptions: { fit: "contain", background: "white" },
  },
};

type PWAImageGenPluginProps = {
  overwriteFiles?: boolean;
  images: Array<{
    path: string;
    transparent?: {
      sizes: Array<AssetSize>;
    };
    maskable?: {
      sizes: Array<AssetSize>;
    };
    apple?: {
      sizes: Array<AssetSize>;
    };
    options?: Partial<
      Record<ImageKind, { padding: number; resizeOptions: ResizeOptions }>
    >;
  }>;
  favicon?: {
    path: string;
    size: AssetSize;
  };
  outputDir?: string;
};

const generateImages = async (props: PWAImageGenPluginProps) => {
  const { overwriteFiles = true, images, favicon, outputDir } = props;

  const root = process.cwd(); //TODO
  const outDir = outputDir ?? root;
  const imageResolver = (path: string): Promise<Buffer> => {
    const filePath = resolve(root, path);
    console.log("Reading file:", filePath);
    if (!existsSync(filePath)) {
      throw Error(`Image under path ${filePath} does not exist.`);
    }
    return readFile(filePath);
  };

  const defaultFileNameResolver = (
    kind: ImageKind,
    size: AssetSize,
    imgType: string
  ) => {
    const imgFileNamePrefix =
      kind === "apple"
        ? "apple-touch-icon"
        : kind === "maskable"
        ? "maskable-icon"
        : "pwa";
    return `${imgFileNamePrefix}-${assetSizeToString(size)}.${imgType}`;
  };

  if (favicon) {
    const { path, size } = favicon;
    const img = await imageResolver(path);
    //TODO FlorianDe: Check which options to parse instead of using defaultPngOptions
    const image = await generateTransparentAsset("png", img, size, {
      outputOptions: { compressionLevel: 9, quality: 60 },
      padding: defaultPngOptions["transparent"].padding,
      resizeOptions: defaultPngOptions["transparent"].resizeOptions,
    });
    generateAsset(
      "ico",
      {
        name: "favicon.ico",
        buffer: () => image.toBuffer(),
      },
      outDir,
      overwriteFiles
    );
  }

  for (const imgProps of images) {
    const { path, options } = imgProps;
    const imgOptions = {
      ...defaultPngOptions,
      ...(options ?? {})
    }
    const img = await imageResolver(path);

    for (const imgKind of ImageKinds) {
      const container = imgProps[imgKind];
      const resolvedTransparents = await Promise.all(
        container?.sizes.map(async (size) => {
          const generateAssetFn =
            imgKind === "transparent"
              ? generateTransparentAsset
              : generateMaskableAsset;
          const imgType: GenerateOptionsType = "png";
          const imageFileName = defaultFileNameResolver(imgKind, size, imgType);
          const image = await generateAssetFn(imgType, img, size, {
            outputOptions: { compressionLevel: 9, quality: 60 },
            padding: imgOptions[imgKind].padding,
            resizeOptions: imgOptions[imgKind].resizeOptions,
          });

          return {
            imgType,
            image,
            imageFileName,
            size,
          };
        }) ?? []
      );

      resolvedTransparents.forEach(({ image, imageFileName, imgType }) => {
        generateAsset(
          imgType,
          {
            name: imageFileName,
            buffer: () => image.toBuffer(),
          },
          outDir,
          overwriteFiles
        );
      });
    }
  }
};

export function pwaImageGenPlugin(props: PWAImageGenPluginProps): Plugin {
  return {
    name: "pwa-image-gen-display",
    enforce: "pre",
    apply: "build",
    async buildStart() {
      await generateImages(props);
    },
    async generateBundle() {
      // const outDir = this.meta.watchMode
      //   ? 'dist'
      //   : (this.getOption('outDir') as string) ?? 'dist';
      // Optional: Emit file to ensure it is tracked in Vite's build pipeline
      // this.emitFile({
      //   type: 'asset',
      //   fileName: 'images/example-image.png',
      //   source: imageContent,
      // });
    },
  };
}

// await generateImages({
//   outputDir: "generated",
//   images: [
//     {
//       path: "assets/logo_512x512.png",
//       transparent: {
//         sizes: [64, 192, 512],
//       },
//       maskable: {
//         sizes: [512],
//       },
//       apple: {
//         sizes: [180],
//       },
//     },
//   ],
//   favicon: {
//     path: "public/favicon.svg",
//     size: 48,
//   },
// });
