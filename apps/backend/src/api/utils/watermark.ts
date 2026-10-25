import { MedusaError } from '@medusajs/framework/utils';
import path from 'path';
import sharp from 'sharp';
import { WATERMARK_LOGO_PNG_BASE64 } from './watermark-logo';

// Watermarked files have this at the start of their name, so they're never
// watermarked twice. Local storage and S3 both keep the name in the file's URL.
const WATERMARKED_PREFIX = 'watermarked_';

// The logo sits in the top-left corner. Sizes are shares of the image's shorter
// side, so the logo fits wide and tall images alike.
const LOGO_SIZE = 0.2;
const LOGO_MARGIN = 0.03;
const LOGO_OPACITY = 0.7;

// The largest file stored for an image, after compression.
export const MAX_IMAGE_KB = 500;

// Compression is tried from the best result down, until the file fits: each
// size (the image's longest side, never enlarged) at each quality, best first.
// The storefront shows images at most about 1000 px wide.
const SIZES = [2000, 1600, 1200];
const QUALITIES = [80, 70, 60];

// Formats that can be watermarked and still shown in a browser. Not GIF (it
// would lose its animation), SVG (it would stop being a vector) or HEIC (sharp
// can't read it).
const FORMATS = ['jpeg', 'png', 'webp', 'avif'] as const;
type Format = (typeof FORMATS)[number];

const logo = Buffer.from(WATERMARK_LOGO_PNG_BASE64, 'base64');

const isFormat = (format: string | undefined): format is Format =>
  FORMATS.includes(format as Format);

const kilobytes = (bytes: number) => Math.ceil(bytes / 1024);

/** Whether a file name or URL belongs to a file this code watermarked. */
export function isWatermarked(fileNameOrUrl: string): boolean {
  return path.posix
    .basename(fileNameOrUrl.split('?')[0])
    .includes(WATERMARKED_PREFIX);
}

/** The name to store a watermarked copy of a file under. */
export function watermarkedFileName(fileName: string): string {
  return `${WATERMARKED_PREFIX}${path.posix.basename(fileName)}`;
}

/**
 * Prepares an image for storage: turns it upright, adds the logo in its
 * top-left corner (unless `addLogo` is false, for a file that already has it),
 * and compresses it until it's at most MAX_IMAGE_KB, keeping its format.
 *
 * Throws an INVALID_DATA error, naming the file, when the format can't be
 * watermarked or the image can't be brought under the limit.
 *
 * Turning the image upright matters for phone photos, which often store their
 * rotation as a flag that is dropped on output: without it the photo would
 * come out sideways and the logo would land in the wrong corner.
 */
export async function watermarkAndCompress(
  input: Buffer,
  fileName: string,
  { addLogo = true }: { addLogo?: boolean } = {},
): Promise<{ buffer: Buffer; mimeType: string }> {
  const { format } = await sharp(input).metadata();
  if (!isFormat(format)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Can't upload "${fileName}": ${format ? `${format.toUpperCase()} images aren't` : "this file type isn't"} supported. Upload a JPEG, PNG or WebP image.`,
    );
  }

  let smallest = Infinity;
  for (const size of SIZES) {
    const image = await uprightWithLogo(input, size, addLogo);
    // PNG is compressed without loss, so it has no quality to lower.
    for (const quality of format === 'png' ? [100] : QUALITIES) {
      const buffer = await encode(image, format, quality);
      if (buffer.length <= MAX_IMAGE_KB * 1024) {
        return { buffer, mimeType: `image/${format}` };
      }
      smallest = Math.min(smallest, buffer.length);
    }
  }

  throw new MedusaError(
    MedusaError.Types.INVALID_DATA,
    `Can't upload "${fileName}": it is still ${kilobytes(smallest)} KB after compressing it down to ${SIZES[SIZES.length - 1]} px, and the limit is ${MAX_IMAGE_KB} KB.` +
      (format === 'png'
        ? ' PNG files can only be compressed without loss; save the image as JPEG or WebP instead.'
        : ' Use a smaller or less detailed image.'),
  );
}

/**
 * The image upright, no larger than `size` on its longest side, with the logo
 * on it, as uncompressed pixels ready to be saved at different qualities.
 */
async function uprightWithLogo(input: Buffer, size: number, addLogo: boolean): Promise<Pixels> {
  const { data, info } = await sharp(input)
    .autoOrient()
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    // Colour, so the logo stays in colour on a greyscale photo.
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const image: Pixels = {
    data,
    raw: { width: info.width, height: info.height, channels: info.channels },
  };
  if (!addLogo) {
    return image;
  }

  const shorterSide = Math.min(info.width, info.height);
  const margin = Math.round(shorterSide * LOGO_MARGIN);
  const mark = await sharp(logo)
    .resize({ width: Math.max(1, Math.round(shorterSide * LOGO_SIZE)) })
    .ensureAlpha()
    .linear([1, 1, 1, LOGO_OPACITY], [0, 0, 0, 0])
    .png()
    .toBuffer();

  // Pasting the logo can add a transparency channel, so take the channel count
  // from the result.
  const withLogo = await sharp(image.data, { raw: image.raw })
    .composite([{ input: mark, left: margin, top: margin }])
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: withLogo.data, raw: { ...image.raw, channels: withLogo.info.channels } };
}

type Pixels = {
  data: Buffer;
  raw: { width: number; height: number; channels: 1 | 2 | 3 | 4 };
};

function encode(
  image: Pixels,
  format: Format,
  quality: number,
): Promise<Buffer> {
  const pipeline = sharp(image.data, { raw: image.raw });
  switch (format) {
    case 'jpeg':
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case 'webp':
      return pipeline.webp({ quality }).toBuffer();
    case 'avif':
      return pipeline.avif({ quality }).toBuffer();
    case 'png':
      return pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
  }
}
