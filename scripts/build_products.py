import json

products = [
  {
    'id': 'mgas-60l',
    'slug': 'cylinder-60-liter',
    'category': 'workshops',
    'volume': 60,
    'volumeUnit': 'Liter',
    'emptyWeightKg': 22.2,
    'circleDiameterCm': 31.5,
    'heightCm': 82,
    'minOrder': 800,
    'unitPriceUsd': 39,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.8,
    'material': 'HP295 / P265GH Deep-Draw Steel',
    'valveStandard': 'Standard 3/4" NPT / DIN 477',
    'coating': 'Electrostatic Polyester Powder Coat (80μm)',
    'isPopular': True,
    'defaultRalCode': 'RAL 6018',
    'cylinderColor': '#57A639',
    'refImg': '/products/60 Liter/DSC08492-1-scaled.webp',
    'volStr': '60 Liter'
  },
  {
    'id': 'mgas-50kg',
    'slug': 'cylinder-50-kg',
    'category': 'workshops',
    'volume': 50,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 42.5,
    'circleDiameterCm': 36,
    'heightCm': 139,
    'minOrder': 450,
    'unitPriceUsd': 58,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 3.2,
    'material': 'HP295 Heavy Gauge Pressure Steel',
    'valveStandard': 'Standard POL / Dual Liquid-Vapor Valve',
    'coating': 'Zinc Primed + Polyester Topcoat (100μm)',
    'isPopular': True,
    'defaultRalCode': 'RAL 5015',
    'cylinderColor': '#007CB0',
    'refImg': '/products/50 Liter/DSC08492-1-scaled.webp',
    'volStr': '50 Kg'
  },
  {
    'id': 'mgas-45kg',
    'slug': 'cylinder-45-kg',
    'category': 'workshops',
    'volume': 45,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 41.5,
    'circleDiameterCm': 36,
    'heightCm': 134,
    'minOrder': 450,
    'unitPriceUsd': 57,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 3.2,
    'material': 'HP295 Deep-Draw Steel',
    'valveStandard': 'Standard POL / Dual Port',
    'coating': 'Electrostatic Polyurethane Paint (90μm)',
    'defaultRalCode': 'RAL 2004',
    'cylinderColor': '#E25303',
    'refImg': '/products/45 Liter/DSC08492-1-scaled.webp',
    'volStr': '45 Kg'
  },
  {
    'id': 'mgas-33kg',
    'slug': 'cylinder-33-kg',
    'category': 'workshops',
    'volume': 33,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 27.5,
    'circleDiameterCm': 30,
    'heightCm': 150,
    'minOrder': 900,
    'unitPriceUsd': 38,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 3.0,
    'material': 'HP295 Cylindrical Steel',
    'valveStandard': 'Standard 22mm / POL Fitting',
    'coating': 'Electrostatic Powder Coat (85μm)',
    'defaultRalCode': 'RAL 3000',
    'cylinderColor': '#AF2B1E',
    'refImg': '/products/33 Liter/DSC08492-1-scaled.webp',
    'volStr': '33 Kg'
  },
  {
    'id': 'mgas-25kg',
    'slug': 'cylinder-25-kg',
    'category': 'workshops',
    'volume': 25,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 27,
    'circleDiameterCm': 30,
    'heightCm': 110,
    'minOrder': 900,
    'unitPriceUsd': 36,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.8,
    'material': 'HP295 High-Strength Steel',
    'valveStandard': 'Standard 21.8mm LH / POL',
    'coating': 'Electrostatic Powder Paint (80μm)',
    'defaultRalCode': 'RAL 1021',
    'cylinderColor': '#F3DA0B',
    'refImg': '/products/25 Liter/DSC08492-1-scaled.webp',
    'volStr': '25 Kg'
  },
  {
    'id': 'mgas-11kg',
    'slug': 'cylinder-11-kg',
    'category': 'home',
    'volume': 11,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 14,
    'circleDiameterCm': 30,
    'heightCm': 59,
    'minOrder': 1800,
    'unitPriceUsd': 16,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.6,
    'material': 'HP295 Deep-Drawing Steel',
    'valveStandard': 'Standard 21.8mm LH / G.12 (EN 1442)',
    'coating': 'Electrostatic Glossy Powder Coat (80μm)',
    'isPopular': True,
    'defaultRalCode': 'RAL 6018',
    'cylinderColor': '#57A639',
    'refImg': '/products/11 Liter/DSC08566-1-scaled.webp',
    'gallery': ['/products/11 Liter/DSC08566-1-scaled.webp', '/products/11 Liter/DSC08573-scaled.webp'],
    'volStr': '11 Kg'
  },
  {
    'id': 'mgas-10kg',
    'slug': 'cylinder-10-kg',
    'category': 'home',
    'volume': 10,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 12,
    'circleDiameterCm': 30,
    'heightCm': 51,
    'minOrder': 1800,
    'unitPriceUsd': 16,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.5,
    'material': 'HP295 Pressure Steel',
    'valveStandard': 'Standard 21.8mm LH / Click-on Valve',
    'coating': 'Electrostatic Powder Coat (80μm)',
    'defaultRalCode': 'RAL 5015',
    'cylinderColor': '#007CB0',
    'refImg': '/products/10 Liter/DSC08566-1-scaled.webp',
    'gallery': ['/products/10 Liter/DSC08566-1-scaled.webp', '/products/10 Liter/DSC08573-scaled.webp'],
    'volStr': '10 Kg'
  },
  {
    'id': 'mgas-8kg',
    'slug': 'cylinder-8-kg',
    'category': 'home',
    'volume': 8,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 7.8,
    'circleDiameterCm': 30,
    'heightCm': 37.5,
    'minOrder': 1800,
    'unitPriceUsd': 15,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.3,
    'material': 'HP295 Deep-Drawing Steel',
    'valveStandard': 'Standard 21.8mm LH / Camping Valve',
    'coating': 'Electrostatic Powder Coat (75μm)',
    'defaultRalCode': 'RAL 2004',
    'cylinderColor': '#E25303',
    'refImg': '/products/8 Liter/DSC08482-1-scaled.webp',
    'volStr': '8 Kg'
  },
  {
    'id': 'mgas-5kg',
    'slug': 'cylinder-5-kg',
    'category': 'home',
    'volume': 5,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 4.95,
    'circleDiameterCm': 22.92,
    'heightCm': 34,
    'minOrder': 3600,
    'unitPriceUsd': 9,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.2,
    'material': 'HP295 Deep-Drawing Steel',
    'valveStandard': 'Standard Camping Thread / 3/8" BSP',
    'coating': 'High-Gloss Electrostatic Powder (75μm)',
    'isPopular': True,
    'defaultRalCode': 'RAL 6018',
    'cylinderColor': '#57A639',
    'refImg': '/products/5 Liter/DSC080536.webp',
    'volStr': '5 Kg'
  },
  {
    'id': 'mgas-3kg',
    'slug': 'cylinder-3-kg',
    'category': 'home',
    'volume': 3,
    'volumeUnit': 'Kg',
    'emptyWeightKg': 4,
    'circleDiameterCm': 22.92,
    'heightCm': 26.5,
    'minOrder': 4800,
    'unitPriceUsd': 8,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 2.0,
    'material': 'HP295 Deep-Drawing Steel',
    'valveStandard': 'Standard Camping Valve 3/8" BSP',
    'coating': 'Electrostatic Powder Coat (75μm)',
    'defaultRalCode': 'RAL 1021',
    'cylinderColor': '#F3DA0B',
    'refImg': '/products/3 Liter/DSC08478-5-scaled.webp',
    'volStr': '3 Kg'
  },
  {
    'id': 'mgas-15l',
    'slug': 'cylinder-1-5-liter',
    'category': 'home',
    'volume': 1.5,
    'volumeUnit': 'Liter',
    'emptyWeightKg': 1.7,
    'circleDiameterCm': 13.57,
    'heightCm': 23.5,
    'minOrder': 7000,
    'unitPriceUsd': 7,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 1.8,
    'material': 'HP295 High-Grade Sheet',
    'valveStandard': 'Camping Valve Thread',
    'coating': 'Electrostatic Glossy Coating (70μm)',
    'defaultRalCode': 'RAL 5015',
    'cylinderColor': '#007CB0',
    'refImg': '/products/1.5 Liter/DSC08466-1-scaled.webp',
    'volStr': '1.5 Liter'
  },
  {
    'id': 'mgas-1l',
    'slug': 'cylinder-1-liter',
    'category': 'home',
    'volume': 1,
    'volumeUnit': 'Liter',
    'emptyWeightKg': 1.45,
    'circleDiameterCm': 13.53,
    'heightCm': 20,
    'minOrder': 7000,
    'unitPriceUsd': 6,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 1.8,
    'material': 'HP295 High-Grade Sheet',
    'valveStandard': 'Camping Valve Thread',
    'coating': 'Electrostatic Powder Coating (70μm)',
    'defaultRalCode': 'RAL 2004',
    'cylinderColor': '#E25303',
    'refImg': '/products/1 Liter/DSC08464-1-scaled.webp',
    'volStr': '1 Liter'
  },
  {
    'id': 'mgas-05l',
    'slug': 'cylinder-0-5-liter',
    'category': 'home',
    'volume': 0.5,
    'volumeUnit': 'Liter',
    'emptyWeightKg': 1.3,
    'circleDiameterCm': 13.45,
    'heightCm': 17,
    'minOrder': 7000,
    'unitPriceUsd': 5,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 1.8,
    'material': 'HP295 High-Grade Steel',
    'valveStandard': 'Camping Valve Thread 3/8"',
    'coating': 'Electrostatic Powder Coat (70μm)',
    'defaultRalCode': 'RAL 6018',
    'cylinderColor': '#57A639',
    'refImg': '/products/0.5 Liter/DSC08457.webp',
    'gallery': ['/products/0.5 Liter/DSC08457.webp', '/products/0.5 Liter/DSC08458-1-scaled.webp'],
    'volStr': '0.5 Liter'
  },
  {
    'id': 'mgas-auto-lpg',
    'slug': 'automotive-lpg-tank-60l',
    'category': 'automotive',
    'volume': 60,
    'volumeUnit': 'Liter',
    'emptyWeightKg': 22.2,
    'circleDiameterCm': 31.5,
    'heightCm': 82,
    'minOrder': 800,
    'unitPriceUsd': 39,
    'testPressureBar': 30,
    'workingPressureBar': 18,
    'bodyThicknessMm': 3.0,
    'material': 'ECE R67-01 Certified Pressure Vessel Steel',
    'valveStandard': 'Multivalve ECE 67R-01 4-Hole / Toroidal Flange',
    'coating': 'Anti-Gravel Elasticized Powder Coat (120μm)',
    'isPopular': True,
    'isNew': True,
    'defaultRalCode': 'RAL 7035',
    'cylinderColor': '#D7D7D7',
    'refImg': '/products/Auto LPG Tank/DSC08511.webp',
    'gallery': [
      '/products/Auto LPG Tank/DSC08511.webp',
      '/products/Auto LPG Tank/DSC08519.webp',
      '/products/Auto LPG Tank/DSC085191.webp',
      '/products/Auto LPG Tank/DSC08525.webp',
      '/products/Auto LPG Tank/DSC08534.webp',
      '/products/Auto LPG Tank/DSC08560.webp'
    ],
    'volStr': 'Auto LPG 60L'
  }
]

lines = []
lines.append("import { Product, LanguageCode, ProductLocalizedInfo } from '../types';")
lines.append("")
lines.append("function createProductLocales(config: {")
lines.append("  volumeStr: string;")
lines.append("  categoryLabelFa: string;")
lines.append("  categoryLabelEn: string;")
lines.append("  categoryLabelAr: string;")
lines.append("  categoryLabelDe: string;")
lines.append("  categoryLabelUr: string;")
lines.append("  categoryLabelHy: string;")
lines.append("  categoryLabelTr: string;")
lines.append("  categoryLabelRu: string;")
lines.append("  appFa: string[];")
lines.append("  appEn: string[];")
lines.append("  appAr: string[];")
lines.append("  appDe: string[];")
lines.append("  appUr: string[];")
lines.append("  appHy: string[];")
lines.append("  appTr: string[];")
lines.append("  appRu: string[];")
lines.append("  featFa: string[];")
lines.append("  featEn: string[];")
lines.append("  featAr: string[];")
lines.append("  featDe: string[];")
lines.append("  featUr: string[];")
lines.append("  featHy: string[];")
lines.append("  featTr: string[];")
lines.append("  featRu: string[];")
lines.append("}): Record<LanguageCode, ProductLocalizedInfo> {")
lines.append("  const { volumeStr } = config;")
lines.append("")
lines.append("  return {")
lines.append("    fa: {")
lines.append("      name: `سیلندر گاز مایع ${volumeStr} ام گاز`,")
lines.append("      shortDescription: `کپسول گاز استاندارد ${volumeStr} مناسب برای مصارف صنعتی، خانگی و کارگاهی با بالاترین استانداردهای ایمنی.`,")
lines.append("      fullDescription: `سیلندر گاز مایع ${volumeStr} کارخانه ام گاز با استفاده از ورق‌های فولادی استاندارد مخازن تحت فشار، خطوط جوشکاری رباتیک تمام‌اتوماتیک و پوشش رنگ الکترواستاتیک مقاوم در برابر سایش و تابش خورشید تولید شده است. این سیلندر کلیه آزمون‌های هیدرواستاتیک ۳۰ بار و تست‌های عدم نشتی زیر آب را با موفقیت سپری کرده است.`,")
lines.append("      categoryLabel: config.categoryLabelFa,")
lines.append("      applications: config.appFa,")
lines.append("      features: config.featFa,")
lines.append("      specsSummary: `ظرفیت ${volumeStr} | تست هیدرواستاتیک ۳۰ بار | رنگ پودری کوره‌ای | جوشکاری اتوماتیک`,")
lines.append("      seoTitle: `خرید کپسول گاز مایع ${volumeStr} | کارخانه ام گاز mgas.ir`,")
lines.append("      seoDescription: `مشخصات فنی، ابعاد و خرید عمده کپسول گاز مایع (LPG) ${volumeStr} تولید کارخانه ام گاز با گارانتی ایمنی، آزمون ۳۰ بار و تحویل صادراتی.`,")
lines.append("      seoKeywords: [`کپسول گاز ${volumeStr}`, 'کپسول گاز مایع LPG', 'قیمت عمده کپسول گاز', 'کارخانه کپسول سازی ام گاز'],")
lines.append("      imageAlt: `تصویر کپسول گاز مایع ${volumeStr} ام گاز با رنگ کوره ای و شیر استاندارد`,")
lines.append("    },")
lines.append("    en: {")
lines.append("      name: `M Gas ${volumeStr} LPG Cylinder`,")
lines.append("      shortDescription: `High-durability ${volumeStr} LPG gas cylinder engineered for heavy industrial, commercial, and household safety requirements.`,")
lines.append("      fullDescription: `The M Gas ${volumeStr} LPG cylinder is manufactured from certified deep-drawing pressure vessel steel, featuring automated robotic seam welding, 900°C stress-relieving heat treatment, and oven-cured electrostatic powder coating. 100% inspected at 30-bar hydrostatic proof pressure.`,")
lines.append("      categoryLabel: config.categoryLabelEn,")
lines.append("      applications: config.appEn,")
lines.append("      features: config.featEn,")
lines.append("      specsSummary: `Capacity ${volumeStr} | 30-Bar Hydrostatic Proof | Robotic Welded | Oven Powder Coat`,")
lines.append("      seoTitle: `Buy ${volumeStr} LPG Gas Cylinder | M Gas Factory mgas.ir`,")
lines.append("      seoDescription: `Specifications, dimensions, and wholesale export inquiry for ${volumeStr} LPG steel gas cylinder manufactured by M Gas Factory with ISO accreditation.`,")
lines.append("      seoKeywords: [`${volumeStr} LPG cylinder`, 'LPG gas cylinder manufacturer', 'wholesale gas cylinders', 'M Gas Iran factory'],")
lines.append("      imageAlt: `M Gas ${volumeStr} LPG gas cylinder with protective valve collar and powder coating`,")
lines.append("    },")
lines.append("    ar: {")
lines.append("      name: `أسطوانة غاز البترول المسال ${volumeStr} إم غاز`,")
lines.append("      shortDescription: `أسطوانة غاز قياسية سعة ${volumeStr} مصممة للاستخدامات الصناعية والمنزلية والمخبرية بأعلى معايير السلامة.`,")
lines.append("      fullDescription: `تُصنع أسطوانة غاز ${volumeStr} في مصنع إم غاز من صفائح الفولاذ عالية الجودة الخاصة بأوعية الضغط مع لحام روبوتي دقيق ومعالجة حرارية لتطبيع المعدن واختبار هيدروستاتيكي بنسبة 100% تحت ضغط 30 بار.`,")
lines.append("      categoryLabel: config.categoryLabelAr,")
lines.append("      applications: config.appAr,")
lines.append("      features: config.featAr,")
lines.append("      specsSummary: `سعة ${volumeStr} | اختبار هيدروستاتيكي 30 بار | لحام روبوتي | طلاء حراري`,")
lines.append("      seoTitle: `شراء أسطوانة غاز ${volumeStr} | مصنع إم غاز mgas.ir`,")
lines.append("      seoDescription: `المواصفات الفنية والأبعاد والطلب بالجملة لأسطوانة غاز البترول المسال ${volumeStr} من مصنع إم غاز مع شهادات الجودة الدولية.`,")
lines.append("      seoKeywords: [`أسطوانة غاز ${volumeStr}`, 'مصنع أسطوانات غاز', 'أسطوانات غاز للتصدير', 'إم غاز'],")
lines.append("      imageAlt: `صورة أسطوانة غاز البترول المسال ${volumeStr} إم غاز المطلية حرارياً`,")
lines.append("    },")
lines.append("    de: {")
lines.append("      name: `M Gas ${volumeStr} LPG-Gasflasche`,")
lines.append("      shortDescription: `Hochsichere ${volumeStr} Flüssiggasflasche für industrielle, gewerbliche und private Druckbehälter-Anwendungen.`,")
lines.append("      fullDescription: `Die ${volumeStr} Gasflasche von M Gas wird aus geprüftem Druckbehälterstahl im vollautomatischen Roboterschweißverfahren hergestellt, spannungsarm geglüht und bei 30 bar hydrostatisch druckgeprüft.`,")
lines.append("      categoryLabel: config.categoryLabelDe,")
lines.append("      applications: config.appDe,")
lines.append("      features: config.featDe,")
lines.append("      specsSummary: `Kapazität ${volumeStr} | 30 bar Prüfdruck | Robotergeschweißt | Pulverbeschichtet`,")
lines.append("      seoTitle: `${volumeStr} LPG-Gasflasche kaufen | M Gas Werk mgas.ir`,")
lines.append("      seoDescription: `Technische Daten, Abmessungen und Export-Großhandel für ${volumeStr} LPG-Gasflaschen vom Hersteller M Gas.`,")
lines.append("      seoKeywords: [`${volumeStr} Gasflasche`, 'LPG Gaszylinder Hersteller', 'Export Gasflaschen', 'M Gas Werk'],")
lines.append("      imageAlt: `M Gas ${volumeStr} LPG Gasflasche mit Ventilschutz und Einbrennlackierung`,")
lines.append("    },")
lines.append("    ur: {")
lines.append("      name: `ایم گیس ${volumeStr} ایل پی جی سلنڈر`,")
lines.append("      shortDescription: `اعلیٰ پائیداری کا حامل ${volumeStr} ایل پی جی گیس سلنڈر صنعتی اور گھریلو مقاصد کے لیے۔`,")
lines.append("      fullDescription: `ایم گیس فیکٹری کا ${volumeStr} سلنڈر مخصوص پریشر ویسل اسٹیل، روبوٹک ویلڈنگ اور ۹۰۰ ڈگری ہیٹ ٹریٹمنٹ کے ساتھ تیار کیا جاتا ہے اور ۳۰ بار واٹر پریشر پر ٹیسٹ شدہ ہے۔`,")
lines.append("      categoryLabel: config.categoryLabelUr,")
lines.append("      applications: config.appUr,")
lines.append("      features: config.featUr,")
lines.append("      specsSummary: `گنجائش ${volumeStr} | ۳۰ بار ٹیسٹ | روبوٹک ویلڈنگ | پاؤڈر کوٹنگ`,")
lines.append("      seoTitle: `${volumeStr} ایل پی جی گیس سلنڈر خریدیں | ایم گیس فیکٹری mgas.ir`,")
lines.append("      seoDescription: `ایم گیس فیکٹری سے ${volumeStr} ایل پی جی سلنڈر کی تکنیکی تفصیلات، پیمائش اور برآمدی آرڈر۔`,")
lines.append("      seoKeywords: [`${volumeStr} گیس سلنڈر`, 'ایل پی جی سلنڈر مینوفیکچرر', 'ایم گیس'],")
lines.append("      imageAlt: `${volumeStr} ایم گیس ایل پی جی سلنڈر کی تصویر`,")
lines.append("    },")
lines.append("    hy: {")
lines.append("      name: `M Gas ${volumeStr} LPG Գազի Բալոն`,")
lines.append("      shortDescription: `Բարձր ամրության ${volumeStr} գազաբալոն արդյունաբերական և կենցաղային անվտանգ կիրառման համար:`,")
lines.append("      fullDescription: `«M Gas» ${volumeStr} գազաբալոնն արտադրված է ճնշման անոթների հատուկ պողպատից՝ ռոբոտացված եռակցմամբ և 30 բար հիդրոստատիկ փորձարկմամբ:`,")
lines.append("      categoryLabel: config.categoryLabelHy,")
lines.append("      applications: config.appHy,")
lines.append("      features: config.featHy,")
lines.append("      specsSummary: `Տարողություն ${volumeStr} | 30 Բար փորձարկում | Ռոբոտացված եռակցում`,")
lines.append("      seoTitle: `Գնել ${volumeStr} LPG Գազաբալոն | M Gas mgas.ir`,")
lines.append("      seoDescription: `M Gas գործարանի ${volumeStr} LPG գազի բալոնի տեխնիկական բնութագիր, չափսեր և մեծածախ պատվեր:`,")
lines.append("      seoKeywords: [`${volumeStr} գազաբալոն`, 'LPG բալոնների արտադրություն', 'M Gas'],")
lines.append("      imageAlt: `M Gas ${volumeStr} գազի բալոնի լուսանկար`,")
lines.append("    },")
lines.append("    tr: {")
lines.append("      name: `M Gas ${volumeStr} LPG Gaz Tüpü`,")
lines.append("      shortDescription: `Endüstriyel, ticari ve evsel kullanım için uluslararası standartlarda üretilmiş ${volumeStr} LPG gaz tüpü.`,")
lines.append("      fullDescription: `M Gas ${volumeStr} LPG tüpü, basınca dayanıklı derin çekme çeliğinden robotik kaynak teknolojisiyle üretilmiş, 30 bar hidrostatik testten geçmiş ve fırınlanmış elektrostatik toz boya ile kaplanmıştır.`,")
lines.append("      categoryLabel: config.categoryLabelTr,")
lines.append("      applications: config.appTr,")
lines.append("      features: config.featTr,")
lines.append("      specsSummary: `Kapasite ${volumeStr} | 30 Bar Test Basıncı | Robotik Kaynak | Fırın Toz Boya`,")
lines.append("      seoTitle: `${volumeStr} LPG Gaz Tüpü Satın Al | M Gas Fabrikası mgas.ir`,")
lines.append("      seoDescription: `M Gas tarafından üretilen ${volumeStr} LPG çelik gaz tüpü teknik özellikleri, boyutları ve toptan ihracat teklifleri.`,")
lines.append("      seoKeywords: [`${volumeStr} LPG tüpü`, 'gaz tüpü üreticisi', 'toptan gaz tüpleri', 'M Gas'],")
lines.append("      imageAlt: `M Gas ${volumeStr} LPG gaz tüpü görseli`,")
lines.append("    },")
lines.append("    ru: {")
lines.append("      name: `Газовый баллон LPG ${volumeStr} М Газ`,")
lines.append("      shortDescription: `Высоконадежный баллон для сжиженного газа ${volumeStr}, разработанный для промышленного и бытового использования.`,")
lines.append("      fullDescription: `Баллон ${volumeStr} производства завода «М Газ» изготовлен из высокопрочной стали для сосудов под давлением, сварен на роботизированных линиях, прошел отжиг и 100% гидростатический тест под давлением 30 бар.`,")
lines.append("      categoryLabel: config.categoryLabelRu,")
lines.append("      applications: config.appRu,")
lines.append("      features: config.featRu,")
lines.append("      specsSummary: `Объем ${volumeStr} | Давление испытания 30 бар | Роботизированная сварка`,")
lines.append("      seoTitle: `Купить газовый баллон ${volumeStr} LPG | Завод М Газ mgas.ir`,")
lines.append("      seoDescription: `Технические характеристики, габариты и оптовые экспортные поставки газовых баллонов ${volumeStr} LPG от завода М Газ.`,")
lines.append("      seoKeywords: [`баллон ${volumeStr} LPG`, 'производитель газовых баллонов', 'М Газ'],")
lines.append("      imageAlt: `Газовый баллон ${volumeStr} LPG М Газ с порошковым покрытием`,")
lines.append("    },")
lines.append("  };")
lines.append("}")
lines.append("")
lines.append("export const PRODUCTS: Product[] = [")

for p in products:
    cat_fa = 'کارگاه‌ها، کارخانه‌ها و آزمایشگاه‌ها' if p['category'] == 'workshops' else ('خودرو و اتوگاز' if p['category'] == 'automotive' else 'خانگی، پیک‌نیک و پخت‌وپز')
    cat_en = 'Workshops, Factories & Labs' if p['category'] == 'workshops' else ('Automotive LPG' if p['category'] == 'automotive' else 'Home & Cooking / Camping')
    
    app_fa = ['مصارف صنعتی، گرمایشی و کارگاهی', 'کارخانجات و خطوط تولید', 'سیستم‌های گازرسانی استاندارد'] if p['category'] == 'workshops' else (['سیستم‌های دوگانه‌سوز خودرویی', 'تاکسی‌ها و ناوگان حمل‌ونقل', 'مخازن استاندارد ECE R67'] if p['category'] == 'automotive' else ['پخت و پز خانگی و رستورانی', 'کمپینگ، مسافرت و پیکنیک', 'سیستم‌های گرمایشی مستقل'])
    app_en = ['Heavy industrial & thermal applications', 'Manufacturing & fabrication lines', 'Certified gas manifold systems'] if p['category'] == 'workshops' else (['Automotive OEM dual-fuel retrofits', 'Taxi & transit fleet conversions', 'ECE R67 certified vehicle tanks'] if p['category'] == 'automotive' else ['Domestic kitchen cooking ranges', 'Outdoor camping & travel burners', 'Independent space & water heating'])
    
    feat_fa = ['تست هیدرواستاتیک ۱۰۰٪ با فشار ۳۰ بار', 'جوشکاری تمام اتوماتیک زیرپودری', 'پوشش رنگ الکترواستاتیک کوره‌ای مقاوم']
    feat_en = ['100% Hydrostatic Proof Tested at 30 Bar', 'Fully Automated Submerged Arc Welding', 'Oven-Baked Electrostatic Powder Coating']
    
    gallery_list = p.get('gallery', [p['refImg']])
    gallery_str = json.dumps(gallery_list)

    lines.append("  {")
    lines.append(f"    id: '{p['id']}',")
    lines.append(f"    slug: '{p['slug']}',")
    lines.append(f"    category: '{p['category']}',")
    lines.append(f"    volume: {p['volume']},")
    lines.append(f"    volumeUnit: '{p['volumeUnit']}',")
    lines.append(f"    emptyWeightKg: {p['emptyWeightKg']},")
    lines.append(f"    circleDiameterCm: {p['circleDiameterCm']},")
    lines.append(f"    heightCm: {p['heightCm']},")
    lines.append(f"    minOrder: {p['minOrder']},")
    lines.append(f"    unitPriceUsd: {p['unitPriceUsd']},")
    lines.append(f"    testPressureBar: {p['testPressureBar']},")
    lines.append(f"    workingPressureBar: {p['workingPressureBar']},")
    lines.append(f"    bodyThicknessMm: {p['bodyThicknessMm']},")
    lines.append(f"    material: '{p['material']}',")
    lines.append(f"    valveStandard: '{p['valveStandard']}',")
    lines.append(f"    coating: '{p['coating']}',")
    lines.append(f"    isPopular: {str(p.get('isPopular', False)).lower()},")
    lines.append(f"    isNew: {str(p.get('isNew', False)).lower()},")
    lines.append(f"    defaultRalCode: '{p['defaultRalCode']}',")
    lines.append(f"    cylinderColor: '{p['cylinderColor']}',")
    lines.append(f"    image: '{p['refImg']}',")
    lines.append("    images: {")
    lines.append(f"      front: '{p['refImg']}',")
    lines.append(f"      perspective: '{p['refImg']}',")
    lines.append(f"      valveDetail: '{p['refImg']}',")
    lines.append(f"      referenceReal: '{p['refImg']}',")
    lines.append(f"      gallery: {gallery_str}")
    lines.append("    },")
    lines.append("    locales: createProductLocales({")
    lines.append(f"      volumeStr: '{p['volStr']}',")
    lines.append(f"      categoryLabelFa: '{cat_fa}',")
    lines.append(f"      categoryLabelEn: '{cat_en}',")
    lines.append(f"      categoryLabelAr: '{cat_fa}',")
    lines.append(f"      categoryLabelDe: '{cat_en}',")
    lines.append(f"      categoryLabelUr: '{cat_fa}',")
    lines.append(f"      categoryLabelHy: '{cat_en}',")
    lines.append(f"      categoryLabelTr: '{cat_en}',")
    lines.append(f"      categoryLabelRu: '{cat_en}',")
    lines.append(f"      appFa: {json.dumps(app_fa, ensure_ascii=False)},")
    lines.append(f"      appEn: {json.dumps(app_en, ensure_ascii=False)},")
    lines.append(f"      appAr: {json.dumps(app_fa, ensure_ascii=False)},")
    lines.append(f"      appDe: {json.dumps(app_en, ensure_ascii=False)},")
    lines.append(f"      appUr: {json.dumps(app_fa, ensure_ascii=False)},")
    lines.append(f"      appHy: {json.dumps(app_en, ensure_ascii=False)},")
    lines.append(f"      appTr: {json.dumps(app_en, ensure_ascii=False)},")
    lines.append(f"      appRu: {json.dumps(app_en, ensure_ascii=False)},")
    lines.append(f"      featFa: {json.dumps(feat_fa, ensure_ascii=False)},")
    lines.append(f"      featEn: {json.dumps(feat_en, ensure_ascii=False)},")
    lines.append(f"      featAr: {json.dumps(feat_fa, ensure_ascii=False)},")
    lines.append(f"      featDe: {json.dumps(feat_en, ensure_ascii=False)},")
    lines.append(f"      featUr: {json.dumps(feat_fa, ensure_ascii=False)},")
    lines.append(f"      featHy: {json.dumps(feat_en, ensure_ascii=False)},")
    lines.append(f"      featTr: {json.dumps(feat_en, ensure_ascii=False)},")
    lines.append(f"      featRu: {json.dumps(feat_en, ensure_ascii=False)},")
    lines.append("    })")
    lines.append("  },")

lines.append("];")
lines.append("")
lines.append("export function getProductById(id: string): Product | undefined {")
lines.append("  return PRODUCTS.find((p) => p.id === id);")
lines.append("}")
lines.append("")
lines.append("export function getProductBySlug(slug: string): Product | undefined {")
lines.append("  return PRODUCTS.find((p) => p.slug === slug);")
lines.append("}")
lines.append("")

with open('src/data/products.ts', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print('Wrote src/data/products.ts with', len(products), 'products')
