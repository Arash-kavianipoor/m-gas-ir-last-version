import { LanguageCode } from '../types';

export interface LocalizedFaq {
  question: string;
  answer: string;
}

export interface FaqItem {
  id: string;
  locales: Record<LanguageCode, LocalizedFaq>;
}

export const FAQS_DATA: FaqItem[] = [
  {
    id: 'hydrostatic-30-bar',
    locales: {
      fa: {
        question: 'آیا کلیه سیلندرهای تولیدی ام گاز تحت آزمون هیدرواستاتیک ۳۰ بار قرار می‌گیرند؟',
        answer: 'بله، بدون هیچ‌گونه استثنا، ۱۰۰٪ کپسول‌های گاز تولید شده در کارخانه ام گاز در ایستگاه‌های مکانیزه تحت فشار ۳۰ بار آب (۱.۵ برابر فشار کارکرد نامی) تست شده و در صورت هرگونه افت فشار یا تغییر فرم میکرونی از خط خارج می‌گردند.',
      },
      en: {
        question: 'Are all M Gas cylinders tested with 30-bar hydrostatic proof pressure?',
        answer: 'Yes. 100% of manufactured cylinders without exception undergo mandatory 30-bar hydrostatic proof pressure testing (1.5x working pressure) and continuous underwater bubble leakage inspection before leaving the automated production line.',
      },
      ar: {
        question: 'هل تخضع جميع أسطوانات م غاز لاختبار الضغط الهيدروستاتيكي ۳۰ بار؟',
        answer: 'نعم، دون أي استثناء، تخضع ۱۰۰٪ من أسطوانات الغاز المنتجة في مصنع م غاز لاختبار ضغط هيدروستاتيكي إلزامي عند ۳۰ بار (۱.۵ ضعف ضغط التشغيل الاسمي) مع فحص تسرب الفقاعات تحت الماء قبل مغادرة خط الإنتاج.',
      },
      de: {
        question: 'Werden alle M-Gas-Flaschen einer hydrostatischen Druckprüfung mit 30 bar unterzogen?',
        answer: 'Ja, ausnahmslos 100 % aller im Werk M Gas gefertigten Gasflaschen durchlaufen eine automatisierte hydrostatische Druckprüfung bei 30 bar Prüfdruck (1,5-facher Nennbetriebsdruck) sowie eine kontinuierliche Unterwasser-Dichtheitsprüfung.',
      },
      ur: {
        question: 'کیا ایم گیس کے تمام سلنڈرز ۳۰ بار ہائیڈروسٹیٹک پریشر ٹیسٹ سے گزرتے ہیں؟',
        answer: 'جی ہاں، بغیر کسی استثنا کے، ایم گیس فیکٹری میں تیار کردہ ۱۰۰٪ گیس سلنڈرز کا ۳۰ بار واٹر پریشر (ورکنگ پریشر سے ۱.۵ گنا زیادہ) پر لازمی ہائیڈروسٹیٹک ٹیسٹ کیا جاتا ہے اور پانی کے اندر لیکیج چیک کی جاتی ہے۔',
      },
      tr: {
        question: 'Tüm M Gas tüpleri 30 bar hidrostatik sızdırmazlık ve basınç testine tabi tutuluyor mu?',
        answer: 'Evet, istisnasız olarak M Gas fabrikasında üretilen tüplerin %100’ü mekanize istasyonlarda 30 bar su basıncı (nominal çalışma basıncının 1,5 katı) altında test edilmekte ve su altı mikro sızıntı denetiminden geçmektedir.',
      },
      ru: {
        question: 'Проходят ли все баллоны М Газ гидростатические испытания под давлением 30 бар?',
        answer: 'Да, без исключения 100% газовых баллонов, производимых на заводе М Газ, проходят обязательные гидростатические испытания под давлением 30 бар (в 1,5 раза выше рабочего давления) и проверку на герметичность под водой.',
      },
      hy: {
        question: 'Արդյո՞ք M Gas-ի բոլոր գազաբալոններն անցնում են 30 բար հիդրոստատիկ ճնշման փորձարկում:',
        answer: 'Այո, առանց բացառության, M Gas գործարանում արտադրված բալոնների 100%-ը մեքենայացված կայաններում ենթարկվում է պարտադիր 30 բար հիդրոստատիկ փորձարկման (աշխատանքային ճնշման 1.5-ապատիկը) և ջրի տակ հերմետիկության ստուգման:',
      },
    },
  },
  {
    id: 'moq-and-logistics',
    locales: {
      fa: {
        question: 'حداقل تیراژ سفارش (MOQ) برای خرید عمده و محموله‌های صادراتی چقدر است؟',
        answer: 'حداقل تیراژ بسته به ظرفیت سیلندر (از ۰.۵ لیتر تا ۶۰ لیتر) بین ۲۰۰ الی ۱۰۰۰ عدد متغیر است. همچنین امکان بارگیری ترکیبی چند مدل مختلف در یک کانتینر ۲۰ فوت یا ۴۰ فوت های‌کیوب فراهم است.',
      },
      en: {
        question: 'What is the minimum order quantity (MOQ) for bulk & export shipments?',
        answer: 'MOQ ranges between 200 and 1,000 units depending on cylinder volume (0.5L to 60L). Mixed container loadouts with multiple cylinder capacities in standard 20ft or 40ft HQ shipping containers are fully supported.',
      },
      ar: {
        question: 'ما هو الحد الأدنى لكمية الطلب (MOQ) للشراء بالجملة والشحنات التصديرية؟',
        answer: 'يتراوح الحد الأدنى للطلب بين ۲۰۰ و ۱۰۰۰ وحدة حسب سعة الأسطوانة (من ۰.۵ لتر حتى ۶۰ لتر). كما يتوفر دعم كامل لتحميل الحاويات المختلطة بسعات متعددة في حاويات شحن ۲۰ أو ۴۰ قدماً عالية السعة (HQ).',
      },
      de: {
        question: 'Wie hoch ist die Mindestbestellmenge (MOQ) für Großbestellungen und Exportlieferungen?',
        answer: 'Die Mindestbestellmenge liegt je nach Flaschenvolumen (0,5 l bis 60 l) zwischen 200 und 1.000 Stück. Gemischte Containerbeladungen verschiedener Modelle in standardmäßigen 20-Fuß- oder 40-Fuß-HQ-Seecontainern sind flexibel möglich.',
      },
      ur: {
        question: 'بلک اور برآمدی آرڈرز کے لیے کم از کم آرڈر کی مقدار (MOQ) کیا ہے؟',
        answer: 'کم از کم آرڈر سلنڈر کی صلاحیت (۰.۵ لیٹر سے ۶۰ لیٹر) کے لحاظ سے ۲۰۰ سے ۱۰۰۰ یونٹس تک ہوتا ہے۔ ۲۰ فٹ یا ۴۰ فٹ ہائی کیوب کنٹینرز میں مختلف ماڈلز کی مکس لوڈنگ کی مکمل سہولت موجود ہے۔',
      },
      tr: {
        question: 'Toptan ve ihracat sevkiyatları için minimum sipariş miktarı (MOQ) nedir?',
        answer: 'Minimum sipariş miktarı tüp hacmine bağlı olarak (0,5 L ile 60 L arası) 200 ila 1.000 adet arasında değişmektedir. 20ft veya 40ft HQ standart konteynerlerde karma model yükleme seçenekleri mevcuttur.',
      },
      ru: {
        question: 'Каков минимальный объем заказа (MOQ) для оптовых и экспортных поставок?',
        answer: 'Минимальный объем заказа варьируется от 200 до 1000 единиц в зависимости от объема баллона (от 0.5 до 60 л). Поддерживается смешанная погрузка различных моделей в стандартные 20-футовые и 40-футовые контейнеры High Cube.',
      },
      hy: {
        question: 'Որքա՞ն է պատվերի նվազագույն քանակը (MOQ) մեծածախ և արտահանման առաքումների համար:',
        answer: 'Նվազագույն պատվերի քանակը տատանվում է 200-ից մինչև 1,000 հատ՝ կախված բալոնի ծավալից (0.5լ-ից մինչև 60լ): Հնարավոր է նաև տարբեր մոդելների խառը բեռնում 20 և 40 ֆուտանոց High Cube բեռնարկղերում:',
      },
    },
  },
  {
    id: 'ral-custom-coating',
    locales: {
      fa: {
        question: 'آیا امکان سفارشی‌سازی رنگ بدنه بر اساس کد اختصاصی رال (RAL) مشتری وجود دارد؟',
        answer: 'بله، خط رنگ تمام اتوماتیک الکترواستاتیک کارخانه ام گاز قابلیت اجرای بیش از ۲۰۰ کد رنگ استاندارد بین‌المللی RAL را با ضخامت کنترل‌شده ۱۰۰ تا ۱۲۰ میکرون دارد.',
      },
      en: {
        question: 'Is custom RAL color powder coating available for cylinders?',
        answer: 'Yes. Our automated electrostatic powder coating facility supports all 200+ international standard RAL color codes with oven-baked epoxy-polyester finish and strictly controlled 100-120 micron coating thickness.',
      },
      ar: {
        question: 'هل يمكن تخصيص لون طلاء الهيكل وفقاً لرمز رال (RAL) الخاص بالعميل؟',
        answer: 'نعم، يدعم خط الطلاء الكهروستاتيكي الآلي بالكامل في مصنع م غاز أكثر من ۲۰۰ رمز لون قياسي دولي من RAL مع طلاء إيبوكسي بوليستر حراري بسماكة مضبوطة بدقة بين ۱۰۰ و ۱۲۰ ميكرون.',
      },
      de: {
        question: 'Ist eine individuelle Pulverbeschichtung nach speziellem RAL-Farbcode möglich?',
        answer: 'Ja, unsere automatisierte elektrostatische Pulverbeschichtungsanlage unterstützt alle über 200 internationalen Standard-RAL-Farben mit ofengehärteter Epoxid-Polyester-Beschichtung und kontrollierter Schichtdicke von 100 bis 120 Mikrometern.',
      },
      ur: {
        question: 'کیا کسٹمر کے مخصوص رال (RAL) رنگ کوڈ کے مطابق کسٹم کلر کوٹنگ ممکن ہے؟',
        answer: 'جی ہاں، ایم گیس فیکٹری کا خودکار الیکٹرو اسٹیٹک پاؤڈر کوٹنگ یونٹ ۲۰۰ سے زیادہ بین الاقوامی معیاری RAL کلر کوڈز کی اوون بیکڈ فنشنگ اور ۱۰۰ سے ۱۲۰ مائیکرون کی کوٹنگ موٹائی فراہم کرتا ہے۔',
      },
      tr: {
        question: 'Müşteriye özel RAL renk koduyla elektrostatik toz boya imkanı var mı?',
        answer: 'Evet, M Gas tam otomatik elektrostatik toz boya hattımız, fırınlanmış epoksi-polyester apre ile 200’den fazla uluslararası standart RAL renk kodunu 100-120 mikron kontrollü kalınlıkta sunmaktadır.',
      },
      ru: {
        question: 'Возможна ли индивидуальная порошковая покраска по коду цвета RAL?',
        answer: 'Да, автоматизированная линия электростатической порошковой покраски завода М Газ поддерживает более 200 стандартных международных цветов RAL с термозапекаемым эпоксидно-полиэфирным покрытием толщиной 100-120 микрон.',
      },
      hy: {
        question: 'Հնարավո՞ր է պատվիրել հատուկ փոշեներկում ըստ հաճախորդի RAL գույնի կոդի:',
        answer: 'Այո, M Gas գործարանի ավտոմատացված էլեկտրաստատիկ փոշեներկման գիծն ապահովում է ավելի քան 200 միջազգային ստանդարտ RAL գույների կիրառում՝ 100-120 միկրոն հաստությամբ ջերմակայուն ծածկույթով:',
      },
    },
  },
  {
    id: 'valves-and-standards',
    locales: {
      fa: {
        question: 'سیلندرهای ام گاز با چه نوع شیرها و استانداردهایی مونتاژ می‌شوند؟',
        answer: 'سیلندرهای صادراتی متناسب با کشور مقصد با شیرهای استاندارد برنجی با رزوه W21.8، رزوه چپ‌گرد، شیرهای سوپاپ‌دار یا مولتی‌والوهای خودرویی ECE R67 مونتاژ و آزمایش می‌شوند.',
      },
      en: {
        question: 'What valve specifications and international standards are fitted?',
        answer: 'Cylinders are assembled according to destination market standards with certified forged brass valves (W21.8, POL, left-hand safety threads, compact camping valves, or ECE R67 automotive multivalves) and 100% leak-tested.',
      },
      ar: {
        question: 'ما هي مواصفات الصمامات والمعايير القياسية التي يتم تركيبها على الأسطوانات؟',
        answer: 'يتم تجميع الأسطوانات وفقاً لمعايير السوق المستهدف بصمامات نحاسية معتمدة (W21.8، سن يساري POL، صمامات الرحلات المدمجة، أو صمامات ECE R67 متعددة الوظائف لخزانات السيارات) مع اختبار كامل ضد التسريب.',
      },
      de: {
        question: 'Welche Ventilspezifikationen und internationalen Normen werden verbaut?',
        answer: 'Die Gasflaschen werden gemäß den Vorschriften der Zielmärkte mit zertifizierten Messingventilen (W21.8, POL, Linksgewinde, kompakte Campingventile oder ECE R67 Autogas-Multiventile) montiert und zu 100 % geprüft.',
      },
      ur: {
        question: 'ایم گیس سلنڈرز میں کون سے والوز اور بین الاقوامی معیارات لگائے جاتے ہیں؟',
        answer: 'برآمدی سلنڈرز منزل مقصود کی مارکیٹ کے مطابق معیاری پیتل کے والوز (W21.8، بائیں ہاتھ کی چوڑی، کمپیکٹ کیمپنگ والوز، یا ECE R67 آٹوموٹو ملٹی والوز) کے ساتھ اسمبل اور مکمل ٹیسٹ کیے جاتے ہیں۔',
      },
      tr: {
        question: 'M Gas silindirleri hangi vana özellikleri ve standartları ile monte edilir?',
        answer: 'Tüpler ihracat yapılacak ülkenin teknik standartlarına göre sertifikalı pirinç vanalarla (W21.8, sol diş POL, kompakt kamp vanaları veya ECE R67 otogaz çoklu vanaları) donatılmakta ve %100 sızdırmazlık testine tabi tutulmaktadır.',
      },
      ru: {
        question: 'Какими типами вентилей и по каким стандартам комплектуются баллоны?',
        answer: 'Баллоны комплектуются в строгом соответствии со стандартами страны назначения сертифицированными латунными вентилями (W21.8, левая резьба POL, кемпинговые компактные клапаны или мультиклапаны ECE R67 для авто) с проверкой герметичности.',
      },
      hy: {
        question: 'Ի՞նչ փականներով և միջազգային ստանդարտներով են համալրվում գազաբալոնները:',
        answer: 'Արտահանվող բալոնները համալրվում են նշանակետ երկրի պահանջներին համապատասխան փողային փականներով (W21.8, ձախ պարույրով POL, կոմպակտ քեմփինգային փականներ կամ ECE R67 ավտոմուլտիփականներ) և ենթարկվում են 100% ստուգման:',
      },
    },
  },
  {
    id: 'certifications-and-iso',
    locales: {
      fa: {
        question: 'چه استانداردهای ملی و بین‌المللی برای سیلندرهای ام گاز اخذ شده است؟',
        answer: 'کارخانه ام گاز دارنده نشان استاندارد ملی ایران (ISIRI 841 و ISIRI 304)، گواهینامه مدیریت کیفیت بین‌المللی ISO 9001:2015 و تاییدیه تطابق با استانداردهای اروپایی EN 1442 و DOT-4BA است.',
      },
      en: {
        question: 'Which national and international certifications does M Gas hold?',
        answer: 'M Gas holds the National Standard of Iran (ISIRI 841 / ISIRI 304), ISO 9001:2015 International Quality Management System certification, and compliance with European EN 1442 and US DOT-4BA pressure vessel standards.',
      },
      ar: {
        question: 'ما هي الشهادات الوطنية والدولية المعتمدة لمصنع م غاز؟',
        answer: 'يحمل مصنع م غاز علامة المعايير الوطنية الإيرانية (ISIRI 841 و ISIRI 304)، وشهادة نظام إدارة الجودة الدولية ISO 9001:2015، والمطابقة مع المعايير الأوروبية EN 1442 ومعايير وزارة النقل الأمريكية DOT-4BA.',
      },
      de: {
        question: 'Über welche nationalen und internationalen Zertifizierungen verfügt M Gas?',
        answer: 'M Gas verfügt über das iranische Nationalstandard-Zertifikat (ISIRI 841 / ISIRI 304), das internationale Qualitätsmanagementsystem ISO 9001:2015 sowie Konformität mit der europäischen Norm EN 1442 und der US-Norm DOT-4BA.',
      },
      ur: {
        question: 'ایم گیس کے پاس کون سے قومی اور بین الاقوامی معیاری سرٹیفکیٹ موجود ہیں؟',
        answer: 'ایم گیس فیکٹری کے پاس ایران نیشنل اسٹینڈرڈ (ISIRI 841 / ISIRI 304)، انٹرنیشنل کوالٹی مینجمنٹ ISO 9001:2015 اور یورپیئن EN 1442 و امریکی DOT-4BA پریشر ویسل سرٹیفکیٹس حاصل ہیں۔',
      },
      tr: {
        question: 'M Gas hangi ulusal ve uluslararası kalite sertifikalarına sahiptir?',
        answer: 'M Gas; İran Ulusal Standardı (ISIRI 841 / ISIRI 304), ISO 9001:2015 Uluslararası Kalite Yönetim Sistemi sertifikası ile Avrupa EN 1442 ve ABD DOT-4BA basınçlı kaplar standartlarına uygunluk belgelerine sahiptir.',
      },
      ru: {
        question: 'Какими национальными и международными сертификатами обладает М Газ?',
        answer: 'Завод М Газ имеет национальный сертификат стандарта Ирана (ISIRI 841 / ISIRI 304), международный сертификат менеджмента качества ISO 9001:2015, а также соответствие европейскому стандарту EN 1442 и стандарту США DOT-4BA.',
      },
      hy: {
        question: 'Ո՞ր ազգային և միջազգային սերտիֆիկատներն ունի M Gas գործարանը:',
        answer: 'M Gas-ն ունի Իրանի ազգային ստանդարտ (ISIRI 841 / ISIRI 304), ISO 9001:2015 որակի կառավարման միջազգային սերտիֆիկատ, ինչպես նաև եվրոպական EN 1442 և ամերիկյան DOT-4BA ստանդարտներին համապատասխանություն:',
      },
    },
  },
];
