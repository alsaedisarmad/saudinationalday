import credits from './generated/photo-credits.json'

/**
 * سجل الصور: كل صورة مرخّصة ترخيصًا مفتوحًا من ويكيميديا كومنز (CC0 / ملك عام / CC BY / CC BY-SA)،
 * ونسبتها (المؤلف والترخيص والرابط) تُعرض دائمًا تحت الصورة. لا صورة بلا نسب.
 * الملفات: src/assets/photos/<id>.webp (كاملة) و thumbs/<id>.webp (مصغّرة للبطاقات).
 */
const full = import.meta.glob('../assets/photos/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const thumbs = import.meta.glob('../assets/photos/thumbs/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export interface Photo {
  id: string
  src: string
  thumb: string
  alt: string
  author: string
  license: string
  licenseUrl: string
  page: string
  w: number
  h: number
}

const authorFix: Record<string, string> = {
  'bitter-lake-1945': 'الأرشيف الوطني الأمريكي (NARA) / U.S. Army Signal Corps',
  founder: 'وكالة الأنباء السعودية (واس)',
  king: 'وكالة الأنباء السعودية (واس)',
  'crown-prince': 'وكالة الأنباء السعودية (واس)',
  'riyadh-boulevard': 'وكالة الأنباء السعودية (واس)',
}

export const photos: Record<string, Photo> = Object.fromEntries(
  (credits as Array<{ id: string; file: string; alt: string; author: string; license: string; licenseUrl: string; page: string; w: number; h: number }>).map((c) => [
    c.id,
    {
      id: c.id,
      src: full[`../assets/photos/${c.file}`],
      thumb: thumbs[`../assets/photos/thumbs/${c.file}`] ?? full[`../assets/photos/${c.file}`],
      alt: c.alt.replace(/­/g, ''),
      author: authorFix[c.id] ?? c.author.replace(/\s*\(.*?\)\s*$/, '').trim(),
      license: c.license,
      licenseUrl: c.licenseUrl,
      page: c.page,
      w: c.w,
      h: c.h,
    },
  ]),
)

export const photo = (id: string): Photo => photos[id]

/** سطر النسب: «الصورة: المؤلف · الترخيص» */
export const creditLine = (p: Photo) => `الصورة: ${p.author} · ${p.license} · ويكيميديا كومنز`
