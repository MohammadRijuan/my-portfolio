/** An uploaded image / PDF stored in the database (model Media in prisma/schema.prisma). */
export interface MediaFile {
  mime: string;
  data: Buffer;
  name: string | null;
}

/** File types the CMS may upload. */
export const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
