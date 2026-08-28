export interface FactoryCertificate {
  id: string;
  image: string;
  title: Record<string, string>;
  issuer: Record<string, string>;
  standardCode: string;
  scope: Record<string, string>;
  category: 'national' | 'international' | 'quality';
}

export const FACTORY_CERTIFICATES: FactoryCertificate[] = [
  {
    id: 'cert-isiri-1',
    image: '/certificates/2c-scaled.webp',
    title: {
      fa: 'پروانه کاربرد علامت استاندارد ملی ایران (سیلندر گاز مایع)',
      en: 'National Standard of Iran Certification (LPG Cylinders)',
      ar: 'شهادة المواصفات والمقاييس الوطنية الإيرانية',
      ru: 'Сертификат Национального стандарта Ирана на баллоны сжиженного газа',
      tr: 'İran Ulusal Standart Sertifikası (LPG Silindirleri)',
      fr: 'Certificat de Norme Nationale d\'Iran pour Bouteilles GPL',
      de: 'Nationales Standardzertifikat des Iran für Flüssiggasflaschen',
      es: 'Certificado de Norma Nacional de Irán para Cilindros de GLP',
    },
    issuer: {
      fa: 'سازمان ملی استاندارد ایران (ISIRI)',
      en: 'Institute of Standards and Industrial Research of Iran',
      ar: 'المؤسسة الوطنية للمواصفات القياسية الإيرانية',
      ru: 'Институт стандартов и промышленных исследований Ирана',
      tr: 'İran Standartlar Enstitüsü',
      fr: 'Institut des Normes d\'Iran',
      de: 'Institut für Normen des Iran',
      es: 'Instituto de Normas de Irán',
    },
    standardCode: 'ISIRI 841 / ISIRI 406',
    scope: {
      fa: 'تولید انواع سیلندرهای گاز مایع، آزمون‌های هیدرواستاتیک و تست‌های ایمنی تحت فشار',
      en: 'Manufacture of transportable refillable LPG cylinders, hydrostatic & burst pressure compliance',
      ar: 'تصنيع أسطوانات الغاز المسال، اختبارات الضغط الهيدروستاتيكي واشتراطات السلامة',
      ru: 'Производство баллонов для сжиженного углеводородного газа и гидростатические испытания',
      tr: 'Taşınabilir yeniden doldurulabilir LPG tüplerinin üretimi ve basınç testleri',
      fr: 'Fabrication de bouteilles de GPL et essais de pression hydrostatique',
      de: 'Herstellung von Flüssiggasflaschen und hydrostatische Druckprüfungen',
      es: 'Fabricación de cilindros de GLP y pruebas de presión hidrostática',
    },
    category: 'national',
  },
  {
    id: 'cert-iso-9001',
    image: '/certificates/4c-scaled.webp',
    title: {
      fa: 'گواهینامه بین‌المللی سیستم مدیریت کیفیت ISO 9001:2015',
      en: 'ISO 9001:2015 Quality Management System Certificate',
      ar: 'شهادة نظام إدارة الجودة الدولية ISO 9001:2015',
      ru: 'Международный сертификат менеджмента качества ISO 9001:2015',
      tr: 'ISO 9001:2015 Kalite Yönetim Sistemi Sertifikası',
      fr: 'Certificat de Système de Management de la Qualité ISO 9001:2015',
      de: 'ISO 9001:2015 Qualitätsmanagementsystem-Zertifikat',
      es: 'Certificado de Sistema de Gestión de Calidad ISO 9001:2015',
    },
    issuer: {
      fa: 'مرجع بین‌المللی صدور گواهینامه معتبر',
      en: 'International Quality Accreditation Body',
      ar: 'هيئة الاعتماد الدولية للجودة',
      ru: 'Международный орган по аккредитации качества',
      tr: 'Uluslararası Kalite Akreditasyon Kurumu',
      fr: 'Organisme international d\'accréditation de la qualité',
      de: 'Internationale Qualitätsakkreditierungsstelle',
      es: 'Organismo internacional de acreditación de calidad',
    },
    standardCode: 'ISO 9001 / EN 1442',
    scope: {
      fa: 'طراحی، قالب‌سازی، ساخت و بازرسی فنی سیلندرهای فولادی تحت فشار گاز مایع',
      en: 'Design, tooling, fabrication, and technical inspection of welded steel gas pressure cylinders',
      ar: 'تصميم وتصنيع وفحص أسطوانات الصلب الملحومة المضغوطة للغاز المسال',
      ru: 'Проектирование, производство и контроль качества стальных баллонов высокого давления',
      tr: 'Kaynaklı çelik gaz basınçlı tüplerin tasarımı, imalatı ve teknik muayenesi',
      fr: 'Conception, fabrication et contrôle technique des bouteilles à gaz en acier soudé',
      de: 'Konstruktion, Fertigung und technische Prüfung geschweißter Druckgasflaschen',
      es: 'Diseño, fabricación e inspección técnica de cilindros de gas de acero soldado',
    },
    category: 'quality',
  },
  {
    id: 'cert-safety-inspection',
    image: '/certificates/5c-scaled.webp',
    title: {
      fa: 'تاییدیه صلاحیت بازرسی فنی و ایمنی خطوط تولید و آزمون ۳۰ بار',
      en: 'Technical Safety & 30-Bar Pressure Testing Compliance Approval',
      ar: 'اعتماد السلامة الفنية واختبارات الضغط 30 بار لخطوط الإنتاج',
      ru: 'Сертификат соответствия технической безопасности и испытаний давлением 30 бар',
      tr: 'Teknik Güvenlik ve 30 Bar Basınç Testi Uygunluk Onayı',
      fr: 'Approbation de conformité de sécurité technique et d\'essais sous pression de 30 bars',
      de: 'Konformitätszertifikat für technische Sicherheit und 30-Bar-Druckprüfungen',
      es: 'Aprobación de cumplimiento de seguridad técnica y pruebas de presión de 30 bares',
    },
    issuer: {
      fa: 'مراجع بازرسی مهندسی و تایید صلاحیت صنعتی',
      en: 'Industrial Engineering Safety & Inspection Authority',
      ar: 'سلطة التفتيش والسلامة الهندسية الصناعية',
      ru: 'Орган промышленной экспертизы и технического надзора',
      tr: 'Endüstriyel Mühendislik ve Güvenlik Teftiş Kurumu',
      fr: 'Autorité d\'inspection et de sécurité de l\'ingénierie industrielle',
      de: 'Behörde für industrielle Sicherheits- und Ingenieurprüfung',
      es: 'Autoridad de inspección y seguridad de ingeniería industrial',
    },
    standardCode: 'DOT-4BA / TPED Directives',
    scope: {
      fa: 'انجام آزمون‌های غیرمخرب (NDT)، بازرسی اشعه ایکس جوش و تست دوره‌ای هیدرواستاتیک',
      en: 'Non-Destructive Testing (NDT), X-Ray weld seam radiography, and hydrostatic safety verification',
      ar: 'الاختبارات غير المدمرة (NDT)، التصوير الشعاعي بالأشعة السينية لدرزات اللحام والتحقق الهيدروستاتيكي',
      ru: 'Неразрушающий контроль (NDT), рентгенография сварных швов и гидростатические испытания',
      tr: 'Tahribatsız muayene (NDT), röntgen kaynak kontrolü ve hidrostatik doğrulama',
      fr: 'Contrôle non destructif (CND), radiographie des soudures et vérification hydrostatique',
      de: 'Zerstörungsfreie Prüfung (ZfP), Schweißnaht-Röntgen und hydrostatische Verifizierung',
      es: 'Ensayos no destructivos (NDT), radiografía de soldaduras y verificación hidrostática',
    },
    category: 'international',
  },
];
