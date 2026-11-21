import jsQRLib from 'jsqr';
import { PNG } from 'pngjs';
import jpeg from 'jpeg-js';

const jsQR = ((jsQRLib as any).default || jsQRLib) as (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  options?: any
) => { data: string } | null;

export interface QrScanResult {
  hasQr: boolean;
  data?: string;
  error?: string;
}

export function extractQrFromImageBuffer(buffer: Buffer, mimeType: string): QrScanResult {
  try {
    let width = 0;
    let height = 0;
    let rgbaData: Uint8ClampedArray | Uint8Array | null = null;

    if (mimeType.includes('png')) {
      const png = PNG.sync.read(buffer);
      width = png.width;
      height = png.height;
      rgbaData = new Uint8ClampedArray(png.data);
    } else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      const decoded = jpeg.decode(buffer, { useTArray: true });
      width = decoded.width;
      height = decoded.height;
      rgbaData = new Uint8ClampedArray(decoded.data);
    } else {
      // For WEBP or other formats, attempt JPEG decode or fallback
      try {
        const decoded = jpeg.decode(buffer, { useTArray: true });
        width = decoded.width;
        height = decoded.height;
        rgbaData = new Uint8ClampedArray(decoded.data);
      } catch {
        return { hasQr: false, error: 'Unsupported image format for QR decoding' };
      }
    }

    if (!rgbaData || width === 0 || height === 0) {
      return { hasQr: false };
    }

    const code = jsQR(rgbaData as any, width, height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      return {
        hasQr: true,
        data: code.data,
      };
    }

    return { hasQr: false };
  } catch (err: any) {
    return { hasQr: false, error: err.message };
  }
}
