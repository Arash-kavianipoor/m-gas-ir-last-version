export interface CustomerBrand {
  id: string;
  nameFa: string;
  nameEn: string;
  logo: string;
  categoryFa: string;
  categoryEn: string;
  roleFa: string;
  roleEn: string;
}

export const DOMESTIC_CUSTOMERS: CustomerBrand[] = [
  {
    id: 'butane',
    nameFa: 'گروه صنعتی بوتان',
    nameEn: 'Butane Industrial Group',
    logo: '/customers/botan.svg',
    categoryFa: 'صنایع گاز و حرارتی',
    categoryEn: 'Gas & Heating Appliances',
    roleFa: 'تامین انواع سیلندر و قطعات گاز مایع',
    roleEn: 'LPG Cylinders & Components Partner',
  },
  {
    id: 'saipa',
    nameFa: 'گروه خودروسازی سایپا',
    nameEn: 'Saipa Automotive Group',
    logo: '/customers/saipa.svg',
    categoryFa: 'صنایع خودروسازی',
    categoryEn: 'Automotive Manufacturing',
    roleFa: 'تامین مخازن استاندارد گازسوز خودرویی',
    roleEn: 'OEM Automotive LPG Cylinders Supply',
  },
  {
    id: 'ikco',
    nameFa: 'گروه صنعتی ایران خودرو',
    nameEn: 'Iran Khodro (IKCO)',
    logo: '/customers/ikco.svg',
    categoryFa: 'صنایع خودروسازی',
    categoryEn: 'Automotive Industry',
    roleFa: 'تامین مخازن اتوگاز استاندارد',
    roleEn: 'Automotive LPG Fuel Tank Supplier',
  },
  {
    id: 'isaco',
    nameFa: 'شرکت خدمات پس از فروش ایساکو',
    nameEn: 'ISACO After-Sales Services',
    logo: '/customers/isaco.svg',
    categoryFa: 'قطعات و خدمات خودرویی',
    categoryEn: 'Automotive Parts & Services',
    roleFa: 'تامین تجهیزات و قطعات یدکی مخازن گاز',
    roleEn: 'LPG Tank Parts & Equipment Supply',
  },
  {
    id: 'persigas',
    nameFa: 'شرکت پرسی ایران گاز',
    nameEn: 'Persi Iran Gas Distribution',
    logo: '/customers/persigas.svg',
    categoryFa: 'توزیع سراسری گاز مایع',
    categoryEn: 'Nationwide LPG Distribution',
    roleFa: 'تامین سیلندرهای گاز مایع خانگی و تجاری',
    roleEn: 'Domestic & Commercial LPG Cylinders',
  },
];
