import { LanguageCode } from '../types';

export interface HeaderNavSubitem {
  label: string;
  desc: string;
}

export interface PageTranslations {
  // Navigation Menus
  navHome: string;
  navProductsAll: string;
  navProductsAllDesc: string;
  navProductsDomestic: string;
  navProductsDomesticDesc: string;
  navProductsIndustrial: string;
  navProductsIndustrialDesc: string;
  navProductsAuto: string;
  navProductsAutoDesc: string;

  navQualityIso: string;
  navQualityIsoDesc: string;
  navQualityVideoTour: string;
  navQualityVideoTourDesc: string;

  navArticlesStandards: string;
  navArticlesStandardsDesc: string;
  navArticlesSafety: string;
  navArticlesSafetyDesc: string;

  navAboutHeritage: string;
  navAboutHeritageDesc: string;
  navAboutFaq: string;
  navAboutFaqDesc: string;
  navAboutRfq: string;
  navAboutRfqDesc: string;
  navAboutContact: string;
  navAboutContactDesc: string;

  // Products Page
  productsBreadcrumb: string;
  productsBadge: string;
  productsMainTitle: string;
  productsHeroDesc: string;
  searchPlaceholder: string;
  popularBadge: string;
  realPhotoBadge: string;
  realPlusRenderBadge: string;
  viewSpecsBtn: string;

  // Product Detail Page
  detailBreadcrumbHome: string;
  detailBreadcrumbStore: string;
  detailPressureTestedBadge: string;
  detailShowBlueprint: string;
  detailShowAngles: string;
  detailCustomColor: string;
  detailResetColor: string;
  detailCertifiedBadge: string;
  detailSpecsHeader: string;
  detailWallThickness: string;
  detailValveStandard: string;
  detailSteelGrade: string;
  detailUnitPcs: string;
  detailFeaturesTitle: string;
  detailAddToRfq: string;
  detailWhatsAppSales: string;
  detailBlueprintHeading: string;
  detailRelatedProducts: string;

  // Factory Video Tour
  tourBadge: string;
  tourTitlePart1: string;
  tourTitleHighlight: string;
  tourDesc: string;
  tourStandardBadge: string;
  tourPlaylistTitle: string;
  tourPlayTooltip: string;
  tourPauseTooltip: string;
  tourMuteTooltip: string;
  tourUnmuteTooltip: string;
  tourFullscreenTooltip: string;

  // Customer Brands Strip
  brandsBadge: string;
  brandsHeadline: string;

  // Catalog Modal
  catalogEditionBadge: string;
  catalogModalTitle: string;
  catalogModalDesc: string;
  catalogFeature1: string;
  catalogFeature2: string;
  catalogFeature3: string;
  catalogFeature4: string;
  catalogDownloadBtn: string;
  catalogGeneratingPdf: string;
  catalogDownloadSuccess: string;
  catalogDirectInquiry: string;

  // Technical Specs Modal & RAL
  specsModalAnglesTab: string;
  specsModalBlueprintTab: string;
  specsModalGalleryTab: string;
  specsColorCoatingNote: string;
  specsColorsFound: string;
  allTopics: string;
  copiedTooltip: string;
  procurementCalloutTitle: string;
  procurementCalloutDesc: string;

  // RFQ Calculator
  rfqBadge: string;
  rfqTitle: string;
  rfqDesc: string;
  rfqAddTitle: string;
  rfqModelLabel: string;
  rfqQuantityLabel: string;
  rfqAddBtn: string;
  rfqBuyerInfoTitle: string;
  rfqNamePlaceholder: string;
  rfqCompanyPlaceholder: string;
  rfqDestPlaceholder: string;
  rfqSummaryTitle: string;
  rfqClearBtn: string;
  rfqEmptyText: string;
  rfqTotalUnits: string;
  rfqTotalWeight: string;
  rfqTonsUnit: string;
  rfqContainerEstimate: string;
  rfqSubmitWhatsApp: string;

  // FAQ Section
  faqBadge: string;
  faqTitle: string;
  faqUnlistedTitle: string;
  faqUnlistedDesc: string;
  faqChatWhatsApp: string;

  // Footer & Contact
  footerCatalogBrochureDesc: string;
  footerDownloadFreePdf: string;
  contactMessagePlaceholder: string;
  contactMobileHotline: string;
  contactFactoryLandline: string;

  // RAL Color Modal
  ralModalTitle: string;
  ralModalDesc: string;
  ralSearchPlaceholder: string;
  ralClear: string;

  // Hero Zoom Banner
  heroBannerLabel: string;
  heroPrevBanner: string;
  heroNextBanner: string;
  heroClose: string;
}

export const PAGE_TRANSLATIONS: Record<LanguageCode, PageTranslations> = {
  // ================= FA (Persian) =================
  fa: {
    navHome: 'خانه',
    navProductsAll: 'کاتالوگ جامع کپسول‌ها',
    navProductsAllDesc: 'مشاهده مشخصات تمام ۱۳ مدل گاز مایع',
    navProductsDomestic: 'خانگی و پیکنیک',
    navProductsDomesticDesc: '۰.۵ تا ۱۱ کیلوگرم استاندارد',
    navProductsIndustrial: 'صنعتی و کارگاهی',
    navProductsIndustrialDesc: '۲۵ تا ۵۰ کیلوگرم فشار قوی',
    navProductsAuto: 'مخازن خودرویی اتوگاز',
    navProductsAutoDesc: 'مخازن ۶۰ لیتر استاندارد خودرو',

    navQualityIso: 'استانداردها و کنترل کیفیت',
    navQualityIsoDesc: 'ISO 9001 و آزمون هیدرواستاتیک ۳۰ بار',
    navQualityVideoTour: 'مستند ویدئویی خطوط تولید',
    navQualityVideoTourDesc: 'بازدید مدیر کارخانه (آقای موسی عمویی)',

    navArticlesStandards: 'استانداردهای مهندسی و ساخت',
    navArticlesStandardsDesc: 'تحلیل متالورژی، جوشکاری و PWHT',
    navArticlesSafety: 'مدیریت، نگهداری و حمل‌ونقل',
    navArticlesSafetyDesc: 'NFPA 58، OSHA و استانداردهای ADR',

    navAboutHeritage: 'درباره کارخانه و بنیانگذار',
    navAboutHeritageDesc: 'تأسیس از سال ۱۳۴۹ (مدیریت موسی عمویی)',
    navAboutFaq: 'پرسش‌های متداول',
    navAboutFaqDesc: 'پاسخ به سوالات فنی و بازرگانی صادرات',
    navAboutRfq: 'استعلام قیمت و کانتینربندی',
    navAboutRfqDesc: 'محاسبه کانتینر ۲۰ و ۴۰ فوت',
    navAboutContact: 'تماس و صادرات',
    navAboutContactDesc: 'تماس با واحد فروش و آدرس کارخانه کرج',

    productsBreadcrumb: 'فروشگاه و کاتالوگ محصولات',
    productsBadge: 'کمپانی تولید سیلندر گاز مایع در ایران | کاتالوگ رسمی کارخانه ام گاز',
    productsMainTitle: 'کاتالوگ و فروشگاه کمپانی تولید سیلندر گاز مایع در ایران',
    productsHeroDesc: 'مجموعه کامل ۱۳ مدل کپسول گاز مایع از ۰.۵ تا ۶۰ لیتری و مخازن استاندارد اتوگاز خودرو، تولید شده در برترین کمپانی تولید سیلندر گاز مایع در ایران با گواهی استاندارد ملی ISIRI 841، آزمون ۱۰۰٪ هیدرواستاتیک ۳۰ بار و جوشکاری اتوماتیک زیرپودری.',
    searchPlaceholder: 'جستجوی مدل، ظرفیت یا وزن...',
    popularBadge: 'پرفروش‌ترین',
    realPhotoBadge: 'عکس واقعی',
    realPlusRenderBadge: 'عکس واقعی + رندر ۲',
    viewSpecsBtn: 'مشاهده مشخصات فنی',

    detailBreadcrumbHome: 'صفحه اصلی',
    detailBreadcrumbStore: 'فروشگاه و کاتالوگ',
    detailPressureTestedBadge: 'آزمون فشار ۳۰ بار تایید شده',
    detailShowBlueprint: 'نمایش نقشه مهندسی',
    detailShowAngles: 'نمایش عکس سیلندر',
    detailCustomColor: 'انتخاب رنگ سفارشی RAL',
    detailResetColor: 'تنظیم مجدد',
    detailCertifiedBadge: 'کمپانی تولید سیلندر گاز مایع در ایران | استاندارد ملی ISIRI 841',
    detailSpecsHeader: 'مشخصات فنی و استانداردهای متالورژی',
    detailWallThickness: 'ضخامت ورق بدنه',
    detailValveStandard: 'استاندارد شیر',
    detailSteelGrade: 'گرید فولاد',
    detailUnitPcs: 'عدد',
    detailFeaturesTitle: 'ویژگی‌های فنی و کاربردهای تایید شده:',
    detailAddToRfq: 'افزودن به پیش‌فاکتور و استعلام رسمی (RFQ)',
    detailWhatsAppSales: 'استعلام فوری در واتس‌اپ مدیر فروش',
    detailBlueprintHeading: 'نقشه مهندسی و ابعاد استاندارد',
    detailRelatedProducts: 'سایر محصولات کاتالوگ',

    tourBadge: 'تور تصویری و مستند خطوط تولید',
    tourTitlePart1: 'مشاهده مستقیم',
    tourTitleHighlight: 'فرآیند تولید و کارخانه',
    tourDesc: 'بازدید از سالن‌های مجهز قالب‌گیری، پرس‌های تناژ بالا، ربات‌های جوشکاری استاندارد و نظارت مستقیم مدیریت کارخانه بر کیفیت کپسول‌ها',
    tourStandardBadge: 'استاندارد معتبر ISO و ملی',
    tourPlaylistTitle: 'فهرست ویدیوهای کارخانه (۴ ویدیو)',
    tourPlayTooltip: 'پخش',
    tourPauseTooltip: 'توقف',
    tourMuteTooltip: 'بی‌صدا',
    tourUnmuteTooltip: 'صدا',
    tourFullscreenTooltip: 'تمام‌صفحه',

    brandsBadge: 'مشتریان عمده و طرف‌های تجاری',
    brandsHeadline: 'تأمین‌کننده مورد اعتماد صنایع بزرگ و خودروسازان',

    catalogEditionBadge: 'نسخه رسمی ۲۰۲۶',
    catalogModalTitle: 'دریافت کاتالوگ جامع محصولات و مشخصات فنی',
    catalogModalDesc: 'شامل مشخصات مهندسی تمام ۱۳ مدل کپسول، گواهینامه‌های ISO و EN 1442، کدهای رنگ RAL و شرایط ارسال صادراتی',
    catalogFeature1: '۱۳ مدل کپسول (خانگی، صنعتی، خودرویی)',
    catalogFeature2: 'نتایج آزمون هیدرواستاتیک ۳۰ بار و گواهی متالورژی',
    catalogFeature3: 'ظرفیت بارگیری در کانتینر ۲۰ و ۴۰ فوت های‌کیوب',
    catalogFeature4: 'کاتالوگ رنگ‌های سفارشی پودری الکترواستاتیک RAL',
    catalogDownloadBtn: 'دانلود کاتالوگ اختصاصی PDF',
    catalogGeneratingPdf: 'در حال آماده‌سازی و دانلود کاتالوگ...',
    catalogDownloadSuccess: 'کاتالوگ با موفقیت آماده و دانلود شد!',
    catalogDirectInquiry: 'استعلام قیمت و سفارش عمده در واتس‌اپ',

    specsModalAnglesTab: 'زوایای محصول و کاتالوگ رنگ (4:3)',
    specsModalBlueprintTab: 'نقشه فنی و مهندسی',
    specsModalGalleryTab: 'گالری عکس کارخانه',
    specsColorCoatingNote: 'پوشش رنگ کلیه سیلندرها با ضخامت ۸۰ الی ۱۲۰ میکرون در کوره ۱۸۰ درجه پخت می‌شود.',
    specsColorsFound: 'رنگ یافت شد',
    allTopics: 'همه موضوعات',
    copiedTooltip: 'کپی شد',
    procurementCalloutTitle: 'سفارش سیلندر استاندارد',
    procurementCalloutDesc: 'تولید کپسول مطابق کدهای EN 1442 و DOT-4BA',
    rfqBadge: 'استعلام قیمت آنلاین و بارگیری کانتینری',
    rfqTitle: 'محاسبه‌گر تیراژ، وزن و ارسال استعلام به کارخانه',
    rfqDesc: 'محصولات و تیراژ مورد نظر را انتخاب نمایید تا تناژ بار و ظرفیت کانتینری به طور خودکار محاسبه و پیش‌فاکتور برای واحد فروش ارسال گردد.',
    rfqAddTitle: 'انتخاب مدل سیلندر و تعداد',
    rfqModelLabel: 'نوع کپسول گاز / مخزن:',
    rfqQuantityLabel: 'تیراژ مورد نظر (عدد):',
    rfqAddBtn: 'افزودن به لیست استعلام',
    rfqBuyerInfoTitle: 'اطلاعات اختیاری خریدار (جهت صدور پیش‌فاکتور)',
    rfqNamePlaceholder: 'نام و نام خانوادگی',
    rfqCompanyPlaceholder: 'نام شرکت یا بازرگانی',
    rfqDestPlaceholder: 'کشور و شهر مقصد تخلیه بار',
    rfqSummaryTitle: 'اقلام انتخابی پیش‌فاکتور',
    rfqClearBtn: 'پاک‌کردن',
    rfqEmptyText: 'هنوز آیتمی به لیست اضافه نشده است. لطفاً ابتدا مدلی را انتخاب کنید.',
    rfqTotalUnits: 'مجموع تیراژ',
    rfqTotalWeight: 'وزن کل بار',
    rfqTonsUnit: 'تن',
    rfqContainerEstimate: 'تخمین کانتینر ۴۰HQ',
    rfqSubmitWhatsApp: 'ارسال رسمی استعلام به مدیر صادرات (واتس‌اپ)',
    faqBadge: 'سوالات متداول مشتریان و بازرگانان',
    faqTitle: 'پاسخ به سوالات فنی، تولید و صادرات',
    faqUnlistedTitle: 'سوالی دارید که در لیست بالا نیست؟',
    faqUnlistedDesc: 'کارشناسان فنی و مدیر فروش بین‌الملل آماده پاسخگویی هستند.',
    faqChatWhatsApp: 'گفتگو در واتس‌اپ',
    footerCatalogBrochureDesc: 'دانلود دفترچه رسمی مشخصات فنی و جدول ظرفیت کپسول‌ها',
    footerDownloadFreePdf: 'دریافت رایگان فایل PDF',
    contactMessagePlaceholder: 'لطفاً تناژ، ظرفیت مخازن یا مشخصات سفارش خود را بنویسید...',
    contactMobileHotline: 'خط ویژه همراه',
    contactFactoryLandline: 'تلفن ثابت کارخانه',
    ralModalTitle: 'کاتالوگ رنگ‌های پودری الکترواستاتیک RAL',
    ralModalDesc: 'انتخاب رنگ سفارشی کوره‌ای طبق استاندارد بین‌المللی رال',
    ralSearchPlaceholder: 'جستجو بر اساس کد (مثلاً 6018 یا RAL 5015) یا نام رنگ...',
    ralClear: 'پاک کردن',
    heroBannerLabel: 'بنر',
    heroPrevBanner: 'بنر قبلی',
    heroNextBanner: 'بنر بعدی',
    heroClose: 'بستن',
  },

  // ================= EN (English) =================
  en: {
    navHome: 'Home',
    navProductsAll: 'Complete Cylinder Catalog',
    navProductsAllDesc: 'Explore all 13 certified LPG models',
    navProductsDomestic: 'Domestic & Camping',
    navProductsDomesticDesc: '0.5kg – 11kg certified cylinders',
    navProductsIndustrial: 'Industrial & Workshop',
    navProductsIndustrialDesc: '25kg – 50kg heavy-duty vessels',
    navProductsAuto: 'Automotive LPG Tanks',
    navProductsAutoDesc: '60L certified autogas tanks',

    navQualityIso: 'Quality & ISO Standards',
    navQualityIsoDesc: 'ISO 9001 & 30-Bar Hydrostatic Testing',
    navQualityVideoTour: 'Factory Video Tour',
    navQualityVideoTourDesc: 'Production lines tour with GM Mousa Amooie',

    navArticlesStandards: 'Manufacturing Standards',
    navArticlesStandardsDesc: 'Metallurgy, SAW welding & PWHT analysis',
    navArticlesSafety: 'Storage & Logistics Safety',
    navArticlesSafetyDesc: 'NFPA 58, OSHA & ADR compliance',

    navAboutHeritage: 'Factory Heritage & Founder',
    navAboutHeritageDesc: 'Established 1970 (50+ years experience)',
    navAboutFaq: 'FAQ & Export Certification',
    navAboutFaqDesc: 'Technical & export questions answered',
    navAboutRfq: 'Online RFQ Calculator',
    navAboutRfqDesc: '20ft & 40ft container loading estimation',
    navAboutContact: 'Export & Karaj Factory Desk',
    navAboutContactDesc: 'Global sales team & factory location',

    productsBreadcrumb: 'Products Store & Catalog',
    productsBadge: 'Premier LPG Cylinder Manufacturing Company in Iran | Official Store',
    productsMainTitle: 'LPG Gas Cylinders Store & Complete Engineering Catalog',
    productsHeroDesc: 'Explore the full portfolio of 13 certified LPG cylinders (0.5L to 60L) and automotive autogas tanks manufactured by Iran’s leading LPG cylinder manufacturing company under ISO 9001 and strict 30-bar pressure proof testing.',
    searchPlaceholder: 'Search cylinder model, capacity or weight...',
    popularBadge: 'Popular',
    realPhotoBadge: 'Real Photo',
    realPlusRenderBadge: 'Real + 3D Render',
    viewSpecsBtn: 'View Specifications',

    detailBreadcrumbHome: 'Home',
    detailBreadcrumbStore: 'Products Store',
    detailPressureTestedBadge: '30-Bar Pressure Proof Tested',
    detailShowBlueprint: 'View Blueprint',
    detailShowAngles: 'Show 3D Angles',
    detailCustomColor: 'Custom RAL Color',
    detailResetColor: 'Reset',
    detailCertifiedBadge: 'Certified by Top LPG Cylinder Manufacturing Company in Iran | ISIRI 841',
    detailSpecsHeader: 'Technical Specifications & Metallurgy',
    detailWallThickness: 'Wall Thickness',
    detailValveStandard: 'Valve Standard',
    detailSteelGrade: 'Steel Grade',
    detailUnitPcs: 'pcs',
    detailFeaturesTitle: 'Engineering Features & Verified Applications:',
    detailAddToRfq: 'Add to RFQ & Request Formal Quote',
    detailWhatsAppSales: 'WhatsApp Sales Manager',
    detailBlueprintHeading: 'Technical Blueprint & Engineering Dimensions',
    detailRelatedProducts: 'Related Cylinders in Catalog',

    tourBadge: 'Factory Video Tour & Production Process',
    tourTitlePart1: 'Inside',
    tourTitleHighlight: 'M Gas Factory & Production Lines',
    tourDesc: 'Explore our high-tonnage hydraulic presses, automated submerged arc welding lines, oven powder coating, and executive leadership supervision.',
    tourStandardBadge: 'ISO & ISIRI Certified',
    tourPlaylistTitle: 'Factory Video Gallery (4 Videos)',
    tourPlayTooltip: 'Play',
    tourPauseTooltip: 'Pause',
    tourMuteTooltip: 'Mute',
    tourUnmuteTooltip: 'Unmute',
    tourFullscreenTooltip: 'Fullscreen',

    brandsBadge: 'OEM & Major Industrial Partners',
    brandsHeadline: 'Trusted by Leading Automotive & Gas Corporations',

    catalogEditionBadge: 'Official 2026 Edition',
    catalogModalTitle: 'Download Official LPG Cylinders Catalog',
    catalogModalDesc: 'Comprehensive guide covering 13 cylinder models, ISO/EN certifications, RAL color charts, and container logistics.',
    catalogFeature1: '13 Cylinder Models (Domestic, Industrial, Automotive)',
    catalogFeature2: '30-Bar Hydrostatic Test Data & Metallurgy Sheets',
    catalogFeature3: '20ft & 40ft HQ Container Stuffing Capacities',
    catalogFeature4: 'RAL Electrostatic Powder Coating Color Chart',
    catalogDownloadBtn: 'Download PDF Catalog',
    catalogGeneratingPdf: 'Generating and downloading catalog...',
    catalogDownloadSuccess: 'Catalog downloaded successfully!',
    catalogDirectInquiry: 'Wholesale Inquiry via WhatsApp',

    specsModalAnglesTab: '3-Angle Views & RAL Colors (4:3)',
    specsModalBlueprintTab: 'Technical Blueprint',
    specsModalGalleryTab: 'Factory Gallery',
    specsColorCoatingNote: 'All cylinders are coated with 80-120μm electrostatic powder, baked at 180°C.',
    specsColorsFound: 'colors found',
    allTopics: 'All Topics',
    copiedTooltip: 'Copied',
    procurementCalloutTitle: 'Standard Cylinder Procurement',
    procurementCalloutDesc: 'Certified manufacturing per EN 1442 & DOT-4BA',
    rfqBadge: 'Interactive RFQ & Logistics Estimator',
    rfqTitle: 'Instant Bulk RFQ & Container Loadout Calculator',
    rfqDesc: 'Select your required gas cylinder models, capacities and volumes to estimate total tonnage, container loads and directly request official factory pricing.',
    rfqAddTitle: 'Add Cylinder to RFQ',
    rfqModelLabel: 'Cylinder Model & Capacity:',
    rfqQuantityLabel: 'Required Quantity (pcs):',
    rfqAddBtn: 'Add to Order List',
    rfqBuyerInfoTitle: 'Optional Buyer Details for Proforma',
    rfqNamePlaceholder: 'Full Name',
    rfqCompanyPlaceholder: 'Company Name',
    rfqDestPlaceholder: 'Destination Port / Country',
    rfqSummaryTitle: 'RFQ Items & Logistics Summary',
    rfqClearBtn: 'Clear',
    rfqEmptyText: 'No cylinders added yet. Select a model above to begin.',
    rfqTotalUnits: 'Total Units',
    rfqTotalWeight: 'Total Weight',
    rfqTonsUnit: 'tons',
    rfqContainerEstimate: '40HQ Load',
    rfqSubmitWhatsApp: 'Submit Official RFQ via WhatsApp',
    faqBadge: 'Frequently Asked Questions',
    faqTitle: 'Technical Specifications & Export Logistics FAQ',
    faqUnlistedTitle: 'Have a custom inquiry or special technical requirement?',
    faqUnlistedDesc: 'Our engineering and export dispatch desks are available 24/7.',
    faqChatWhatsApp: 'Chat on WhatsApp',
    footerCatalogBrochureDesc: 'Download official technical product brochure & dimensions guide',
    footerDownloadFreePdf: 'Download Catalog PDF',
    contactMessagePlaceholder: 'Please specify cylinder capacities, quantity, or requirements...',
    contactMobileHotline: 'Mobile Hotline',
    contactFactoryLandline: 'Factory Landline',
    ralModalTitle: 'RAL Electrostatic Powder Color Chart',
    ralModalDesc: 'Select certified electrostatic oven-cured coating according to international RAL standards',
    ralSearchPlaceholder: 'Search by RAL code (e.g. 6018 or RAL 5015) or color name...',
    ralClear: 'Clear',
    heroBannerLabel: 'Banner',
    heroPrevBanner: 'Previous Banner',
    heroNextBanner: 'Next Banner',
    heroClose: 'Close',
  },

  // ================= DE (German) =================
  de: {
    navHome: 'Start',
    navProductsAll: 'Vollständiger Gasflaschenkatalog',
    navProductsAllDesc: 'Alle 13 zertifizierten LPG-Modelle ansehen',
    navProductsDomestic: 'Haushalt & Camping',
    navProductsDomesticDesc: '0,5 kg bis 11 kg Gasflaschen',
    navProductsIndustrial: 'Industrie & Werkstatt',
    navProductsIndustrialDesc: '25 kg bis 50 kg Hochleistungsflaschen',
    navProductsAuto: 'Auto-LPG-Tanks',
    navProductsAutoDesc: '60L zertifizierte Autogastanks',

    navQualityIso: 'Qualitäts- & ISO-Normen',
    navQualityIsoDesc: 'ISO 9001 & 30-Bar hydrostatische Druckprüfung',
    navQualityVideoTour: 'Werks-Videorundgang',
    navQualityVideoTourDesc: 'Fertigungslinien mit GF Mousa Amooie',

    navArticlesStandards: 'Fertigungsstandards',
    navArticlesStandardsDesc: 'Metallurgie, Unterpulverschweißen & PWHT',
    navArticlesSafety: 'Lagerung & Transportsicherheit',
    navArticlesSafetyDesc: 'NFPA 58, OSHA & ADR Richtlinien',

    navAboutHeritage: 'Tradition & Unternehmensgründer',
    navAboutHeritageDesc: 'Gegründet 1970 (über 50 Jahre Erfahrung)',
    navAboutFaq: 'Häufig gestellte Fragen (FAQ)',
    navAboutFaqDesc: 'Antworten zu Technik und Export',
    navAboutRfq: 'Online-RFQ-Kalkulator',
    navAboutRfqDesc: 'Berechnung für 20ft & 40ft Container',
    navAboutContact: 'Kontakt & Exportabteilung',
    navAboutContactDesc: 'Vertriebsteam & Fabrikstandort Karadsch',

    productsBreadcrumb: 'Produkte & Katalog',
    productsBadge: 'Führender Hersteller von Flüssiggasflaschen im Iran | Offizieller Shop',
    productsMainTitle: 'LPG Gasflaschen Katalog & Vollständiges Sortiment',
    productsHeroDesc: 'Entdecken Sie das gesamte Portfolio von 13 zertifizierten LPG-Gasflaschen (0,5L bis 60L) und Autogastanks, gefertigt vom führenden Flüssiggasflaschen-Hersteller im Iran nach ISO 9001 mit 30-Bar-Druckprüfung.',
    searchPlaceholder: 'Modell, Kapazität oder Gewicht suchen...',
    popularBadge: 'Bestseller',
    realPhotoBadge: 'Werksfoto',
    realPlusRenderBadge: 'Werksfoto + 3D',
    viewSpecsBtn: 'Spezifikationen ansehen',

    detailBreadcrumbHome: 'Start',
    detailBreadcrumbStore: 'Produkte',
    detailPressureTestedBadge: '30 Bar hydrostatisch geprüft',
    detailShowBlueprint: 'Zeichnung anzeigen',
    detailShowAngles: '3D-Ansichten',
    detailCustomColor: 'RAL-Wunschfarbe',
    detailResetColor: 'Zurücksetzen',
    detailCertifiedBadge: 'Zertifiziert durch führenden LPG-Flaschenhersteller im Iran | ISIRI 841',
    detailSpecsHeader: 'Technische Daten & Werkstoffnormen',
    detailWallThickness: 'Wandstärke',
    detailValveStandard: 'Ventilnorm',
    detailSteelGrade: 'Stahlsorte',
    detailUnitPcs: 'Stück',
    detailFeaturesTitle: 'Technische Merkmale & zertifizierte Anwendungen:',
    detailAddToRfq: 'Zum RFQ hinzufügen & Angebot anfordern',
    detailWhatsAppSales: 'WhatsApp Exportleitung',
    detailBlueprintHeading: 'Technische Zeichnung & Konstruktionsmaße',
    detailRelatedProducts: 'Weitere Gasflaschen im Katalog',

    tourBadge: 'Werks-Videorundgang & Fertigungsprozess',
    tourTitlePart1: 'Einblick in die',
    tourTitleHighlight: 'M-Gas Fabrik & Produktionslinien',
    tourDesc: 'Besichtigen Sie unsere hydraulischen Tiefziehpressen, automatisierte Schweißstraßen, Pulverbeschichtung und die direkte Qualitätskontrolle.',
    tourStandardBadge: 'ISO & ISIRI zertifiziert',
    tourPlaylistTitle: 'Werks-Videogalerie (4 Videos)',
    tourPlayTooltip: 'Abspielen',
    tourPauseTooltip: 'Pause',
    tourMuteTooltip: 'Stumm',
    tourUnmuteTooltip: 'Ton an',
    tourFullscreenTooltip: 'Vollbild',

    brandsBadge: 'Industriepartner & Großkunden',
    brandsHeadline: 'Vertrauenswürdiger Zulieferer für Automobil- & Gasindustrie',

    catalogEditionBadge: 'Offizielle Ausgabe 2026',
    catalogModalTitle: 'Offiziellen LPG-Gasflaschenkatalog herunterladen',
    catalogModalDesc: 'Umfassendes Handbuch mit allen 13 Modellen, ISO/EN-Zertifikaten, RAL-Farbtabelle und Frachtkapazitäten.',
    catalogFeature1: '13 Gasflaschenmodelle (Haushalt, Industrie, Auto)',
    catalogFeature2: '30-Bar-Druckprüfdaten & Materialanalysen',
    catalogFeature3: 'Beladungskapazitäten für 20ft & 40ft HQ Container',
    catalogFeature4: 'Elektrostatische RAL-Pulverbeschichtungstabelle',
    catalogDownloadBtn: 'Katalog als PDF herunterladen',
    catalogGeneratingPdf: 'Katalog wird vorbereitet und heruntergeladen...',
    catalogDownloadSuccess: 'Katalog erfolgreich heruntergeladen!',
    catalogDirectInquiry: 'Großhandelsanfrage via WhatsApp',

    specsModalAnglesTab: '3-Winkel-Ansichten & RAL-Farben (4:3)',
    specsModalBlueprintTab: 'Technische Zeichnung',
    specsModalGalleryTab: 'Werksgalerie',
    specsColorCoatingNote: 'Alle Zylinder werden mit 80–120 µm elektrostatischem Pulver beschichtet und bei 180 °C eingebrannt.',
    specsColorsFound: 'Farben gefunden',
    allTopics: 'Alle Themen',
    copiedTooltip: 'Kopiert',
    procurementCalloutTitle: 'Standard-Gasflaschenbestellung',
    procurementCalloutDesc: 'Zertifizierte Fertigung nach EN 1442 und DOT-4BA',
    rfqBadge: 'Interaktiver Preisanfrage- & Logistik-Kalkulator',
    rfqTitle: 'Mengen-, Gewichts- & Containerrechner für Werksanfragen',
    rfqDesc: 'Wählen Sie gewünschte Gasflaschenmodelle und Stückzahlen, um Gesamtgewicht, Containerauslastung und ein offizielles Werksangebot direkt anzufragen.',
    rfqAddTitle: 'Flaschenmodell und Menge auswählen',
    rfqModelLabel: 'Flaschentyp / Behälter:',
    rfqQuantityLabel: 'Gewünschte Stückzahl (Stück):',
    rfqAddBtn: 'Zur Anfrage hinzufügen',
    rfqBuyerInfoTitle: 'Optionale Käuferangaben (für Proforma-Rechnung)',
    rfqNamePlaceholder: 'Vollständiger Name',
    rfqCompanyPlaceholder: 'Firmenname / Unternehmen',
    rfqDestPlaceholder: 'Bestimmungsland / Zielhafen',
    rfqSummaryTitle: 'Ausgewählte Positionen & Logistikübersicht',
    rfqClearBtn: 'Zurücksetzen',
    rfqEmptyText: 'Bislang keine Artikel hinzugefügt. Wählen Sie oben ein Modell aus.',
    rfqTotalUnits: 'Gesamtstückzahl',
    rfqTotalWeight: 'Gesamtgewicht',
    rfqTonsUnit: 'Tonnen',
    rfqContainerEstimate: 'Auslastung 40HQ-Container',
    rfqSubmitWhatsApp: 'Offizielle Anfrage per WhatsApp an den Exportleiter senden',
    faqBadge: 'Häufig gestellte Fragen von Kunden und Händlern',
    faqTitle: 'Antworten zu Technik, Fertigung und Exportlogistik',
    faqUnlistedTitle: 'Haben Sie eine Frage, die hier nicht aufgeführt ist?',
    faqUnlistedDesc: 'Unsere Fachingenieure und die Exportabteilung stehen Ihnen jederzeit zur Verfügung.',
    faqChatWhatsApp: 'Chat über WhatsApp',
    footerCatalogBrochureDesc: 'Offiziellen technischen Produktkatalog und Abmessungsleitfaden herunterladen',
    footerDownloadFreePdf: 'Katalog-PDF kostenlos herunterladen',
    contactMessagePlaceholder: 'Bitte Tonnage, Flaschenvolumen oder besondere Anforderungen angeben...',
    contactMobileHotline: 'Direkte Mobil-Hotline',
    contactFactoryLandline: 'Werksfestnetz',
    ralModalTitle: 'RAL-Farbtabelle für elektrostatische Pulverbeschichtung',
    ralModalDesc: 'Wählen Sie zertifizierte ofengehärtete Beschichtungen nach internationaler RAL-Norm',
    ralSearchPlaceholder: 'Suche nach RAL-Code (z.B. 6018 oder RAL 5015) oder Farbnamen...',
    ralClear: 'Löschen',
    heroBannerLabel: 'Banner',
    heroPrevBanner: 'Vorheriges Banner',
    heroNextBanner: 'Nächstes Banner',
    heroClose: 'Schließen',
  },

  // ================= AR (Arabic) =================
  ar: {
    navHome: 'الرئيسية',
    navProductsAll: 'كتالوج الأسطوانات الشامل',
    navProductsAllDesc: 'استعراض مواصفات جميع الطرازات الـ ۱۳ للغاز المسال',
    navProductsDomestic: 'المنزلية والرحلات',
    navProductsDomesticDesc: 'من ۰.۵ إلى ۱۱ كغ بمواصفات معتمدة',
    navProductsIndustrial: 'الصناعية والورش',
    navProductsIndustrialDesc: 'من ۲۵ إلى ۵۰ كغ للأعمال الشاقة',
    navProductsAuto: 'خزانات غاز السيارات',
    navProductsAutoDesc: 'خزانات ۶۰ لتراً القياسية المعتمدة',

    navQualityIso: 'معايير الجودة وشهادات ISO',
    navQualityIsoDesc: 'شهادة ISO 9001 واختبار هيدروستاتيكي ۳۰ بار',
    navQualityVideoTour: 'جولة فيديو وثائقية لخطوط الإنتاج',
    navQualityVideoTourDesc: 'بإشراف المدير العام السيد موسى عموئي',

    navArticlesStandards: 'المعايير الهندسية والتصنيع',
    navArticlesStandardsDesc: 'تحليل الميتالورجيا واللحام والمعالجة الحرارية',
    navArticlesSafety: 'السلامة والتخزين والخدمات اللوجستية',
    navArticlesSafetyDesc: 'معايير NFPA 58 و OSHA واللوائح الدولية',

    navAboutHeritage: 'تاريخ المصنع والمؤسس',
    navAboutHeritageDesc: 'تأسس عام ۱۹۷۰ (أكثر من ۵۰ عاماً من الخبرة)',
    navAboutFaq: 'الأسئلة الشائعة وشهادات التصدير',
    navAboutFaqDesc: 'إجابات على الأسئلة الفنية والتجارية للتصدير',
    navAboutRfq: 'حاسبة عروض الأسعار وحمولة الحاويات',
    navAboutRfqDesc: 'حساب سعة حاويات ۲۰ و ۴۰ قدماً',
    navAboutContact: 'الاتصال وإدارة التصدير',
    navAboutContactDesc: 'التواصل المباشر وموقع المصنع في كرج',

    productsBreadcrumb: 'متجر وكتالوج المنتجات',
    productsBadge: 'أكبر شركة لتصنيع أسطوانات الغاز المسال في إيران | المتجر الرسمي',
    productsMainTitle: 'متجر وكتالوج أسطوانات الغاز المسال LPG المعتمدة',
    productsHeroDesc: 'استكشف المجموعة الكاملة المكونة من ۱۳ طرازاً لأسطوانات الغاز المسال وخزانات غاز السيارات، المصنعة في أكبر شركة لتصنيع أسطوانات الغاز في إيران وفق معايير ISO 9001 واختبار ضغط هيدروستاتيكي ۳۰ بار.',
    searchPlaceholder: 'البحث عن الطراز أو السعة أو الوزن...',
    popularBadge: 'الأكثر طلباً',
    realPhotoBadge: 'صورة حقيقية',
    realPlusRenderBadge: 'صورة حقيقية + رندر ۲',
    viewSpecsBtn: 'عرض المواصفات الفنية',

    detailBreadcrumbHome: 'الرئيسية',
    detailBreadcrumbStore: 'المتجر والكتالوج',
    detailPressureTestedBadge: 'تم اختبار الضغط بنجاح عند ۳۰ بار',
    detailShowBlueprint: 'عرض المخطط الهندسي',
    detailShowAngles: 'عرض زوايا الأسطوانة',
    detailCustomColor: 'اختيار لون RAL مخصص',
    detailResetColor: 'إعادة ضبط',
    detailCertifiedBadge: 'معتمد من أكبر شركة لتصنيع أسطوانات الغاز في إيران | ISIRI 841',
    detailSpecsHeader: 'المواصفات الفنية ومعايير الميتالورجيا',
    detailWallThickness: 'سمك جدار الأسطوانة',
    detailValveStandard: 'معيار الصمام',
    detailSteelGrade: 'درجة الفولاذ',
    detailUnitPcs: 'قطعة',
    detailFeaturesTitle: 'الميزات الهندسية والتطبيقات المعتمدة:',
    detailAddToRfq: 'إضافة إلى طلب عرض السعر الرسمي (RFQ)',
    detailWhatsAppSales: 'واتساب مدير المبيعات الدولية',
    detailBlueprintHeading: 'المخطط الهندسي والأبعاد القياسية',
    detailRelatedProducts: 'أسطوانات أخرى في الكتالوج',

    tourBadge: 'جولة وثائقية لخطوط الإنتاج',
    tourTitlePart1: 'مشاهدة مباشرة لـ',
    tourTitleHighlight: 'مصنع إم غاز وخطوط الإنتاج المتطورة',
    tourDesc: 'استكشف مكابس السحب الهيدروليكية العملاقة وخطوط اللحام الآلي والطلاء الحراري بالفرن والرقابة الإدارية المباشرة.',
    tourStandardBadge: 'معتمد وفق ISO والمعايير الدولية',
    tourPlaylistTitle: 'قائمة فيديوهات المصنع (۴ فيديوهات)',
    tourPlayTooltip: 'تشغيل',
    tourPauseTooltip: 'إيقاف مؤقت',
    tourMuteTooltip: 'كتم الصوت',
    tourUnmuteTooltip: 'تشغيل الصوت',
    tourFullscreenTooltip: 'شاشة كاملة',

    brandsBadge: 'الشركاء والعملاء الصناعيون',
    brandsHeadline: 'المورد المعتمد لدى كبرى شركات السيارات والغاز',

    catalogEditionBadge: 'النسخة الرسمية ۲۰۲۶',
    catalogModalTitle: 'تحميل الكتالوج الرسمي لأسطوانات الغاز المسال',
    catalogModalDesc: 'دليل شامل يغطي ۱۳ طرازاً من الأسطوانات، وشهادات ISO/EN، وجدول ألوان RAL، وسعات شحن الحاويات.',
    catalogFeature1: '۱۳ طرازاً للأسطوانات (منزلية، صناعية، سيارات)',
    catalogFeature2: 'بيانات اختبار الضغط ۳۰ بار وشهادات تحليل الفولاذ',
    catalogFeature3: 'سعات التحميل في حاويات ۲۰ و ۴۰ قدماً عالية السقف',
    catalogFeature4: 'جدول ألوان الطلاء الحراري الإلكتروستاتيكي RAL',
    catalogDownloadBtn: 'تحميل كتالوج PDF المخصص',
    catalogGeneratingPdf: 'جارٍ إعداد وتحميل الكتالوج...',
    catalogDownloadSuccess: 'تم تحميل الكتالوج بنجاح!',
    catalogDirectInquiry: 'استفسار طلبات الجملة عبر واتساب',

    specsModalAnglesTab: 'زوایای المنتج وألوان RAL (4:3)',
    specsModalBlueprintTab: 'المخطط الهندسي',
    specsModalGalleryTab: 'معرض صور المصنع',
    specsColorCoatingNote: 'يتم طلاء جميع الأسطوانات بمسحوق إلكتروستاتيكي بسمك ۸۰-۱۲۰ ميكرون ومعالجته في فرن عند ۱۸۰ درجة مئوية.',
    specsColorsFound: 'لون متاح',
    allTopics: 'جميع الموضوعات',
    copiedTooltip: 'تم النسخ',
    procurementCalloutTitle: 'طلب أسطوانات قياسية',
    procurementCalloutDesc: 'تصنيع معتمد وفق معايير EN 1442 و DOT-4BA',
    rfqBadge: 'طلب تسعير فوري وتقدير الحاويات',
    rfqTitle: 'حاسبة الكميات والأوزان وإرسال طلب الأسعار إلى المصنع',
    rfqDesc: 'اختر موديلات وسعات أسطوانات الغاز المطلوبة لحساب الوزن الإجمالي وحمولة الحاويات تلقائياً وإرسال طلب التسعير المباشر لإدارة المبيعات.',
    rfqAddTitle: 'اختيار موديل الأسطوانة والكمية',
    rfqModelLabel: 'نوع أسطوانة الغاز / الخزان:',
    rfqQuantityLabel: 'الكمية المطلوبة (بالقطعة):',
    rfqAddBtn: 'إضافة إلى قائمة الطلب',
    rfqBuyerInfoTitle: 'بيانات المشتري الاختيارية (لإصدار الفاتورة المبدئية)',
    rfqNamePlaceholder: 'الاسم الكامل',
    rfqCompanyPlaceholder: 'اسم الشركة أو المؤسسة',
    rfqDestPlaceholder: 'ميناء أو دولة الوصول والتفريغ',
    rfqSummaryTitle: 'قائمة المواد وملخص الشحن',
    rfqClearBtn: 'مسح القائمة',
    rfqEmptyText: 'لم تتم إضافة أي صنف حتى الآن. الرجاء اختيار موديل من الأعلى للبدء.',
    rfqTotalUnits: 'إجمالي الكمية',
    rfqTotalWeight: 'الوزن الإجمالي',
    rfqTonsUnit: 'طن',
    rfqContainerEstimate: 'تقدير حاوية 40HQ',
    rfqSubmitWhatsApp: 'إرسال طلب التسعير الرسمي عبر واتساب',
    faqBadge: 'الأسئلة الشائعة للعملاء والمستوردين',
    faqTitle: 'إجابات على الأسئلة الفنية والإنتاجية والتصديرية',
    faqUnlistedTitle: 'هل لديك استفسار غير مدرج في القائمة أعلاه؟',
    faqUnlistedDesc: 'خبراؤنا الفنيون وإدارة التصدير الدولي على أتم الاستعداد للإجابة على مدار الساعة.',
    faqChatWhatsApp: 'المحادثة عبر واتساب',
    footerCatalogBrochureDesc: 'تحميل الكتيب الرسمي للمواصفات الفنية وجدول سعات الأسطوانات',
    footerDownloadFreePdf: 'تحميل ملف الكتالوج مجاناً (PDF)',
    contactMessagePlaceholder: 'يرجى كتابة الكميات المطلوبة، سعات الخزانات أو المواصفات الخاصة...',
    contactMobileHotline: 'الخط الساخن المحمول',
    contactFactoryLandline: 'هاتف المصنع الأرضي',
    ralModalTitle: 'كتالوج ألوان مسحوق الطلاء الكهروستاتيكي RAL',
    ralModalDesc: 'اختيار لون حراري مخصص معتمد وفقاً لمعايير رال الدولية',
    ralSearchPlaceholder: 'البحث برمز رال (مثال: 6018 أو RAL 5015) أو اسم اللون...',
    ralClear: 'مسح',
    heroBannerLabel: 'شعار',
    heroPrevBanner: 'الشعار السابق',
    heroNextBanner: 'الشعار التالي',
    heroClose: 'إغلاق',
  },

  // ================= TR (Turkish) =================
  tr: {
    navHome: 'Ana Sayfa',
    navProductsAll: 'Kapsamlı Tüp Kataloğu',
    navProductsAllDesc: '13 sertifikalı LPG modelini inceleyin',
    navProductsDomestic: 'Ev ve Kamp Tüpleri',
    navProductsDomesticDesc: '0.5 kg – 11 kg standart tüpler',
    navProductsIndustrial: 'Sanayi ve Atölye',
    navProductsIndustrialDesc: '25 kg – 50 kg ağır hizmet tüpleri',
    navProductsAuto: 'Otomotiv Otogaz Tankları',
    navProductsAutoDesc: '60L standart araç otogaz tankları',

    navQualityIso: 'Kalite ve ISO Standartları',
    navQualityIsoDesc: 'ISO 9001 & 30 Bar hidrostatik basınç testi',
    navQualityVideoTour: 'Fabrika Video Turu',
    navQualityVideoTourDesc: 'Genel Müdür Mousa Amooie ile üretim hattı turu',

    navArticlesStandards: 'İmalat Standartları',
    navArticlesStandardsDesc: 'Metalurji, tozaltı kaynağı ve PWHT analizi',
    navArticlesSafety: 'Depolama ve Lojistik Güvenliği',
    navArticlesSafetyDesc: 'NFPA 58, OSHA ve ADR uyumluluğu',

    navAboutHeritage: 'Fabrika Tarihçesi ve Kurucu',
    navAboutHeritageDesc: '1970 kuruluş (50 yılı aşkın tecrübe)',
    navAboutFaq: 'Sıkça Sorulan Sorular (SSS)',
    navAboutFaqDesc: 'Teknik ve ihracat soruları yanıtları',
    navAboutRfq: 'Online RFQ Hesaplayıcı',
    navAboutRfqDesc: '20ft ve 40ft konteyner yükleme hesabı',
    navAboutContact: 'İhracat ve Fabrika İletişim',
    navAboutContactDesc: 'Satış ekibi ve Kerec fabrika adresi',

    productsBreadcrumb: 'Ürün Mağazası ve Katalog',
    productsBadge: 'İran’ın Lider LPG Tüpü Üretici Şirketi | Resmi Mağaza',
    productsMainTitle: 'LPG Gaz Tüpleri Mağazası ve Kapsamlı Mühendislik Kataloğu',
    productsHeroDesc: 'İran’ın lider LPG gaz tüpü üretici fabrikası tarafından ISO 9001 ve 30 bar hidrostatik test standartlarında üretilen 13 model evsel, sanayi ve otogaz tankını keşfedin.',
    searchPlaceholder: 'Model, kapasite veya ağırlık ara...',
    popularBadge: 'Çok Satan',
    realPhotoBadge: 'Gerçek Fotoğraf',
    realPlusRenderBadge: 'Gerçek Fotoğraf + 3D',
    viewSpecsBtn: 'Teknik Özellikleri Gör',

    detailBreadcrumbHome: 'Ana Sayfa',
    detailBreadcrumbStore: 'Ürünler',
    detailPressureTestedBadge: '30 Bar Hidrostatik Basınç Testi Onaylı',
    detailShowBlueprint: 'Teknik Çizimi Gör',
    detailShowAngles: '3D Açıları Gör',
    detailCustomColor: 'Özel RAL Rengi Seç',
    detailResetColor: 'Sıfırla',
    detailCertifiedBadge: 'İran’ın Lider LPG Tüpü İmalatçısı Onaylı | ISIRI 841',
    detailSpecsHeader: 'Teknik Özellikler ve Metalurji Standartları',
    detailWallThickness: 'Gövde Sac Kalınlığı',
    detailValveStandard: 'Vana Standardı',
    detailSteelGrade: 'Çelik Kalitesi',
    detailUnitPcs: 'adet',
    detailFeaturesTitle: 'Teknik Özellikler ve Onaylı Uygulamalar:',
    detailAddToRfq: 'RFQ Listesine Ekle & Resmi Teklif İste',
    detailWhatsAppSales: 'WhatsApp İhracat Müdürü',
    detailBlueprintHeading: 'Teknik Çizim ve İmalat Boyutları',
    detailRelatedProducts: 'Katalogdaki Diğer Tüpler',

    tourBadge: 'Fabrika Video Turu ve Üretim Süreci',
    tourTitlePart1: 'Doğrudan İnceleyin:',
    tourTitleHighlight: 'M Gas Fabrikası ve Üretim Hatları',
    tourDesc: 'Yüksek tonajlı hidrolik preslerimizi, otomatik tozaltı kaynak hatlarımızı ve üst yönetimin doğrudan kalite denetimini keşfedin.',
    tourStandardBadge: 'ISO ve Milli Standart Onaylı',
    tourPlaylistTitle: 'Fabrika Video Galerisi (4 Video)',
    tourPlayTooltip: 'Oynat',
    tourPauseTooltip: 'Duraklat',
    tourMuteTooltip: 'Sessize Al',
    tourUnmuteTooltip: 'Sesi Aç',
    tourFullscreenTooltip: 'Tam Ekran',

    brandsBadge: 'Ana Müşteriler ve Ticari Ortaklar',
    brandsHeadline: 'Otomotiv ve Gaz Sanayi Devi Kuruluşların Güvenilir Tedarikçisi',

    catalogEditionBadge: 'Resmi 2026 Baskısı',
    catalogModalTitle: 'Resmi LPG Gaz Tüpleri Kataloğunu İndirin',
    catalogModalDesc: '13 tüp modelinin teknik çizimlerini, ISO/EN sertifikalarını, RAL renk tablosunu ve konteyner lojistiğini içeren kapsamlı rehber.',
    catalogFeature1: '13 Tüp Modeli (Ev, Sanayi, Araç)',
    catalogFeature2: '30 Bar Hidrostatik Test Verileri ve Çelik Analizleri',
    catalogFeature3: '20ft ve 40ft HQ Konteyner Yükleme Kapasiteleri',
    catalogFeature4: 'Elektrostatik Toz Boya RAL Renk Kartelası',
    catalogDownloadBtn: 'Özel PDF Kataloğu İndir',
    catalogGeneratingPdf: 'Katalog hazırlanıyor ve indiriliyor...',
    catalogDownloadSuccess: 'Katalog başarıyla indirildi!',
    catalogDirectInquiry: 'WhatsApp ile Toptan Sipariş ve Fiyat Sorun',

    specsModalAnglesTab: '3 Açıdan Görünüm & RAL Renkleri (4:3)',
    specsModalBlueprintTab: 'Teknik Çizim',
    specsModalGalleryTab: 'Fabrika Galerisi',
    specsColorCoatingNote: 'Tüm tüpler 80-120 mikron elektrostatik toz boya ile kaplanıp 180°C fırında pişirilir.',
    specsColorsFound: 'renk bulundu',
    allTopics: 'Tüm Konular',
    copiedTooltip: 'Kopyalandı',
    procurementCalloutTitle: 'Standart Tüp Siparişi',
    procurementCalloutDesc: 'EN 1442 ve DOT-4BA standartlarında üretim',
    rfqBadge: 'Etkileşimli Teklif & Konteyner Lojistik Hesaplayıcı',
    rfqTitle: 'Hacim, Ağırlık ve Fabrika Teklif Talep Hesaplayıcısı',
    rfqDesc: 'İstenen gaz tüpü modellerini ve adetlerini seçin; toplam ağırlık ve konteyner doluluk oranını otomatik hesaplayıp doğrudan satış birimine teklif gönderin.',
    rfqAddTitle: 'Tüp Modelini ve Adedini Seçin',
    rfqModelLabel: 'Gaz Tüpü / Tank Tipi:',
    rfqQuantityLabel: 'İstenen Miktar (adet):',
    rfqAddBtn: 'Teklif Listesine Ekle',
    rfqBuyerInfoTitle: 'İsteğe Bağlı Alıcı Bilgileri (Proforma Fatura İçin)',
    rfqNamePlaceholder: 'Ad Soyad',
    rfqCompanyPlaceholder: 'Şirket veya Firma Adı',
    rfqDestPlaceholder: 'Varış Limanı / Ülkesi',
    rfqSummaryTitle: 'Seçilen Ürünler ve Lojistik Özeti',
    rfqClearBtn: 'Temizle',
    rfqEmptyText: 'Henüz ürün eklenmedi. Başlamak için yukarıdan bir model seçin.',
    rfqTotalUnits: 'Toplam Adet',
    rfqTotalWeight: 'Toplam Ağırlık',
    rfqTonsUnit: 'ton',
    rfqContainerEstimate: '40HQ Konteyner Tahmini',
    rfqSubmitWhatsApp: 'İhracat Müdürüne WhatsApp ile Resmi Teklif Talebi Gönder',
    faqBadge: 'Müşteri ve Tüccarlar İçin Sıkça Sorulan Sorular',
    faqTitle: 'Teknik Özellikler, Üretim ve İhracat Hakkında Cevaplar',
    faqUnlistedTitle: 'Yukarıdaki listede olmayan bir sorunuz mu var?',
    faqUnlistedDesc: 'Uzman mühendislerimiz ve uluslararası ihracat temsilcilerimiz 7/24 yardıma hazırdır.',
    faqChatWhatsApp: 'WhatsApp’tan Görüşün',
    footerCatalogBrochureDesc: 'Resmi teknik ürün broşürünü ve ölçü tablosunu indirin',
    footerDownloadFreePdf: 'Ücretsiz PDF Kataloğunu İndir',
    contactMessagePlaceholder: 'Lütfen talep edilen tonaj, tüp kapasitesi veya teknik detayları belirtiniz...',
    contactMobileHotline: 'Mobil İletişim Hattı',
    contactFactoryLandline: 'Fabrika Sabit Hattı',
    ralModalTitle: 'RAL Elektrostatik Toz Boya Renk Kataloğu',
    ralModalDesc: 'Uluslararası RAL standartlarına uygun fırınlanmış özel renk seçimi',
    ralSearchPlaceholder: 'RAL koduyla (ör. 6018 veya RAL 5015) veya renk adıyla arayın...',
    ralClear: 'Temizle',
    heroBannerLabel: 'Afiş',
    heroPrevBanner: 'Önceki Afiş',
    heroNextBanner: 'Sonraki Afiş',
    heroClose: 'Kapat',
  },

  // ================= RU (Russian) =================
  ru: {
    navHome: 'Главная',
    navProductsAll: 'Полный каталог баллонов',
    navProductsAllDesc: 'Все 13 сертифицированных моделей СУГ',
    navProductsDomestic: 'Бытовые и кемпинг',
    navProductsDomesticDesc: 'Баллоны от 0.5 до 11 кг',
    navProductsIndustrial: 'Промышленные баллоны',
    navProductsIndustrialDesc: 'Тяжелые баллоны 25–50 кг',
    navProductsAuto: 'Автомобильные емкости СУГ',
    navProductsAutoDesc: 'Сертифицированные емкости 60 л',

    navQualityIso: 'Стандарты качества и ISO',
    navQualityIsoDesc: 'ISO 9001 и гидроиспытания 30 бар',
    navQualityVideoTour: 'Видеоэкскурсия по заводу',
    navQualityVideoTourDesc: 'Осмотр линий с директором Мусой Амуи',

    navArticlesStandards: 'Инженерные стандарты',
    navArticlesStandardsDesc: 'Металлургия, автоматическая сварка и термообработка',
    navArticlesSafety: 'Безопасность хранения и перевозки',
    navArticlesSafetyDesc: 'Соответствие NFPA 58, OSHA и ADR',

    navAboutHeritage: 'История завода и основатель',
    navAboutHeritageDesc: 'Основан в 1970 г. (более 50 лет опыта)',
    navAboutFaq: 'Частые вопросы (FAQ)',
    navAboutFaqDesc: 'Ответы на технические и экспортные вопросы',
    navAboutRfq: 'Онлайн калькулятор RFQ',
    navAboutRfqDesc: 'Расчет загрузки 20ft и 40ft контейнеров',
    navAboutContact: 'Контакты и экспортный отдел',
    navAboutContactDesc: 'Отдел продаж и завод в г. Карадж',

    productsBreadcrumb: 'Магазин и каталог продукции',
    productsBadge: 'Ведущий завод-производитель баллонов LPG в Иране | Официальный магазин',
    productsMainTitle: 'Магазин и полный инженерный каталог баллонов для сжиженного газа (LPG)',
    productsHeroDesc: 'Полная линейка из 13 сертифицированных моделей газовых баллонов (от 0.5 до 60 л) и автомобильных емкостей СУГ от крупнейшего завода в Иране со 100% испытаниями давлением 30 бар по ISO 9001.',
    searchPlaceholder: 'Поиск по модели, объему или весу...',
    popularBadge: 'Хит продаж',
    realPhotoBadge: 'Фото завода',
    realPlusRenderBadge: 'Фото завода + 3D',
    viewSpecsBtn: 'Технические характеристики',

    detailBreadcrumbHome: 'Главная',
    detailBreadcrumbStore: 'Продукция',
    detailPressureTestedBadge: 'Испытано давлением 30 бар',
    detailShowBlueprint: 'Инженерный чертеж',
    detailShowAngles: '3D ракурсы',
    detailCustomColor: 'Выбор цвета по RAL',
    detailResetColor: 'Сброс',
    detailCertifiedBadge: 'Сертифицировано ведущим заводом баллонов LPG в Иране | ISIRI 841',
    detailSpecsHeader: 'Технические характеристики и металлургические стандарты',
    detailWallThickness: 'Толщина стенки',
    detailValveStandard: 'Стандарт вентиля',
    detailSteelGrade: 'Марка стали',
    detailUnitPcs: 'шт.',
    detailFeaturesTitle: 'Инженерные особенности и назначение:',
    detailAddToRfq: 'Добавить в спецификацию и запросить КП',
    detailWhatsAppSales: 'WhatsApp директора по экспорту',
    detailBlueprintHeading: 'Инженерный чертеж и размеры',
    detailRelatedProducts: 'Другие баллоны в каталоге',

    tourBadge: 'Видеоэкскурсия и технологический процесс',
    tourTitlePart1: 'Прямой обзор:',
    tourTitleHighlight: 'Завод М Газ и производственные линии',
    tourDesc: 'Ознакомьтесь с мощными гидравлическими прессами, автоматическими линиями сварки под флюсом и контролем руководства.',
    tourStandardBadge: 'Сертификация ISO и ГОСТ',
    tourPlaylistTitle: 'Видеогалерея завода (4 видео)',
    tourPlayTooltip: 'Воспроизведение',
    tourPauseTooltip: 'Пауза',
    tourMuteTooltip: 'Без звука',
    tourUnmuteTooltip: 'Включить звук',
    tourFullscreenTooltip: 'Полный экран',

    brandsBadge: 'Крупнейшие заказчики и партнеры',
    brandsHeadline: 'Надежный поставщик для автопроизводителей и газовых корпораций',

    catalogEditionBadge: 'Официальное издание 2026',
    catalogModalTitle: 'Скачать официальный каталог баллонов LPG',
    catalogModalDesc: 'Полное техническое руководство по 13 моделям баллонов, сертификатам ISO/EN, палитре RAL и логистике.',
    catalogFeature1: '13 моделей баллонов (бытовые, промышленные, авто)',
    catalogFeature2: 'Данные испытаний 30 бар и сертификаты стали',
    catalogFeature3: 'Вместимость в 20ft и 40ft HQ контейнеры',
    catalogFeature4: 'Таблица электростатических порошковых цветов RAL',
    catalogDownloadBtn: 'Скачать PDF-каталог',
    catalogGeneratingPdf: 'Формирование и скачивание каталога...',
    catalogDownloadSuccess: 'Каталог успешно скачан!',
    catalogDirectInquiry: 'Оптовый запрос через WhatsApp',

    specsModalAnglesTab: '3 ракурса и цвета RAL (4:3)',
    specsModalBlueprintTab: 'Чертеж',
    specsModalGalleryTab: 'Галерея завода',
    specsColorCoatingNote: 'Все баллоны покрываются порошковой краской 80–120 мкм и запекаются в печи при 180°C.',
    specsColorsFound: 'цветов найдено',
    allTopics: 'Все темы',
    copiedTooltip: 'Скопировано',
    procurementCalloutTitle: 'Заказ стандартных баллонов',
    procurementCalloutDesc: 'Производство по стандартам EN 1442 и DOT-4BA',
    rfqBadge: 'Интерактивный расчет стоимости и контейнерной загрузки',
    rfqTitle: 'Калькулятор тиража, тоннажа и отправки запроса на завод',
    rfqDesc: 'Выберите модели и количество баллонов, чтобы автоматически рассчитать тоннаж партии, вместимость контейнеров и отправить запрос в отдел продаж.',
    rfqAddTitle: 'Выбор модели баллона и количества',
    rfqModelLabel: 'Тип баллона / емкости:',
    rfqQuantityLabel: 'Требуемое количество (шт):',
    rfqAddBtn: 'Добавить в список заказа',
    rfqBuyerInfoTitle: 'Данные покупателя (для выставления проформы)',
    rfqNamePlaceholder: 'Имя и фамилия',
    rfqCompanyPlaceholder: 'Название компании',
    rfqDestPlaceholder: 'Страна и порт назначения',
    rfqSummaryTitle: 'Выбранные позиции и логистическая сводка',
    rfqClearBtn: 'Очистить',
    rfqEmptyText: 'Пока ничего не добавлено. Выберите модель выше для начала.',
    rfqTotalUnits: 'Всего штук',
    rfqTotalWeight: 'Общий вес',
    rfqTonsUnit: 'т',
    rfqContainerEstimate: 'Загрузка контейнера 40HQ',
    rfqSubmitWhatsApp: 'Отправить официальный запрос директору по экспорту (WhatsApp)',
    faqBadge: 'Часто задаваемые вопросы клиентов и партнеров',
    faqTitle: 'Ответы на технические, производственные и экспортные вопросы',
    faqUnlistedTitle: 'Есть вопрос, которого нет в списке выше?',
    faqUnlistedDesc: 'Наши технические эксперты и экспортный отдел готовы ответить 24/7.',
    faqChatWhatsApp: 'Написать в WhatsApp',
    footerCatalogBrochureDesc: 'Скачать официальную брошюру технических характеристик и габаритов баллонов',
    footerDownloadFreePdf: 'Скачать каталог бесплатно (PDF)',
    contactMessagePlaceholder: 'Пожалуйста, укажите требуемый объем, тираж или технические требования...',
    contactMobileHotline: 'Горячая линия моб.',
    contactFactoryLandline: 'Городской телефон завода',
    ralModalTitle: 'Каталог электростатической порошковой окраски RAL',
    ralModalDesc: 'Выбор сертифицированного термозапекаемого покрытия по международному стандарту RAL',
    ralSearchPlaceholder: 'Поиск по коду RAL (напр. 6018 или RAL 5015) или названию цвета...',
    ralClear: 'Очистить',
    heroBannerLabel: 'Баннер',
    heroPrevBanner: 'Предыдущий баннер',
    heroNextBanner: 'Следующий баннер',
    heroClose: 'Закрыть',
  },

  // ================= UR (Urdu) =================
  ur: {
    navHome: 'ہوم',
    navProductsAll: 'مکمل سلنڈر کیٹلاگ',
    navProductsAllDesc: 'تمام ۱۳ تصدیق شدہ ایل پی جی ماڈلز دیکھیں',
    navProductsDomestic: 'گھریلو اور کیمپنگ',
    navProductsDomesticDesc: '۰.۵ تا ۱۱ کلوگرام معیاری سلنڈرز',
    navProductsIndustrial: 'صنعتی اور ورکشاپ',
    navProductsIndustrialDesc: '۲۵ تا ۵۰ کلوگرام ہیوی ڈیوٹی',
    navProductsAuto: 'گاڑیوں کے آٹو گیس ٹینک',
    navProductsAutoDesc: '۶۰ لیٹر معیاری آٹو ایل پی جی ٹینک',

    navQualityIso: 'کوالٹی اور ISO معیارات',
    navQualityIsoDesc: 'ISO 9001 اور ۳۰ بار ہائیڈروسٹیٹک پریشر ٹیسٹ',
    navQualityVideoTour: 'فیکٹری ویڈیو ٹور',
    navQualityVideoTourDesc: 'جنرل منیجر موسی عموئی کے ساتھ معائنہ',

    navArticlesStandards: 'مینوفیکچرنگ معیارات',
    navArticlesStandardsDesc: 'میٹالرجی، خودکار ویلڈنگ اور ہیٹ ٹریٹمنٹ',
    navArticlesSafety: 'اسٹوریج اور لاجسٹکس سیفٹی',
    navArticlesSafetyDesc: 'NFPA 58، OSHA اور ADR اصول',

    navAboutHeritage: 'فیکٹری کی تاریخ اور بانی',
    navAboutHeritageDesc: 'قیام ۱۹۷۰ (۵۰ سال سے زیادہ کا تجربہ)',
    navAboutFaq: 'اکثر پوچھے جانے والے سوالات',
    navAboutFaqDesc: 'تکنیکی اور برآمدی سوالات کے جوابات',
    navAboutRfq: 'آن لائن قیمت کیلکولیٹر',
    navAboutRfqDesc: '۲۰ اور ۴۰ فٹ کنٹینر کی گنجائش کا تخمینہ',
    navAboutContact: 'رابطہ اور برآمدی ڈیسک',
    navAboutContactDesc: 'سیلز ٹیم اور کرج فیکٹری کا پتہ',

    productsBreadcrumb: 'اسٹور اور پروڈکٹ کیٹلاگ',
    productsBadge: 'ایران میں ایل پی جی سلنڈر بنانے والی صف اول کی کمپنی | آفیشل اسٹور',
    productsMainTitle: 'ایل پی جی گیس سلنڈرز اسٹور اور مکمل انجینئرنگ کیٹلاگ',
    productsHeroDesc: 'ایران کی معروف مینوفیکچرنگ فیکٹری کے تحت تیار کردہ ۱۳ ماڈلز کے گھریلو، صنعتی اور آٹو گیس ٹینک دریافت کریں جو ISO 9001 اور ۳۰ بار پریشر پروف ٹیسٹ کے حامل ہیں۔',
    searchPlaceholder: 'ماڈل، گنجائش یا وزن تلاش کریں...',
    popularBadge: 'سب سے زیادہ مقبول',
    realPhotoBadge: 'اصل تصویر',
    realPlusRenderBadge: 'اصل تصویر + رینڈر ۲',
    viewSpecsBtn: 'تکنیکی تفصیلات دیکھیں',

    detailBreadcrumbHome: 'ہوم',
    detailBreadcrumbStore: 'پروڈکٹس',
    detailPressureTestedBadge: '۳۰ بار ہائیڈروسٹیٹک ٹیسٹ شدہ',
    detailShowBlueprint: 'انجینئرنگ بلیو پرنٹ دیکھیں',
    detailShowAngles: 'تھری ڈی اینگلز دیکھیں',
    detailCustomColor: 'پسندیدہ RAL رنگ منتخب کریں',
    detailResetColor: 'ری سیٹ',
    detailCertifiedBadge: 'ایران کی سرکردہ ایل پی جی سلنڈر کمپنی سے تصدیق شدہ | ISIRI 841',
    detailSpecsHeader: 'تکنیکی تفصیلات اور میٹالرجیکل معیارات',
    detailWallThickness: 'دیوار کی موٹائی',
    detailValveStandard: 'والو کا معیار',
    detailSteelGrade: 'اسٹیل گریڈ',
    detailUnitPcs: 'عدد',
    detailFeaturesTitle: 'تکنیکی خصوصیات اور تصدیق شدہ استعمالات:',
    detailAddToRfq: 'کوٹیشن میں شامل کریں اور قیمت طلب کریں',
    detailWhatsAppSales: 'واٹس ایپ سیلز منیجر',
    detailBlueprintHeading: 'تکنیکی بلیو پرنٹ اور پیمائش',
    detailRelatedProducts: 'کیٹلاگ کے دیگر سلنڈرز',

    tourBadge: 'فیکٹری ویڈیو ٹور اور پروڈکشن کا عمل',
    tourTitlePart1: 'براہ راست جائزہ لیں:',
    tourTitleHighlight: 'ایم گیس فیکٹری اور پروڈکشن لائنز',
    tourDesc: 'ہمارے ہائیڈرولک پریس، خودکار ویلڈنگ لائنز، اوون پاؤڈر کوٹنگ اور انتظامی معائنے کا مشاہدہ کریں۔',
    tourStandardBadge: 'ISO اور قومی معیار سے تصدیق شدہ',
    tourPlaylistTitle: 'فیکٹری ویڈیو گیلری (۴ ویڈیوز)',
    tourPlayTooltip: 'چلائیں',
    tourPauseTooltip: 'روکیں',
    tourMuteTooltip: 'خاموش',
    tourUnmuteTooltip: 'آواز کھولیں',
    tourFullscreenTooltip: 'فل اسکرین',

    brandsBadge: 'اہم صنعتی خریدار اور پارٹنرز',
    brandsHeadline: 'بڑی آٹوموٹو اور گیس کمپنیوں کا قابل اعتماد سپلائر',

    catalogEditionBadge: 'آفیشل ایڈیشن ۲۰۲۶',
    catalogModalTitle: 'آفیشل ایل پی جی گیس سلنڈر کیٹلاگ ڈاؤن لوڈ کریں',
    catalogModalDesc: '۱۳ سلنڈر ماڈلز، بین الاقوامی سرٹیفکیٹس، RAL کلر چارٹ اور کنٹینر لوڈنگ کی جامع گائیڈ۔',
    catalogFeature1: '۱۳ سلنڈر ماڈلز (گھریلو، صنعتی، گاڑیوں کے)',
    catalogFeature2: '۳۰ بار پریشر ٹیسٹ ڈیٹا اور اسٹیل ٹیسٹ رپورٹس',
    catalogFeature3: '۲۰ اور ۴۰ فٹ ہائی کیوب کنٹینر لوڈنگ کی گنجائش',
    catalogFeature4: 'الیکٹرو اسٹیٹک پاؤڈر کوٹنگ RAL کلر چارٹ',
    catalogDownloadBtn: 'پی ڈی ایف کیٹلاگ ڈاؤن لوڈ کریں',
    catalogGeneratingPdf: 'کیٹلاگ تیار کیا جا رہا ہے...',
    catalogDownloadSuccess: 'کیٹلاگ کامیابی سے ڈاؤن لوڈ ہو گیا!',
    catalogDirectInquiry: 'واٹس ایپ پر تھوک قیمت معلوم کریں',

    specsModalAnglesTab: 'تین رخی مناظر اور رنگ (4:3)',
    specsModalBlueprintTab: 'انجینئرنگ ڈرائنگ',
    specsModalGalleryTab: 'فیکٹری گیلری',
    specsColorCoatingNote: 'تمام سلنڈروں پر ۸۰ تا ۱۲۰ مائیکرون پاؤڈر کوٹنگ کی جاتی ہے اور ۱۸۰ ڈگری پر پکایا جاتا ہے۔',
    specsColorsFound: 'رنگ دستیاب ہیں',
    allTopics: 'تمام موضوعات',
    copiedTooltip: 'کاپی ہو گیا',
    procurementCalloutTitle: 'معیاری سلنڈر آرڈر',
    procurementCalloutDesc: 'EN 1442 اور DOT-4BA کے تحت تصدیق شدہ پیداوار',
    rfqBadge: 'آن لائن قیمت کا تخمینہ اور کنٹینر لوڈنگ کیلکولیٹر',
    rfqTitle: 'حجم، وزن اور فیکٹری کو کوٹیشن بھیجنے کا کیلکولیٹر',
    rfqDesc: 'مطلوبہ گیس سلنڈر ماڈلز اور تعداد منتخب کریں تاکہ کل وزن اور کنٹینر کی گنجائش خودکار طور پر حساب ہو کر سیلز ڈیپارٹمنٹ کو ارسال کی جا سکے۔',
    rfqAddTitle: 'سلنڈر ماڈل اور تعداد منتخب کریں',
    rfqModelLabel: 'گیس سلنڈر / ٹینک کی قسم:',
    rfqQuantityLabel: 'مطلوبہ تعداد (یونٹس):',
    rfqAddBtn: 'انکوائری لسٹ میں شامل کریں',
    rfqBuyerInfoTitle: 'خریدار کی اختیاری معلومات (پروفارما انوائس کے لیے)',
    rfqNamePlaceholder: 'پورا نام',
    rfqCompanyPlaceholder: 'کمپنی یا فرم کا نام',
    rfqDestPlaceholder: 'منزل کا ملک یا بندرگاہ',
    rfqSummaryTitle: 'منتخب کردہ اشیاء اور لاجسٹکس کا خلاصہ',
    rfqClearBtn: 'صاف کریں',
    rfqEmptyText: 'ابھی تک کوئی آئٹم شامل نہیں کیا گیا۔ شروع کرنے کے لیے اوپر ماڈل منتخب کریں۔',
    rfqTotalUnits: 'کل تعداد',
    rfqTotalWeight: 'کل وزن',
    rfqTonsUnit: 'ٹن',
    rfqContainerEstimate: '۴۰HQ کنٹینر کا تخمینہ',
    rfqSubmitWhatsApp: 'ایکسپورٹ مینیجر کو واٹس ایپ پر آفیشل انکوائری بھیجیں',
    faqBadge: 'گاہکوں اور تاجروں کے عام سوالات',
    faqTitle: 'تکنیکی، پیداواری اور برآمدی سوالات کے جوابات',
    faqUnlistedTitle: 'کیا آپ کا کوئی سوال ہے جو فہرست میں نہیں ہے؟',
    faqUnlistedDesc: 'ہمارے ٹیکنیکل انجینئرز اور بین الاقوامی برآمدی نمائندے ہر وقت رہنمائی کے لیے تیار ہیں۔',
    faqChatWhatsApp: 'واٹس ایپ پر رابطہ کریں',
    footerCatalogBrochureDesc: 'آفیشل ٹیکنیکل پروڈکٹ بروشر اور سائزز گائیڈ ڈاؤن لوڈ کریں',
    footerDownloadFreePdf: 'مفت PDF کیٹلاگ حاصل کریں',
    contactMessagePlaceholder: 'براہ کرم سلنڈر کی صلاحیت، مقدار یا درکار تفصیلات درج کریں...',
    contactMobileHotline: 'موبائل ہاٹ لائن',
    contactFactoryLandline: 'فیکٹری لینڈ لائن فون',
    ralModalTitle: 'RAL الیکٹرو اسٹیٹک پاؤڈر کوٹنگ کلر چارٹ',
    ralModalDesc: 'بین الاقوامی RAL معیار کے مطابق اوون بیکڈ کسٹم کلر کا انتخاب',
    ralSearchPlaceholder: 'RAL کوڈ (مثلاً 6018 یا RAL 5015) یا رنگ کے نام سے تلاش کریں...',
    ralClear: 'صاف کریں',
    heroBannerLabel: 'بینر',
    heroPrevBanner: 'پچھلا بینر',
    heroNextBanner: 'اگلا بینر',
    heroClose: 'بند کریں',
  },

  // ================= HY (Armenian) =================
  hy: {
    navHome: 'Գլխավոր',
    navProductsAll: 'Գազաբալոնների ամբողջական կատալոգ',
    navProductsAllDesc: 'Դիտել բոլոր 13 սերտիֆիկացված LPG մոդելները',
    navProductsDomestic: 'Կենցաղային և արշավային',
    navProductsDomesticDesc: '0.5 կգ - 11 կգ գազաբալոններ',
    navProductsIndustrial: 'Արդյունաբերական',
    navProductsIndustrialDesc: '25 կգ - 50 կգ բարձր ճնշման բալոններ',
    navProductsAuto: 'Ավտոգազի բաքեր (Auto LPG)',
    navProductsAutoDesc: '60 լիտրանոց ստանդարտ ավտոբաքեր',

    navQualityIso: 'Որակի և ISO ստանդարտներ',
    navQualityIsoDesc: 'ISO 9001 և 30 բար հիդրոստատիկ փորձարկում',
    navQualityVideoTour: 'Գործարանի վիդեո շրջայց',
    navQualityVideoTourDesc: 'Արտադրական գծերի շրջայց գլխավոր տնօրենի հետ',

    navArticlesStandards: 'Արտադրական ստանդարտներ',
    navArticlesStandardsDesc: 'Մետալուրգիա, ավտոմատ զոդում և PWHT',
    navArticlesSafety: 'Պահպանման և լոգիստիկայի անվտանգություն',
    navArticlesSafetyDesc: 'NFPA 58, OSHA և ADR կանոնակարգեր',

    navAboutHeritage: 'Գործարանի պատմություն և հիմնադիր',
    navAboutHeritageDesc: 'Հիմնադրված 1970 թ. (50+ տարվա փորձ)',
    navAboutFaq: 'Հաճախակի տրվող հարցեր (FAQ)',
    navAboutFaqDesc: 'Տեխնիկական և արտահանման հարցերի պատասխաններ',
    navAboutRfq: 'Առցանց RFQ հաշվիչ',
    navAboutRfqDesc: '20ft և 40ft կոնտեյներների բեռնման հաշվարկ',
    navAboutContact: 'Կապ և արտահանման բաժին',
    navAboutContactDesc: 'Վաճառքի բաժին և գործարանի հասցե Քարաջում',

    productsBreadcrumb: 'Ապրանքների խանութ և կատալոգ',
    productsBadge: 'Իրանում հեղուկ գազի գազաբալոնների առաջատար արտադրող ընկերություն | Պաշտոնական խանութ',
    productsMainTitle: 'LPG Գազի բալոնների խանութ և ամբողջական ինժեներական կատալոգ',
    productsHeroDesc: 'Բացահայտեք 13 սերտիֆիկացված LPG գազաբալոնների (0.5լ-ից մինչև 60լ) և ավտոգազի բաքերի ամբողջական տեսականին՝ արտադրված Իրանի առաջատար գործարանում ISO 9001 և 30 բար ճնշման փորձարկմամբ:',
    searchPlaceholder: 'Փնտրել մոդել, տարողություն կամ քաշ...',
    popularBadge: 'Հանրաճանաչ',
    realPhotoBadge: 'Իրական լուսանկար',
    realPlusRenderBadge: 'Իրական լուսանկար + 3D',
    viewSpecsBtn: 'Դիտել բնութագրերը',

    detailBreadcrumbHome: 'Գլխավոր',
    detailBreadcrumbStore: 'Ապրանքներ',
    detailPressureTestedBadge: '30 բար ճնշման փորձարկումն անցած',
    detailShowBlueprint: 'Դիտել գծագիրը',
    detailShowAngles: '3D դիտում',
    detailCustomColor: 'Ընտրել RAL գույն',
    detailResetColor: 'Վերականգնել',
    detailCertifiedBadge: 'Հաստատված է Իրանի առաջատար գազաբալոնների գործարանի կողմից | ISIRI 841',
    detailSpecsHeader: 'Տեխնիկական բնութագրեր և մետալուրգիական ստանդարտներ',
    detailWallThickness: 'Պատի հաստություն',
    detailValveStandard: 'Փականի ստանդարտ',
    detailSteelGrade: 'Պողպատի մակնիշ',
    detailUnitPcs: 'հատ',
    detailFeaturesTitle: 'Տեխնիկական առանձնահատկություններ և կիրառություններ:',
    detailAddToRfq: 'Ավելացնել RFQ-ին և ստանալ պաշտոնական գնառաջարկ',
    detailWhatsAppSales: 'WhatsApp արտահանման տնօրեն',
    detailBlueprintHeading: 'Տեխնիկական գծագիր և չափսեր',
    detailRelatedProducts: 'Կատալոգի այլ բալոններ',

    tourBadge: 'Գործարանի վիդեո շրջայց և արտադրական գործընթաց',
    tourTitlePart1: 'Անմիջական հայացք',
    tourTitleHighlight: 'M Gas գործարանին և արտադրական գծերին',
    tourDesc: 'Ծանոթացեք մեր հզոր հիդրավլիկ մամլիչներին, ավտոմատ զոդման գծերին, փոշեներկմանը և ղեկավարության անմիջական որակի հսկողությանը:',
    tourStandardBadge: 'ISO և ազգային ստանդարտներով հաստատված',
    tourPlaylistTitle: 'Գործարանի տեսանյութեր (4 վիդեո)',
    tourPlayTooltip: 'Միացնել',
    tourPauseTooltip: 'Դադար',
    tourMuteTooltip: 'Անջատել ձայնը',
    tourUnmuteTooltip: 'Միացնել ձայնը',
    tourFullscreenTooltip: 'Ամբողջ էկրանով',

    brandsBadge: 'Խոշոր հաճախորդներ և գործընկերներ',
    brandsHeadline: 'Ավտոմոբիլային և գազային խոշորագույն ընկերությունների վստահելի մատակարար',

    catalogEditionBadge: 'Պաշտոնական հրատարակություն 2026',
    catalogModalTitle: 'Ներբեռնել LPG գազաբալոնների պաշտոնական կատալոգը',
    catalogModalDesc: 'Համապարփակ ուղեցույց 13 մոդելների, ISO/EN սերտիֆիկատների, RAL գույների և կոնտեյներային լոգիստիկայի վերաբերյալ:',
    catalogFeature1: '13 բալոնների մոդել (կենցաղային, արդյունաբերական, ավտո)',
    catalogFeature2: '30 բար հիդրոստատիկ փորձարկման տվյալներ և պողպատի վերլուծություն',
    catalogFeature3: '20ft և 40ft HQ կոնտեյներների բեռնման տարողություններ',
    catalogFeature4: 'Էլեկտրաստատիկ փոշեներկման RAL գունային աղյուսակ',
    catalogDownloadBtn: 'Ներբեռնել PDF կատալոգը',
    catalogGeneratingPdf: 'Կատալոգը պատրաստվում և ներբեռնվում է...',
    catalogDownloadSuccess: 'Կատալոգը հաջողությամբ ներբեռնվեց:',
    catalogDirectInquiry: 'Մեծածախ հարցում WhatsApp-ով',

    specsModalAnglesTab: '3 տեսանկյուն և RAL գույներ (4:3)',
    specsModalBlueprintTab: 'Գծագիր',
    specsModalGalleryTab: 'Գործարանի պատկերասրահ',
    specsColorCoatingNote: 'Բոլոր բալոնները պատվում են 80-120 մկմ էլեկտրաստատիկ փոշեներկով և թրծվում 180°C ջերմաստիճանում:',
    specsColorsFound: 'գույն գտնվեց',
    allTopics: 'Բոլոր թեմաները',
    copiedTooltip: 'Պատճենված է',
    procurementCalloutTitle: 'Ստանդարտ բալոնների պատվեր',
    procurementCalloutDesc: 'Արտադրություն EN 1442 և DOT-4BA ստանդարտներով',
    rfqBadge: 'Առցանց գնահարցում և կոնտեյներային բեռնման հաշվիչ',
    rfqTitle: 'Քանակի, քաշի և գործարանին հարցման հաշվիչ',
    rfqDesc: 'Ընտրեք անհրաժեշտ մոդելները և քանակը՝ բեռի ընդհանուր քաշը և կոնտեյների տարողությունը հաշվարկելու և վաճառքի բաժնին հարցում ուղարկելու համար:',
    rfqAddTitle: 'Ընտրել գազաբալոնի մոդելը և քանակը',
    rfqModelLabel: 'Գազաբալոնի / բաքի տեսակը՝',
    rfqQuantityLabel: 'Պահանջվող քանակ (հատ)՝',
    rfqAddBtn: 'Ավելացնել հարցման ցանկին',
    rfqBuyerInfoTitle: 'Գնորդի լրացուցիչ տվյալներ (նախնական հաշվի համար)',
    rfqNamePlaceholder: 'Անուն, Ազգանուն',
    rfqCompanyPlaceholder: 'Ընկերության անվանում',
    rfqDestPlaceholder: 'Նշանակետ նավահանգիստ / Երկիր',
    rfqSummaryTitle: 'Ընտրված ապրանքներ և լոգիստիկ ամփոփում',
    rfqClearBtn: 'Մաքրել',
    rfqEmptyText: 'Դեռևս որևէ ապրանք չի ավելացվել: Սկսելու համար ընտրեք մոդելը վերևում:',
    rfqTotalUnits: 'Ընդհանուր քանակ',
    rfqTotalWeight: 'Ընդհանուր քաշ',
    rfqTonsUnit: 'տոննա',
    rfqContainerEstimate: '40HQ կոնտեյների հաշվարկ',
    rfqSubmitWhatsApp: 'Պաշտոնական հարցում ուղարկել արտահանման տնօրենին (WhatsApp)',
    faqBadge: 'Հաճախակի տրվող հարցեր',
    faqTitle: 'Պատասխաններ տեխնիկական, արտադրական և արտահանման հարցերին',
    faqUnlistedTitle: 'Ունե՞ք հարց, որը նշված չէ ցանկում:',
    faqUnlistedDesc: 'Մեր ինժեներներն ու արտահանման բաժինը պատրաստ են պատասխանել 24/7 ռեժիմով:',
    faqChatWhatsApp: 'Զրուցել WhatsApp-ով',
    footerCatalogBrochureDesc: 'Ներբեռնել տեխնիկական պաշտոնական բրոշյուրը և չափերի ուղեցույցը',
    footerDownloadFreePdf: 'Ներբեռնել անվճար PDF կատալոգը',
    contactMessagePlaceholder: 'Խնդրում ենք նշել պահանջվող քանակը, բալոնների տարողությունը կամ հատուկ պահանջները...',
    contactMobileHotline: 'Բջջային թեժ գիծ',
    contactFactoryLandline: 'Գործարանի քաղաքային հեռախոս',
    ralModalTitle: 'RAL էլեկտրաստատիկ փոշեներկման գունային աղյուսակ',
    ralModalDesc: 'Ընտրեք ջերմակայուն պատվածք՝ համաձայն միջազգային RAL ստանդարտի',
    ralSearchPlaceholder: 'Փնտրել ըստ RAL կոդի (օր. 6018 կամ RAL 5015) կամ գույնի անվանման...',
    ralClear: 'Մաքրել',
    heroBannerLabel: 'Բաններ',
    heroPrevBanner: 'Նախորդ բաններ',
    heroNextBanner: 'Հաջորդ բաններ',
    heroClose: 'Փակել',
  },
};
