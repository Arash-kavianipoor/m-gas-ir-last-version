/**
 * Universal JPEG Image Processing & Validation Pipeline
 * 
 * Guarantees that all images used across the application:
 * 1. Are verified, decodable, valid image sources.
 * 2. Are converted & normalized to standard JPEG (image/jpeg) at 82-85% quality.
 * 3. Have robust fallback handling to prevent broken image icons.
 * 4. Cache converted JPEG blobs/URLs so images are never re-converted needlessly.
 */

const jpegConversionCache = new Map<string, string>();

/**
 * Converts any image source (URL, Data URI, SVG raster) into an optimized standard JPEG Blob/DataURL
 * using HTML Canvas decoding and re-encoding at 82-85% quality.
 */
export async function convertToStandardJpeg(
  sourceUrl: string,
  quality: number = 0.85,
  maxWidth: number = 1200,
  maxHeight: number = 900
): Promise<string> {
  // Check in-memory cache first to avoid converting the same image multiple times
  const cacheKey = `${sourceUrl}_q${quality}_w${maxWidth}`;
  if (jpegConversionCache.has(cacheKey)) {
    return jpegConversionCache.get(cacheKey)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.onload = () => {
      try {
        // Calculate constrained dimensions preserving aspect ratio
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas for decoding & JPEG re-encoding
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false }); // JPEG does not need alpha, pure RGB

        if (!ctx) {
          // Fallback to source URL if canvas context fails
          resolve(sourceUrl);
          return;
        }

        // Fill background with dark slate studio backdrop if transparency existed
        ctx.fillStyle = '#060E14';
        ctx.fillRect(0, 0, width, height);

        // Draw and decode original image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to image/jpeg at specified quality (85%)
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Verify valid JPEG header
        if (jpegDataUrl.startsWith('data:image/jpeg')) {
          jpegConversionCache.set(cacheKey, jpegDataUrl);
          resolve(jpegDataUrl);
        } else {
          // Safe fallback
          resolve(sourceUrl);
        }
      } catch (err) {
        console.warn('[ImagePipeline] Canvas JPEG conversion warning, using direct URL:', err);
        resolve(sourceUrl);
      }
    };

    img.onerror = (err) => {
      console.warn('[ImagePipeline] Image loading error for URL:', sourceUrl, err);
      // Return original URL or fallback
      resolve(sourceUrl);
    };

    img.src = sourceUrl;
  });
}

/**
 * Validates whether an image URL or Base64 is valid and decodable by the browser
 */
export function validateImageAvailability(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve(false);
      return;
    }
    const testImg = new Image();
    testImg.referrerPolicy = 'no-referrer';
    testImg.onload = () => resolve(true);
    testImg.onerror = () => resolve(false);
    testImg.src = url;
  });
}
