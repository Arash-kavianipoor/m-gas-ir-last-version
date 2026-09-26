export type RalCategory =
  | 'green'
  | 'blue'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'grey'
  | 'white_black'
  | 'brown'
  | 'violet';

export interface RalColor {
  code: string;
  nameFa: string;
  nameEn: string;
  nameDe?: string;
  hex: string;
  category: RalCategory;
  isPopular?: boolean;
}

export const RAL_POPULAR_COLORS: RalColor[] = [
  { code: 'RAL 6018', nameFa: 'سبز چمنی (استاندارد کارگاهی و خانگی)', nameEn: 'Yellow Green (Standard Workshop & Home)', nameDe: 'Gelbgrün', hex: '#48A43F', category: 'green', isPopular: true },
  { code: 'RAL 6005', nameFa: 'سبز خزه ای (صنعتی سنگین)', nameEn: 'Moss Green (Industrial Heavy)', nameDe: 'Moosgrün', hex: '#0F4336', category: 'green', isPopular: true },
  { code: 'RAL 5015', nameFa: 'آبی آسمانی (مخازن آزمایشگاهی و فشرده)', nameEn: 'Sky Blue (Lab & Compact Cylinders)', nameDe: 'Himmelblau', hex: '#007CB0', category: 'blue', isPopular: true },
  { code: 'RAL 5002', nameFa: 'آبی لاجوردی مات (صادراتی حوزه خلیج فارس)', nameEn: 'Ultramarine Blue (Export Gulf Grade)', nameDe: 'Ultramarinblau', hex: '#162E7B', category: 'blue', isPopular: true },
  { code: 'RAL 3000', nameFa: 'قرمز آتشنشانی (سیلندرهای اطفاء و هشدار)', nameEn: 'Flame Red (Safety & Fire Specs)', nameDe: 'Feuerrot', hex: '#AF2B1E', category: 'red', isPopular: true },
  { code: 'RAL 3020', nameFa: 'قرمز راهنمایی (مخازن سوخت با دید بالا)', nameEn: 'Traffic Red (High Visibility Fuel)', nameDe: 'Verkehrsrot', hex: '#CC0605', category: 'red', isPopular: true },
  { code: 'RAL 2004', nameFa: 'نارنجی خالص (پیک‌نیک و کمپینگ)', nameEn: 'Pure Orange (Outdoor & Camping)', nameDe: 'Reinorange', hex: '#E25303', category: 'orange', isPopular: true },
  { code: 'RAL 1021', nameFa: 'زرد کلمبیایی (مخازن گاز صنعتی مایع ویژه)', nameEn: 'Rape Yellow (Industrial Specialized)', nameDe: 'Rapsgelb', hex: '#F39F18', category: 'yellow', isPopular: true },
  { code: 'RAL 7035', nameFa: 'طوسی روشن (مقاوم در برابر تابش آفتاب)', nameEn: 'Light Grey (Solar Reflective)', nameDe: 'Lichtgrau', hex: '#C5C7C4', category: 'grey', isPopular: true },
  { code: 'RAL 7016', nameFa: 'خاکستری ذغالی مات (اتوگاز مدرن خودرو)', nameEn: 'Anthracite Grey (Automotive Autogas)', nameDe: 'Anthrazitgrau', hex: '#373F43', category: 'grey', isPopular: true },
  { code: 'RAL 9005', nameFa: 'مشکی سمباده ای (مخازن خودرویی و شاسی)', nameEn: 'Jet Black (Underbody Automotive Tank)', nameDe: 'Tiefschwarz', hex: '#0A0A0D', category: 'white_black', isPopular: true },
  { code: 'RAL 9010', nameFa: 'سفید خالص (مخازن صادراتی مناطق گرمسیری)', nameEn: 'Pure White (Tropical Heat Shield)', nameDe: 'Reinweiß', hex: '#F7F9F5', category: 'white_black', isPopular: true },
];

export const RAL_COLORS: RalColor[] = [
  ...RAL_POPULAR_COLORS,
  { code: 'RAL 6001', nameFa: 'سبز زمردی', nameEn: 'Emerald Green', nameDe: 'Smaragdgrün', hex: '#28713E', category: 'green' },
  { code: 'RAL 6002', nameFa: 'سبز برگ درخت', nameEn: 'Leaf Green', nameDe: 'Laubgrün', hex: '#276235', category: 'green' },
  { code: 'RAL 6029', nameFa: 'سبز نعنایی', nameEn: 'Mint Green', nameDe: 'Minzgrün', hex: '#006F43', category: 'green' },
  { code: 'RAL 5010', nameFa: 'آبی گلوری', nameEn: 'Gentian Blue', nameDe: 'Enzianblau', hex: '#0E467F', category: 'blue' },
  { code: 'RAL 5017', nameFa: 'آبی ترافیکی', nameEn: 'Traffic Blue', nameDe: 'Verkehrsblau', hex: '#005B8C', category: 'blue' },
  { code: 'RAL 5012', nameFa: 'آبی روشن', nameEn: 'Light Blue', nameDe: 'Lichtblau', hex: '#2B87AC', category: 'blue' },
  { code: 'RAL 3001', nameFa: 'قرمز سیگنال', nameEn: 'Signal Red', nameDe: 'Signalrot', hex: '#A02128', category: 'red' },
  { code: 'RAL 3003', nameFa: 'قرمز یاقوتی', nameEn: 'Ruby Red', nameDe: 'Rubinrot', hex: '#8B1C25', category: 'red' },
  { code: 'RAL 2000', nameFa: 'نارنجی زرد', nameEn: 'Yellow Orange', nameDe: 'Gelborange', hex: '#D4652F', category: 'orange' },
  { code: 'RAL 2008', nameFa: 'نارنجی روشن', nameEn: 'Bright Red Orange', nameDe: 'Hellrotorange', hex: '#DE532A', category: 'orange' },
  { code: 'RAL 1003', nameFa: 'زرد علامتی', nameEn: 'Signal Yellow', nameDe: 'Signalgelb', hex: '#E89D07', category: 'yellow' },
  { code: 'RAL 1018', nameFa: 'زرد روی', nameEn: 'Zinc Yellow', nameDe: 'Zinkgelb', hex: '#F4C038', category: 'yellow' },
  { code: 'RAL 7001', nameFa: 'نقره‌ای طوسی', nameEn: 'Silver Grey', nameDe: 'Silbergrau', hex: '#8A9597', category: 'grey' },
  { code: 'RAL 7040', nameFa: 'طوسی پنجره‌ای', nameEn: 'Window Grey', nameDe: 'Fenstergrau', hex: '#959CA1', category: 'grey' },
  { code: 'RAL 8003', nameFa: 'قهوه‌ای رسی', nameEn: 'Clay Brown', nameDe: 'Lehmbraun', hex: '#794D3A', category: 'brown' },
  { code: 'RAL 8017', nameFa: 'قهوه‌ای شکلاتی', nameEn: 'Chocolate Brown', nameDe: 'Schokoladenbraun', hex: '#442F29', category: 'brown' },
  { code: 'RAL 4005', nameFa: 'بنفش آبی', nameEn: 'Blue Lilac', nameDe: 'Blaulila', hex: '#6C6874', category: 'violet' },
  { code: 'RAL 4008', nameFa: 'بنفش سیگنال', nameEn: 'Signal Violet', nameDe: 'Signalviolett', hex: '#844C82', category: 'violet' },
];

export function getRalColorByCode(code: string): RalColor | undefined {
  return RAL_COLORS.find((c) => c.code.toLowerCase() === code.toLowerCase());
}

export function getRalColorsByCategory(category: RalCategory): RalColor[] {
  return RAL_COLORS.filter((c) => c.category === category);
}

export function searchRalColors(query: string): RalColor[] {
  const q = query.toLowerCase().trim();
  if (!q) return RAL_COLORS;
  return RAL_COLORS.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.nameFa.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      (c.nameDe && c.nameDe.toLowerCase().includes(q))
  );
}
