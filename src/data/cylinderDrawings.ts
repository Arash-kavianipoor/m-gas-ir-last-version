export interface CylinderDrawingItem {
  id: number;
  title: string;
  weight: string;
  length: string;
  diameter: string;
  width: number;
  height: number;
  viewBox: string;
  svg: string;
  lines: { x1: number; y1: number; x2: number; y2: number; stroke: string; strokeWidth: number }[];
  circles: { cx: number; cy: number; r: number }[];
  texts: { x: number; y: number; val: string }[];
}

export const CYLINDER_DRAWINGS: CylinderDrawingItem[] = [
  {
    "id": 1,
    "title": "75 Liter",
    "weight": "25.2 kg",
    "length": "83 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <!-- body -->\n        <line x1=\"28\" y1=\"15\" x2=\"156.65\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"55\" x2=\"156.65\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <!-- left end -->\n        <circle cx=\"28\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <!-- right end -->\n        <circle cx=\"156.65\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"156.65\" y1=\"15\" x2=\"156.65\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <!-- length dim -->\n        <line x1=\"28\" y1=\"62\" x2=\"156.65\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"59.5\" x2=\"28\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"156.65\" y1=\"59.5\" x2=\"156.65\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"92.3\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">83</text>\n        <!-- diameter dim -->\n        <line x1=\"185\" y1=\"15\" x2=\"185\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"182.5\" y1=\"15\" x2=\"187.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"182.5\" y1=\"55\" x2=\"187.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"192\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 156.65,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 55,
        "x2": 156.65,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 156.65,
        "y1": 15,
        "x2": 156.65,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 62,
        "x2": 156.65,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 59.5,
        "x2": 28,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 156.65,
        "y1": 59.5,
        "x2": 156.65,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 185,
        "y1": 15,
        "x2": 185,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 182.5,
        "y1": 15,
        "x2": 187.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 182.5,
        "y1": 55,
        "x2": 187.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 156.65,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 92.3,
        "y": 70,
        "val": "83"
      },
      {
        "x": 192,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 2,
    "title": "80 Liter",
    "weight": "25.7 kg",
    "length": "94 cm",
    "diameter": "34 cm",
    "width": 340,
    "height": 68,
    "viewBox": "0 0 340 68",
    "svg": "<svg width=\"340\" height=\"68\" viewBox=\"0 0 340 68\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"26\" y1=\"15.5\" x2=\"171.7\" y2=\"15.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"26\" y1=\"52.5\" x2=\"171.7\" y2=\"52.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"26\" cy=\"34\" r=\"18.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"26\" y1=\"15.5\" x2=\"26\" y2=\"52.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"171.7\" cy=\"34\" r=\"18.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"171.7\" y1=\"15.5\" x2=\"171.7\" y2=\"52.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"26\" y1=\"60\" x2=\"171.7\" y2=\"60\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"26\" y1=\"57.5\" x2=\"26\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"171.7\" y1=\"57.5\" x2=\"171.7\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"98.85\" y=\"68\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">94</text>\n        <line x1=\"198\" y1=\"15.5\" x2=\"198\" y2=\"52.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"195.5\" y1=\"15.5\" x2=\"200.5\" y2=\"15.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"195.5\" y1=\"52.5\" x2=\"200.5\" y2=\"52.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"205\" y=\"37\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">34</text>\n      </svg>",
    "lines": [
      {
        "x1": 26,
        "y1": 15.5,
        "x2": 171.7,
        "y2": 15.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 26,
        "y1": 52.5,
        "x2": 171.7,
        "y2": 52.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 26,
        "y1": 15.5,
        "x2": 26,
        "y2": 52.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 171.7,
        "y1": 15.5,
        "x2": 171.7,
        "y2": 52.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 26,
        "y1": 60,
        "x2": 171.7,
        "y2": 60,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 26,
        "y1": 57.5,
        "x2": 26,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 171.7,
        "y1": 57.5,
        "x2": 171.7,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 198,
        "y1": 15.5,
        "x2": 198,
        "y2": 52.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 195.5,
        "y1": 15.5,
        "x2": 200.5,
        "y2": 15.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 195.5,
        "y1": 52.5,
        "x2": 200.5,
        "y2": 52.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 26,
        "cy": 34,
        "r": 18.5
      },
      {
        "cx": 171.7,
        "cy": 34,
        "r": 18.5
      }
    ],
    "texts": [
      {
        "x": 98.85,
        "y": 68,
        "val": "94"
      },
      {
        "x": 205,
        "y": 37,
        "val": "34"
      }
    ]
  },
  {
    "id": 3,
    "title": "95 Liter",
    "weight": "35.5 kg",
    "length": "97 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"178.35\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"55\" x2=\"178.35\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"178.35\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"178.35\" y1=\"15\" x2=\"178.35\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"62\" x2=\"178.35\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"59.5\" x2=\"28\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"178.35\" y1=\"59.5\" x2=\"178.35\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"103.2\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">97</text>\n        <line x1=\"206\" y1=\"15\" x2=\"206\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"203.5\" y1=\"15\" x2=\"208.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"203.5\" y1=\"55\" x2=\"208.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"213\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 178.35,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 55,
        "x2": 178.35,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 178.35,
        "y1": 15,
        "x2": 178.35,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 62,
        "x2": 178.35,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 59.5,
        "x2": 28,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 178.35,
        "y1": 59.5,
        "x2": 178.35,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 206,
        "y1": 15,
        "x2": 206,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 203.5,
        "y1": 15,
        "x2": 208.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 203.5,
        "y1": 55,
        "x2": 208.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 178.35,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 103.2,
        "y": 70,
        "val": "97"
      },
      {
        "x": 213,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 4,
    "title": "105 Liter",
    "weight": "36.2 kg",
    "length": "115 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"206.25\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"55\" x2=\"206.25\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"206.25\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"206.25\" y1=\"15\" x2=\"206.25\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"62\" x2=\"206.25\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"59.5\" x2=\"28\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"206.25\" y1=\"59.5\" x2=\"206.25\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"117.1\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">115</text>\n        <line x1=\"234\" y1=\"15\" x2=\"234\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"231.5\" y1=\"15\" x2=\"236.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"231.5\" y1=\"55\" x2=\"236.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"241\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 206.25,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 55,
        "x2": 206.25,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 206.25,
        "y1": 15,
        "x2": 206.25,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 62,
        "x2": 206.25,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 59.5,
        "x2": 28,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 206.25,
        "y1": 59.5,
        "x2": 206.25,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 234,
        "y1": 15,
        "x2": 234,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 231.5,
        "y1": 15,
        "x2": 236.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 231.5,
        "y1": 55,
        "x2": 236.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 206.25,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 117.1,
        "y": 70,
        "val": "115"
      },
      {
        "x": 241,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 5,
    "title": "125 Liter",
    "weight": "43.8 kg",
    "length": "133 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"26\" y1=\"15\" x2=\"225.15\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"26\" y1=\"55\" x2=\"225.15\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"26\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"26\" y1=\"15\" x2=\"26\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"225.15\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"225.15\" y1=\"15\" x2=\"225.15\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"26\" y1=\"62\" x2=\"225.15\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"26\" y1=\"59.5\" x2=\"26\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"225.15\" y1=\"59.5\" x2=\"225.15\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"125.6\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">133</text>\n        <line x1=\"253\" y1=\"15\" x2=\"253\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"250.5\" y1=\"15\" x2=\"255.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"250.5\" y1=\"55\" x2=\"255.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"260\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 26,
        "y1": 15,
        "x2": 225.15,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 26,
        "y1": 55,
        "x2": 225.15,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 26,
        "y1": 15,
        "x2": 26,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 225.15,
        "y1": 15,
        "x2": 225.15,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 26,
        "y1": 62,
        "x2": 225.15,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 26,
        "y1": 59.5,
        "x2": 26,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 225.15,
        "y1": 59.5,
        "x2": 225.15,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 253,
        "y1": 15,
        "x2": 253,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 250.5,
        "y1": 15,
        "x2": 255.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 250.5,
        "y1": 55,
        "x2": 255.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 26,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 225.15,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 125.6,
        "y": 70,
        "val": "133"
      },
      {
        "x": 260,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 6,
    "title": "125 Liter",
    "weight": "42.8 kg",
    "length": "143 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"24\" y1=\"15\" x2=\"238.65\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"24\" y1=\"55\" x2=\"238.65\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"24\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"24\" y1=\"15\" x2=\"24\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"238.65\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"238.65\" y1=\"15\" x2=\"238.65\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"24\" y1=\"62\" x2=\"238.65\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"24\" y1=\"59.5\" x2=\"24\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"238.65\" y1=\"59.5\" x2=\"238.65\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"131.3\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">143</text>\n        <line x1=\"267\" y1=\"15\" x2=\"267\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"264.5\" y1=\"15\" x2=\"269.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"264.5\" y1=\"55\" x2=\"269.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"274\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 24,
        "y1": 15,
        "x2": 238.65,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 24,
        "y1": 55,
        "x2": 238.65,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 24,
        "y1": 15,
        "x2": 24,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 238.65,
        "y1": 15,
        "x2": 238.65,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 24,
        "y1": 62,
        "x2": 238.65,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 24,
        "y1": 59.5,
        "x2": 24,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 238.65,
        "y1": 59.5,
        "x2": 238.65,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 267,
        "y1": 15,
        "x2": 267,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 264.5,
        "y1": 15,
        "x2": 269.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 264.5,
        "y1": 55,
        "x2": 269.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 24,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 238.65,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 131.3,
        "y": 70,
        "val": "143"
      },
      {
        "x": 274,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 7,
    "title": "30 Liter",
    "weight": "16 kg",
    "length": "40 cm",
    "diameter": "31.5 cm",
    "width": 340,
    "height": 68,
    "viewBox": "0 0 340 68",
    "svg": "<svg width=\"340\" height=\"68\" viewBox=\"0 0 340 68\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15.25\" x2=\"90\" y2=\"15.25\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"52.75\" x2=\"90\" y2=\"52.75\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"34\" r=\"18.75\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15.25\" x2=\"28\" y2=\"52.75\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"90\" cy=\"34\" r=\"18.75\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"90\" y1=\"15.25\" x2=\"90\" y2=\"52.75\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"60\" x2=\"90\" y2=\"60\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"57.5\" x2=\"28\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"90\" y1=\"57.5\" x2=\"90\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"59\" y=\"68\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">40</text>\n        <line x1=\"117\" y1=\"15.25\" x2=\"117\" y2=\"52.75\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"114.5\" y1=\"15.25\" x2=\"119.5\" y2=\"15.25\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"114.5\" y1=\"52.75\" x2=\"119.5\" y2=\"52.75\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"124\" y=\"37\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">31.5</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15.25,
        "x2": 90,
        "y2": 15.25,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 52.75,
        "x2": 90,
        "y2": 52.75,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15.25,
        "x2": 28,
        "y2": 52.75,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 90,
        "y1": 15.25,
        "x2": 90,
        "y2": 52.75,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 60,
        "x2": 90,
        "y2": 60,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 57.5,
        "x2": 28,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 90,
        "y1": 57.5,
        "x2": 90,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 117,
        "y1": 15.25,
        "x2": 117,
        "y2": 52.75,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 114.5,
        "y1": 15.25,
        "x2": 119.5,
        "y2": 15.25,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 114.5,
        "y1": 52.75,
        "x2": 119.5,
        "y2": 52.75,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 34,
        "r": 18.75
      },
      {
        "cx": 90,
        "cy": 34,
        "r": 18.75
      }
    ],
    "texts": [
      {
        "x": 59,
        "y": 68,
        "val": "40"
      },
      {
        "x": 124,
        "y": 37,
        "val": "31.5"
      }
    ]
  },
  {
    "id": 8,
    "title": "25 Liter Tipple",
    "weight": "25.8 kg",
    "length": "78 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"148.9\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"55\" x2=\"148.9\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"148.9\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"148.9\" y1=\"15\" x2=\"148.9\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"62\" x2=\"148.9\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"59.5\" x2=\"28\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"148.9\" y1=\"59.5\" x2=\"148.9\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"88.45\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">78</text>\n        <line x1=\"177\" y1=\"15\" x2=\"177\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"174.5\" y1=\"15\" x2=\"179.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"174.5\" y1=\"55\" x2=\"179.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"184\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 148.9,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 55,
        "x2": 148.9,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 148.9,
        "y1": 15,
        "x2": 148.9,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 62,
        "x2": 148.9,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 59.5,
        "x2": 28,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 148.9,
        "y1": 59.5,
        "x2": 148.9,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 177,
        "y1": 15,
        "x2": 177,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 174.5,
        "y1": 15,
        "x2": 179.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 174.5,
        "y1": 55,
        "x2": 179.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 148.9,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 88.45,
        "y": 70,
        "val": "78"
      },
      {
        "x": 184,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 9,
    "title": "25 Liter Long",
    "weight": "11.5 kg",
    "length": "62 cm",
    "diameter": "23 cm",
    "width": 340,
    "height": 58,
    "viewBox": "0 0 340 58",
    "svg": "<svg width=\"340\" height=\"58\" viewBox=\"0 0 340 58\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"22\" y1=\"12.5\" x2=\"118.1\" y2=\"12.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"41.5\" x2=\"118.1\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"22\" cy=\"27\" r=\"14.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"12.5\" x2=\"22\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"118.1\" cy=\"27\" r=\"14.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"118.1\" y1=\"12.5\" x2=\"118.1\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"22\" y1=\"48\" x2=\"118.1\" y2=\"48\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"22\" y1=\"45.5\" x2=\"22\" y2=\"50.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"118.1\" y1=\"45.5\" x2=\"118.1\" y2=\"50.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"70.05\" y=\"57\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">62</text>\n        <line x1=\"140\" y1=\"12.5\" x2=\"140\" y2=\"41.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"137.5\" y1=\"12.5\" x2=\"142.5\" y2=\"12.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"137.5\" y1=\"41.5\" x2=\"142.5\" y2=\"41.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"147\" y=\"30\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">23</text>\n      </svg>",
    "lines": [
      {
        "x1": 22,
        "y1": 12.5,
        "x2": 118.1,
        "y2": 12.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 22,
        "y1": 41.5,
        "x2": 118.1,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 22,
        "y1": 12.5,
        "x2": 22,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 118.1,
        "y1": 12.5,
        "x2": 118.1,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 22,
        "y1": 48,
        "x2": 118.1,
        "y2": 48,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 22,
        "y1": 45.5,
        "x2": 22,
        "y2": 50.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 118.1,
        "y1": 45.5,
        "x2": 118.1,
        "y2": 50.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 140,
        "y1": 12.5,
        "x2": 140,
        "y2": 41.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 137.5,
        "y1": 12.5,
        "x2": 142.5,
        "y2": 12.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 137.5,
        "y1": 41.5,
        "x2": 142.5,
        "y2": 41.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 22,
        "cy": 27,
        "r": 14.5
      },
      {
        "cx": 118.1,
        "cy": 27,
        "r": 14.5
      }
    ],
    "texts": [
      {
        "x": 70.05,
        "y": 57,
        "val": "62"
      },
      {
        "x": 147,
        "y": 30,
        "val": "23"
      }
    ]
  },
  {
    "id": 10,
    "title": "30 Liter Long",
    "weight": "14 kg",
    "length": "79 cm",
    "diameter": "23 cm",
    "width": 340,
    "height": 58,
    "viewBox": "0 0 340 58",
    "svg": "<svg width=\"340\" height=\"58\" viewBox=\"0 0 340 58\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"22\" y1=\"12.5\" x2=\"144.45\" y2=\"12.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"41.5\" x2=\"144.45\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"22\" cy=\"27\" r=\"14.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"12.5\" x2=\"22\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"144.45\" cy=\"27\" r=\"14.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"144.45\" y1=\"12.5\" x2=\"144.45\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"22\" y1=\"48\" x2=\"144.45\" y2=\"48\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"22\" y1=\"45.5\" x2=\"22\" y2=\"50.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"144.45\" y1=\"45.5\" x2=\"144.45\" y2=\"50.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"83.2\" y=\"57\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">79</text>\n        <line x1=\"167\" y1=\"12.5\" x2=\"167\" y2=\"41.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"164.5\" y1=\"12.5\" x2=\"169.5\" y2=\"12.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"164.5\" y1=\"41.5\" x2=\"169.5\" y2=\"41.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"174\" y=\"30\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">23</text>\n      </svg>",
    "lines": [
      {
        "x1": 22,
        "y1": 12.5,
        "x2": 144.45,
        "y2": 12.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 22,
        "y1": 41.5,
        "x2": 144.45,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 22,
        "y1": 12.5,
        "x2": 22,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 144.45,
        "y1": 12.5,
        "x2": 144.45,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 22,
        "y1": 48,
        "x2": 144.45,
        "y2": 48,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 22,
        "y1": 45.5,
        "x2": 22,
        "y2": 50.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 144.45,
        "y1": 45.5,
        "x2": 144.45,
        "y2": 50.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 167,
        "y1": 12.5,
        "x2": 167,
        "y2": 41.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 164.5,
        "y1": 12.5,
        "x2": 169.5,
        "y2": 12.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 164.5,
        "y1": 41.5,
        "x2": 169.5,
        "y2": 41.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 22,
        "cy": 27,
        "r": 14.5
      },
      {
        "cx": 144.45,
        "cy": 27,
        "r": 14.5
      }
    ],
    "texts": [
      {
        "x": 83.2,
        "y": 57,
        "val": "79"
      },
      {
        "x": 174,
        "y": 30,
        "val": "23"
      }
    ]
  },
  {
    "id": 11,
    "title": "35 Liter Long",
    "weight": "15 kg",
    "length": "83 cm",
    "diameter": "23 cm",
    "width": 340,
    "height": 58,
    "viewBox": "0 0 340 58",
    "svg": "<svg width=\"340\" height=\"58\" viewBox=\"0 0 340 58\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"22\" y1=\"12.5\" x2=\"150.65\" y2=\"12.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"41.5\" x2=\"150.65\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"22\" cy=\"27\" r=\"14.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"22\" y1=\"12.5\" x2=\"22\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"150.65\" cy=\"27\" r=\"14.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"150.65\" y1=\"12.5\" x2=\"150.65\" y2=\"41.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"22\" y1=\"48\" x2=\"150.65\" y2=\"48\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"22\" y1=\"45.5\" x2=\"22\" y2=\"50.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"150.65\" y1=\"45.5\" x2=\"150.65\" y2=\"50.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"86.3\" y=\"57\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">83</text>\n        <line x1=\"173\" y1=\"12.5\" x2=\"173\" y2=\"41.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"170.5\" y1=\"12.5\" x2=\"175.5\" y2=\"12.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"170.5\" y1=\"41.5\" x2=\"175.5\" y2=\"41.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"180\" y=\"30\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">23</text>\n      </svg>",
    "lines": [
      {
        "x1": 22,
        "y1": 12.5,
        "x2": 150.65,
        "y2": 12.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 22,
        "y1": 41.5,
        "x2": 150.65,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 22,
        "y1": 12.5,
        "x2": 22,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 150.65,
        "y1": 12.5,
        "x2": 150.65,
        "y2": 41.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 22,
        "y1": 48,
        "x2": 150.65,
        "y2": 48,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 22,
        "y1": 45.5,
        "x2": 22,
        "y2": 50.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 150.65,
        "y1": 45.5,
        "x2": 150.65,
        "y2": 50.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 173,
        "y1": 12.5,
        "x2": 173,
        "y2": 41.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 170.5,
        "y1": 12.5,
        "x2": 175.5,
        "y2": 12.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 170.5,
        "y1": 41.5,
        "x2": 175.5,
        "y2": 41.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 22,
        "cy": 27,
        "r": 14.5
      },
      {
        "cx": 150.65,
        "cy": 27,
        "r": 14.5
      }
    ],
    "texts": [
      {
        "x": 86.3,
        "y": 57,
        "val": "83"
      },
      {
        "x": 180,
        "y": 30,
        "val": "23"
      }
    ]
  },
  {
    "id": 12,
    "title": "60 Liter",
    "weight": "22.5 kg",
    "length": "82 cm",
    "diameter": "31.5 cm",
    "width": 340,
    "height": 68,
    "viewBox": "0 0 340 68",
    "svg": "<svg width=\"340\" height=\"68\" viewBox=\"0 0 340 68\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15.25\" x2=\"155.1\" y2=\"15.25\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"52.75\" x2=\"155.1\" y2=\"52.75\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"34\" r=\"18.75\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15.25\" x2=\"28\" y2=\"52.75\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"155.1\" cy=\"34\" r=\"18.75\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"155.1\" y1=\"15.25\" x2=\"155.1\" y2=\"52.75\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"60\" x2=\"155.1\" y2=\"60\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"57.5\" x2=\"28\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"155.1\" y1=\"57.5\" x2=\"155.1\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"91.55\" y=\"68\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">82</text>\n        <line x1=\"182\" y1=\"15.25\" x2=\"182\" y2=\"52.75\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"179.5\" y1=\"15.25\" x2=\"184.5\" y2=\"15.25\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"179.5\" y1=\"52.75\" x2=\"184.5\" y2=\"52.75\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"189\" y=\"37\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">31.5</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15.25,
        "x2": 155.1,
        "y2": 15.25,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 52.75,
        "x2": 155.1,
        "y2": 52.75,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15.25,
        "x2": 28,
        "y2": 52.75,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 155.1,
        "y1": 15.25,
        "x2": 155.1,
        "y2": 52.75,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 60,
        "x2": 155.1,
        "y2": 60,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 57.5,
        "x2": 28,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 155.1,
        "y1": 57.5,
        "x2": 155.1,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 182,
        "y1": 15.25,
        "x2": 182,
        "y2": 52.75,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 179.5,
        "y1": 15.25,
        "x2": 184.5,
        "y2": 15.25,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 179.5,
        "y1": 52.75,
        "x2": 184.5,
        "y2": 52.75,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 34,
        "r": 18.75
      },
      {
        "cx": 155.1,
        "cy": 34,
        "r": 18.75
      }
    ],
    "texts": [
      {
        "x": 91.55,
        "y": 68,
        "val": "82"
      },
      {
        "x": 189,
        "y": 37,
        "val": "31.5"
      }
    ]
  },
  {
    "id": 13,
    "title": "20 Liter Tipple",
    "weight": "11 kg",
    "length": "36 cm",
    "diameter": "30 cm",
    "width": 340,
    "height": 66,
    "viewBox": "0 0 340 66",
    "svg": "<svg width=\"340\" height=\"66\" viewBox=\"0 0 340 66\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"83.8\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"51\" x2=\"83.8\" y2=\"51\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"83.8\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"83.8\" y1=\"15\" x2=\"83.8\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"58\" x2=\"83.8\" y2=\"58\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"55.5\" x2=\"28\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"83.8\" y1=\"55.5\" x2=\"83.8\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"55.9\" y=\"66\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n        <line x1=\"110\" y1=\"15\" x2=\"110\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"107.5\" y1=\"15\" x2=\"112.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"107.5\" y1=\"51\" x2=\"112.5\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"117\" y=\"36\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">30</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 83.8,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 51,
        "x2": 83.8,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 83.8,
        "y1": 15,
        "x2": 83.8,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 58,
        "x2": 83.8,
        "y2": 58,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 55.5,
        "x2": 28,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 83.8,
        "y1": 55.5,
        "x2": 83.8,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 110,
        "y1": 15,
        "x2": 110,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 107.5,
        "y1": 15,
        "x2": 112.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 107.5,
        "y1": 51,
        "x2": 112.5,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 33,
        "r": 18
      },
      {
        "cx": 83.8,
        "cy": 33,
        "r": 18
      }
    ],
    "texts": [
      {
        "x": 55.9,
        "y": 66,
        "val": "36"
      },
      {
        "x": 117,
        "y": 36,
        "val": "30"
      }
    ]
  },
  {
    "id": 14,
    "title": "25 Liter Tipple",
    "weight": "12 kg",
    "length": "41 cm",
    "diameter": "30 cm",
    "width": 340,
    "height": 66,
    "viewBox": "0 0 340 66",
    "svg": "<svg width=\"340\" height=\"66\" viewBox=\"0 0 340 66\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"91.55\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"51\" x2=\"91.55\" y2=\"51\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"91.55\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"91.55\" y1=\"15\" x2=\"91.55\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"58\" x2=\"91.55\" y2=\"58\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"55.5\" x2=\"28\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"91.55\" y1=\"55.5\" x2=\"91.55\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"59.8\" y=\"66\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">41</text>\n        <line x1=\"118\" y1=\"15\" x2=\"118\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"115.5\" y1=\"15\" x2=\"120.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"115.5\" y1=\"51\" x2=\"120.5\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"125\" y=\"36\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">30</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 91.55,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 51,
        "x2": 91.55,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 91.55,
        "y1": 15,
        "x2": 91.55,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 58,
        "x2": 91.55,
        "y2": 58,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 55.5,
        "x2": 28,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 91.55,
        "y1": 55.5,
        "x2": 91.55,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 118,
        "y1": 15,
        "x2": 118,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 115.5,
        "y1": 15,
        "x2": 120.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 115.5,
        "y1": 51,
        "x2": 120.5,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 33,
        "r": 18
      },
      {
        "cx": 91.55,
        "cy": 33,
        "r": 18
      }
    ],
    "texts": [
      {
        "x": 59.8,
        "y": 66,
        "val": "41"
      },
      {
        "x": 125,
        "y": 36,
        "val": "30"
      }
    ]
  },
  {
    "id": 15,
    "title": "35 Liter Tipple",
    "weight": "14 kg",
    "length": "49 cm",
    "diameter": "31 cm",
    "width": 340,
    "height": 68,
    "viewBox": "0 0 340 68",
    "svg": "<svg width=\"340\" height=\"68\" viewBox=\"0 0 340 68\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15.5\" x2=\"103.95\" y2=\"15.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"52.5\" x2=\"103.95\" y2=\"52.5\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"34\" r=\"18.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15.5\" x2=\"28\" y2=\"52.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"103.95\" cy=\"34\" r=\"18.5\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"103.95\" y1=\"15.5\" x2=\"103.95\" y2=\"52.5\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"60\" x2=\"103.95\" y2=\"60\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"57.5\" x2=\"28\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"103.95\" y1=\"57.5\" x2=\"103.95\" y2=\"62.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"65.975\" y=\"68\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">49</text>\n        <line x1=\"131\" y1=\"15.5\" x2=\"131\" y2=\"52.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"128.5\" y1=\"15.5\" x2=\"133.5\" y2=\"15.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"128.5\" y1=\"52.5\" x2=\"133.5\" y2=\"52.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"138\" y=\"37\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">31</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15.5,
        "x2": 103.95,
        "y2": 15.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 52.5,
        "x2": 103.95,
        "y2": 52.5,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15.5,
        "x2": 28,
        "y2": 52.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 103.95,
        "y1": 15.5,
        "x2": 103.95,
        "y2": 52.5,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 60,
        "x2": 103.95,
        "y2": 60,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 57.5,
        "x2": 28,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 103.95,
        "y1": 57.5,
        "x2": 103.95,
        "y2": 62.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 131,
        "y1": 15.5,
        "x2": 131,
        "y2": 52.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 128.5,
        "y1": 15.5,
        "x2": 133.5,
        "y2": 15.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 128.5,
        "y1": 52.5,
        "x2": 133.5,
        "y2": 52.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 34,
        "r": 18.5
      },
      {
        "cx": 103.95,
        "cy": 34,
        "r": 18.5
      }
    ],
    "texts": [
      {
        "x": 65.975,
        "y": 68,
        "val": "49"
      },
      {
        "x": 138,
        "y": 37,
        "val": "31"
      }
    ]
  },
  {
    "id": 16,
    "title": "50 Liter New",
    "weight": "19.5 kg",
    "length": "77 cm",
    "diameter": "30 cm",
    "width": 340,
    "height": 66,
    "viewBox": "0 0 340 66",
    "svg": "<svg width=\"340\" height=\"66\" viewBox=\"0 0 340 66\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"147.35\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"51\" x2=\"147.35\" y2=\"51\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"147.35\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"147.35\" y1=\"15\" x2=\"147.35\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"58\" x2=\"147.35\" y2=\"58\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"55.5\" x2=\"28\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"147.35\" y1=\"55.5\" x2=\"147.35\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"87.675\" y=\"66\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">77</text>\n        <line x1=\"174\" y1=\"15\" x2=\"174\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"171.5\" y1=\"15\" x2=\"176.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"171.5\" y1=\"51\" x2=\"176.5\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"181\" y=\"36\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">30</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 147.35,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 51,
        "x2": 147.35,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 147.35,
        "y1": 15,
        "x2": 147.35,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 58,
        "x2": 147.35,
        "y2": 58,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 55.5,
        "x2": 28,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 147.35,
        "y1": 55.5,
        "x2": 147.35,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 174,
        "y1": 15,
        "x2": 174,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 171.5,
        "y1": 15,
        "x2": 176.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 171.5,
        "y1": 51,
        "x2": 176.5,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 33,
        "r": 18
      },
      {
        "cx": 147.35,
        "cy": 33,
        "r": 18
      }
    ],
    "texts": [
      {
        "x": 87.675,
        "y": 66,
        "val": "77"
      },
      {
        "x": 181,
        "y": 36,
        "val": "30"
      }
    ]
  },
  {
    "id": 17,
    "title": "50 Liter New",
    "weight": "20 kg",
    "length": "58 cm",
    "diameter": "36 cm",
    "width": 340,
    "height": 70,
    "viewBox": "0 0 340 70",
    "svg": "<svg width=\"340\" height=\"70\" viewBox=\"0 0 340 70\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"117.9\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"55\" x2=\"117.9\" y2=\"55\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"117.9\" cy=\"35\" r=\"20\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"117.9\" y1=\"15\" x2=\"117.9\" y2=\"55\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"62\" x2=\"117.9\" y2=\"62\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"59.5\" x2=\"28\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"117.9\" y1=\"59.5\" x2=\"117.9\" y2=\"64.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"72.95\" y=\"70\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">58</text>\n        <line x1=\"146\" y1=\"15\" x2=\"146\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"143.5\" y1=\"15\" x2=\"148.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"143.5\" y1=\"55\" x2=\"148.5\" y2=\"55\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"153\" y=\"38\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">36</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 117.9,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 55,
        "x2": 117.9,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 117.9,
        "y1": 15,
        "x2": 117.9,
        "y2": 55,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 62,
        "x2": 117.9,
        "y2": 62,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 59.5,
        "x2": 28,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 117.9,
        "y1": 59.5,
        "x2": 117.9,
        "y2": 64.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 146,
        "y1": 15,
        "x2": 146,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 143.5,
        "y1": 15,
        "x2": 148.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 143.5,
        "y1": 55,
        "x2": 148.5,
        "y2": 55,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 35,
        "r": 20
      },
      {
        "cx": 117.9,
        "cy": 35,
        "r": 20
      }
    ],
    "texts": [
      {
        "x": 72.95,
        "y": 70,
        "val": "58"
      },
      {
        "x": 153,
        "y": 38,
        "val": "36"
      }
    ]
  },
  {
    "id": 18,
    "title": "30 Liter New",
    "weight": "12.3 kg",
    "length": "45 cm",
    "diameter": "30 cm",
    "width": 340,
    "height": 66,
    "viewBox": "0 0 340 66",
    "svg": "<svg width=\"340\" height=\"66\" viewBox=\"0 0 340 66\" xmlns=\"http://www.w3.org/2000/svg\">\n        <line x1=\"28\" y1=\"15\" x2=\"97.75\" y2=\"15\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"51\" x2=\"97.75\" y2=\"51\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <circle cx=\"28\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"28\" y1=\"15\" x2=\"28\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <circle cx=\"97.75\" cy=\"33\" r=\"18\" fill=\"none\" stroke=\"#111\" stroke-width=\"1.2\"/>\n        <line x1=\"97.75\" y1=\"15\" x2=\"97.75\" y2=\"51\" stroke=\"#111\" stroke-width=\"1\"/>\n        <line x1=\"28\" y1=\"58\" x2=\"97.75\" y2=\"58\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"28\" y1=\"55.5\" x2=\"28\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"97.75\" y1=\"55.5\" x2=\"97.75\" y2=\"60.5\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"62.875\" y=\"66\" text-anchor=\"middle\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">45</text>\n        <line x1=\"124\" y1=\"15\" x2=\"124\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"121.5\" y1=\"15\" x2=\"126.5\" y2=\"15\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <line x1=\"121.5\" y1=\"51\" x2=\"126.5\" y2=\"51\" stroke=\"#333\" stroke-width=\"0.7\"/>\n        <text x=\"131\" y=\"36\" font-size=\"9\" font-family=\"system-ui,sans-serif\" fill=\"#111\">30</text>\n      </svg>",
    "lines": [
      {
        "x1": 28,
        "y1": 15,
        "x2": 97.75,
        "y2": 15,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 51,
        "x2": 97.75,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1.2
      },
      {
        "x1": 28,
        "y1": 15,
        "x2": 28,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 97.75,
        "y1": 15,
        "x2": 97.75,
        "y2": 51,
        "stroke": "#111",
        "strokeWidth": 1
      },
      {
        "x1": 28,
        "y1": 58,
        "x2": 97.75,
        "y2": 58,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 28,
        "y1": 55.5,
        "x2": 28,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 97.75,
        "y1": 55.5,
        "x2": 97.75,
        "y2": 60.5,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 124,
        "y1": 15,
        "x2": 124,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 121.5,
        "y1": 15,
        "x2": 126.5,
        "y2": 15,
        "stroke": "#333",
        "strokeWidth": 0.7
      },
      {
        "x1": 121.5,
        "y1": 51,
        "x2": 126.5,
        "y2": 51,
        "stroke": "#333",
        "strokeWidth": 0.7
      }
    ],
    "circles": [
      {
        "cx": 28,
        "cy": 33,
        "r": 18
      },
      {
        "cx": 97.75,
        "cy": 33,
        "r": 18
      }
    ],
    "texts": [
      {
        "x": 62.875,
        "y": 66,
        "val": "45"
      },
      {
        "x": 131,
        "y": 36,
        "val": "30"
      }
    ]
  }
];
