import { LanguageCode } from '../types';

export interface BannerContent {
  badge: Record<LanguageCode, string>;
  title: Record<LanguageCode, string>;
  description: Record<LanguageCode, string>;
}

export const STANDALONE_BANNERS: Record<string, BannerContent> = {
  quality: {
    badge: {
      fa: 'استاندارد ملی و بین‌المللی ۳۰ بار فشار',
      en: '30-Bar Hydrostatic Proof Standards',
      ar: 'المواصفات القياسية الوطنية والدولية واختبار ۳۰ بار',
      de: 'Nationale & internationale Normen (30-Bar-Prüfung)',
      ur: 'قومی و بین الاقوامی معیارات اور ۳۰ بار پریشر ٹیسٹ',
      hy: 'Ազգային և միջազգային ստանդարտներ (30 բար)',
      tr: 'Ulusal ve Uluslararası Standartlar (30 Bar Testi)',
      ru: 'Национальные и международные стандарты (30 бар)',
    },
    title: {
      fa: 'کنترل کیفیت، آزمون ۳۰ بار و استانداردهای کمپانی تولید سیلندر گاز مایع در ایران',
      en: 'Quality Assurance, 30-Bar Testing & Standards | M Gas Cylinder Co.',
      ar: 'مراقبة الجودة، اختبار ضغط ۳۰ بار والمواصفات القياسية لمصنع إم غاز',
      de: 'Qualitätssicherung, 30-Bar-Prüfung & Normen des führenden LPG-Zylinderherstellers',
      ur: 'ایران میں کوالٹی کنٹرول، ۳۰ بار پریشر ٹیسٹنگ اور بین الاقوامی معیارات',
      hy: 'Որակի հսկողություն, 30 բար ճնշման փորձարկում և արտադրական ստանդարտներ',
      tr: 'İran’ın Lider LPG Tüpü Üreticisinde Kalite Kontrol, 30 Bar Testi ve Standartlar',
      ru: 'Контроль качества, испытания под давлением 30 бар и стандарты завода «М Газ»',
    },
    description: {
      fa: 'تمامی سیلندرهای تولیدی کارخانه ام گاز از ورق‌های فولادی استاندارد مخازن تحت فشار، پرس هیدرولیک کشش عمیق، جوشکاری مکانیزه زیرپودری SAW، کوره تنش‌زدایی یکنواخت و آزمون فشار هیدرواستاتیک ۱۰۰٪ با ۳۰ بار فشار تولید و صادر می‌شوند.',
      en: 'Every liquefied petroleum gas cylinder manufactured at M Gas undergoes deep drawing hydraulic forming, submerged arc welding (SAW), stress-relief heat treatment, and 100% individual 30-bar hydrostatic proof pressure verification.',
      ar: 'تخضع جميع أسطوانات الغاز المسال في مصنع إم غاز لعمليات السحب الهيدروليكي العميق، اللحام الآلي تحت البودرة SAW، المعالجة الحرارية لإزالة الإجهاد، واختبار ضغط هيدروستاتيكي فردي بنسبة ۱۰۰٪ عند ۳۰ بار.',
      de: 'Jede Flüssiggasflasche von M Gas durchläuft hydraulisches Tiefziehen, automatisches UP-Schweißen (SAW), Spannungsarmglühen und eine 100%ige Stückprüfung mit 30 Bar Prüfdruck.',
      ur: 'ایم گیس فیکٹری میں تیار ہونے والے تمام ایل پی جی سلنڈرز گہرے ہائیڈرولک پریس، خودکار SAW ویلڈنگ، گرمی سے تناؤ کے خاتمے اور ۳۰ بار پریشر پر ۱۰۰٪ انفرادی ہائیڈروسٹیٹک ٹیسٹنگ سے گزرتے ہیں۔',
      hy: 'M Gas գործարանում արտադրվող յուրաքանչյուր գազաբալոն անցնում է խորը հիդրավլիկ ձգում, ավտոմատ SAW եռակցում, ջերմամշակում և 30 բար ճնշմամբ 100% անհատական հիդրոստատիկ ստուգում:',
      tr: 'M Gas fabrikasında üretilen her LPG tüpü, hidrolik derin çekme, otomatik tozaltı kaynağı (SAW), gerilim giderme tavlaması ve %100 bireysel 30 bar hidrostatik sızdırmazlık testinden geçer.',
      ru: 'Каждый баллон для сжиженного газа завода «М Газ» проходит глубокую гидравлическую вытяжку, автоматическую сварку под флюсом (SAW), термообработку и 100% индивидуальное гидроиспытание давлением 30 бар.',
    },
  },

  factoryTour: {
    badge: {
      fa: 'مستند کارخانه ام گاز کرج',
      en: 'Documentary Video Tour',
      ar: 'جولة وثائقية في مصنع كرج',
      de: 'Dokumentarischer Werksrundgang',
      ur: 'کرج فیکٹری کا دستاویزی ویڈیو ٹور',
      hy: 'Վավերագրական վիդեո շրջայց',
      tr: 'Fabrika Video Belgeseli',
      ru: 'Документальный видеотур по заводу',
    },
    title: {
      fa: 'مستند ویدئویی خطوط تولید کارخانه ام گاز؛ مدیریت موسی عمویی',
      en: 'Factory Video Tour & Automated Production Lines | Mousa Amooie',
      ar: 'جولة وثائقية بالفيديو لخطوط الإنتاج في مصنع إم غاز؛ إدارة موسى عموئي',
      de: 'Werks-Videorundgang & automatisierte Produktionslinien | GF Mousa Amooie',
      ur: 'ایم گیس فیکٹری پروڈکشن لائنز کا ویڈیو ٹور؛ زیر نگرانی موسیٰ عموئی',
      hy: 'M Gas գործարանի արտադրական գծերի վիդեո շրջայց. տնօրեն Մուսա Ամուի',
      tr: 'M Gas Fabrikası Üretim Hatları Video Belgeseli; Yönetim Mousa Amooie',
      ru: 'Видеоэкскурсия по автоматизированным линиям завода «М Газ»; руководство Мусы Амуи',
    },
    description: {
      fa: 'مشاهده ۵ ویدئوی اختصاصی با کیفیت بالا از مراحل ساخت، جوشکاری مکانیزه زیرپودری، بازرسی چشمی و نظارت مستقیم آقای موسی عمویی مدیر و بنیانگذار کارخانه ام گاز در کرج.',
      en: 'Experience five authentic factory production videos showcasing press lines, automated submerged arc welding, hydrostatic burst testing, and executive leadership by Mousa Amooie.',
      ar: 'شاهد ۵ مقاطع فيديو حصرية عالية الدقة لمراحل التصنيع، اللحام الآلي تحت البودرة، الفحص البصري، والإشراف المباشر للمؤسس والمدير العام موسى عموئي في كرج.',
      de: 'Sehen Sie 5 authentische Videos der Fertigung: Pressenstraßen, automatisiertes Unterpulverschweißen, Berstdruckprüfung und Werksführung durch Gründer Mousa Amooie.',
      ur: 'کرج میں پروڈکشن پریس، خودکار زیر آب ویلڈنگ اور بانی موسی عموئی کی زیر نگرانی کوالٹی چیک کی ۵ خصوصی ہائی ڈیفینیشن ویڈیوز دیکھیں۔',
      hy: 'Դիտեք 5 բացառիկ բարձրորակ տեսանյութեր արտադրության փուլերի, ավտոմատ եռակցման, տեսողական ստուգման և տնօրեն Մուսա Ամուիի վերահսկողության մասին:',
      tr: 'Karac tesislerinde hidrolik presler, otomatik tozaltı kaynağı ve kurucu Mousa Amooie yönetimindeki kalite testlerini gösteren 5 özel videoyu izleyin.',
      ru: 'Посмотрите 5 эксклюзивных видеороликов высокого разрешения: линии прессования, автоматическая сварка, гидроиспытания и личный контроль основателя Мусы Амуи в Карадже.',
    },
  },

  articles: {
    badge: {
      fa: 'مرجع متالورژی و ایمنی مهندسی',
      en: 'Engineering Knowledge Base',
      ar: 'مرجع الميتالورجيا وهندسة السلامة',
      de: 'Wissensdatenbank für Metallurgie & Sicherheit',
      ur: 'انجینئرنگ اور میٹالرجیکل ڈیٹا بیس',
      hy: 'Ինժեներական և անվտանգության գիտելիքների բազա',
      tr: 'Mühendislik ve Güvenlik Bilgi Bankası',
      ru: 'База инженерных знаний и металлургии',
    },
    title: {
      fa: 'مقالات مهندسی و متالورژی کمپانی تولید سیلندر گاز مایع در ایران',
      en: 'Engineering & Metallurgy Articles | LPG Cylinder Manufacturing Standards',
      ar: 'المقالات الهندسية وميتالورجيا تصنيع أسطوانات الغاز المسال في إيران',
      de: 'Ingenieur- und Metallurgie-Fachartikel zur Flüssiggas-Zylinderfertigung',
      ur: 'ایران میں ایل پی جی سلنڈر مینوفیکچرنگ کے انجینئرنگ اور میٹالرجیکل مقالات',
      hy: 'Հեղուկ գազի բալոնների արտադրության ինժեներական և մետալուրգիական հոդվածներ',
      tr: 'İran LPG Tüpü İmalatında Mühendislik ve Metalurji Makaleleri',
      ru: 'Инженерные статьи по металлургии и стандартам производства баллонов LPG',
    },
    description: {
      fa: 'تحلیل جامع استانداردهای ساخت کپسول گاز، متالورژی ورق‌های فولادی مخازن تحت فشار، بازرسی رادیوگرافی جوش، الزامات NFPA 58 و دستورالعمل‌های بین‌المللی حمل‌ونقل ADR.',
      en: 'In-depth engineering analyses covering pressure vessel steel metallurgy, submerged arc weld inspection, NFPA 58 standards, and international hazardous material transport protocols.',
      ar: 'تحليلات هندسية شاملة لمعايير صناعة أسطوانات الغاز، ميتالورجيا فولاذ أوعية الضغط، الفحص الشعاعي للحام، متطلبات NFPA 58 والاتفاقية الدولية لنقل المواد الخطرة ADR.',
      de: 'Fundierte Fachanalysen zu Druckbehälterstahl-Metallurgie, Schweißnaht-Röntgenprüfung, NFPA-58-Normen und internationalen ADR-Gefahrguttransportrichtlinien.',
      ur: 'پریشر ویسل اسٹیل میٹالرجی، ویلڈنگ کی ریڈیوگرافی انسپیکشن، NFPA 58 معیارات اور ADR بین الاقوامی شپنگ اصولوں کا جامع تجزیہ۔',
      hy: 'Ճնշման անոթների պողպատի մետալուրգիայի, եռակցման կարերի ռենտգենային ստուգման, NFPA 58 և ADR փոխադրման կանոնների մանրամասն վերլուծություն:',
      tr: 'Basınçlı kap çelik metalurjisi, kaynak dikişi radyografik muayenesi, NFPA 58 standartları ve uluslararası ADR tehlikeli madde lojistiği teknik analizleri.',
      ru: 'Комплексный инженерный анализ металлургии сталей для сосудов под давлением, рентгенографии швов, требований стандарта NFPA 58 и правил ADR.',
    },
  },

  about: {
    badge: {
      fa: 'بیش از ۵۰ سال افتخار صنعتی (۱۳۴۹)',
      en: 'Over 50 Years Industrial Legacy (Est. 1970)',
      ar: 'أكثر من ۵۰ عاماً من الريادة الصناعية (تأسس ۱۹۷۰)',
      de: 'Über 50 Jahre Industrieerbe (Gegr. 1970)',
      ur: '۵۰ سال سے زائد صنعتی تاریخ (قیام ۱۹۷۰)',
      hy: 'Ավելի քան 50 տարվա արտադրական ժառանգություն (1970)',
      tr: '50 Yılı Aşkın Sanayi Mirası (Kuruluş 1970)',
      ru: 'Более 50 лет промышленного наследия (Основан в 1970)',
    },
    title: {
      fa: 'تاریخچه و پیشینه کمپانی تولید سیلندر گاز مایع در ایران؛ مدیریت موسی عمویی',
      en: '50+ Years Heritage & Vision | Premier LPG Cylinder Manufacturer in Iran',
      ar: 'تاريخ ورؤية مصنع إم غاز؛ أكثر من نصف قرن بقيادة موسى عموئي',
      de: '50+ Jahre Tradition & Vision | Führender Hersteller von Gaszylindern im Iran',
      ur: 'ایران میں ایل پی جی سلنڈر مینوفیکچرنگ کی ۵۰ سالہ تاریخ؛ زیر قیادت موسیٰ عموئی',
      hy: '50+ տարվա փորձ և պատմություն Իրանում հեղուկ գազի բալոնների առաջատար գործարանում',
      tr: '50 Yılı Aşkın Tarih ve Vizyon | İran’ın Öncü LPG Tüpü Üreticisi',
      ru: 'Более 50 лет традиций и истории ведущего производителя баллонов СУГ в Иране',
    },
    description: {
      fa: 'از سال ۱۳۴۹ تا کنون، کارخانه ام گاز با مدیریت و بنیانگذاری آقای موسی عمویی در خط مقدم صنعت مخازن تحت فشار ایران و خاورمیانه قرار داشته و صادرات به بیش از ۱۲ کشور را ثبت نموده است.',
      en: 'Since 1970, M Gas Factory under the executive leadership of Mousa Amooie has manufactured certified LPG cylinders powering industries and homes across Iran and over 12 global export hubs.',
      ar: 'منذ عام ۱۹۷۰ وحتى اليوم، يتصدر مصنع إم غاز بقيادة المؤسس موسى عموئي صناعة أوعية الضغط في الشرق الأوسط مع تصدير منتجاته لأكثر من ۱۲ دولة حول العالم.',
      de: 'Seit 1970 steht das M-Gas-Werk unter der Leitung von Mousa Amooie an der Spitze der Druckbehälterindustrie und exportiert zertifizierte Gasflaschen in über 12 Länder.',
      ur: '۱۹۷۰ سے لے کر آج تک ایم گیس فیکٹری بانی موسیٰ عموئی کی قیادت میں مشرق وسطیٰ کی پریشر ویسل انڈسٹری میں صف اول پر ہے اور ۱۲ سے زائد ممالک کو برآمد کرتی ہے۔',
      hy: '1970 թվականից ի վեր հիմնադիր Մուսա Ամուիի գլխավորությամբ M Gas-ը հանդիսանում է ճնշման անոթների առաջատար արտադրող՝ արտահանելով ավելի քան 12 երկիր:',
      tr: '1970 yılından bugüne M Gas fabrikası, kurucu Mousa Amooie liderliğinde basınçlı kaplar sektöründe öncü konumda olup 12’den fazla ülkeye ihracat gerçekleştirmektedir.',
      ru: 'С 1970 года завод «М Газ» под руководством Мусы Амуи находится в авангарде производства сосудов под давлением, экспортируя продукцию в более чем 12 стран мира.',
    },
  },

  certificates: {
    badge: {
      fa: 'پروانه استاندارد ملی و تاییدیه بین‌المللی',
      en: 'National & International Accredited Standards',
      ar: 'اعتماد المواصفات القياسية الوطنية والدولية',
      de: 'Nationale & internationale Akkreditierungen',
      ur: 'قومی اور بین الاقوامی سرٹیفیکیشنز',
      hy: 'Ազգային և միջազգային հավատարմագրումներ',
      tr: 'Ulusal ve Uluslararası Akredite Standartlar',
      ru: 'Национальные и международные аккредитации',
    },
    title: {
      fa: 'گواهینامه‌های رسمی، استانداردهای ملی و بین‌المللی کارخانه ام گاز',
      en: 'Official Quality Certifications & International Standards | M Gas',
      ar: 'الشهادات الرسمية والمعايير الوطنية والدولية لمصنع إم غاز',
      de: 'Offizielle Qualitätszertifikate & internationale Normen von M Gas',
      ur: 'ایم گیس فیکٹری کے سرکاری کوالٹی سرٹیفکیٹس اور بین الاقوامی معیارات',
      hy: 'M Gas գործարանի պաշտոնական որակի սերտիֆիկատները և միջազգային ստանդարտները',
      tr: 'M Gas Fabrikası Resmi Kalite Sertifikaları ve Uluslararası Standartlar',
      ru: 'Официальные сертификаты качества и международные стандарты завода «М Газ»',
    },
    description: {
      fa: 'مشاهده و بررسی اسناد و پروانه‌های رسمی استاندارد ملی ایران (ISIRI 841)، گواهینامه ISO 9001:2015 و استانداردهای اروپایی کپسول گاز مایع EN 1442 / CE و DOT-4BA.',
      en: 'Official certifications, quality assurance records, and third-party inspection documentation verifying M Gas high-pressure LPG cylinders for domestic distribution and global export.',
      ar: 'معاينة وفحص الوثائق والتراخيص الرسمية للمواصفة الإيرانية القياسية (ISIRI 841)، شهادة ISO 9001:2015 والمعايير الدولية EN 1442 و CE للتصدير.',
      de: 'Einsicht in offizielle Prüfunterlagen: nationale Norm ISIRI 841, Qualitätsmanagementsystem ISO 9001:2015 sowie europäische Druckgeräterichtlinien EN 1442 / CE und DOT-4BA.',
      ur: 'ایران کے قومی معیار ISIRI 841، کوالٹی مینجمنٹ ISO 9001:2015 اور یورپی معیارات EN 1442 / CE کے باضابطہ سرٹیفکیٹس اور کوالٹی دستاویزات کا معائنہ کریں۔',
      hy: 'Դիտեք Իրանի ազգային ստանդարտի (ISIRI 841), ISO 9001:2015-ի և եվրոպական EN 1442 / CE գազաբալոնների սերտիֆիկատները:',
      tr: 'İran Ulusal Standardı ISIRI 841, ISO 9001:2015 Kalite Yönetim Sistemi ve Avrupa EN 1442 / CE direktiflerine uygun resmi belgeleri inceleyin.',
      ru: 'Официальные сертификаты Национального стандарта Ирана ISIRI 841, системы менеджмента качества ISO 9001:2015 и европейских директив EN 1442 / CE.',
    },
  },

  faq: {
    badge: {
      fa: 'پاسخ به سوالات فنی و بازرگانی',
      en: 'Technical & Commercial FAQ',
      ar: 'إجابات الأسئلة الفنية والتجارية',
      de: 'Technische & kaufmännische FAQ',
      ur: 'تکنیکی و تجارتی سوالات کے جوابات',
      hy: 'Տեխնիկական և առևտրային հարցուպատասխան',
      tr: 'Teknik ve Ticari Sıkça Sorulan Sorular',
      ru: 'Технические и коммерческие ответы на вопросы',
    },
    title: {
      fa: 'سوالات متداول خریداران کپسول گاز مایع؛ کمپانی تولید سیلندر در ایران',
      en: 'Frequently Asked Questions | LPG Cylinder Manufacturing & Export',
      ar: 'الأسئلة الشائعة لمشتري أسطوانات الغاز المسال في إيران',
      de: 'Häufig gestellte Fragen (FAQ) zu LPG-Zylindern & Exportabwicklung',
      ur: 'ایل پی جی سلنڈر خریداروں کے اکثر پوچھے جانے والے سوالات',
      hy: 'Հեղուկ գազի բալոնների գնորդների հաճախակի տրվող հարցերը',
      tr: 'LPG Tüpü Alıcıları İçin Sıkça Sorulan Sorular ve İhracat Detayları',
      ru: 'Часто задаваемые вопросы покупателей газовых баллонов LPG и экспорт',
    },
    description: {
      fa: 'پاسخ به پرسش‌های رایج در زمینه فشار کاری و تست، ضخامت ورق‌های فولادی، شرایط کانتینربندی صادراتی و حداقل تیراژ تولید سفارشی.',
      en: 'Clear, engineering-verified answers to common questions regarding working pressure, steel thickness, MOQ, container capacity, and color customization.',
      ar: 'إجابات هندسية معتمدة على الأسئلة الشائعة حول ضغط التشغيل، سماكة صفائح الفولاذ، سعة الحاويات البحرية، والحد الأدنى للطلبات المخصصة.',
      de: 'Technisch verifizierte Antworten auf Fragen zu Betriebs- und Prüfdrücken, Stahlwandstärken, Mindestbestellmengen, Container-Stauplänen und RAL-Farben.',
      ur: 'ورکنگ اور ٹیسٹ پریشر، اسٹیل شیٹ کی موٹائی، کنٹینر لوڈنگ کی گنجائش اور کم سے کم آرڈر کے بارے میں تفصیلی انجینئرنگ جوابات۔',
      hy: 'Ճշգրիտ ինժեներական պատասխաններ աշխատանքային ճնշման, պողպատի հաստության, կոնտեյների տարողության և նվազագույն պատվերի վերաբերյալ:',
      tr: 'Çalışma ve test basıncı, çelik sac kalınlığı, ihracat konteyner kapasitesi ve minimum sipariş miktarı (MOQ) hakkında teknik cevaplar.',
      ru: 'Технические ответы на распространенные вопросы о рабочем давлении, толщине стали, вместимости контейнеров и минимальном тираже заказа.',
    },
  },

  calculator: {
    badge: {
      fa: 'محاسبه کانتینربندی و استعلام آنلاین',
      en: 'Container Logistics & Online RFQ',
      ar: 'حساب حمولة الحاويات وطلب الأسعار',
      de: 'Container-Logistik & Online-Preisanfrage',
      ur: 'کنٹینر لاجسٹکس اور آن لائن کوٹیشن',
      hy: 'Կոնտեյների լոգիստիկա և առցանց գնառաջարկ',
      tr: 'Konteyner Lojistiği ve Çevrimiçi Fiyat Talebi',
      ru: 'Логистика контейнеров и онлайн-запрос цен',
    },
    title: {
      fa: 'استعلام قیمت عمده و محاسبه ظرفیت بارگیری کانتینر کپسول گاز',
      en: 'Online RFQ & Shipping Container Loading Capacity Calculator',
      ar: 'استعلام أسعار الجملة وحاسبة سعة شحن الحاويات لأسطوانات الغاز',
      de: 'Online-Preisanfrage & Containerkapazitäts-Rechner für Flüssiggasflaschen',
      ur: 'ہول سیل قیمت کی انکوائری اور کنٹینر لوڈنگ گنجائش کیلکولیٹر',
      hy: 'Մեծածախ գների հաշվարկ և կոնտեյների բեռնման տարողության հաշվիչ',
      tr: 'Toptan Fiyat Teklifi ve Konteyner Yükleme Kapasitesi Hesaplayıcı',
      ru: 'Оптовый расчет цен и калькулятор загрузки контейнеров баллонами СУГ',
    },
    description: {
      fa: 'تعداد کپسول مورد نیاز خود را وارد کنید تا ظرفیت کانتینر ۲۰ فوت، ۴۰ فوت های‌کیوب (HQ)، وزن ناخالص و پیش‌فاکتور رسمی به صورت زنده محاسبه و مستقیماً برای واحد فروش صادر شود.',
      en: 'Enter your desired cylinder quantities to instantly compute 20ft and 40ft HQ container loading capacities, gross shipping tonnage, and dispatch directly to M Gas export directorate.',
      ar: 'أدخل كميات الأسطوانات المطلوبة لحساب حمولة حاويات ۲۰ قدماً و ۴۰ قدماً هاي كيوب (HQ) والوزن الإجمالي وإصدار الفاتورة الأولية للمبيعات فوراً.',
      de: 'Geben Sie die gewünschten Stückzahlen ein, um die Auslastung von 20ft- und 40ft-HQ-Containern sowie Gesamtgewichte live zu berechnen und an den Vertrieb zu senden.',
      ur: 'مطلوبہ سلنڈروں کی تعداد درج کریں تاکہ ۲۰ اور ۴۰ فٹ ہائی کیوب کنٹینرز کی گنجائش، مجموعی وزن اور کوٹیشن کا فوری حساب لگایا جا سکے۔',
      hy: 'Մուտքագրեք անհրաժեշտ քանակը՝ 20 և 40 ֆուտանոց կոնտեյներների բեռնումը, ընդհանուր քաշը հաշվելու և վաճառքի բաժնին ուղարկելու համար:',
      tr: 'İhtiyacınız olan adetleri girerek 20ft ve 40ft HQ konteyner doluluk oranlarını, brüt ağırlığı ve proforma teklifi anında hesaplayın.',
      ru: 'Введите требуемое количество баллонов для расчета вместимости 20-футовых и 40-футовых HQ контейнеров, веса брутто и отправки запроса в отдел продаж.',
    },
  },

  contact: {
    badge: {
      fa: 'تماس با واحد فروش و آدرس کارخانه کرج',
      en: 'Karaj Factory Location & Export Contact',
      ar: 'التواصل مع المبيعات وعنوان مصنع كرج',
      de: 'Werk Karaj & Export-Vertrieb',
      ur: 'سیلز ڈپارٹمنٹ اور کرج فیکٹری کا پتہ',
      hy: 'Կապ վաճառքի բաժնի հետ և Քարաջի գործարան',
      tr: 'Satış Departmanı ve Karac Fabrika Adresi',
      ru: 'Связь с отделом продаж и адрес завода в Карадже',
    },
    title: {
      fa: 'تماس با کارخانه، نشانی کرج و واحد فروش کمپانی تولید سیلندر گاز مایع در ایران',
      en: 'Contact Karaj Factory & International Export Directorate | M Gas',
      ar: 'اتصل بالمصنع، عنوان كرج وإدارة مبيعات وتصدير أسطوانات الغاز',
      de: 'Kontakt zum Werk Karaj & Internationale Vertriebsleitung | M Gas',
      ur: 'فیکٹری سے رابطہ، کرج کا پتہ اور بین الاقوامی سیلز ڈائریکٹوریٹ',
      hy: 'Կապ Քարաջի գործարանի և միջազգային վաճառքի տնօրինության հետ',
      tr: 'Karac Fabrikası ve Uluslararası İhracat Müdürlüğü İletişim Bilgileri',
      ru: 'Контакты завода в Карадже и международной дирекции продаж «М Газ»',
    },
    description: {
      fa: 'ارتباط مستقیم با مدیریت کارخانه ام گاز (آقای موسی عمویی)، ساعات کاری، لوکیشن کارخانه در کرج و مشاوره تخصصی در واتس‌اپ.',
      en: 'Direct inquiry with M Gas factory management in Karaj, working hours, exact factory location, and instant WhatsApp international sales support.',
      ar: 'تواصل مباشر مع إدارة مصنع إم غاز (السيد موسى عموئي)، أوقات العمل، الموقع الجغرافي للمصنع في كرج، والاستشارات عبر واتساب.',
      de: 'Direkter Kontakt zur M-Gas-Werksleitung (Mousa Amooie), Arbeitszeiten, genauer Standort in Karaj und internationale WhatsApp-Kundenbetreuung.',
      ur: 'کرج میں فیکٹری مینیجمنٹ (موسی عموئی) سے براہ راست رابطہ، کام کے اوقات، فیکٹری کا درست مقام اور واٹس ایپ پر فوری مشاورت۔',
      hy: 'Ուղիղ կապ գործարանի ղեկավարության հետ (Մուսա Ամուի), աշխատանքային ժամեր, գործարանի ճշգրիտ հասցե և WhatsApp խորհրդատվություն:',
      tr: 'Karac fabrika yönetimi (Mousa Amooie) ile doğrudan irtibat, çalışma saatleri, konum ve WhatsApp üzerinden hızlı danışmanlık.',
      ru: 'Прямая связь с руководством завода «М Газ» (Муса Амуи), график работы, точная локация завода в Карадже и консультации в WhatsApp.',
    },
  },
};

export function getBanner(key: keyof typeof STANDALONE_BANNERS, lang: LanguageCode) {
  const item = STANDALONE_BANNERS[key];
  if (!item) {
    return {
      badge: '',
      title: '',
      description: '',
    };
  }
  return {
    badge: item.badge[lang] || item.badge.fa || item.badge.en,
    title: item.title[lang] || item.title.fa || item.title.en,
    description: item.description[lang] || item.description.fa || item.description.en,
  };
}
