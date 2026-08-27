// RAL Classic Powder Coating Color Catalog (From RAL-color-chart-Exel)
export interface RalColor {
  code: string;
  nameEn: string;
  nameFa: string;
  hex: string;
  category: 'yellow' | 'orange' | 'red' | 'violet' | 'blue' | 'green' | 'grey' | 'brown' | 'white-black';
  categoryFa: string;
  isPopular?: boolean;
}

function getCategory(code: string): { cat: RalColor['category']; catFa: string } {
  const num = parseInt(code.replace(/\D/g, ''), 10);
  if (num >= 1000 && num < 2000) return { cat: 'yellow', catFa: 'زرد و بژ (Yellow / Beige)' };
  if (num >= 2000 && num < 3000) return { cat: 'orange', catFa: 'نارنجی (Orange)' };
  if (num >= 3000 && num < 4000) return { cat: 'red', catFa: 'قرمز (Red)' };
  if (num >= 4000 && num < 5000) return { cat: 'violet', catFa: 'بنفش (Violet)' };
  if (num >= 5000 && num < 6000) return { cat: 'blue', catFa: 'آبی (Blue)' };
  if (num >= 6000 && num < 7000) return { cat: 'green', catFa: 'سبز (Green)' };
  if (num >= 7000 && num < 8000) return { cat: 'grey', catFa: 'خاکستری و طوسی (Grey)' };
  if (num >= 8000 && num < 9000) return { cat: 'brown', catFa: 'قهوه‌ای (Brown)' };
  return { cat: 'white-black', catFa: 'سفید و مشکی (White / Black)' };
}

export const RAL_COLORS: RalColor[] = [
  {
    code: "RAL 1000",
    nameEn: "Green beige",
    nameFa: "\u06a9\u0631\u0645 \u0645\u0627\u06cc\u0644 \u0628\u0647 \u0633\u0628\u0632",
    hex: "#CDBA88",
    category: getCategory("RAL 1000").cat,
    categoryFa: getCategory("RAL 1000").catFa,
    isPopular: false
  },
  {
    code: "RAL 1001",
    nameEn: "Beige",
    nameFa: "\u06a9\u0631\u0645 \u0628\u0698",
    hex: "#D0B084",
    category: getCategory("RAL 1001").cat,
    categoryFa: getCategory("RAL 1001").catFa,
    isPopular: false
  },
  {
    code: "RAL 1002",
    nameEn: "Sand yellow",
    nameFa: "\u0632\u0631\u062f \u0634\u0646\u06cc",
    hex: "#D2AA6D",
    category: getCategory("RAL 1002").cat,
    categoryFa: getCategory("RAL 1002").catFa,
    isPopular: false
  },
  {
    code: "RAL 1003",
    nameEn: "Signal yellow",
    nameFa: "\u0632\u0631\u062f \u0647\u0634\u062f\u0627\u0631 (\u0633\u06cc\u06af\u0646\u0627\u0644)",
    hex: "#F9A800",
    category: getCategory("RAL 1003").cat,
    categoryFa: getCategory("RAL 1003").catFa,
    isPopular: false
  },
  {
    code: "RAL 1004",
    nameEn: "Golden yellow",
    nameFa: "\u0632\u0631\u062f \u0637\u0644\u0627\u06cc\u06cc",
    hex: "#E49E00",
    category: getCategory("RAL 1004").cat,
    categoryFa: getCategory("RAL 1004").catFa,
    isPopular: false
  },
  {
    code: "RAL 1005",
    nameEn: "Honey yellow",
    nameFa: "Honey yellow",
    hex: "#CB8E00",
    category: getCategory("RAL 1005").cat,
    categoryFa: getCategory("RAL 1005").catFa,
    isPopular: false
  },
  {
    code: "RAL 1006",
    nameEn: "Maize yellow",
    nameFa: "Maize yellow",
    hex: "#E29000",
    category: getCategory("RAL 1006").cat,
    categoryFa: getCategory("RAL 1006").catFa,
    isPopular: false
  },
  {
    code: "RAL 1007",
    nameEn: "Daffodil yellow",
    nameFa: "Daffodil yellow",
    hex: "#E88C00",
    category: getCategory("RAL 1007").cat,
    categoryFa: getCategory("RAL 1007").catFa,
    isPopular: false
  },
  {
    code: "RAL 1011",
    nameEn: "Brown beige",
    nameFa: "Brown beige",
    hex: "#AF804F",
    category: getCategory("RAL 1011").cat,
    categoryFa: getCategory("RAL 1011").catFa,
    isPopular: false
  },
  {
    code: "RAL 1012",
    nameEn: "Lemon yellow",
    nameFa: "Lemon yellow",
    hex: "#DDAF27",
    category: getCategory("RAL 1012").cat,
    categoryFa: getCategory("RAL 1012").catFa,
    isPopular: false
  },
  {
    code: "RAL 1013",
    nameEn: "Oyster white",
    nameFa: "Oyster white",
    hex: "#E3D9C6",
    category: getCategory("RAL 1013").cat,
    categoryFa: getCategory("RAL 1013").catFa,
    isPopular: true
  },
  {
    code: "RAL 1014",
    nameEn: "Ivory",
    nameFa: "Ivory",
    hex: "#DDC49A",
    category: getCategory("RAL 1014").cat,
    categoryFa: getCategory("RAL 1014").catFa,
    isPopular: false
  },
  {
    code: "RAL 1015",
    nameEn: "Light ivory",
    nameFa: "Light ivory",
    hex: "#E6D2B5",
    category: getCategory("RAL 1015").cat,
    categoryFa: getCategory("RAL 1015").catFa,
    isPopular: false
  },
  {
    code: "RAL 1016",
    nameEn: "Sulfur yellow",
    nameFa: "Sulfur yellow",
    hex: "#F1DD38",
    category: getCategory("RAL 1016").cat,
    categoryFa: getCategory("RAL 1016").catFa,
    isPopular: false
  },
  {
    code: "RAL 1017",
    nameEn: "Saffron yellow",
    nameFa: "Saffron yellow",
    hex: "#F6A950",
    category: getCategory("RAL 1017").cat,
    categoryFa: getCategory("RAL 1017").catFa,
    isPopular: false
  },
  {
    code: "RAL 1018",
    nameEn: "Zinc yellow",
    nameFa: "\u0632\u0631\u062f \u0631\u0648\u06cc (\u0632\u06cc\u0646\u06a9)",
    hex: "#FACA30",
    category: getCategory("RAL 1018").cat,
    categoryFa: getCategory("RAL 1018").catFa,
    isPopular: false
  },
  {
    code: "RAL 1019",
    nameEn: "Grey beige",
    nameFa: "Grey beige",
    hex: "#A48F7A",
    category: getCategory("RAL 1019").cat,
    categoryFa: getCategory("RAL 1019").catFa,
    isPopular: false
  },
  {
    code: "RAL 1020",
    nameEn: "Olive yellow",
    nameFa: "Olive yellow",
    hex: "#A08F65",
    category: getCategory("RAL 1020").cat,
    categoryFa: getCategory("RAL 1020").catFa,
    isPopular: false
  },
  {
    code: "RAL 1021",
    nameEn: "Colza yellow",
    nameFa: "\u0632\u0631\u062f \u06a9\u0627\u062a\u0631\u067e\u06cc\u0644\u0627\u0631 (\u06a9\u0644\u0632\u0627)",
    hex: "#F6B600",
    category: getCategory("RAL 1021").cat,
    categoryFa: getCategory("RAL 1021").catFa,
    isPopular: true
  },
  {
    code: "RAL 1023",
    nameEn: "Traffic yellow",
    nameFa: "Traffic yellow",
    hex: "#F7B500",
    category: getCategory("RAL 1023").cat,
    categoryFa: getCategory("RAL 1023").catFa,
    isPopular: false
  },
  {
    code: "RAL 1024",
    nameEn: "Ochre yellow",
    nameFa: "Ochre yellow",
    hex: "#BA8F4C",
    category: getCategory("RAL 1024").cat,
    categoryFa: getCategory("RAL 1024").catFa,
    isPopular: false
  },
  {
    code: "RAL 1026",
    nameEn: "Luminous yellow",
    nameFa: "Luminous yellow",
    hex: "#FFFF00",
    category: getCategory("RAL 1026").cat,
    categoryFa: getCategory("RAL 1026").catFa,
    isPopular: false
  },
  {
    code: "RAL 1027",
    nameEn: "Curry",
    nameFa: "\u0632\u0631\u062f \u06a9\u0627\u0631\u06cc",
    hex: "#A77F0E",
    category: getCategory("RAL 1027").cat,
    categoryFa: getCategory("RAL 1027").catFa,
    isPopular: false
  },
  {
    code: "RAL 1028",
    nameEn: "Melon yellow",
    nameFa: "Melon yellow",
    hex: "#FF9B00",
    category: getCategory("RAL 1028").cat,
    categoryFa: getCategory("RAL 1028").catFa,
    isPopular: false
  },
  {
    code: "RAL 1032",
    nameEn: "Broom yellow",
    nameFa: "\u0632\u0631\u062f \u0644\u06cc\u0645\u0648\u06cc\u06cc \u0631\u0648\u0634\u0646",
    hex: "#E2A300",
    category: getCategory("RAL 1032").cat,
    categoryFa: getCategory("RAL 1032").catFa,
    isPopular: false
  },
  {
    code: "RAL 1033",
    nameEn: "Dahlia yellow",
    nameFa: "Dahlia yellow",
    hex: "#F99A1C",
    category: getCategory("RAL 1033").cat,
    categoryFa: getCategory("RAL 1033").catFa,
    isPopular: false
  },
  {
    code: "RAL 1034",
    nameEn: "Pastel yellow",
    nameFa: "Pastel yellow",
    hex: "#EB9C52",
    category: getCategory("RAL 1034").cat,
    categoryFa: getCategory("RAL 1034").catFa,
    isPopular: false
  },
  {
    code: "RAL 1035",
    nameEn: "Pearl beige",
    nameFa: "Pearl beige",
    hex: "#908370",
    category: getCategory("RAL 1035").cat,
    categoryFa: getCategory("RAL 1035").catFa,
    isPopular: false
  },
  {
    code: "RAL 1036",
    nameEn: "Pearl gold",
    nameFa: "Pearl gold",
    hex: "#80643F",
    category: getCategory("RAL 1036").cat,
    categoryFa: getCategory("RAL 1036").catFa,
    isPopular: false
  },
  {
    code: "RAL 1037",
    nameEn: "Sun yellow",
    nameFa: "Sun yellow",
    hex: "#F09200",
    category: getCategory("RAL 1037").cat,
    categoryFa: getCategory("RAL 1037").catFa,
    isPopular: false
  },
  {
    code: "RAL 2000",
    nameEn: "Yellow orange",
    nameFa: "Yellow orange",
    hex: "#DD7907",
    category: getCategory("RAL 2000").cat,
    categoryFa: getCategory("RAL 2000").catFa,
    isPopular: false
  },
  {
    code: "RAL 2001",
    nameEn: "Red orange",
    nameFa: "Red orange",
    hex: "#BE4E20",
    category: getCategory("RAL 2001").cat,
    categoryFa: getCategory("RAL 2001").catFa,
    isPopular: false
  },
  {
    code: "RAL 2002",
    nameEn: "Vermilion",
    nameFa: "Vermilion",
    hex: "#C63927",
    category: getCategory("RAL 2002").cat,
    categoryFa: getCategory("RAL 2002").catFa,
    isPopular: false
  },
  {
    code: "RAL 2003",
    nameEn: "Pastel orange",
    nameFa: "Pastel orange",
    hex: "#FA842B",
    category: getCategory("RAL 2003").cat,
    categoryFa: getCategory("RAL 2003").catFa,
    isPopular: false
  },
  {
    code: "RAL 2004",
    nameEn: "Pure orange",
    nameFa: "\u0646\u0627\u0631\u0646\u062c\u06cc \u062e\u0627\u0644\u0635 \u06a9\u067e\u0633\u0648\u0644\u06cc",
    hex: "#E75B12",
    category: getCategory("RAL 2004").cat,
    categoryFa: getCategory("RAL 2004").catFa,
    isPopular: true
  },
  {
    code: "RAL 2005",
    nameEn: "Luminous orange",
    nameFa: "Luminous orange",
    hex: "#FF2300",
    category: getCategory("RAL 2005").cat,
    categoryFa: getCategory("RAL 2005").catFa,
    isPopular: false
  },
  {
    code: "RAL 2007",
    nameEn: "Luminous bright orange",
    nameFa: "Luminous bright orange",
    hex: "#FFA421",
    category: getCategory("RAL 2007").cat,
    categoryFa: getCategory("RAL 2007").catFa,
    isPopular: false
  },
  {
    code: "RAL 2008",
    nameEn: "Bright red orange",
    nameFa: "Bright red orange",
    hex: "#F3752C",
    category: getCategory("RAL 2008").cat,
    categoryFa: getCategory("RAL 2008").catFa,
    isPopular: false
  },
  {
    code: "RAL 2009",
    nameEn: "Traffic orange",
    nameFa: "Traffic orange",
    hex: "#E15501",
    category: getCategory("RAL 2009").cat,
    categoryFa: getCategory("RAL 2009").catFa,
    isPopular: false
  },
  {
    code: "RAL 2010",
    nameEn: "Signal orange",
    nameFa: "\u0646\u0627\u0631\u0646\u062c\u06cc \u0633\u06cc\u06af\u0646\u0627\u0644 \u0627\u06cc\u0645\u0646\u06cc",
    hex: "#D4652F",
    category: getCategory("RAL 2010").cat,
    categoryFa: getCategory("RAL 2010").catFa,
    isPopular: false
  },
  {
    code: "RAL 2011",
    nameEn: "Deep orange",
    nameFa: "Deep orange",
    hex: "#EC7C25",
    category: getCategory("RAL 2011").cat,
    categoryFa: getCategory("RAL 2011").catFa,
    isPopular: false
  },
  {
    code: "RAL 2012",
    nameEn: "Salmon orange",
    nameFa: "Salmon orange",
    hex: "#DB6A50",
    category: getCategory("RAL 2012").cat,
    categoryFa: getCategory("RAL 2012").catFa,
    isPopular: false
  },
  {
    code: "RAL 2013",
    nameEn: "Pearl orange",
    nameFa: "Pearl orange",
    hex: "#954527",
    category: getCategory("RAL 2013").cat,
    categoryFa: getCategory("RAL 2013").catFa,
    isPopular: false
  },
  {
    code: "RAL 2017",
    nameEn: "RAL orange",
    nameFa: "RAL orange",
    hex: "",
    category: getCategory("RAL 2017").cat,
    categoryFa: getCategory("RAL 2017").catFa,
    isPopular: false
  },
  {
    code: "RAL 3000",
    nameEn: "Flame red",
    nameFa: "\u0642\u0631\u0645\u0632 \u0622\u062a\u0634\u0646\u0634\u0627\u0646\u06cc (\u0634\u0639\u0644\u0647)",
    hex: "#AB2524",
    category: getCategory("RAL 3000").cat,
    categoryFa: getCategory("RAL 3000").catFa,
    isPopular: true
  },
  {
    code: "RAL 3001",
    nameEn: "Signal red",
    nameFa: "\u0642\u0631\u0645\u0632 \u0633\u06cc\u06af\u0646\u0627\u0644 \u062e\u0637\u0631",
    hex: "#A02128",
    category: getCategory("RAL 3001").cat,
    categoryFa: getCategory("RAL 3001").catFa,
    isPopular: false
  },
  {
    code: "RAL 3002",
    nameEn: "Carmine red",
    nameFa: "\u0642\u0631\u0645\u0632 \u0644\u0627\u06a9\u06cc",
    hex: "#A1232B",
    category: getCategory("RAL 3002").cat,
    categoryFa: getCategory("RAL 3002").catFa,
    isPopular: false
  },
  {
    code: "RAL 3003",
    nameEn: "Ruby red",
    nameFa: "\u0642\u0631\u0645\u0632 \u06cc\u0627\u0642\u0648\u062a\u06cc",
    hex: "#8D1D2C",
    category: getCategory("RAL 3003").cat,
    categoryFa: getCategory("RAL 3003").catFa,
    isPopular: false
  },
  {
    code: "RAL 3004",
    nameEn: "Purple red",
    nameFa: "Purple red",
    hex: "#701F29",
    category: getCategory("RAL 3004").cat,
    categoryFa: getCategory("RAL 3004").catFa,
    isPopular: false
  },
  {
    code: "RAL 3005",
    nameEn: "Wine red",
    nameFa: "Wine red",
    hex: "#5E2028",
    category: getCategory("RAL 3005").cat,
    categoryFa: getCategory("RAL 3005").catFa,
    isPopular: false
  },
  {
    code: "RAL 3007",
    nameEn: "Black red",
    nameFa: "Black red",
    hex: "#402225",
    category: getCategory("RAL 3007").cat,
    categoryFa: getCategory("RAL 3007").catFa,
    isPopular: false
  },
  {
    code: "RAL 3009",
    nameEn: "Oxide red",
    nameFa: "Oxide red",
    hex: "#703731",
    category: getCategory("RAL 3009").cat,
    categoryFa: getCategory("RAL 3009").catFa,
    isPopular: false
  },
  {
    code: "RAL 3011",
    nameEn: "Brown red",
    nameFa: "Brown red",
    hex: "#7E292C",
    category: getCategory("RAL 3011").cat,
    categoryFa: getCategory("RAL 3011").catFa,
    isPopular: false
  },
  {
    code: "RAL 3012",
    nameEn: "Beige red",
    nameFa: "Beige red",
    hex: "#CB8D73",
    category: getCategory("RAL 3012").cat,
    categoryFa: getCategory("RAL 3012").catFa,
    isPopular: false
  },
  {
    code: "RAL 3013",
    nameEn: "Tomato red",
    nameFa: "Tomato red",
    hex: "#9C322E",
    category: getCategory("RAL 3013").cat,
    categoryFa: getCategory("RAL 3013").catFa,
    isPopular: false
  },
  {
    code: "RAL 3014",
    nameEn: "Antique pink",
    nameFa: "Antique pink",
    hex: "#D47479",
    category: getCategory("RAL 3014").cat,
    categoryFa: getCategory("RAL 3014").catFa,
    isPopular: false
  },
  {
    code: "RAL 3015",
    nameEn: "Light pink",
    nameFa: "Light pink",
    hex: "#E1A6AD",
    category: getCategory("RAL 3015").cat,
    categoryFa: getCategory("RAL 3015").catFa,
    isPopular: false
  },
  {
    code: "RAL 3016",
    nameEn: "Coral red",
    nameFa: "Coral red",
    hex: "#AC4034",
    category: getCategory("RAL 3016").cat,
    categoryFa: getCategory("RAL 3016").catFa,
    isPopular: false
  },
  {
    code: "RAL 3017",
    nameEn: "Rose",
    nameFa: "Rose",
    hex: "#D3545F",
    category: getCategory("RAL 3017").cat,
    categoryFa: getCategory("RAL 3017").catFa,
    isPopular: false
  },
  {
    code: "RAL 3018",
    nameEn: "Strawberry red",
    nameFa: "Strawberry red",
    hex: "#D14152",
    category: getCategory("RAL 3018").cat,
    categoryFa: getCategory("RAL 3018").catFa,
    isPopular: false
  },
  {
    code: "RAL 3020",
    nameEn: "Traffic red",
    nameFa: "Traffic red",
    hex: "#C1121C",
    category: getCategory("RAL 3020").cat,
    categoryFa: getCategory("RAL 3020").catFa,
    isPopular: false
  },
  {
    code: "RAL 3022",
    nameEn: "Salmon pink",
    nameFa: "Salmon pink",
    hex: "#D56D56",
    category: getCategory("RAL 3022").cat,
    categoryFa: getCategory("RAL 3022").catFa,
    isPopular: false
  },
  {
    code: "RAL 3024",
    nameEn: "Luminous red",
    nameFa: "Luminous red",
    hex: "#F70000",
    category: getCategory("RAL 3024").cat,
    categoryFa: getCategory("RAL 3024").catFa,
    isPopular: false
  },
  {
    code: "RAL 3026",
    nameEn: "Luminous bright red",
    nameFa: "Luminous bright red",
    hex: "#FF0000",
    category: getCategory("RAL 3026").cat,
    categoryFa: getCategory("RAL 3026").catFa,
    isPopular: false
  },
  {
    code: "RAL 3027",
    nameEn: "Raspberry red",
    nameFa: "Raspberry red",
    hex: "#B42041",
    category: getCategory("RAL 3027").cat,
    categoryFa: getCategory("RAL 3027").catFa,
    isPopular: false
  },
  {
    code: "RAL 3028",
    nameEn: "Pure red",
    nameFa: "Pure red",
    hex: "#E72512",
    category: getCategory("RAL 3028").cat,
    categoryFa: getCategory("RAL 3028").catFa,
    isPopular: false
  },
  {
    code: "RAL 3031",
    nameEn: "Orient red",
    nameFa: "Orient red",
    hex: "#AC323B",
    category: getCategory("RAL 3031").cat,
    categoryFa: getCategory("RAL 3031").catFa,
    isPopular: false
  },
  {
    code: "RAL 3032",
    nameEn: "Pearl ruby red",
    nameFa: "Pearl ruby red",
    hex: "#711521",
    category: getCategory("RAL 3032").cat,
    categoryFa: getCategory("RAL 3032").catFa,
    isPopular: false
  },
  {
    code: "RAL 3033",
    nameEn: "Pearl pink",
    nameFa: "Pearl pink",
    hex: "#B24C43",
    category: getCategory("RAL 3033").cat,
    categoryFa: getCategory("RAL 3033").catFa,
    isPopular: false
  },
  {
    code: "RAL 4001",
    nameEn: "Red lilac",
    nameFa: "Red lilac",
    hex: "#8A5A83",
    category: getCategory("RAL 4001").cat,
    categoryFa: getCategory("RAL 4001").catFa,
    isPopular: false
  },
  {
    code: "RAL 4002",
    nameEn: "Red violet",
    nameFa: "Red violet",
    hex: "#933D50",
    category: getCategory("RAL 4002").cat,
    categoryFa: getCategory("RAL 4002").catFa,
    isPopular: false
  },
  {
    code: "RAL 4003",
    nameEn: "Heather violet",
    nameFa: "Heather violet",
    hex: "#D15B8F",
    category: getCategory("RAL 4003").cat,
    categoryFa: getCategory("RAL 4003").catFa,
    isPopular: false
  },
  {
    code: "RAL 4004",
    nameEn: "Claret violet",
    nameFa: "Claret violet",
    hex: "#691639",
    category: getCategory("RAL 4004").cat,
    categoryFa: getCategory("RAL 4004").catFa,
    isPopular: false
  },
  {
    code: "RAL 4005",
    nameEn: "Blue lilac",
    nameFa: "Blue lilac",
    hex: "#83639D",
    category: getCategory("RAL 4005").cat,
    categoryFa: getCategory("RAL 4005").catFa,
    isPopular: false
  },
  {
    code: "RAL 4006",
    nameEn: "Traffic purple",
    nameFa: "Traffic purple",
    hex: "#992572",
    category: getCategory("RAL 4006").cat,
    categoryFa: getCategory("RAL 4006").catFa,
    isPopular: false
  },
  {
    code: "RAL 4007",
    nameEn: "Purple violet",
    nameFa: "Purple violet",
    hex: "#4A203B",
    category: getCategory("RAL 4007").cat,
    categoryFa: getCategory("RAL 4007").catFa,
    isPopular: false
  },
  {
    code: "RAL 4008",
    nameEn: "Signal violet",
    nameFa: "Signal violet",
    hex: "#904684",
    category: getCategory("RAL 4008").cat,
    categoryFa: getCategory("RAL 4008").catFa,
    isPopular: false
  },
  {
    code: "RAL 4009",
    nameEn: "Pastel violet",
    nameFa: "Pastel violet",
    hex: "#A38995",
    category: getCategory("RAL 4009").cat,
    categoryFa: getCategory("RAL 4009").catFa,
    isPopular: false
  },
  {
    code: "RAL 4010",
    nameEn: "Telemagenta",
    nameFa: "Telemagenta",
    hex: "#C63678",
    category: getCategory("RAL 4010").cat,
    categoryFa: getCategory("RAL 4010").catFa,
    isPopular: false
  },
  {
    code: "RAL 4011",
    nameEn: "Pearl violet",
    nameFa: "Pearl violet",
    hex: "#8773A1",
    category: getCategory("RAL 4011").cat,
    categoryFa: getCategory("RAL 4011").catFa,
    isPopular: false
  },
  {
    code: "RAL 4012",
    nameEn: "Pearl blackberry",
    nameFa: "Pearl blackberry",
    hex: "#6B6880",
    category: getCategory("RAL 4012").cat,
    categoryFa: getCategory("RAL 4012").catFa,
    isPopular: false
  },
  {
    code: "RAL 5000",
    nameEn: "Violet blue",
    nameFa: "Violet blue",
    hex: "#384C70",
    category: getCategory("RAL 5000").cat,
    categoryFa: getCategory("RAL 5000").catFa,
    isPopular: false
  },
  {
    code: "RAL 5001",
    nameEn: "Green blue",
    nameFa: "Green blue",
    hex: "#1F4764",
    category: getCategory("RAL 5001").cat,
    categoryFa: getCategory("RAL 5001").catFa,
    isPopular: false
  },
  {
    code: "RAL 5002",
    nameEn: "Ultramarine blue",
    nameFa: "\u0622\u0628\u06cc \u06a9\u0627\u0631\u0628\u0646\u06cc (\u0627\u0648\u0644\u062a\u0631\u0627\u0645\u0627\u0631\u06cc\u0646)",
    hex: "#2B2C7C",
    category: getCategory("RAL 5002").cat,
    categoryFa: getCategory("RAL 5002").catFa,
    isPopular: true
  },
  {
    code: "RAL 5003",
    nameEn: "Sapphire blue",
    nameFa: "Sapphire blue",
    hex: "#2A3756",
    category: getCategory("RAL 5003").cat,
    categoryFa: getCategory("RAL 5003").catFa,
    isPopular: false
  },
  {
    code: "RAL 5004",
    nameEn: "Black blue",
    nameFa: "Black blue",
    hex: "#1D1F2A",
    category: getCategory("RAL 5004").cat,
    categoryFa: getCategory("RAL 5004").catFa,
    isPopular: false
  },
  {
    code: "RAL 5005",
    nameEn: "Signal blue",
    nameFa: "\u0622\u0628\u06cc \u0633\u06cc\u06af\u0646\u0627\u0644 \u0627\u0633\u062a\u0627\u0646\u062f\u0627\u0631\u062f",
    hex: "#154889",
    category: getCategory("RAL 5005").cat,
    categoryFa: getCategory("RAL 5005").catFa,
    isPopular: false
  },
  {
    code: "RAL 5007",
    nameEn: "Brilliant blue",
    nameFa: "Brilliant blue",
    hex: "#41678D",
    category: getCategory("RAL 5007").cat,
    categoryFa: getCategory("RAL 5007").catFa,
    isPopular: false
  },
  {
    code: "RAL 5008",
    nameEn: "Grey blue",
    nameFa: "Grey blue",
    hex: "#313C48",
    category: getCategory("RAL 5008").cat,
    categoryFa: getCategory("RAL 5008").catFa,
    isPopular: false
  },
  {
    code: "RAL 5009",
    nameEn: "Azure blue",
    nameFa: "Azure blue",
    hex: "#2E5978",
    category: getCategory("RAL 5009").cat,
    categoryFa: getCategory("RAL 5009").catFa,
    isPopular: false
  },
  {
    code: "RAL 5010",
    nameEn: "Gentian blue",
    nameFa: "Gentian blue",
    hex: "#13447C",
    category: getCategory("RAL 5010").cat,
    categoryFa: getCategory("RAL 5010").catFa,
    isPopular: false
  },
  {
    code: "RAL 5011",
    nameEn: "Steel blue",
    nameFa: "Steel blue",
    hex: "#232C3F",
    category: getCategory("RAL 5011").cat,
    categoryFa: getCategory("RAL 5011").catFa,
    isPopular: false
  },
  {
    code: "RAL 5012",
    nameEn: "Light blue",
    nameFa: "Light blue",
    hex: "#3481B8",
    category: getCategory("RAL 5012").cat,
    categoryFa: getCategory("RAL 5012").catFa,
    isPopular: false
  },
  {
    code: "RAL 5013",
    nameEn: "Cobalt blue",
    nameFa: "Cobalt blue",
    hex: "#232D53",
    category: getCategory("RAL 5013").cat,
    categoryFa: getCategory("RAL 5013").catFa,
    isPopular: false
  },
  {
    code: "RAL 5014",
    nameEn: "Pigeon blue",
    nameFa: "Pigeon blue",
    hex: "#6C7C98",
    category: getCategory("RAL 5014").cat,
    categoryFa: getCategory("RAL 5014").catFa,
    isPopular: false
  },
  {
    code: "RAL 5015",
    nameEn: "Sky blue",
    nameFa: "\u0622\u0628\u06cc \u0622\u0633\u0645\u0627\u0646\u06cc \u06af\u0627\u0632\u06cc",
    hex: "#2874B2",
    category: getCategory("RAL 5015").cat,
    categoryFa: getCategory("RAL 5015").catFa,
    isPopular: true
  },
  {
    code: "RAL 5017",
    nameEn: "Traffic blue",
    nameFa: "Traffic blue",
    hex: "#0E518D",
    category: getCategory("RAL 5017").cat,
    categoryFa: getCategory("RAL 5017").catFa,
    isPopular: false
  },
  {
    code: "RAL 5018",
    nameEn: "Turquoise blue",
    nameFa: "Turquoise blue",
    hex: "#21888F",
    category: getCategory("RAL 5018").cat,
    categoryFa: getCategory("RAL 5018").catFa,
    isPopular: false
  },
  {
    code: "RAL 5019",
    nameEn: "Capri blue",
    nameFa: "Capri blue",
    hex: "#1A5784",
    category: getCategory("RAL 5019").cat,
    categoryFa: getCategory("RAL 5019").catFa,
    isPopular: false
  },
  {
    code: "RAL 5020",
    nameEn: "Ocean blue",
    nameFa: "Ocean blue",
    hex: "#0B4151",
    category: getCategory("RAL 5020").cat,
    categoryFa: getCategory("RAL 5020").catFa,
    isPopular: false
  },
  {
    code: "RAL 5021",
    nameEn: "Water blue",
    nameFa: "Water blue",
    hex: "#07737A",
    category: getCategory("RAL 5021").cat,
    categoryFa: getCategory("RAL 5021").catFa,
    isPopular: false
  },
  {
    code: "RAL 5022",
    nameEn: "Night blue",
    nameFa: "Night blue",
    hex: "#2F2A5A",
    category: getCategory("RAL 5022").cat,
    categoryFa: getCategory("RAL 5022").catFa,
    isPopular: false
  },
  {
    code: "RAL 5023",
    nameEn: "Distant blue",
    nameFa: "Distant blue",
    hex: "#4D668E",
    category: getCategory("RAL 5023").cat,
    categoryFa: getCategory("RAL 5023").catFa,
    isPopular: false
  },
  {
    code: "RAL 5024",
    nameEn: "Pastel blue",
    nameFa: "Pastel blue",
    hex: "#6A93B0",
    category: getCategory("RAL 5024").cat,
    categoryFa: getCategory("RAL 5024").catFa,
    isPopular: false
  },
  {
    code: "RAL 5025",
    nameEn: "Pearl Gentian blue",
    nameFa: "Pearl Gentian blue",
    hex: "#296478",
    category: getCategory("RAL 5025").cat,
    categoryFa: getCategory("RAL 5025").catFa,
    isPopular: false
  },
  {
    code: "RAL 5026",
    nameEn: "Pearl night blue",
    nameFa: "Pearl night blue",
    hex: "#102C54",
    category: getCategory("RAL 5026").cat,
    categoryFa: getCategory("RAL 5026").catFa,
    isPopular: false
  },
  {
    code: "RAL 6000",
    nameEn: "Patina green",
    nameFa: "Patina green",
    hex: "#327662",
    category: getCategory("RAL 6000").cat,
    categoryFa: getCategory("RAL 6000").catFa,
    isPopular: false
  },
  {
    code: "RAL 6001",
    nameEn: "Emerald green",
    nameFa: "Emerald green",
    hex: "#28713E",
    category: getCategory("RAL 6001").cat,
    categoryFa: getCategory("RAL 6001").catFa,
    isPopular: false
  },
  {
    code: "RAL 6002",
    nameEn: "Leaf green",
    nameFa: "Leaf green",
    hex: "#276235",
    category: getCategory("RAL 6002").cat,
    categoryFa: getCategory("RAL 6002").catFa,
    isPopular: false
  },
  {
    code: "RAL 6003",
    nameEn: "Olive green",
    nameFa: "Olive green",
    hex: "#4B573E",
    category: getCategory("RAL 6003").cat,
    categoryFa: getCategory("RAL 6003").catFa,
    isPopular: false
  },
  {
    code: "RAL 6004",
    nameEn: "Blue green",
    nameFa: "Blue green",
    hex: "#0E4243",
    category: getCategory("RAL 6004").cat,
    categoryFa: getCategory("RAL 6004").catFa,
    isPopular: false
  },
  {
    code: "RAL 6005",
    nameEn: "Moss green",
    nameFa: "\u0633\u0628\u0632 \u062e\u0632\u0647 \u0627\u06cc \u0635\u0646\u0639\u062a\u06cc",
    hex: "#0F4336",
    category: getCategory("RAL 6005").cat,
    categoryFa: getCategory("RAL 6005").catFa,
    isPopular: true
  },
  {
    code: "RAL 6006",
    nameEn: "Grey olive",
    nameFa: "Grey olive",
    hex: "#40433B",
    category: getCategory("RAL 6006").cat,
    categoryFa: getCategory("RAL 6006").catFa,
    isPopular: false
  },
  {
    code: "RAL 6007",
    nameEn: "Bottle green",
    nameFa: "Bottle green",
    hex: "#283424",
    category: getCategory("RAL 6007").cat,
    categoryFa: getCategory("RAL 6007").catFa,
    isPopular: false
  },
  {
    code: "RAL 6008",
    nameEn: "Brown green",
    nameFa: "Brown green",
    hex: "#35382E",
    category: getCategory("RAL 6008").cat,
    categoryFa: getCategory("RAL 6008").catFa,
    isPopular: false
  },
  {
    code: "RAL 6009",
    nameEn: "Fir green",
    nameFa: "Fir green",
    hex: "#26392F",
    category: getCategory("RAL 6009").cat,
    categoryFa: getCategory("RAL 6009").catFa,
    isPopular: false
  },
  {
    code: "RAL 6010",
    nameEn: "Grass green",
    nameFa: "Grass green",
    hex: "#3E753B",
    category: getCategory("RAL 6010").cat,
    categoryFa: getCategory("RAL 6010").catFa,
    isPopular: false
  },
  {
    code: "RAL 6011",
    nameEn: "Reseda green",
    nameFa: "Reseda green",
    hex: "#68825B",
    category: getCategory("RAL 6011").cat,
    categoryFa: getCategory("RAL 6011").catFa,
    isPopular: false
  },
  {
    code: "RAL 6012",
    nameEn: "Black green",
    nameFa: "Black green",
    hex: "#31403D",
    category: getCategory("RAL 6012").cat,
    categoryFa: getCategory("RAL 6012").catFa,
    isPopular: false
  },
  {
    code: "RAL 6013",
    nameEn: "Reed green",
    nameFa: "Reed green",
    hex: "#797C5A",
    category: getCategory("RAL 6013").cat,
    categoryFa: getCategory("RAL 6013").catFa,
    isPopular: false
  },
  {
    code: "RAL 6014",
    nameEn: "Yellow olive",
    nameFa: "Yellow olive",
    hex: "#444337",
    category: getCategory("RAL 6014").cat,
    categoryFa: getCategory("RAL 6014").catFa,
    isPopular: false
  },
  {
    code: "RAL 6015",
    nameEn: "Black olive",
    nameFa: "Black olive",
    hex: "#3D403A",
    category: getCategory("RAL 6015").cat,
    categoryFa: getCategory("RAL 6015").catFa,
    isPopular: false
  },
  {
    code: "RAL 6016",
    nameEn: "Turquoise green",
    nameFa: "Turquoise green",
    hex: "#026A52",
    category: getCategory("RAL 6016").cat,
    categoryFa: getCategory("RAL 6016").catFa,
    isPopular: false
  },
  {
    code: "RAL 6017",
    nameEn: "May green",
    nameFa: "May green",
    hex: "#468641",
    category: getCategory("RAL 6017").cat,
    categoryFa: getCategory("RAL 6017").catFa,
    isPopular: false
  },
  {
    code: "RAL 6018",
    nameEn: "Yellow green",
    nameFa: "\u0633\u0628\u0632 \u0645\u063a\u0632\u067e\u0633\u062a\u0647\u200c\u0627\u06cc \u0635\u0646\u0639\u062a\u06cc",
    hex: "#48A43F",
    category: getCategory("RAL 6018").cat,
    categoryFa: getCategory("RAL 6018").catFa,
    isPopular: true
  },
  {
    code: "RAL 6019",
    nameEn: "Pastel green",
    nameFa: "Pastel green",
    hex: "#B7D9B1",
    category: getCategory("RAL 6019").cat,
    categoryFa: getCategory("RAL 6019").catFa,
    isPopular: false
  },
  {
    code: "RAL 6020",
    nameEn: "Chrome green",
    nameFa: "Chrome green",
    hex: "#354733",
    category: getCategory("RAL 6020").cat,
    categoryFa: getCategory("RAL 6020").catFa,
    isPopular: false
  },
  {
    code: "RAL 6021",
    nameEn: "Pale green",
    nameFa: "Pale green",
    hex: "#86A47C",
    category: getCategory("RAL 6021").cat,
    categoryFa: getCategory("RAL 6021").catFa,
    isPopular: false
  },
  {
    code: "RAL 6022",
    nameEn: "Olive-drab/brown olive",
    nameFa: "Olive-drab/brown olive",
    hex: "#3E3C32",
    category: getCategory("RAL 6022").cat,
    categoryFa: getCategory("RAL 6022").catFa,
    isPopular: false
  },
  {
    code: "RAL 6024",
    nameEn: "Traffic green",
    nameFa: "Traffic green",
    hex: "#008754",
    category: getCategory("RAL 6024").cat,
    categoryFa: getCategory("RAL 6024").catFa,
    isPopular: false
  },
  {
    code: "RAL 6025",
    nameEn: "Fern green",
    nameFa: "Fern green",
    hex: "#53753C",
    category: getCategory("RAL 6025").cat,
    categoryFa: getCategory("RAL 6025").catFa,
    isPopular: false
  },
  {
    code: "RAL 6026",
    nameEn: "Opal green",
    nameFa: "Opal green",
    hex: "#005D52",
    category: getCategory("RAL 6026").cat,
    categoryFa: getCategory("RAL 6026").catFa,
    isPopular: false
  },
  {
    code: "RAL 6027",
    nameEn: "Light green",
    nameFa: "Light green",
    hex: "#81C0BB",
    category: getCategory("RAL 6027").cat,
    categoryFa: getCategory("RAL 6027").catFa,
    isPopular: false
  },
  {
    code: "RAL 6028",
    nameEn: "Pine green",
    nameFa: "Pine green",
    hex: "#2D5546",
    category: getCategory("RAL 6028").cat,
    categoryFa: getCategory("RAL 6028").catFa,
    isPopular: false
  },
  {
    code: "RAL 6029",
    nameEn: "Mint green",
    nameFa: "Mint green",
    hex: "#007243",
    category: getCategory("RAL 6029").cat,
    categoryFa: getCategory("RAL 6029").catFa,
    isPopular: false
  },
  {
    code: "RAL 6032",
    nameEn: "Signal green",
    nameFa: "\u0633\u0628\u0632 \u0633\u06cc\u06af\u0646\u0627\u0644 \u0627\u06cc\u0645\u0646\u06cc",
    hex: "#0F8558",
    category: getCategory("RAL 6032").cat,
    categoryFa: getCategory("RAL 6032").catFa,
    isPopular: false
  },
  {
    code: "RAL 6033",
    nameEn: "Mint turquoise",
    nameFa: "Mint turquoise",
    hex: "#478A84",
    category: getCategory("RAL 6033").cat,
    categoryFa: getCategory("RAL 6033").catFa,
    isPopular: false
  },
  {
    code: "RAL 6034",
    nameEn: "Pastel turquoise",
    nameFa: "Pastel turquoise",
    hex: "#7FB0B2",
    category: getCategory("RAL 6034").cat,
    categoryFa: getCategory("RAL 6034").catFa,
    isPopular: false
  },
  {
    code: "RAL 6035",
    nameEn: "Pearl green",
    nameFa: "Pearl green",
    hex: "#1B542C",
    category: getCategory("RAL 6035").cat,
    categoryFa: getCategory("RAL 6035").catFa,
    isPopular: false
  },
  {
    code: "RAL 6036",
    nameEn: "Pearl opal green",
    nameFa: "Pearl opal green",
    hex: "#005D4C",
    category: getCategory("RAL 6036").cat,
    categoryFa: getCategory("RAL 6036").catFa,
    isPopular: false
  },
  {
    code: "RAL 6037",
    nameEn: "Pure green",
    nameFa: "Pure green",
    hex: "#25E712",
    category: getCategory("RAL 6037").cat,
    categoryFa: getCategory("RAL 6037").catFa,
    isPopular: false
  },
  {
    code: "RAL 6038",
    nameEn: "Luminous green",
    nameFa: "Luminous green",
    hex: "#00F700",
    category: getCategory("RAL 6038").cat,
    categoryFa: getCategory("RAL 6038").catFa,
    isPopular: false
  },
  {
    code: "RAL 7000",
    nameEn: "Squirrel grey",
    nameFa: "Squirrel grey",
    hex: "#7E8B92",
    category: getCategory("RAL 7000").cat,
    categoryFa: getCategory("RAL 7000").catFa,
    isPopular: false
  },
  {
    code: "RAL 7001",
    nameEn: "Silver grey",
    nameFa: "Silver grey",
    hex: "#8F999F",
    category: getCategory("RAL 7001").cat,
    categoryFa: getCategory("RAL 7001").catFa,
    isPopular: false
  },
  {
    code: "RAL 7002",
    nameEn: "Olive grey",
    nameFa: "Olive grey",
    hex: "#817F68",
    category: getCategory("RAL 7002").cat,
    categoryFa: getCategory("RAL 7002").catFa,
    isPopular: false
  },
  {
    code: "RAL 7003",
    nameEn: "Moss grey",
    nameFa: "Moss grey",
    hex: "#7A7B6D",
    category: getCategory("RAL 7003").cat,
    categoryFa: getCategory("RAL 7003").catFa,
    isPopular: false
  },
  {
    code: "RAL 7004",
    nameEn: "Signal grey",
    nameFa: "Signal grey",
    hex: "#9EA0A1",
    category: getCategory("RAL 7004").cat,
    categoryFa: getCategory("RAL 7004").catFa,
    isPopular: false
  },
  {
    code: "RAL 7005",
    nameEn: "Mouse grey",
    nameFa: "Mouse grey",
    hex: "#6B716F",
    category: getCategory("RAL 7005").cat,
    categoryFa: getCategory("RAL 7005").catFa,
    isPopular: false
  },
  {
    code: "RAL 7006",
    nameEn: "Beige grey",
    nameFa: "Beige grey",
    hex: "#756F61",
    category: getCategory("RAL 7006").cat,
    categoryFa: getCategory("RAL 7006").catFa,
    isPopular: false
  },
  {
    code: "RAL 7008",
    nameEn: "Khaki grey",
    nameFa: "Khaki grey",
    hex: "#746643",
    category: getCategory("RAL 7008").cat,
    categoryFa: getCategory("RAL 7008").catFa,
    isPopular: false
  },
  {
    code: "RAL 7009",
    nameEn: "Green grey",
    nameFa: "Green grey",
    hex: "#5B6259",
    category: getCategory("RAL 7009").cat,
    categoryFa: getCategory("RAL 7009").catFa,
    isPopular: false
  },
  {
    code: "RAL 7010",
    nameEn: "Tarpaulin grey",
    nameFa: "Tarpaulin grey",
    hex: "#575D57",
    category: getCategory("RAL 7010").cat,
    categoryFa: getCategory("RAL 7010").catFa,
    isPopular: false
  },
  {
    code: "RAL 7011",
    nameEn: "Iron grey",
    nameFa: "Iron grey",
    hex: "#555D61",
    category: getCategory("RAL 7011").cat,
    categoryFa: getCategory("RAL 7011").catFa,
    isPopular: false
  },
  {
    code: "RAL 7012",
    nameEn: "Basalt grey",
    nameFa: "Basalt grey",
    hex: "#596163",
    category: getCategory("RAL 7012").cat,
    categoryFa: getCategory("RAL 7012").catFa,
    isPopular: false
  },
  {
    code: "RAL 7013",
    nameEn: "Brown grey",
    nameFa: "Brown grey",
    hex: "#555548",
    category: getCategory("RAL 7013").cat,
    categoryFa: getCategory("RAL 7013").catFa,
    isPopular: false
  },
  {
    code: "RAL 7015",
    nameEn: "Slate grey",
    nameFa: "Slate grey",
    hex: "#51565C",
    category: getCategory("RAL 7015").cat,
    categoryFa: getCategory("RAL 7015").catFa,
    isPopular: false
  },
  {
    code: "RAL 7016",
    nameEn: "Anthracite grey",
    nameFa: "\u062e\u0627\u06a9\u0633\u062a\u0631\u06cc \u0622\u0646\u062a\u0631\u0627\u0633\u06cc\u062a",
    hex: "#373F43",
    category: getCategory("RAL 7016").cat,
    categoryFa: getCategory("RAL 7016").catFa,
    isPopular: true
  },
  {
    code: "RAL 7021",
    nameEn: "Black grey",
    nameFa: "Black grey",
    hex: "#2E3234",
    category: getCategory("RAL 7021").cat,
    categoryFa: getCategory("RAL 7021").catFa,
    isPopular: false
  },
  {
    code: "RAL 7022",
    nameEn: "Umbra grey",
    nameFa: "Umbra grey",
    hex: "#4B4D46",
    category: getCategory("RAL 7022").cat,
    categoryFa: getCategory("RAL 7022").catFa,
    isPopular: false
  },
  {
    code: "RAL 7023",
    nameEn: "Concrete grey",
    nameFa: "Concrete grey",
    hex: "#818479",
    category: getCategory("RAL 7023").cat,
    categoryFa: getCategory("RAL 7023").catFa,
    isPopular: false
  },
  {
    code: "RAL 7024",
    nameEn: "Graphite grey",
    nameFa: "Graphite grey",
    hex: "#474A50",
    category: getCategory("RAL 7024").cat,
    categoryFa: getCategory("RAL 7024").catFa,
    isPopular: false
  },
  {
    code: "RAL 7026",
    nameEn: "Granite grey",
    nameFa: "Granite grey",
    hex: "#374447",
    category: getCategory("RAL 7026").cat,
    categoryFa: getCategory("RAL 7026").catFa,
    isPopular: false
  },
  {
    code: "RAL 7030",
    nameEn: "Stone grey",
    nameFa: "Stone grey",
    hex: "#939388",
    category: getCategory("RAL 7030").cat,
    categoryFa: getCategory("RAL 7030").catFa,
    isPopular: false
  },
  {
    code: "RAL 7031",
    nameEn: "Blue grey",
    nameFa: "Blue grey",
    hex: "#5D6970",
    category: getCategory("RAL 7031").cat,
    categoryFa: getCategory("RAL 7031").catFa,
    isPopular: false
  },
  {
    code: "RAL 7032",
    nameEn: "Pebble grey",
    nameFa: "Pebble grey",
    hex: "#B9B9A8",
    category: getCategory("RAL 7032").cat,
    categoryFa: getCategory("RAL 7032").catFa,
    isPopular: false
  },
  {
    code: "RAL 7033",
    nameEn: "Cement grey",
    nameFa: "Cement grey",
    hex: "#818979",
    category: getCategory("RAL 7033").cat,
    categoryFa: getCategory("RAL 7033").catFa,
    isPopular: false
  },
  {
    code: "RAL 7034",
    nameEn: "Yellow grey",
    nameFa: "Yellow grey",
    hex: "#939176",
    category: getCategory("RAL 7034").cat,
    categoryFa: getCategory("RAL 7034").catFa,
    isPopular: false
  },
  {
    code: "RAL 7035",
    nameEn: "Light grey",
    nameFa: "\u062e\u0627\u06a9\u0633\u062a\u0631\u06cc \u0631\u0648\u0634\u0646 \u0635\u0646\u0639\u062a\u06cc",
    hex: "#CBD0CC",
    category: getCategory("RAL 7035").cat,
    categoryFa: getCategory("RAL 7035").catFa,
    isPopular: true
  },
  {
    code: "RAL 7036",
    nameEn: "Platinum grey",
    nameFa: "Platinum grey",
    hex: "#9A9697",
    category: getCategory("RAL 7036").cat,
    categoryFa: getCategory("RAL 7036").catFa,
    isPopular: false
  },
  {
    code: "RAL 7037",
    nameEn: "Dusty grey",
    nameFa: "Dusty grey",
    hex: "#7C7F7E",
    category: getCategory("RAL 7037").cat,
    categoryFa: getCategory("RAL 7037").catFa,
    isPopular: false
  },
  {
    code: "RAL 7038",
    nameEn: "Agate grey",
    nameFa: "\u062e\u0627\u06a9\u0633\u062a\u0631\u06cc \u0639\u0642\u06cc\u0642\u06cc",
    hex: "#B4B8B0",
    category: getCategory("RAL 7038").cat,
    categoryFa: getCategory("RAL 7038").catFa,
    isPopular: false
  },
  {
    code: "RAL 7039",
    nameEn: "Quartz grey",
    nameFa: "Quartz grey",
    hex: "#6B695F",
    category: getCategory("RAL 7039").cat,
    categoryFa: getCategory("RAL 7039").catFa,
    isPopular: false
  },
  {
    code: "RAL 7040",
    nameEn: "Window grey",
    nameFa: "Window grey",
    hex: "#9DA3A6",
    category: getCategory("RAL 7040").cat,
    categoryFa: getCategory("RAL 7040").catFa,
    isPopular: false
  },
  {
    code: "RAL 7042",
    nameEn: "Traffic grey A",
    nameFa: "Traffic grey A",
    hex: "#8F9695",
    category: getCategory("RAL 7042").cat,
    categoryFa: getCategory("RAL 7042").catFa,
    isPopular: false
  },
  {
    code: "RAL 7043",
    nameEn: "Traffic grey B",
    nameFa: "Traffic grey B",
    hex: "#4E5451",
    category: getCategory("RAL 7043").cat,
    categoryFa: getCategory("RAL 7043").catFa,
    isPopular: false
  },
  {
    code: "RAL 7044",
    nameEn: "Silk grey",
    nameFa: "Silk grey",
    hex: "#BDBDB2",
    category: getCategory("RAL 7044").cat,
    categoryFa: getCategory("RAL 7044").catFa,
    isPopular: false
  },
  {
    code: "RAL 7045",
    nameEn: "Telegrey 1",
    nameFa: "Telegrey 1",
    hex: "#91969A",
    category: getCategory("RAL 7045").cat,
    categoryFa: getCategory("RAL 7045").catFa,
    isPopular: false
  },
  {
    code: "RAL 7046",
    nameEn: "Telegrey 2",
    nameFa: "Telegrey 2",
    hex: "#82898E",
    category: getCategory("RAL 7046").cat,
    categoryFa: getCategory("RAL 7046").catFa,
    isPopular: false
  },
  {
    code: "RAL 7047",
    nameEn: "Telegrey 4",
    nameFa: "Telegrey 4",
    hex: "#CFD0CF",
    category: getCategory("RAL 7047").cat,
    categoryFa: getCategory("RAL 7047").catFa,
    isPopular: false
  },
  {
    code: "RAL 7048",
    nameEn: "Pearl mouse grey",
    nameFa: "Pearl mouse grey",
    hex: "#888175",
    category: getCategory("RAL 7048").cat,
    categoryFa: getCategory("RAL 7048").catFa,
    isPopular: false
  },
  {
    code: "RAL 8000",
    nameEn: "Green brown",
    nameFa: "Green brown",
    hex: "#887142",
    category: getCategory("RAL 8000").cat,
    categoryFa: getCategory("RAL 8000").catFa,
    isPopular: false
  },
  {
    code: "RAL 8001",
    nameEn: "Ochre brown",
    nameFa: "Ochre brown",
    hex: "#9C6B30",
    category: getCategory("RAL 8001").cat,
    categoryFa: getCategory("RAL 8001").catFa,
    isPopular: false
  },
  {
    code: "RAL 8002",
    nameEn: "Signal brown",
    nameFa: "Signal brown",
    hex: "#7B5141",
    category: getCategory("RAL 8002").cat,
    categoryFa: getCategory("RAL 8002").catFa,
    isPopular: false
  },
  {
    code: "RAL 8003",
    nameEn: "Clay brown",
    nameFa: "Clay brown",
    hex: "#80542F",
    category: getCategory("RAL 8003").cat,
    categoryFa: getCategory("RAL 8003").catFa,
    isPopular: false
  },
  {
    code: "RAL 8004",
    nameEn: "Copper brown",
    nameFa: "Copper brown",
    hex: "#8F4E35",
    category: getCategory("RAL 8004").cat,
    categoryFa: getCategory("RAL 8004").catFa,
    isPopular: false
  },
  {
    code: "RAL 8007",
    nameEn: "Fawn brown",
    nameFa: "Fawn brown",
    hex: "#6F4A2F",
    category: getCategory("RAL 8007").cat,
    categoryFa: getCategory("RAL 8007").catFa,
    isPopular: false
  },
  {
    code: "RAL 8008",
    nameEn: "Olive brown",
    nameFa: "Olive brown",
    hex: "#6F4F28",
    category: getCategory("RAL 8008").cat,
    categoryFa: getCategory("RAL 8008").catFa,
    isPopular: false
  },
  {
    code: "RAL 8011",
    nameEn: "Nut brown",
    nameFa: "Nut brown",
    hex: "#5A3A29",
    category: getCategory("RAL 8011").cat,
    categoryFa: getCategory("RAL 8011").catFa,
    isPopular: false
  },
  {
    code: "RAL 8012",
    nameEn: "Red brown",
    nameFa: "Red brown",
    hex: "#673831",
    category: getCategory("RAL 8012").cat,
    categoryFa: getCategory("RAL 8012").catFa,
    isPopular: false
  },
  {
    code: "RAL 8014",
    nameEn: "Sepia brown",
    nameFa: "Sepia brown",
    hex: "#49392D",
    category: getCategory("RAL 8014").cat,
    categoryFa: getCategory("RAL 8014").catFa,
    isPopular: false
  },
  {
    code: "RAL 8015",
    nameEn: "Chestnut brown",
    nameFa: "Chestnut brown",
    hex: "#633A34",
    category: getCategory("RAL 8015").cat,
    categoryFa: getCategory("RAL 8015").catFa,
    isPopular: false
  },
  {
    code: "RAL 8016",
    nameEn: "Mahogany brown",
    nameFa: "Mahogany brown",
    hex: "#4C2F26",
    category: getCategory("RAL 8016").cat,
    categoryFa: getCategory("RAL 8016").catFa,
    isPopular: false
  },
  {
    code: "RAL 8017",
    nameEn: "Chocolate brown",
    nameFa: "Chocolate brown",
    hex: "#44322D",
    category: getCategory("RAL 8017").cat,
    categoryFa: getCategory("RAL 8017").catFa,
    isPopular: false
  },
  {
    code: "RAL 8019",
    nameEn: "Grey brown",
    nameFa: "Grey brown",
    hex: "#3F3A3A",
    category: getCategory("RAL 8019").cat,
    categoryFa: getCategory("RAL 8019").catFa,
    isPopular: false
  },
  {
    code: "RAL 8022",
    nameEn: "Black brown",
    nameFa: "Black brown",
    hex: "#211F20",
    category: getCategory("RAL 8022").cat,
    categoryFa: getCategory("RAL 8022").catFa,
    isPopular: false
  },
  {
    code: "RAL 8023",
    nameEn: "Orange brown",
    nameFa: "Orange brown",
    hex: "#A65E2F",
    category: getCategory("RAL 8023").cat,
    categoryFa: getCategory("RAL 8023").catFa,
    isPopular: false
  },
  {
    code: "RAL 8024",
    nameEn: "Beige brown",
    nameFa: "Beige brown",
    hex: "#79553C",
    category: getCategory("RAL 8024").cat,
    categoryFa: getCategory("RAL 8024").catFa,
    isPopular: false
  },
  {
    code: "RAL 8025",
    nameEn: "Pale brown",
    nameFa: "Pale brown",
    hex: "#755C49",
    category: getCategory("RAL 8025").cat,
    categoryFa: getCategory("RAL 8025").catFa,
    isPopular: false
  },
  {
    code: "RAL 8028",
    nameEn: "Terra brown",
    nameFa: "Terra brown",
    hex: "#4E3B2B",
    category: getCategory("RAL 8028").cat,
    categoryFa: getCategory("RAL 8028").catFa,
    isPopular: false
  },
  {
    code: "RAL 8029",
    nameEn: "Pearl copper",
    nameFa: "Pearl copper",
    hex: "#773C27",
    category: getCategory("RAL 8029").cat,
    categoryFa: getCategory("RAL 8029").catFa,
    isPopular: false
  },
  {
    code: "RAL 9001",
    nameEn: "Cream",
    nameFa: "Cream",
    hex: "#EFEBDC",
    category: getCategory("RAL 9001").cat,
    categoryFa: getCategory("RAL 9001").catFa,
    isPopular: false
  },
  {
    code: "RAL 9002",
    nameEn: "Grey white",
    nameFa: "Grey white",
    hex: "#DDDED4",
    category: getCategory("RAL 9002").cat,
    categoryFa: getCategory("RAL 9002").catFa,
    isPopular: false
  },
  {
    code: "RAL 9003",
    nameEn: "Signal white",
    nameFa: "Signal white",
    hex: "#F4F8F4",
    category: getCategory("RAL 9003").cat,
    categoryFa: getCategory("RAL 9003").catFa,
    isPopular: false
  },
  {
    code: "RAL 9004",
    nameEn: "Signal black",
    nameFa: "Signal black",
    hex: "#2E3032",
    category: getCategory("RAL 9004").cat,
    categoryFa: getCategory("RAL 9004").catFa,
    isPopular: false
  },
  {
    code: "RAL 9005",
    nameEn: "Jet black",
    nameFa: "\u0645\u0634\u06a9\u06cc \u0645\u0627\u062a \u062c\u062a \u0628\u0644\u06a9",
    hex: "#0A0A0D",
    category: getCategory("RAL 9005").cat,
    categoryFa: getCategory("RAL 9005").catFa,
    isPopular: true
  },
  {
    code: "RAL 9006",
    nameEn: "White aluminium",
    nameFa: "White aluminium",
    hex: "#A5A8A6",
    category: getCategory("RAL 9006").cat,
    categoryFa: getCategory("RAL 9006").catFa,
    isPopular: false
  },
  {
    code: "RAL 9007",
    nameEn: "Grey aluminium",
    nameFa: "Grey aluminium",
    hex: "#8F8F8C",
    category: getCategory("RAL 9007").cat,
    categoryFa: getCategory("RAL 9007").catFa,
    isPopular: false
  },
  {
    code: "RAL 9010",
    nameEn: "Pure white",
    nameFa: "\u0633\u0641\u06cc\u062f \u062e\u0627\u0644\u0635 \u06cc\u062e\u0686\u0627\u0644\u06cc",
    hex: "#F7F9EF",
    category: getCategory("RAL 9010").cat,
    categoryFa: getCategory("RAL 9010").catFa,
    isPopular: true
  },
  {
    code: "RAL 9011",
    nameEn: "Graphite black",
    nameFa: "Graphite black",
    hex: "#292C2F",
    category: getCategory("RAL 9011").cat,
    categoryFa: getCategory("RAL 9011").catFa,
    isPopular: false
  },
  {
    code: "RAL 9012",
    nameEn: "Clean room white",
    nameFa: "Clean room white",
    hex: "",
    category: getCategory("RAL 9012").cat,
    categoryFa: getCategory("RAL 9012").catFa,
    isPopular: false
  },
  {
    code: "RAL 9016",
    nameEn: "Traffic white",
    nameFa: "\u0633\u0641\u06cc\u062f \u062a\u0631\u0627\u0641\u06cc\u06a9\u06cc",
    hex: "#F7FBF5",
    category: getCategory("RAL 9016").cat,
    categoryFa: getCategory("RAL 9016").catFa,
    isPopular: false
  },
  {
    code: "RAL 9017",
    nameEn: "Traffic black",
    nameFa: "\u0645\u0634\u06a9\u06cc \u062a\u0631\u0627\u0641\u06cc\u06a9\u06cc",
    hex: "#2A2D2F",
    category: getCategory("RAL 9017").cat,
    categoryFa: getCategory("RAL 9017").catFa,
    isPopular: false
  },
  {
    code: "RAL 9018",
    nameEn: "Papyrus white",
    nameFa: "Papyrus white",
    hex: "#CFD3CD",
    category: getCategory("RAL 9018").cat,
    categoryFa: getCategory("RAL 9018").catFa,
    isPopular: false
  },
  {
    code: "RAL 9022",
    nameEn: "Pearl light grey",
    nameFa: "Pearl light grey",
    hex: "#9C9C9C",
    category: getCategory("RAL 9022").cat,
    categoryFa: getCategory("RAL 9022").catFa,
    isPopular: false
  },
  {
    code: "RAL 9023",
    nameEn: "Pearl dark grey",
    nameFa: "Pearl dark grey",
    hex: "#7E8182",
    category: getCategory("RAL 9023").cat,
    categoryFa: getCategory("RAL 9023").catFa,
    isPopular: false
  },
];

export const POPULAR_CYLINDER_RAL_COLORS = RAL_COLORS.filter(c => c.isPopular);

export const RAL_POPULAR_COLORS: RalColor[] = [
  getRalColorByCode('RAL 6018') || { code: 'RAL 6018', nameEn: 'Yellow green', nameFa: 'سبز مغزپسته‌ای', hex: '#57A639', category: 'green', categoryFa: 'سبز' },
  getRalColorByCode('RAL 5015') || { code: 'RAL 5015', nameEn: 'Sky blue', nameFa: 'آبی آسمانی', hex: '#007CB0', category: 'blue', categoryFa: 'آبی' },
  getRalColorByCode('RAL 2004') || { code: 'RAL 2004', nameEn: 'Pure orange', nameFa: 'نارنجی خالص', hex: '#E25303', category: 'orange', categoryFa: 'نارنجی' },
  getRalColorByCode('RAL 3000') || { code: 'RAL 3000', nameEn: 'Flame red', nameFa: 'قرمز آتشنشانی', hex: '#AF2B1E', category: 'red', categoryFa: 'قرمز' },
  getRalColorByCode('RAL 1021') || { code: 'RAL 1021', nameEn: 'Colza yellow', nameFa: 'زرد روغنی', hex: '#F3DA0B', category: 'yellow', categoryFa: 'زرد' },
  getRalColorByCode('RAL 7035') || { code: 'RAL 7035', nameEn: 'Light grey', nameFa: 'طوسی روشن', hex: '#D7D7D7', category: 'grey', categoryFa: 'خاکستری' },
  getRalColorByCode('RAL 9005') || { code: 'RAL 9005', nameEn: 'Jet black', nameFa: 'مشکی براق', hex: '#0A0A0D', category: 'white-black', categoryFa: 'سیاه' },
  getRalColorByCode('RAL 5002') || { code: 'RAL 5002', nameEn: 'Ultramarine blue', nameFa: 'آبی لاجوردی', hex: '#00387B', category: 'blue', categoryFa: 'آبی' },
  getRalColorByCode('RAL 6005') || { code: 'RAL 6005', nameEn: 'Moss green', nameFa: 'سبز خزه‌ای', hex: '#2F4538', category: 'green', categoryFa: 'سبز' },
  getRalColorByCode('RAL 9010') || { code: 'RAL 9010', nameEn: 'Pure white', nameFa: 'سفید خالص', hex: '#FFFFFF', category: 'white-black', categoryFa: 'سفید' },
];

export type RalCategory = 'yellow' | 'orange' | 'red' | 'violet' | 'blue' | 'green' | 'grey' | 'brown' | 'white-black' | 'white_black';

export function getRalColorsByCategory(cat: RalCategory): RalColor[] {
  const normalized = cat === 'white_black' ? 'white-black' : cat;
  return RAL_COLORS.filter(c => c.category === normalized);
}

export function searchRalColors(query: string): RalColor[] {
  const q = query.toLowerCase().trim();
  return RAL_COLORS.filter(c => 
    c.code.toLowerCase().includes(q) ||
    c.code.replace('ral', '').trim().includes(q) ||
    c.nameEn.toLowerCase().includes(q) ||
    c.nameFa.toLowerCase().includes(q) ||
    c.hex.toLowerCase().includes(q)
  );
}

export function getRalColorByCode(code: string): RalColor | undefined {
  const cleaned = code.toLowerCase().trim();
  return RAL_COLORS.find(c => 
    c.code.toLowerCase() === cleaned || 
    c.code.toLowerCase().replace('ral', '').trim() === cleaned.replace('ral', '').trim()
  );
}
