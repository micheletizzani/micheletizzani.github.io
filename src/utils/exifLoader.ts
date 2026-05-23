import exifr from 'exifr';
import fs from 'fs/promises';
import path from 'path';

export interface PhotoExifData {
  src: string;
  make?: string;
  model?: string;
  lensModel?: string;
  fNumber?: number;
  exposureTime?: number | string;
  iso?: number;
  focalLength?: number;
  dateCreated?: Date;
}

/**
 * Extracts EXIF data from all photos in a given directory (e.g., src/assets/photos)
 */
export async function getPhotosWithExif(directoryPath: string): Promise<PhotoExifData[]> {
  try {
    const fullPath = path.resolve(process.cwd(), directoryPath);
    const files = await fs.readdir(fullPath);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png|webp|heic)$/i.test(file));

    const photos: PhotoExifData[] = [];

    for (const file of imageFiles) {
      const filePath = path.join(fullPath, file);
      // Construct a relative path for the frontend (assuming standard Astro assets routing if imported, or public dir)
      // Here we assume it will be used from the public folder or resolved via Vite.
      const srcPath = `/photos/${file}`;

      try {
        const fileBuffer = await fs.readFile(filePath);
        const exifData = await exifr.parse(fileBuffer, {
          tiff: true,
          exif: true,
          ifd0: true,
        });

        photos.push({
          src: srcPath,
          make: exifData?.Make,
          model: exifData?.Model,
          lensModel: exifData?.LensModel,
          fNumber: exifData?.FNumber,
          exposureTime: exifData?.ExposureTime,
          iso: exifData?.ISO,
          focalLength: exifData?.FocalLength,
          dateCreated: exifData?.DateTimeOriginal || exifData?.CreateDate,
        });
      } catch (err) {
        console.warn(`Could not read EXIF for ${file}:`, err);
        // Fallback gracefully
        photos.push({ src: srcPath });
      }
    }

    return photos.sort((a, b) => {
      const dateA = a.dateCreated ? new Date(a.dateCreated).getTime() : 0;
      const dateB = b.dateCreated ? new Date(b.dateCreated).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  } catch (error) {
    console.error("Error reading photos directory:", error);
    return [];
  }
}
