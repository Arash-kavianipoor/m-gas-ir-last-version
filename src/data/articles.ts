import { LanguageCode } from '../types';

export interface ArticleSection {
  id: string;
  title: Record<LanguageCode, string>;
  content: Record<LanguageCode, string>;
  table?: {
    headers: Record<LanguageCode, string[]>;
    rows: Record<LanguageCode, string[][]>;
  };
  diagram?: string;
  callout?: {
    type: 'warning' | 'info' | 'standard';
    title: Record<LanguageCode, string>;
    text: Record<LanguageCode, string>;
  };
}

export interface Article {
  id: string;
  slug: string;
  publishDate: string;
  modifyDate: string;
  readTimeMinutes: number;
  author: {
    name: string;
    role: Record<LanguageCode, string>;
    avatar: string;
  };
  coverImage: string;
  category: Record<LanguageCode, string>;
  tags: Record<LanguageCode, string[]>;
  title: Record<LanguageCode, string>;
  abstract: Record<LanguageCode, string>;
  keyTakeaways: Record<LanguageCode, string[]>;
  sections: ArticleSection[];
  references: {
    id: number;
    title: string;
    url: string;
  }[];
}

export const TECHNICAL_ARTICLES: Article[] = [
  {
    id: 'article-engineering-standards-manufacturing',
    slug: 'engineering-standards-lpg-cylinder-manufacturing',
    publishDate: '2023-04-10T09:00:00+03:30',
    modifyDate: '2026-08-25T11:00:00+03:30',
    readTimeMinutes: 18,
    author: {
      name: 'Mousa Amooie & M Gas Engineering Team',
      role: {
        fa: 'مدیریت ارشد کارخانه م گاز و کارگروه مهندسی متالورژی و ایمنی فشار مخازن',
        en: 'Managing Director & Metallurgy & Pressure Vessel Safety Taskforce',
        ar: 'المدير العام وفريق هندسة المعادن وسلامة أوعية الضغط',
        de: 'Geschäftsführer & Arbeitsgruppe für Metallurgie und Druckbehältersicherheit',
        ur: 'مینجنگ ڈائریکٹر اور میٹالرجی اور پریشر ویسل سیفٹی ٹاسک فورس',
        hy: 'Գլխավոր տնօրեն և ճնշման անոթների անվտանգության ինժեներական խումբ',
        tr: 'Genel Müdür ve Metalurji & Basınçlı Kap Güvenliği Mühendislik Ekibi',
        ru: 'Генеральный директор и инженерная группа по металлургии и сосудам под давлением',
      },
      avatar: '/founder/mousa-amooie.png',
    },
    coverImage: '/articles/engineering.png',
    category: {
      fa: 'استانداردهای مهندسی و ساخت',
      en: 'Engineering & Manufacturing Standards',
      ar: 'المعايير الهندسية والتصنيع',
      de: 'Ingenieur- und Fertigungsstandards',
      ur: 'انجینئرنگ اور مینوفیکچرنگ کے معیارات',
      hy: 'Ինժեներական և արտադրական ստանդարտներ',
      tr: 'Mühendislik ve İmalat Standartları',
      ru: 'Инженерные стандарты и производство',
    },
    tags: {
      fa: ['استاندارد کپسول گاز', 'جوشکاری زیرپودری', 'تست هیدرواستاتیک', 'میکروآلیاژ', 'EN 1442', 'DOT-4BA', 'ISO 4706'],
      en: ['LPG Cylinder Standards', 'Submerged Arc Welding', 'Hydrostatic Testing', 'Microalloyed Steel', 'EN 1442', 'DOT-4BA', 'ISO 4706'],
      ar: ['معايير أسطوانات الغاز', 'اللحام الآلي', 'الفحص الهيدروستاتيكي', 'الصلب الميكرو-سبائكي', 'EN 1442', 'DOT-4BA', 'ISO 4706'],
      de: ['LPG-Zylinderstandards', 'Unterpulverschweißen', 'Hydrostatische Prüfung', 'Mikrolegierter Stahl', 'EN 1442', 'DOT-4BA'],
      ur: ['ایل پی جی سلنڈر کے معیارات', 'خودکار ویلڈنگ', 'ہائیڈروسٹیٹک ٹیسٹنگ', 'مائیکرو الائے اسٹیل', 'EN 1442', 'DOT-4BA'],
      hy: ['LPG բալոնների ստանդարտներ', 'Ավտոմատ զոդում', 'Հիդրոստատիկ փորձարկում', 'EN 1442', 'DOT-4BA'],
      tr: ['LPG Tüp Standartları', 'Tozaltı Kaynak', 'Hidrostatik Test', 'Mikro Alaşımlı Çelik', 'EN 1442', 'DOT-4BA'],
      ru: ['Стандарты баллонов LPG', 'Сварка под флюсом', 'Гидроиспытания 30 бар', 'Микролегированная сталь', 'EN 1442', 'DOT-4BA', 'ГОСТ'],
    },
    title: {
      fa: 'استانداردهای مهندسی و پروتکل‌های ایمنی در ساخت کپسول‌های گاز مایع (LPG): تحلیل جامع فنی و مقرراتی',
      en: 'Engineering Standards and Safety Protocols in Liquefied Petroleum Gas Cylinder Manufacturing: A Comprehensive Technical and Regulatory Analysis',
      ar: 'المعايير الهندسية وبروتوكولات السلامة في تصنيع أسطوانات الغاز المسال (LPG): تحليل فني وتنظيمي شامل',
      de: 'Technische Standards und Sicherheitsprotokolle bei der Herstellung von Flüssiggasflaschen (LPG): Eine umfassende Analyse',
      ur: 'مائع پیٹرولیم گیس (LPG) سلنڈر مینوفیکچرنگ میں انجینئرنگ کے معیارات اور حفاظتی پروٹوکولز: جامع تکنیکی تجزیہ',
      hy: 'Ճարտարագիտական ստանդարտներ և անվտանգության արձանագրություններ հեղուկ գազի (LPG) բալոնների արտադրության մեջ',
      tr: 'LPG Gaz Tüpü İmalatında Mühendislik Standartları ve Güvenlik Protokolleri: Kapsamlı Teknik ve Düzenleyici Analiz',
      ru: 'Инженерные стандарты и протоколы безопасности при производстве газовых баллонов LPG: Комплексный технический анализ',
    },
    abstract: {
      fa: 'این مقاله پژوهشی-مهندسی به بررسی مبانی متالورژی ورق‌های فولادی میکروآلیاژ، فرآیندهای کشش عمیق هیدرولیک، جوشکاری مکانیزه زیرپودری (SAW)، عملیات حرارتی تنش‌زدایی (PWHT) در ۹۳۰ درجه سانتی‌گراد، روش‌های آزمون غیرمخرب (NDT)، تست فشار هیدرواستاتیک ۳۰ بار و انطباق با کدهای بین‌المللی ISO 4706، EN 1442 و DOT-4BA می‌پردازد.',
      en: 'This technical paper examines the metallurgical criteria of microalloyed steel, hydraulic deep drawing forming, automated submerged arc welding (SAW), normalizing post-weld heat treatment (PWHT) at 930°C, non-destructive testing (NDT), 30-bar hydrostatic proof expansion, and global regulatory compliance across ISO 4706, EN 1442, and US DOT-4BA codes.',
      ar: 'تتناول هذه الورقة الهندسية الشاملة معايير اختيار سبائك الصلب المقاومة، عمليات السحب العميق الهيدروليكي، تقنيات اللحام الآلي بالقوس المغمور (SAW)، المعالجة الحرارية بعد اللحام (PWHT) عند 930 درجة مئوية، واختبارات التمدد الهيدروستاتيكي بضغط 30 بار وفق معايير ISO 4706 و EN 1442.',
      de: 'Diese technische Analyse untersucht metallurgische Kriterien für mikrolegierten Stahl, Tiefziehverfahren, automatisiertes Unterpulverschweißen, Wärmebehandlung nach dem Schweißen (PWHT) bei 930°C, 30-Bar-Hydrostatikprüfungen und die Einhaltung internationaler Vorschriften nach ISO 4706 und EN 1442.',
      ur: 'یہ تکنیکی دستاویز مائیکرو الائے اسٹیل کے میٹالرجیکل انتخاب، ہائیڈرولک ڈیپ ڈرائنگ، خودکار ویلڈنگ، 930 ڈگری پر ہیٹ ٹریٹمنٹ اور 30 بار ہائیڈروسٹیٹک ٹیسٹنگ کے معیارات کا جائزہ پیش کرتی ہے۔',
      hy: 'Այս տեխնիկական հոդվածը մանրամասնում է պողպատի ընտրությունը, հիդրավլիկ ձգումը, ավտոմատ զոդումը, 930°C ջերմային մշակումը և 30 բար հիդրոստատիկ փորձարկումները:',
      tr: 'Bu teknik makale; mikro alaşımlı çelik metalurjisi, derin çekme presleri, tozaltı otomatik kaynak, 930°C normalizasyon ısıl işlemi, 30 bar hidrostatik basınç testi ve ISO 4706 ile EN 1442 standartlarına uyumluluğu detaylandırmaktadır.',
      ru: 'Комплексный инженерный анализ металлургических требований к микролегированной стали, глубокой вытяжке, автоматической сварке под флюсом (SAW), термообработке (PWHT) при 930°C, гидроиспытаниям давлением 30 бар и соответствию стандартам ISO 4706, EN 1442 и DOT-4BA.',
    },
    keyTakeaways: {
      fa: [
        'کنترل سخت‌گیرانه گوگرد و فسفر فولاد (کمتر از ۰.۰۱۵٪) جهت مقاومت ضربه‌ای بالا در دمای منفی ۵۰ درجه سانتی‌گراد',
        'فرآیند کشش عمیق هیدرولیک با نرخ تقلیل بهینه برای حفظ یکنواختی ضخامت جداره بدنه سیلندر',
        'جوشکاری قوسی مکانیزه زیرپودری دوطرفه با نفوذ ۱۰۰٪ و آزمون رادیوگرافی پیوسته',
        'عملیات حرارتی نرمالیزاسیون در کوره پیوسته در دمای ۹۰۰ تا ۹۳۰ درجه سانتی‌گراد جهت بازگرداندن چقرمگی و حذف تنش‌های پسماند',
        'آزمون هیدرواستاتیک انبساط حجمی در ۳۰ بار و الزام به انبساط پسماند دائمی کمتر از ۱۰٪',
      ],
      en: [
        'Strict sulfur and phosphorus limits (<0.015%) ensuring sub-zero Charpy V-notch impact toughness down to -50°C',
        'Multi-stage hydraulic deep drawing ensuring uniform wall thickness and defect-free crown geometry',
        'Automated longitudinal and circumferential Submerged Arc Welding (SAW) with 100% penetration and continuous NDT',
        'Continuous normalizing Post-Weld Heat Treatment (PWHT) at 900–930°C restoring microstructure and relieving residual stress',
        '100% factory hydrostatic proof expansion test at 30 Bar with permanent expansion ratio strictly capped below 10%',
      ],
      ar: [
        'نسبة منخفضة جداً من الكبريت والفوسفور (<0.015%) لضمان مقاومة الصدمات في درجات حرارة تصل إلى -50 مئوية',
        'تشكيل عميق هيدروليكي دقيق يضمن تماثل سماكة جدار الأسطوانة وقوة القبة العلوية والسفلية',
        'لحام آلي بالقوس المغمور (SAW) مع اختراق كامل بنسبة 100% وفحص إشعاعي مستمر',
        'معالجة حرارية مستمرة (PWHT) في أفران عند 900-930 درجة مئوية لإزالة الإجهادات المتبقية بالكامل',
        'فحص هيدروستاتيكي إلزامي لكل أسطوانة بضغط 30 بار مع نسبة تمدد دائم أقل من 10%',
      ],
      de: [
        'Niedriger Schwefel- und Phosphorgehalt (<0,015%) für höchste Kerbschlagarbeit bis -50°C',
        'Mehrstufiges hydraulisches Tiefziehen für gleichmäßige Wandstärkenverteilung',
        'Vollautomatisches Unterpulverschweißen (SAW) mit 100% Durchschweißung und NDT-Prüfung',
        'Normalisierendes Glühen (PWHT) bei 900–930°C zum Abbau von Schweißrestspannungen',
        '100% werkseitige hydrostatische 30-Bar-Druckprüfung mit max. 10% bleibender Dehnung',
      ],
      ur: [
        'کم سلفر اور فاسفورس کی حد جو منفی 50 ڈگری پر بھی بہترین پائیداری فراہم کرتی ہے',
        'یکساں موٹائی برقرار رکھنے کے لیے جدید ہائیڈرولک ڈیپ ڈرائنگ',
        '100 فیصد نفوذ کے ساتھ مکمل خودکار سبمرجڈ آرک ویلڈنگ',
        '900 سے 930 ڈگری سینٹی گریڈ پر ہیٹ ٹریٹمنٹ جو اندرونی دباؤ کو مکمل ختم کرتی ہے',
        'ہر سلنڈر کے لیے لازمی 30 بار ہائیڈروسٹیٹک ٹیسٹنگ',
      ],
      hy: [
        'Ծծմբի և ֆոսֆորի խիստ սահմանափակում (<0.015%) մինչև -50°C ցրտադիմացկունության համար',
        'Բազմափուլ հիդրավլիկ ձգում պատի միատեսակ հաստության համար',
        '100% ավտոմատ զոդում և ռենտգենյան հսկողություն',
        '900–930°C ջերմային մշակում ներքին լարումների վերացման համար',
        '30 բար հիդրոստատիկ փորձարկում 100% արտադրանքի համար',
      ],
      tr: [
        '-50°C sıcaklıkta bile darbe tokluğu için düşük kükürt ve fosfor oranı (<%0.015)',
        'Eşit et kalınlığı sağlayan çok kademeli hidrolik derin çekme teknolojisi',
        '%100 tam nüfuziyetli otomatik tozaltı çevresel ve boyuna kaynak hattı',
        '900-930°C sıcaklıkta sürekli normalizasyon fırınında artık gerilim giderme (PWHT)',
        '%100 basınç testinde 30 bar hidrostatik genişleme ve <%10 kalıcı deformasyon şartı',
      ],
      ru: [
        'Микролегированная сталь с содержанием серы и фосфора <0.015% для ударной вязкости при -50°C',
        'Многоступенчатая гидравлическая глубокая вытяжка для равномерности толщины стенок',
        'Автоматическая двухсторонняя сварка под флюсом (SAW) со 100% проваром и радиографией',
        'Непрерывная нормализация (PWHT) при температуре 900–930°C для снятия внутренних напряжений',
        'Обязательные заводские гидроиспытания каждого баллона давлением 30 бар с контролем остаточного расширения (<10%)',
      ],
    },
    sections: [
      {
        id: 'metallurgical-selection',
        title: {
          fa: '۱. انتخاب متالورژیکی و الزامات مهندسی ورق‌های فولادی',
          en: '1. Material Selection & Metallurgical Specifications',
          ar: '1. المعايير الميتالورجية واختيار سبائك الصلب',
          de: '1. Werkstoffauswahl & Metallurgische Spezifikationen',
          ur: '1. میٹالرجیکل انتخاب اور اسٹیل کی تکنیکی خصوصیات',
          hy: '1. Մետալուրգիական ընտրություն և պողպատի բնութագրեր',
          tr: '1. Metalurjik Seçim ve Çelik Sac Mühendislik Şartları',
          ru: '1. Металлургические требования и выбор стального проката',
        },
        content: {
          fa: 'سیلندرهای گاز مایع به دلیل کاربری تحت فشار متغیر و در معرض شرایط جوی گوناگون، نیازمند ورق‌های فولادی کم‌کربن میکروآلیاژ با قابلیت شکل‌پذیری عمیق، جوش‌پذیری عالی و مقاومت تسلیم کنترل‌شده هستند. استانداردهای مرجع نظیر EN 10120 (ورق‌های فولادی برای کپسول‌های گاز قابل حمل) و ASTM A516، مقادیر مجاز کربن را زیر ۰.۱۸٪ و گوگرد/فسفر را زیر ۰.۰۱۵٪ محدود می‌کنند تا از ایجاد عیوب تردش سرد و ایجاد ترک‌های مویی ناشی از هیدروژن جلوگیری شود.',
          en: 'LPG cylinders undergo constant cyclic pressure and diverse ambient temperatures, necessitating fine-grained, microalloyed low-carbon steels exhibiting superior deep-drawability, defect-free weldability, and controlled yield-to-tensile ratios. Governing specifications such as EN 10120 (steel sheet for welded gas cylinders) and ASTM A516 mandate carbon equivalents below 0.40% and strict caps on sulfur (S ≤ 0.010%) and phosphorus (P ≤ 0.015%) to eliminate hot-cracking and low-temperature embrittlement.',
          ar: 'تتطلب أسطوانات الغاز المسال استخدام صفائح فولاذية منخفضة الكربون وميكرو-سبائكية ذات حبيبات دقيقة لضمان القابلية العالية للسحب العميق وقابلية اللحام الممتازة ومقاومة الإجهاد الدوري. تنص معايير EN 10120 و ASTM على ألا تتجاوز نسبة الكربون 0.18% مع تقييد محتوى الكبريت والفوسفور لأقل من 0.015% لتفادي التصدعات الهيدروجينية.',
          de: 'Flüssiggasflaschen erfordern feinkörnige, mikrolegierte Feinkornbaustähle nach EN 10120 mit hervorragender Tiefziehfähigkeit und Schweißeignung. Der Kohlenstoffgehalt wird unter 0,18% und der Schwefel-/Phosphorgehalt unter 0,015% gehalten, um Sprödbruch und Schweißnahtrisse auszuschließen.',
          ur: 'ایل پی جی سلنڈروں کے لیے اعلیٰ معیار کے مائیکرو الائے اسٹیل کی ضرورت ہوتی ہے جس میں کاربن کی مقدار 0.18 فیصد سے کم اور فاسفورس 0.015 فیصد سے کم ہو تاکہ شدید دباؤ میں بھی پھٹنے کا کوئی خطرہ نہ رہے۔',
          hy: 'LPG գազաբալոնները պահանջում են միկրոհամաձուլվածքային ցածր ածխածնային պողպատներ՝ համաձայն EN 10120 ստանդարտի, ապահովելով գերազանց եռակցելիություն և ցրտադիմացկունություն:',
          tr: 'LPG tüpleri; EN 10120 standardına uygun, yüksek şekillendirilebilirliğe ve üstün kaynak kabiliyetine sahip ince taneli mikro alaşımlı çelik saclardan imal edilir. Karbon oranı %0.18 altında, kükürt ve fosfor %0.015 altında tutularak gevrek kırılma riski sıfırlanır.',
          ru: 'Корпуса баллонов изготавливаются из мелкозернистой микролегированной стали согласно EN 10120 / ГОСТ с углеродным эквивалентом <0.40% и содержанием серы и фосфора менее 0.015%, что обеспечивает высокую пластичность и исключает водородное охрупчивание.',
        },
        table: {
          headers: {
            fa: ['پارامتر متالورژیکی', 'محدوده مجاز استاندارد EN 10120', 'مقدار اختصاصی کارخانه م گاز', 'هدف مهندسی'],
            en: ['Metallurgical Parameter', 'EN 10120 Standard Range', 'M Gas Specification Target', 'Engineering Objective'],
            ar: ['المعيار الميتالورجي', 'المجال المسموح (EN 10120)', 'مواصفات مصنع م غاز', 'الهدف الهندسي'],
            de: ['Metallurgischer Parameter', 'EN 10120 Richtwert', 'M Gas Zielwert', 'Technisches Ziel'],
            ur: ['پیرامیٹر', 'معیاری حد', 'ایم گیس ہدف', 'ہندسی مقصد'],
            hy: ['Մետալուրգիական պարամետր', 'EN 10120 ստանդարտ', 'M Gas թիրախ', 'Նպատակ'],
            tr: ['Metalurjik Parametre', 'EN 10120 Standart Limiti', 'M Gas Özel Değeri', 'Mühendislik Amacı'],
            ru: ['Параметр', 'Предел EN 10120', 'Значение завода М Газ', 'Инженерная цель'],
          },
          rows: {
            fa: [
              ['کربن (Carbon)', '≤ ۰.۲۰٪', '۰.۱۴٪ - ۰.۱۶٪', 'جلوگیری از تردی جوش و بهینه‌سازی قابلیت کشش'],
              ['گوگرد (Sulfur)', '≤ ۰.۰۱۵٪', '≤ ۰.۰۰۸٪', 'افزایش چقرمگی ضربه و حذف آخال‌های غیرفلزی'],
              ['فسفر (Phosphorus)', '≤ ۰.۰۲۰٪', '≤ ۰.۰۱۰٪', 'حفظ مقاومت ضربه‌ای در دمای منفی ۵۰ درجه'],
              ['استحکام تسلیم (Yield Strength)', '≥ ۲۶۵ مگاپاسکال', '۲۸۵ - ۳۲۰ مگاپاسکال', 'جلوگیری از تغییر شکل پلاستیک در فشار آزمون'],
              ['ازدیاد طول نسبی (Elongation)', '≥ ۲۸٪', '≥ ۳۲٪', 'اطمینان از تغییر شکل شکل‌پذیر (Ductile) در هنگام گسیختگی'],
            ],
            en: [
              ['Carbon (C)', '≤ 0.20%', '0.14% – 0.16%', 'Prevents weld embrittlement; optimizes deep drawability'],
              ['Sulfur (S)', '≤ 0.015%', '≤ 0.008%', 'Increases Charpy toughness; minimizes inclusion density'],
              ['Phosphorus (P)', '≤ 0.020%', '≤ 0.010%', 'Guarantees sub-zero impact resistance down to -50°C'],
              ['Yield Strength (Re)', '≥ 265 MPa', '285 – 320 MPa', 'Resists localized plastic deformation at proof pressures'],
              ['Elongation (A5)', '≥ 28%', '≥ 32%', 'Ensures 100% ductile rupture mode prior to burst failure'],
            ],
            ar: [
              ['الكربون (C)', '≤ 0.20%', '0.14% – 0.16%', 'منع هشاشة اللحام وتحسين السحب العميق'],
              ['الكبريت (S)', '≤ 0.015%', '≤ 0.008%', 'رفع متانة الصدمات وتقليل الشوائب غير المعدنية'],
              ['الفوسفور (P)', '≤ 0.020%', '≤ 0.010%', 'ضمان مقاومة الصدمات في درجات حرارة سالبة حتى -50°C'],
              ['مقاومة الخضوع (Yield)', '≥ 265 ميغاباسكال', '285 – 320 ميغاباسكال', 'مقاومة التشوه اللدن تحت ضغوط الاختبار'],
              ['الاستطالة (Elongation)', '≥ 28%', '≥ 32%', 'ضمان حدوث انهيار لدن (Ductile) آمن عند الانفجار التجريبي'],
            ],
            de: [
              ['Kohlenstoff (C)', '≤ 0,20%', '0,14% – 0,16%', 'Vermeidung von Schweißversprödung'],
              ['Schwefel (S)', '≤ 0,015%', '≤ 0,008%', 'Maximale Kerbschlagzähigkeit'],
              ['Phosphor (P)', '≤ 0,020%', '≤ 0,010%', 'Kälteschlagzähigkeit bis -50°C'],
              ['Streckgrenze (Re)', '≥ 265 MPa', '285 – 320 MPa', 'Verhindert plastische Verformung bei Prüfdruck'],
              ['Bruchdehnung (A5)', '≥ 28%', '≥ 32%', 'Garantierter duktiler Berstmodus'],
            ],
            ur: [
              ['کاربن', '≤ 0.20%', '0.14% – 0.16%', 'ویلڈ کی لچک اور ڈیپ ڈرائنگ کے لیے'],
              ['سلفر', '≤ 0.015%', '≤ 0.008%', 'چوٹ برداشت کرنے کی صلاحیت'],
              ['فاسفورس', '≤ 0.020%', '≤ 0.010%', 'منفی 50 درجہ حرارت پر پائیداری'],
              ['یلڈ اسٹرینتھ', '≥ 265 MPa', '285 – 320 MPa', 'پریشر میں شکل برقرار رکھنا'],
              ['ایلونگیشن', '≥ 28%', '≥ 32%', 'حفاظتی لچک کی ضمانت'],
            ],
            hy: [
              ['Ածխածին (C)', '≤ 0.20%', '0.14% – 0.16%', 'Զոդման որակ և ճկունություն'],
              ['Ծծումբ (S)', '≤ 0.015%', '≤ 0.008%', 'Հարվածադիմացկունություն'],
              ['Ֆոսֆոր (P)', '≤ 0.020%', '≤ 0.010%', 'Ցրտադիմացկունություն մինչև -50°C'],
              ['Հոսունության սահման', '≥ 265 MPa', '285 – 320 MPa', 'Կառուցվածքային կայունություն'],
              ['Հարաբերական երկարացում', '≥ 28%', '≥ 32%', 'Պլաստիկ դեֆորմացիայի ապահովում'],
            ],
            tr: [
              ['Karbon (C)', '≤ %0.20', '%0.14 – %0.16', 'Kaynak gevrekliğini önler, derin çekmeyi optimize eder'],
              ['Kükürt (S)', '≤ %0.015', '≤ %0.008', 'Darbe tokluğunu maksimize eder, kalıntıları temizler'],
              ['Fosfor (P)', '≤ %0.020', '≤ %0.010', '-50°C altında soğuk darbe direncini garanti eder'],
              ['Akma Dayanımı (Re)', '≥ 265 MPa', '285 – 320 MPa', 'Test basıncında plastik deformasyonu önler'],
              ['Kopma Uzaması (A5)', '≥ %28', '≥ %32', 'Patlama testinde %100 sünek (ductile) yırtılma sağlar'],
            ],
            ru: [
              ['Углерод (C)', '≤ 0.20%', '0.14% – 0.16%', 'Предотвращение охрупчивания околошовной зоны'],
              ['Сера (S)', '≤ 0.015%', '≤ 0.008%', 'Максимальная ударная вязкость по Шарпи'],
              ['Фосфор (P)', '≤ 0.020%', '≤ 0.010%', 'Хладостойкость металла до -50°C'],
              ['Предел текучести (Re)', '≥ 265 МПа', '285 – 320 МПа', 'Стойкость к остаточной деформации при опрессовке'],
              ['Относительное удлинение', '≥ 28%', '≥ 32%', 'Гарантия вязкого разрушения без образования осколков'],
            ],
          },
        },
      },
      {
        id: 'manufacturing-welding-processes',
        title: {
          fa: '۲. فرآیندهای کشش عمیق، جوشکاری مکانیزه زیرپودری و مونتاژ طوقه و پایه',
          en: '2. Deep Drawing Forming, Automated Submerged Arc Welding & Assembly',
          ar: '2. التشكيل بالسحب العميق، اللحام الآلي وتجميع الطوق والقاعدة',
          de: '2. Tiefziehformen, Automatisiertes UP-Schweißen & Montage',
          ur: '2. ڈیپ ڈرائنگ، خودکار ویلڈنگ اور پرزوں کی اسمبلی',
          hy: '2. Խորը ձգում, ավտոմատ զոդում և հավաքում',
          tr: '2. Derin Çekme Presleri, Otomatik Tozaltı Kaynak ve Montaj Hattı',
          ru: '2. Глубокая вытяжка, автоматическая сварка под флюсом и сборка',
        },
        content: {
          fa: 'مراحل شکل‌دهی با برش گرده از رول فولادی، پولیش لبه‌ها و کشش هیدرولیک در پرس‌های تناژ بالا (۶۰۰ تا ۱۰۰۰ تن) انجام می‌گیرد. دو نیم‌پوسته بالایی و پایینی پس از سوراخ‌کاری و جوش بوشن شیر، توسط خطوط جوشکاری دورانی زیرپودری (Submerged Arc Welding - SAW) به یکدیگر متصل می‌شوند. استفاده از فلاکس و سیم جوش متناسب با ترکیب متالورژیکی ورق، جوشی بدون تخلخل و با نفوذ کامل ریشه ایجاد می‌کند. طوقه محافظ و پایه نگهدارنده نیز با جوشکاری اتوماتیک CO2 متصل می‌گردند.',
          en: 'Blanking circles from calibrated steel coils is followed by high-tonnage hydraulic deep drawing (600–1000 ton presses) to form upper and lower dome shells. The neckring boss is TIG/MIG welded before shells enter circumferential Submerged Arc Welding (SAW) stations. Specialized flux and solid wire matching the parent metal chemistry deliver full-penetration, porosity-free seams. The heavy protective collar and slotted base ring are welded via automated robotic CO2/MAG stations.',
          ar: 'تبدأ عملية التصنيع بقص الأقراص الدائرية من لفائف الصلب وتشكيل القباب العلوية والسفلية بمكابس سحب هيدروليكية عالية القوة. يتم لحام جلبة الصمام ومن ثم دمج نصفي الأسطوانة عبر خطوط اللحام الآلي بالقوس المغمور (SAW) لضمان تغلغل كامل للشريط اللحامي وخلوه من المسام، مع تثبيت طوق الحماية والقاعدة بلحام CO2 آلي.',
          de: 'Nach dem Ausstanzen der Ronden erfolgt das Tiefziehen der oberen und unteren Halbschalen auf 600–1000-Tonnen-Hydraulikpressen. Die Rundnaht wird auf automatisierten Unterpulver-Schweißanlagen (SAW) mit 100% Wurzeldurchschweißung ausgeführt. Kragen und Fußring werden per Roboterschweißung befestigt.',
          ur: 'اسٹیل کوائل سے گول ٹکڑے کاٹ کر ہائیڈرولک پریس پر کپسول کے دونوں حصے تیار کیے جاتے ہیں، جنہیں خودکار سبمرجڈ آرک ویلڈنگ سے جوڑا جاتا ہے۔',
          hy: 'Պողպատե թիթեղներից դրոշմվում են կիսագնդերը, որոնք զոդվում են ավտոմատ աղեղային եղանակով՝ ապահովելով կարերի 100% հուսալիություն:',
          tr: 'Rulo sacdan daire kesme sonrası 600-1000 tonluk hidrolik preslerde üst ve alt gövdeler çekilir. Vana manşonu kaynatıldıktan sonra iki gövde otomatik tozaltı kaynak (SAW) hattında birleştirilir; koruyucu yaka ve taban çemberi robotik gazaltı kaynakla monte edilir.',
          ru: 'Вырубка круглых заготовок с последующей глубокой вытяжкой на прессах усилием 600–1000 тонн формирует верхнее и нижнее полудонья. Сварка кольцевого шва выполняется на автоматических установках под флюсом (SAW) с полным проваром корня шва.',
        },
        callout: {
          type: 'standard',
          title: {
            fa: 'الزام استاندارد در جوشکاری دورانی',
            en: 'Standard Mandate in Circumferential Seams',
            ar: 'المتطلب القياسي للحام الدائري',
            de: 'Normative Anforderung an Rundnähte',
            ur: 'سرکلر ویلڈنگ کی لازمی شرط',
            hy: 'Շրջանաձև զոդման ստանդարտ',
            tr: 'Çevresel Kaynakta Standart Şartı',
            ru: 'Стандартное требование к кольцевому шву',
          },
          text: {
            fa: 'مطابق استانداردهای EN 1442 و ISO 4706، گرده جوش محیطی باید دارای هم‌پوشانی صاف، بدون بریدگی کناره (Undercut) و تقویت ارتفاع حداکثر ۲.۵ میلی‌متر باشد تا از تمرکز تنش در شرایط ارتعاشی جلوگیری شود.',
            en: 'Per EN 1442 and ISO 4706, the external circumferential weld bead must feature smooth transition angles, zero undercut, and a weld crown reinforcement not exceeding 2.5 mm to prevent localized stress risers under cyclic pressurization.',
            ar: 'وفقاً للمواصفات القياسية EN 1442، يجب أن يكون خط اللحام الدائري متجانساً وخالياً من أي حفر جانبية بأقصى ارتفاع تيجاني 2.5 مم لمنع تركز الإجهادات.',
            de: 'Gemäß EN 1442 darf die Schweißnahtüberhöhung maximal 2,5 mm betragen und muss kerbfrei in das Grundmaterial übergehen.',
            ur: 'ویلڈ کا بیرونی ابھار 2.5 ملی میٹر سے زیادہ نہیں ہونا چاہیے تاکہ دباؤ یکساں تقسیم ہو۔',
            hy: 'Եռակցման կարը պետք է լինի հարթ, առանց թերությունների՝ առավելագույնը 2.5 մմ բարձրությամբ:',
            tr: 'EN 1442 standardı uyarınca çevresel kaynak dikişi pürüzsüz geçişli olmalı, kaynak yükseklik takviyesi 2.5 mm\'yi aşmamalı ve yanma oluğu (undercut) içermemelidir.',
            ru: 'Согласно EN 1442 и ГОСТ, усиление кольцевого шва не должно превышать 2.5 мм с плавным переходом к основному металлу без подрезов.',
          },
        },
      },
      {
        id: 'post-weld-heat-treatment-pwht',
        title: {
          fa: '۳. عملیات حرارتی نرمالیزاسیون و تنش‌زدایی پس از جوشکاری (PWHT)',
          en: '3. Normalizing Post-Weld Heat Treatment (PWHT) & Microstructure Refinement',
          ar: '3. المعالجة الحرارية للتطبيع وإزالة الإجهادات بعد اللحام (PWHT)',
          de: '3. Normalisierende Wärmebehandlung (PWHT) nach dem Schweißen',
          ur: '3. ویلڈنگ کے بعد نارملائزنگ ہیٹ ٹریٹمنٹ (PWHT)',
          hy: '3. Ջերմային մշակում (PWHT) և լարումների վերացում',
          tr: '3. Kaynak Sonrası Normalizasyon Isıl İşlemi (PWHT) ve Gerilim Giderme',
          ru: '3. Термообработка (PWHT): нормализация и рекристаллизация структуры',
        },
        content: {
          fa: 'فرآیند کشش عمیق و جوشکاری قوسی سبب ایجاد تنش‌های پسماند شدید و ساختار متالورژیکی نامتعادل در منطقه متأثر از حرارت (HAZ) می‌شود. برای رفع این پدیده، تمامی کپسول‌های تولیدی کارخانه م گاز وارد کوره پیوسته کانوایری نرمالیزاسیون شده و در دمای ۹۰۰ تا ۹۳۰ درجه سانتی‌گراد نگهداری می‌شوند. این عملیات باعث آستنیته شدن کامل، دانه‌ریز شدن ساختار فریت-پرلیت، بازیابی چقرمگی و حذف کامل نقاط مستعد ترک خوردگی می‌گردد.',
          en: 'Cold forming and high-heat arc fusion induce localized plastic strain and metallurgical hard zones within the Heat Affected Zone (HAZ). To restore uniform isotropic ductility, 100% of M Gas cylinders enter continuous conveyorized normalizing furnaces held at 900°C–930°C. Austenitization fully recrystallizes the grain structure into fine equiaxed ferrite-pearlite, completely eliminating residual stresses and guaranteeing crack-arrest capability under catastrophic impact.',
          ar: 'تسبب عمليات السحب واللحام إجهادات داخلية وتغيرات هيكلية في المنطقة المتأثرة بالحرارة (HAZ). لمعالجة ذلك، تمر جميع أسطوانات مصنع م غاز عبر أفران تطبيع مستمرة بحرارة 900 إلى 930 درجة مئوية لإعادة تنظيم الحبيبات المعدنية إلى فيريت-بيرلايت دقيق وإزالة الإجهادات المتبقية بنسبة 100%.',
          de: 'Kaltverformung und Schweißwärme erzeugen Eigenspannungen in der Wärmeeinflusszone (WEZ). Durch das Glühen im Durchlaufofen bei 900–930°C wird das Gefüge normalisiert (feinkörniges Ferrit-Perlit) und maximale Zähigkeit wiederhergestellt.',
          ur: 'تمام سلنڈرز کو 900 سے 930 ڈگری سینٹی گریڈ کی بھٹی سے گزارا جاتا ہے تاکہ ویلڈنگ کی وجہ سے پیدا ہونے والا اندرونی دباؤ مکمل طور پر ختم ہو جائے۔',
          hy: 'Բոլոր գազաբալոններն անցնում են 900-930°C ջերմային մշակում՝ վերացնելով եռակցման ընթացքում առաջացած լարումները:',
          tr: 'Derin çekme ve kaynak gerilimlerini gidermek için tüm tüpler 900°C–930°C sıcaklıktaki tünel normalizasyon fırınından geçirilir. Bu işlem ferrit-perlit mikroyapısını incelterek kırılma tokluğunu maksimuma çıkarır.',
          ru: 'Для устранения остаточных напряжений после вытяжки и сварки 100% баллонов проходят нормализацию в проходной печи при температуре 900–930°C. Полная аустенитизация формирует мелкозернистую феррито-перлитную структуру.',
        },
      },
      {
        id: 'quality-assurance-testing-protocols',
        title: {
          fa: '۴. پروتکل‌های تضمین کیفیت، بازرسی غیرمخرب (NDT) و آزمون فشار ۳۰ بار',
          en: '4. Quality Assurance, Non-Destructive Testing (NDT) & 30-Bar Hydrostatic Expansion',
          ar: '4. بروتوكولات ضبط الجودة، الفحص غير الإتلافي (NDT) واختبار الضغط 30 بار',
          de: '4. Qualitätssicherung, ZfP-Prüfung & 30-Bar-Wasserdruckprüfung',
          ur: '4. کوالٹی کنٹرول، این ڈی ٹی ٹیسٹنگ اور 30 بار پریشر ٹیسٹ',
          hy: '4. Որակի վերահսկում (NDT) և 30 բար հիդրոստատիկ փորձարկում',
          tr: '4. Kalite Güvence, Tahribatsız Muayene (NDT) ve 30 Bar Hidrostatik Genişleme Testi',
          ru: '4. Контроль качества, неразрушающий контроль (NDT) и гидроиспытания 30 бар',
        },
        content: {
          fa: 'کنترل کیفیت در کارخانه م گاز شامل دو بخش آزمون‌های مخرب دوره‌ای (نمونه‌برداری از هر بچ ۲۰۰ عددی شامل آزمون کشش، خمش ریشه جوش ۱۸۰ درجه و تست انفجار هیدرولیک) و آزمون‌های ۱۰۰ درصدی خط تولید است. در مرحله آزمون هیدرواستاتیک خطی، تک‌تک کپسول‌ها در ژاکت آب با فشار ۳۰ بار (معادل دو برابر فشار طراحی) تست انبساط حجمی می‌شوند؛ در صورتی که انبساط پسماند دائمی از ۱۰٪ کل فراتر رود، قطعه مردود و اسقاط می‌گردد.',
          en: 'Quality assurance integrates batch destructive qualification (1 per 200 units for transverse tensile, 180° root bend, and hydraulic burst testing) alongside 100% non-destructive line inspection. During the water-jacket hydrostatic proof expansion test, every single cylinder is pressurized to 30 Bar (2× working pressure). Total and permanent volumetric expansion are recorded; any cylinder showing permanent expansion exceeding 10% of total expansion is immediately condemned.',
          ar: 'تتضمن منظومة الجودة اختبارات دورية إتلافية (عينة من كل 200 أسطوانة لاختبارات الشد، ثني اللحام 180 درجة، واختبار الانفجار الهيدروليكي) واختبارات فحص شاملة 100%. يخضع كل كپسول لفحص التمدد الحجمي في سترة مائية بضغط 30 بار، مع استبعاد أي وحدة يتجاوز تمددها الدائم 10%.',
          de: 'Das Prüfprogramm umfasst zerstörende Chargenprüfungen (Zugversuch, 180°-Biegeversuch, Berstdruckprüfung) sowie 100%-ZfP-Prüfungen. Bei der 30-Bar-Wassermantelprüfung wird die bleibende Volumendehnung exakt gemessen; Werte über 10% führen zum sofortigen Ausschuss.',
          ur: 'ہر سلنڈر کا 30 بار پریشر پر واٹر جیکٹ ٹیسٹ کیا جاتا ہے تاکہ اس کی مضبوطی اور لچک کا مکمل اطمینان ہو سکے۔',
          hy: 'Յուրաքանչյուր գազաբալոն անցնում է 30 բար ջրային ճնշման փորձարկում՝ 100% անվտանգություն ապահովելու համար:',
          tr: 'M Gas kalite sistemi; her 200 adetten alınan numunelerle çekme, 180° kaynak bükme ve patlatma testlerini, ayrıca hat üzerindeki her tüp için 30 bar su ceketi hidrostatik genişleme testini (%10 kalıcı genleşme sınırıyla) içerir.',
          ru: 'Система контроля включает выборочные разрушающие испытания (растяжение, изгиб на 180°, гидравлический разрыв) и 100% опрессовку в водяной рубашке давлением 30 бар с контролем остаточного расширения (<10%).',
        },
      },
      {
        id: 'surface-finishing-powder-coating',
        title: {
          fa: '۵. آماده‌سازی سطحی با شات‌بلاست Sa 2.5، رنگ پودری الکترواستاتیک و کوره پخت ۲۰۰ درجه',
          en: '5. Automated Shot Blasting (Sa 2.5), Electrostatic Powder Coating & 200°C Curing',
          ar: '5. المعالجة السطحية بالسفع الرملي Sa 2.5، الطلاء الكهروستاتيكي وفرن الخبز 200°C',
          de: '5. Kugelstrahlen (Sa 2,5), Elektrostatische Pulverbeschichtung & 200°C Einbrennen',
          ur: '5. شاٹ بلاسٹنگ، الیکٹرو اسٹاٹک پاؤڈر کوٹنگ اور 200 ڈگری اوون بیکنگ',
          hy: '5. Մակերևույթի մշակում, էլեկտրաստատիկ փոշեներկում և 200°C ջերմամշակում',
          tr: '5. Sa 2.5 Otomatik Kumlama, Elektrostatik Toz Boya ve 200°C Fırınlama',
          ru: '5. Дробеструйная очистка Sa 2.5, электростатическое порошковое покрытие и полимеризация при 200°C',
        },
        content: {
          fa: 'پس از تست‌های هیدرواستاتیک و خشک‌سازی کامل داخل سیلندر، سطوح خارجی وارد کابین شات‌بلاست تمام‌اتوماتیک توربینی با ساچمه‌های فولادی کروی می‌شوند تا به استاندارد پاکیزگی سطح Sa 2.5 و پروفایل زبری مناسب دست یابند. بلافاصله رنگ پودری پلی‌استر/اپوکسی مقاوم در برابر اشعه UV به روش الکترواستاتیک رباتیک پاشش شده و سیلندرها به مدت ۲۵ دقیقه وارد کوره پخت کانوایری با دمای ۲۰۰ درجه سانتی‌گراد می‌شوند تا پوششی با ضخامت ۸۰ تا ۱۲۰ میکرون، ضدخش و مقاوم در برابر آزمون سالت اسپری ۱۰۰۰ ساعته ایجاد گردد.',
          en: 'Following hydrostatic proofing and internal warm-air drying, cylinder exteriors undergo automated multi-wheel turbine shot blasting achieving ISO 8501-1 Sa 2.5 white-metal cleanliness with optimal anchor profiles. Robotic electrostatic guns apply TGIC-free polyester/epoxy powders before entering the 200°C continuous curing oven for 25 minutes. This creates an 80–120 micron protective layer delivering superior UV resistance, impact hardness, and 1,000+ hours ASTM B117 salt spray endurance.',
          ar: 'بعد التجفيف الداخلي، تخضع الأسطوانات لسفع بالخردق الصلب للوصول إلى درجة النظافة القياسية Sa 2.5، ثم تُرش بمسحوق البوليستر/الإيبوكسي المقاوم للأشعة فوق البنفسجية وتدخل أفران خبز مستمرة عند 200 درجة مئوية لمدة 25 دقيقة لإنتاج طلاء بسماكة 80-120 ميكرون عالي المقاومة للصدأ والتآكل.',
          de: 'Nach automatischer Trocknung werden die Zylinder auf Reinheitsgrad Sa 2,5 kugelgestrahlt, elektrostatisch mit Polyester-/Epoxidpulver beschichtet und bei 200°C eingebrannt. Dies garantiert 1000h Salzsprühbeständigkeit.',
          ur: 'شاٹ بلاسٹنگ کے بعد 200 ڈگری پر بیک کی گئی پاؤڈر کوٹنگ سلنڈر کو زنگ اور موسمی اثرات سے سالوں تک محفوظ رکھتی ہے۔',
          hy: 'Շիթահարումից հետո էլեկտրաստատիկ ներկումը 200°C վառարանում ապահովում է հակակոռոզիոն պաշտպանություն:',
          tr: 'Tüp dış yüzeyleri Sa 2.5 kalitesinde kumlama sonrası robotik elektrostatik toz boya ile kaplanır ve 200°C tünel fırında pişirilir. Bu sayede 80-120 mikronluk UV ve çizilme dirençli, 1000 saat tuz testi dayanımlı yüzey elde edilir.',
          ru: 'Дробеструйная очистка до степени Sa 2.5 с последующим роботизированным нанесением полиэфирного порошка и запеканием в конвейерной печи при 200°C формирует покрытие толщиной 80–120 мкм со стойкостью к солевому туману >1000 часов.',
        },
      },
      {
        id: 'international-regulatory-codes-comparison',
        title: {
          fa: '۶. تطبیق استانداردهای جهانی (ISO 4706, EN 1442, DOT-4BA, ISIRI 841)',
          en: '6. Global Regulatory Codes Comparison & Certification Matrix',
          ar: '6. مقارنة المعايير الدولية واللوائح التنظيمية',
          de: '6. Vergleich internationaler Regelwerke & Zertifizierungsmatrix',
          ur: '6. بین الاقوامی معیارات اور ضوابط کا تقابلی جائزہ',
          hy: '6. Միջազգային ստանդարտների համեմատական վերլուծություն',
          tr: '6. Uluslararası Standartlar ve Uyumluluk Matrisi Karşılaştırması',
          ru: '6. Сравнительный анализ международных нормативных стандартов',
        },
        content: {
          fa: 'تولیدات کارخانه م گاز برای بازارهای مختلف خاورمیانه، آسیا، آفریقا و CIS بر اساس الزامات خاص منطقه‌ای طراحی و مارک‌زنی می‌شوند. این تطبیق‌پذیری شامل استانداردهای اروپایی EN 1442 و علامت Pi (TPED 2010/35/EU)، استاندارد آمریکایی DOT-4BA/4BW، استاندارد بین‌المللی ISO 4706 و استانداردهای ملی ایران ISIRI 841 و ISIRI 304 می‌باشد.',
          en: 'M Gas engineered cylinders cater to diverse geographic markets across the Middle East, CIS, Africa, and Europe by conforming to dedicated manufacturing codes: European TPED 2010/35/EU (EN 1442 with Pi mark), US DOT 49 CFR Part 178 (DOT-4BA/4BW), ISO 4706, and Iranian National Standards ISIRI 841/304.',
          ar: 'تتوافق منتجات مصنع م غاز مع اللوائح الدولية المتنوعة للتصدير بما فيها المعايير الأوروبية EN 1442 وتوجيه TPED (علامة Pi)، والمعايير الأمريكية DOT-4BA ومعايير ISO 4706 والمواصفات القياسية الوطنية ISIRI 841.',
          de: 'M Gas fertigt nach weltweiten Standards: Europäische Druckgeräterichtlinie TPED 2010/35/EU (EN 1442 mit Pi-Kennzeichnung), US-DOT 49 CFR (DOT-4BA/4BW), ISO 4706 und nationale Normen.',
          ur: 'ایم گیس کے سلنڈرز تمام بڑے بین الاقوامی معیارات بشمول EN 1442، DOT-4BA اور ISO 4706 کے مطابق تیار کیے جاتے ہیں۔',
          hy: 'M Gas արտադրանքը համապատասխանում է եվրոպական EN 1442, ամերիկյան DOT-4BA և միջազգային ISO 4706 ստանդարտներին:',
          tr: 'M Gas silindirleri; Avrupa TPED EN 1442 (Pi markalı), Amerikan DOT-4BA, uluslararası ISO 4706 ve TSE/ISIRI standartlarına tam uyumlu olarak üretilmektedir.',
          ru: 'Продукция завода М Газ сертифицирована по европейской директиве TPED 2010/35/EU (EN 1442), стандарту США DOT-4BA (49 CFR), ISO 4706 и ГОСТ.',
        },
      },
    ],
    references: [
      { id: 1, title: 'ISO 4706:2008 - Gas cylinders -- Refillable welded steel gas cylinders -- Test pressure 60 bar and below', url: 'https://www.iso.org/standard/43118.html' },
      { id: 2, title: 'EN 1442:2017 - LPG equipment and accessories - Transportable refillable welded steel cylinders for LPG', url: 'https://standards.iteh.ai/catalog/standards/cen/492576b5-2244-4cb6-a67b-1cb8ff8fefbf/en-1442-2017' },
      { id: 3, title: 'US Electronic Code of Federal Regulations - 49 CFR Part 178 Subpart C (Specifications for Cylinders)', url: 'https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-178/subpart-C' },
      { id: 4, title: 'European Directive 2010/35/EU on transportable pressure equipment (TPED)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32010L0035' },
      { id: 5, title: 'Compressed Gas Association (CGA) Pamphlet C-6: Standards for Visual Inspection of Steel Compressed Gas Cylinders', url: 'https://www.cganet.com/' },
    ],
  },
  {
    id: 'article-lpg-cylinder-management-storage-transportation',
    slug: 'lpg-cylinder-management-storage-transportation-safety-protocols',
    publishDate: '2023-05-18T10:30:00+03:30',
    modifyDate: '2026-08-25T11:00:00+03:30',
    readTimeMinutes: 15,
    author: {
      name: 'Mousa Amooie & M Gas Safety Directorate',
      role: {
        fa: 'مدیریت ارشد کارخانه م گاز و دفتر ایمنی حمل‌ونقل مواد خطرناک و انبارداری صنعتی',
        en: 'Managing Director & Hazardous Materials Logistics & Industrial Safety Directorate',
        ar: 'المدير العام ومكتب سلامة نقل المواد الخطرة والتخزين الصناعي',
        de: 'Geschäftsführer & Direktion für Gefahrgutlogistik und industrielle Sicherheit',
        ur: 'مینجنگ ڈائریکٹر اور خطرناک مواد کی لاجسٹکس اور سیفٹی ڈائریکٹوریٹ',
        hy: 'Գլխավոր տնօրեն և վտանգավոր նյութերի լոգիստիկայի անվտանգության բաժին',
        tr: 'Genel Müdür ve Tehlikeli Madde Lojistiği & Endüstriyel Güvenlik Direktörlüğü',
        ru: 'Генеральный директор и дирекция по безопасности опасных грузов и промышленному хранению',
      },
      avatar: '/founder/mousa-amooie.png',
    },
    coverImage: '/articles/technical.png',
    category: {
      fa: 'پروتکل‌های ایمنی، انبارداری و لجستیک',
      en: 'Safety Protocols, Storage & Logistics',
      ar: 'بروتوكولات السلامة والتخزين والخدمات اللوجستية',
      de: 'Sicherheitsprotokolle, Lagerung & Logistik',
      ur: 'حفاظتی پروٹوکولز، اسٹوریج اور لاجسٹکس',
      hy: 'Անվտանգության արձանագրություններ, պահեստավորում և լոգիստիկա',
      tr: 'Güvenlik Protokolleri, Depolama ve Lojistik',
      ru: 'Протоколы безопасности, хранение и логистика',
    },
    tags: {
      fa: ['انبارداری کپسول گاز', 'حمل و نقل LPG', 'NFPA 58', 'OSHA 1910.110', 'ضد انفجار', 'تخلیه اضطراری', 'بازرسی ادواری'],
      en: ['LPG Cylinder Storage', 'LPG Logistics & Transport', 'NFPA 58', 'OSHA 1910.110', 'Explosion-Proof', 'ADR Regulations', 'Periodic Requalification'],
      ar: ['تخزين أسطوانات الغاز', 'نقل الغاز المسال', 'NFPA 58', 'OSHA 1910.110', 'مضاد للانفجار', 'معايير ADR', 'الفحص الدوري'],
      de: ['LPG-Lagerung', 'Flüssiggas Transport', 'NFPA 58', 'OSHA 1910.110', 'Explosionsschutz', 'ADR-Gefahrgut', 'Wiederkehrende Prüfung'],
      ur: ['ایل پی جی اسٹوریج', 'گیس ٹرانسپورٹ کے اصول', 'NFPA 58', 'حفاظتی تدابیر', 'دھماکہ پروف سہولیات'],
      hy: ['LPG պահեստավորում', 'Գազաբալոնների փոխադրում', 'NFPA 58', 'Անվտանգության կանոններ'],
      tr: ['LPG Tüp Depolama', 'LPG Nakliye ve Lojistik', 'NFPA 58', 'OSHA 1910.110', 'Patlamaya Dayanıklı', 'ADR Taşımacılık'],
      ru: ['Хранение баллонов LPG', 'Транспортировка опасных грузов', 'NFPA 58', 'OSHA 1910.110', 'Взрывобезопасность', 'Правила ADR', 'Переосвидетельствование'],
    },
    title: {
      fa: 'استانداردهای فنی، انطباق با مقررات و پروتکل‌های ایمنی مدیریت، نگهداری و حمل‌ونقل کپسول‌های گاز مایع (LPG)',
      en: 'Technical Standards, Regulatory Compliance, and Safety Protocols for Liquefied Petroleum Gas (LPG) Cylinder Management, Storage, and Transportation',
      ar: 'المعايير الفنية، الامتثال التنظيمي وبروتوكولات السلامة لإدارة وتخزين ونقل أسطوانات الغاز المسال (LPG)',
      de: 'Technische Standards, regulatorische Konformität und Sicherheitsprotokolle für Lagerung, Handhabung und Transport von LPG-Flaschen',
      ur: 'مائع پیٹرولیم گیس (LPG) سلنڈر مینجمنٹ، اسٹوریج اور ٹرانسپورٹیشن کے لیے تکنیکی معیارات اور حفاظتی پروٹوکولز',
      hy: 'Տեխնիկական ստանդարտներ և անվտանգության արձանագրություններ հեղուկ գազի (LPG) բալոնների կառավարման, պահպանման և փոխադրման համար',
      tr: 'LPG Gaz Tüpü Yönetimi, Depolama ve Taşımacılığında Teknik Standartlar, Mevzuata Uyum ve Güvenlik Protokolleri',
      ru: 'Технические стандарты, нормативное соответствие и протоколы безопасности при обращении, хранении и транспортировке баллонов LPG',
    },
    abstract: {
      fa: 'بررسی جامع خواص فیزیکوشیمیایی و ترمودینامیکی گاز مایع، نسبت تراکم حجمی ۲۷۰:۱، الزامات تهویه و اودورایزاسیون (اتیل مرکاپتان)، فواصل ایمنی انبارهای سرپوشیده و باز طبق NFPA 58 و OSHA 1910.110، تجهیزات ضدجرقه Ex، استانداردهای حمل‌ونقل ناوگان (ADR و DOT) و فرآیند بازرسی ادواری ۵ و ۱۰ ساله.',
      en: 'A comprehensive technical and regulatory analysis of LPG physicochemical properties, 270:1 volumetric expansion ratios, ethyl mercaptan odorization, indoor/outdoor aggregate storage limits per NFPA 58 and OSHA 1910.110, explosion-proof electrical zoning, ADR/DOT fleet transportation securement, and periodic requalification frameworks.',
      ar: 'تحليل فني وتنظيمي شامل للخصائص الفيزيوكيميائية للغاز المسال، نسبة التمدد الحجمي 270:1، متطلبات الرائحة والتهوية، مسافات الأمان لتخزين الأسطوانات وفق NFPA 58 و OSHA 1910.110، وتجهيزات النقل الآمن وقواعد الفحص الدوري.',
      de: 'Umfassende Analyse der thermodynamischen Eigenschaften von LPG, 270:1-Ausdehnungsverhältnis, Sicherheitsabstände für Zylinderlager nach NFPA 58 / OSHA 1910.110, Ex-Schutz und ADR-Transportvorschriften.',
      ur: 'ایل پی جی گیس کی خصوصیات، محفوظ اسٹوریج کے فاصلے، این ایف پی اے 58 کے تقاضے اور ٹرانسپورٹ کے حفاظتی اصولوں کا مکمل جائزہ۔',
      hy: 'LPG ֆիզիկաքիմիական հատկությունների, պահեստավորման անվտանգության հեռավորությունների (NFPA 58, OSHA) և ADR փոխադրման կանոնների վերլուծություն:',
      tr: 'LPG termodinamik özellikleri, 270:1 hacimsel genleşme oranı, NFPA 58 ve OSHA 1910.110 depolama güvenlik mesafeleri, Ex-proof elektrik standartları ve ADR nakliye kurallarının kapsamlı analizi.',
      ru: 'Комплексный анализ физико-химических свойств сжиженного газа, коэффициента объемного расширения 270:1, требований одоризации, безопасных расстояний хранения по NFPA 58 и OSHA 1910.110, правил перевозки опасных грузов (ADR/ДОПОГ) и сроков переосвидетельствования.',
    },
    keyTakeaways: {
      fa: [
        'درک ضریب انبساط حجمی ۲۷۰ برابری گاز مایع در فاز بخار و ضرورت حفظ فضای بخار خالی (Outage) در کپسول‌ها',
        'محدودیت‌های ذخیره‌سازی داخل ساختمانی: سقف ۳۰۰ پوند در ساختمان‌های عادی و سازه‌های مقاوم در برابر حریق ۲ ساعته برای ظرفیت‌های بالاتر',
        'الزامات خروجی ضد انفجار (Explosion Relief) معادل حداقل ۱۰٪ از سطح دیوار و سقف انبار',
        'الزام حمل کپسول‌ها در وضعیت کاملاً عمودی با شیر بسته و درپوش محافظ در ناوگان حمل و نقل',
        'دوره‌های آزمون ادواری ۵ و ۱۰ ساله مطابق کدهای CGA C-6 و DOT 49 CFR Part 180',
      ],
      en: [
        'Understanding the 270:1 liquid-to-vapor expansion ratio and mandatory vapor outage space to prevent hydraulic over-pressurization',
        'Indoor facility limits: 300 lbs in standard industrial buildings, requiring 2-hour fire-rated enclosures for aggregate capacities up to 10,000 lbs',
        'Architectural explosion pressure relief requirements equaling at least 10% of total enclosure wall/roof area',
        'Mandatory vertical securement during fleet transit keeping pressure relief valves in direct communication with the vapor space',
        'Periodic 5-year and 10-year requalification, visual inspections, and ultrasonic/hydrostatic testing per CGA C-6 and 49 CFR Part 180',
      ],
      ar: [
        'فهم نسبة التمدد الحجمي للغاز 270:1 وأهمية ترك مساحة بخارية آمنة داخل الأسطوانة لمنع الضغط الهيدروليكي الزائد',
        'حدود التخزين الداخلي: 300 رطل للمباني العادية، مع اشتراط حواجز مقاومة للحريق لمدة ساعتين للكميات الأكبر',
        'تصميم مخارج تنفيس الانفجار بنسبة لا تقل عن 10% من مساحة الجدران والأسقف في المستودعات المخصصة',
        'إلزامية نقل الأسطوانات بوضعية عمودية محكمة التثبيت لضمان اتصال صمام الأمان مع الفضاء البخاري',
        'فترات إعادة التأهيل والفحص الدوري كل 5 و 10 سنوات وفقاً لتعليمات CGA C-6 و DOT',
      ],
      de: [
        'Beachtung des 270:1 Ausdehnungsverhältnisses von Flüssiggas und Vorhaltung von Gaspolstern',
        'Lagerbegrenzung in Innenräumen mit 2-Stunden-Brandschutzwänden bei größeren Mengen',
        'Druckentlastungsflächen von mindestens 10% der Wand-/Dachfläche im Lagerraum',
        'Ausschließlich stehender Transport zur Gewährleistung der Sicherheitsventilfunktion',
        'Wiederkehrende Prüfintervalle alle 5 bis 10 Jahre nach CGA C-6 und ADR-Richtlinien',
      ],
      ur: [
        'ایل پی جی کے گیس بننے پر 270 گنا پھیلاؤ کے پیش نظر سلنڈر میں مناسب جگہ چھوڑنے کی ضرورت',
        'گودام میں سلنڈر رکھنے کے لیے 2 گھنٹے فائر ریٹڈ دیواروں کی ضرورت',
        'گاڑیوں میں سلنڈرز کو ہمیشہ سیدھا اور مضبوطی سے باندھ کر منتقل کرنا',
        'ہر 5 سے 10 سال بعد سلنڈرز کی دوبارہ مکمل ہائیڈرولک ٹیسٹنگ',
      ],
      hy: [
        'Հեղուկ գազի 270:1 ծավալային ընդլայնման հաշվառում և անվտանգ գոլորշային տարածքի ապահովում',
        'Փակ պահեստներում հակահրդեհային պատերի (2 ժամ) և օդափոխության ապահովում',
        'Փոխադրումը բացառապես ուղղահայաց դիրքով և փականի պաշտպանիչ գլխարկով',
        'Պարբերական փորձարկումներ 5-ից 10 տարին մեկ անգամ:',
      ],
      tr: [
        'LPG\'nin 270:1 sıvı-buhar genleşme oranı ve hidrolik aşırı basıncı önlemek için zorunlu buhar boşluğu payı',
        'Kapalı alan depolama limitleri: 300 lb üzeri stoklar için 2 saat yangına dayanıklı özel depo şartı',
        'Depo duvar/tavan alanının en az %10\'u kadar patlama basıncı tahliye paneli gereksinimi',
        'Taşıma araçlarında emniyet ventilinin sürekli buhar fazında kalması için dik sabitleme zorunluluğu',
        'CGA C-6 ve ADR mevzuatına göre 5 ve 10 yıllık periyodik muayene ve yeniden belgelendirme',
      ],
      ru: [
        'Учет коэффициента объемного расширения 270:1 и обязательное сохранение паровой подушки в баллоне',
        'Ограничения на хранение в помещениях: предел 300 фунтов в общих зданиях и огнестойкость 2 часа для спецскладов',
        'Противовзрывные легкосбрасываемые панели площадью не менее 10% от ограждающих конструкций склада',
        'Транспортировка строго в вертикальном положении с защитными колпаками',
        'Периодическое техническое переосвидетельствование каждые 5–10 лет согласно нормам DOT/CGA и ДОПОГ',
      ],
    },
    sections: [
      {
        id: 'physicochemical-properties-thermodynamics',
        title: {
          fa: '۱. خواص فیزیکوشیمیایی، رفتار ترمودینامیکی و اودورایزاسیون LPG',
          en: '1. Physicochemical Properties & Thermodynamic Behavior of LPG',
          ar: '1. الخصائص الفيزيوكيميائية والسلوك الديناميكي الحراري للغاز',
          de: '1. Physikochemische Eigenschaften & Thermodynamik von LPG',
          ur: '1. ایل پی جی کی طبعی اور تھرموڈائنامک خصوصیات',
          hy: '1. LPG ֆիզիկաքիմիական և թերմոդինամիկ հատկությունները',
          tr: '1. LPG\'nin Fizikokimyasal Özellikleri ve Termodinamik Davranışı',
          ru: '1. Физико-химические свойства и термодинамика сжиженного углеводородного газа',
        },
        content: {
          fa: 'گاز مایع (ترکیب پروپان C3H8 و بوتان C4H10) در دمای محیط و فشار معتدل به مایع تبدیل شده و چگالی انرژی بسیار بالایی پیدا می‌کند. نسبت انبساط حجمی مایع به بخار تقریباً ۲۷۰ به ۱ است؛ یعنی نشت تنها ۱ لیتر گاز مایع به محیط، ۲۷۰ لیتر بخار قابل اشتعال تولید می‌کند. به دلیل سنگین‌تر بودن بخارات LPG نسبت به هوا (چگالی نسبی ۱.۵ تا ۲.۰ برابر هوا)، این گاز در صورت نشت در سطوح پایین، چاله‌ها و کف انبار جمع می‌شود. برای ردیابی سریع نشت، افزودن ترکیب بودارکننده اتیل مرکاپتان (Ethyl Mercaptan) به میزان حداقل ۱ پوند در هر ۱۰ هزار گالن الزامی است.',
          en: 'Commercial LPG consists of propane (C3H8) and butane (C4H10) hydrocarbon blends stored under equilibrium pressure. With a volumetric liquid-to-vapor expansion ratio of ~270:1, a minor liquid leak vaporizes into immense combustible volumes. Since LPG vapors are 1.5 to 2.0 times heavier than air, uncontained gas accumulates at floor levels and low-lying depressions. Mandatory odorization with Ethyl Mercaptan (≥1.0 lb per 10,000 gallons) ensures human detectability at concentrations well below the 2.1% Lower Explosive Limit (LEL).',
          ar: 'يتكون الغاز المسال من خليط البروبان والبيوتان المضغوطين. نسبة التمدد الحجمي للسائل إلى البخار تبلغ 270:1، ونظراً لأن كثافة أبخرته أثقل من الهواء بمقدار 1.5 إلى 2.0 مرة، فإنه يتجمع عند الأرضيات في حال التسرب. تلزم اللوائح بإضافة مادة إيثيل ميركابتان برائحة نفاذة للتحذير المبكر قبل بلوغ حد الاشتعال الأدنى (2.1%).',
          de: 'LPG dehnt sich beim Verdampfen im Verhältnis 270:1 aus und ist 1,5 bis 2,0 mal schwerer als Luft, weshalb es sich am Boden sammelt. Die Odorierung mit Ethylmercaptan garantiert die frühzeitige Wahrnehmung unterhalb der unteren Explosionsgrenze (2,1 Vol.-%).',
          ur: 'ایل پی جی ہوا سے ڈیڑھ سے دو گنا بھاری ہوتی ہے اور لیک ہونے پر فرش پر جمع ہوتی ہے۔ اس میں خاص بو دار مادہ ملایا جاتا ہے تاکہ فوری پتہ چل سکے۔',
          hy: 'Հեղուկ գազը գոլորշիանալիս ընդլայնվում է 270 անգամ և ծանր է օդից: Էթիլմերկապտանի հավելումն ապահովում է արտահոսքի անհապաղ հայտնաբերումը:',
          tr: 'LPG, 270:1 sıvı-buhar genleşme oranına sahiptir ve havadan 1.5-2.0 kat daha ağırdır. Sızıntı halinde tabanda birikir. Alt patlama limiti (%2.1 LEL) altına ulaşmadan insan burnuyla algılanabilmesi için Etil Merkaptan ile kokulandırılması zorunludur.',
          ru: 'Сжиженный газ при испарении увеличивается в объеме в 270 раз и в 1.5–2.0 раза тяжелее воздуха, скапливаясь в нижних точках помещений. Обязательная одоризация этилмеркаптаном обеспечивает обнаружение утечки задолго до достижения нижнего концентрационного предела распространения пламени (2.1%).',
        },
      },
      {
        id: 'facility-design-indoor-outdoor-storage',
        title: {
          fa: '۲. الزامات معماری انبارها، سیستم‌های تهویه و فواصل ایمنی (NFPA 58 / OSHA)',
          en: '2. Architectural Facility Engineering, Ventilation & NFPA 58 / OSHA Separation Rules',
          ar: '2. الهندسة المعمارية للمستودعات، التهوية ومسافات الأمان (NFPA 58 / OSHA)',
          de: '2. Bauliche Anforderungen, Belüftung & NFPA 58 / OSHA-Sicherheitsabstände',
          ur: '2. گودام کا ہندسی ڈیزائن، وینٹی لیشن اور حفاظتی فاصلے',
          hy: '2. Պահեստների ճարտարապետական նախագծում և NFPA 58 անվտանգության հեռավորություններ',
          tr: '2. Tesis Mimari Tasarımı, Havalandırma ve NFPA 58 / OSHA Depolama Güvenlik Mesafeleri',
          ru: '2. Требования к проектированию складов, вентиляции и расстояниям по NFPA 58 / OSHA',
        },
        content: {
          fa: 'طبق استانداردهای OSHA 29 CFR 1910.110 و NFPA 58، ذخیره‌سازی کپسول‌های گاز در اماکن سرپوشیده عمومی ممنوع و در کارگاه‌های صنعتی حداکثر به ۳۰۰ پوند گاز محدود است. در صورت نیاز به ذخیره‌سازی تا سقف ۱۰،۰۰۰ پوند، احداث انبار اختصاصی با دیوارهای ضدحریق ۲ ساعته، درب‌های خودبسته‌شو ۱.۵ ساعته، تهویه دائم بالا و پایین به هوای آزاد، کف بتنی هم‌سطح زمین و پانل‌های سبک تخلیه فشار انفجار (Explosion Relief) معادل حداقل ۱۰٪ از مساحت کل دیوار و سقف الزامی می‌باشد.',
          en: 'Per OSHA 29 CFR 1910.110 and NFPA 58, indoor LPG cylinder storage in buildings open to the public is strictly banned, while standard industrial plants are limited to 300 lbs aggregate capacity. Storage exceeding 300 lbs up to 10,000 lbs requires dedicated structural enclosures featuring 2-hour fire-rated partition walls, 1.5-hour self-closing Class B fire doors, continuous high/low exterior ventilation, floor surfaces directly at grade (no basements), and explosion pressure relief panels exceeding 10% of total enclosure wall/roof area.',
          ar: 'تحظر معايير OSHA و NFPA 58 تخزين الغاز في المباني العامة وتحدده بـ 300 رطل في المصانع. ولتخزين حتى 10,000 رطل، يجب بناء مستودعات خاصة بجدران مقاومة للحريق لمدة ساعتين، وأبواب إطفاء ذاتية الإغلاق، وتهوية علوية وسفلية مستمرة، ومساحات تنفيس للضغط بنسبة 10% من مساحة الجدران والأسقف.',
          de: 'Nach OSHA 29 CFR 1910.110 und NFPA 58 gilt in allgemeinen Industrieräumen ein Limit von 300 lbs. Für bis zu 10.000 lbs sind 2-Stunden-Brandschutzräume mit automatischer Entlüftung und min. 10% Explosions-Druckentlastungsflächen vorgeschrieben.',
          ur: 'گوداموں کے لیے 2 گھنٹے فائر ریٹڈ دیواریں، خودکار بند ہونے والے دروازے اور دھماکے کا دباؤ نکالنے کے خصوصی پینل لازمی ہیں۔',
          hy: 'Պահեստները պետք է ունենան 2 ժամյա հրակայուն պատեր, հատակի մակարդակի օդափոխություն և ճնշման թուլացման վահանակներ:',
          tr: 'OSHA 1910.110 ve NFPA 58 uyarınca 300 lb üzeri kapalı depolama için 2 saat yangına dayanıklı duvarlar, Class B yangın kapıları, sürekli alt-üst tabii havalandırma ve alanın en az %10\'u kadar patlama tahliye panelleri zorunludur.',
          ru: 'Согласно OSHA 29 CFR 1910.110 и NFPA 58, хранение свыше 300 фунтов требует специальных складских помещений с пределом огнестойкости стен 2 часа, легкосбрасываемыми конструкциями (10% площади) и приточно-вытяжной вентиляцией.',
        },
      },
      {
        id: 'transportation-and-fleet-logistics',
        title: {
          fa: '۳. لجستیک ایمن حمل‌ونقل ناوگان، استانداردهای ADR و مهار فیزیکی سیلندرها',
          en: '3. Safe Transportation, Fleet Logistics, ADR Regulations & Mechanical Securement',
          ar: '3. لوجستيات النقل الآمن، معايير ADR والتثبيت الميكانيكي للأسطوانات',
          de: '3. Sicherer Flottentransport, ADR-Gefahrgutvorschriften & Ladungssicherung',
          ur: '3. گاڑیوں کے ذریعے محفوظ نقل و حمل اور لوڈنگ کے اصول',
          hy: '3. Բեռնափոխադրումների անվտանգություն, ADR կանոններ և ամրացում',
          tr: '3. Güvenli Nakliye Lojistiği, ADR Yönetmelikleri ve Mekanik Sabitleme',
          ru: '3. Безопасность транспортировки автотранспортом, правила ADR/ДОПОГ и крепление баллонов',
        },
        content: {
          fa: 'در حمل‌ونقل جاده‌ای و بین‌شهری کپسول‌های گاز، رعایت توافق‌نامه بین‌المللی حمل کالاهای خطرناک (ADR) و استانداردهای DOT الزامی است. کپسول‌ها باید همیشه در وضعیت کاملاً عمودی با شیر بسته و کلاهک حفاظتی بر روی پالت‌های مجهز به مهاربندهای غیرجرقه مهار شوند تا در صورت باز شدن ناخواسته سوپاپ اطمینان، فاز بخار (نه فاز مایع) خارج شود. خودروهای حامل باید مجهز به سپرهای فولادی ضدضربه عقب، حفاظ حرارتی بالای لوله اگزوز، کپسول‌های آتش‌نشانی پودری و پلاکارد خطر اشتعال کلاس ۲ باشند.',
          en: 'Highway and commercial transport of LPG cylinders strictly enforces international ADR dangerous goods regulations and DOT 49 CFR Part 173. Cylinders must always be secured upright in non-sparking cradles/pallets with valves tightly closed and protective collars/caps installed, ensuring pressure relief valves communicate exclusively with vapor space. Transport vehicles require heavy rear impact bumpers, heat shields over exhaust conduits, dry chemical fire extinguishers, and Class 2 flammable gas hazmat placards.',
          ar: 'يخضع نقل أسطوانات الغاز للوائح ADR و DOT. يجب تثبيت الأسطوانات رأسياً بشكل آمن على منصات غير مولدة للشرر مع إغلاق الصمامات وتركيب أغطية الحماية. ويجب تزويد الشاحنات بمصدات صلبة ودروع حرارية لعوادم المحركات ولوحات تحذيرية للمواد القابلة للاشتعال من الفئة 2.',
          de: 'Der Transport unterliegt den ADR-Vorschriften: Aufrechte Sicherung der Flaschen, Ventilschutzkappen, Hitzeschilde über Abgasanlagen, Feuerlöscher und Gefahrgut-Kennzeichnung Klasse 2 (Flammbare Gase).',
          ur: 'گاڑیوں پر سلنڈرز کو ہمیشہ سیدھا رکھنا لازمی ہے تاکہ سیفٹی والو سے مائع گیس نہ نکلے، ساتھ ہی گاڑی پر فائر ایکسٹنگوشر ہونا ضروری ہے۔',
          hy: 'Փոխադրումը կատարվում է ADR կանոններով. բալոնները պետք է լինեն ուղղահայաց, պաշտպանիչ թասակներով, իսկ մեքենան՝ հագեցած կրակմարիչներով:',
          tr: 'LPG tüplerinin karayoluyla nakliyesinde ADR ve DOT kuralları uygulanır. Tüpler daima dik vaziyette, vanaları kapalı ve koruma başlıklı olarak kıvılcım çıkarmaz paletlerde sabitlenmelidir. Araçlarda egzoz ısı kalkanı ve Sınıf 2 yanıcı gaz tabelaları bulunmalıdır.',
          ru: 'Перевозка автотранспортом регламентируется ДОПОГ (ADR): баллоны размещаются строго вертикально в специальных клетях с защитными колпаками, автомобили оборудуются экранами глушителя, заземлением и знаками опасности класса 2.1.',
        },
      },
      {
        id: 'periodic-requalification-and-testing',
        title: {
          fa: '۴. بازرسی ادواری، آزمون‌های هیدرواستاتیک ۵ و ۱۰ ساله و معیارهای اسقاط',
          en: '4. Periodic Requalification, 5/10-Year Testing Protocols & Condemnation Limits',
          ar: '4. إعادة التأهيل الدوري، بروتوكولات الفحص لـ 5 و 10 سنوات ومعايير الاستبعاد',
          de: '4. Wiederkehrende Prüfungen (5/10 Jahre) & Aussonderungskriterien',
          ur: '4. وقتاً فوقتاً دوبارہ ٹیسٹنگ اور ناقابل استعمال سلنڈرز کے معیار',
          hy: '4. Պարբերական վերափորձարկումներ (5/10 տարի) և խոտանման չափանիշներ',
          tr: '4. Periyodik Yeniden Belgelendirme, 5 ve 10 Yıllık Testler ve Hurdaya Ayırma Kriterleri',
          ru: '4. Периодическое техническое освидетельствование (5 и 10 лет) и нормы отбраковки',
        },
        content: {
          fa: 'سیلندرهای گاز فولادی به طور مداوم تحت تأثیر پر و خالی شدن و شرایط محیطی قرار دارند. مطابق با کدهای CGA C-6 و 49 CFR Part 180، قبل از هر بار شارژ گاز، بازرسی چشمی بدنه برای تشخیص خوردگی، فرورفتگی، سوختگی ناشی از قوس الکتریکی و کاهش ضخامت انجام می‌شود. علاوه بر این، در دوره‌های ۵ تا ۱۰ ساله آزمون فشار هیدرواستاتیک انبساط حجمی یا ضخامت‌سنجی التراسونیک (UT) تکرار می‌گردد و کپسول‌های دارای فرورفتگی بیش از حد مجاز یا افت ضخامت جداره بیش از ۱۰٪ فوراً سوراخ و اسقاط می‌شوند.',
          en: 'Subjected to continuous filling cycles and ambient exposure, LPG cylinders require pre-fill inspections per CGA C-6 for dents, gouges, arc burns, and wall thinning. Mandated 5-year to 10-year requalification intervals require full water-jacket volumetric expansion testing or Ultrasonic Thickness (UT) examination. Cylinders exhibiting severe pitting, weld heat damage, or wall thinning exceeding statutory limits are permanently punctured and decommissioned.',
          ar: 'تخضع الأسطوانات لفحص بصري دقيق قبل كل تعبئة طبقاً لمعايير CGA C-6 للكشف عن التآكل والتشوهات. وتخضع لفحص هيدروستاتيكي أو فحص بالموجات فوق الصوتية كل 5 إلى 10 سنوات، مع إتلاف واستبعاد أي أسطوانة يقل سمك جدارها عن الحدود الآمنة.',
          de: 'Vor jeder Befüllung erfolgt eine Sichtprüfung nach CGA C-6. Alle 5 bis 10 Jahre ist eine wiederkehrende Druckprüfung oder Ultraschall-Wanddickenmessung gesetzlich vorgeschrieben. Beschädigte Flaschen werden unbrauchbar gemacht.',
          ur: 'ہر 5 سے 10 سال بعد سلنڈر کا دوبارہ مکمل معائنہ اور ہائیڈرولک ٹیسٹ کیا جاتا ہے تاکہ کمزور سلنڈرز کو فوراً تلف کیا جا سکے۔',
          hy: 'Գազաբալոնները ենթարկվում են ստուգման յուրաքանչյուր լիցքավորումից առաջ և հիդրոստատիկ վերափորձարկման յուրաքանչյուր 5-10 տարին մեկ:',
          tr: 'CGA C-6 standardı gereği her dolum öncesi korozyon ve ezilme kontrolü yapılır. 5 ve 10 yıllık periyotlarda hidrostatik genleşme veya ultrasonik et kalınlığı ölçümü tekrarlanır; güvenlik sınırını aşan tüpler delinerek hurdaya ayrılır.',
          ru: 'Перед каждой заправкой проводится визуальный контроль по CGA C-6. Каждые 5–10 лет баллоны проходят обязательное гидравлическое переосвидетельствование или ультразвуковую толщинометрию с отбраковкой и утилизацией дефектных сосудов.',
        },
      },
    ],
    references: [
      { id: 1, title: 'OSHA 29 CFR 1910.110 - Storage and handling of liquefied petroleum gases', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.110_2' },
      { id: 2, title: 'NFPA 58: Liquefied Petroleum Gas Code (National Fire Protection Association)', url: 'https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=58' },
      { id: 3, title: 'US DOT PHMSA - Requalification Guidance for Propane Cylinders', url: 'https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/docs/propane_en_v3.pdf' },
      { id: 4, title: 'UNECE - Agreement concerning the International Carriage of Dangerous Goods by Road (ADR)', url: 'https://unece.org/about-adr' },
      { id: 5, title: 'CGA Pamphlet C-6.1: Standards for Visual Inspection of High Pressure Aluminum Compressed Gas Cylinders', url: 'https://www.cganet.com/' },
    ],
  },
];
