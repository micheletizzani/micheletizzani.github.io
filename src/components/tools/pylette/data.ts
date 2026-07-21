// PyPalette Studio: Color Palette Data and Helpers for Python Integration
export interface Palette {
  name: string;
  colors: string[];
  dataType: "sequential" | "diverging" | "qualitative" | "cyclic";
  isBuiltIn: boolean;
  description: string;
  tags: string[];
}

export const BUILT_IN_PALETTES: Palette[] = [
  // SEQUENTIAL
  {
    name: "viridis",
    colors: ["#440154", "#414487", "#2a788e", "#22a884", "#7ad151", "#fde725"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Matplotlib standard. Perceptually uniform, excellent for readability and colorblind-safe.",
    tags: ["matplotlib", "seaborn", "colorblind-safe", "perceptual", "scientific"],
  },
  {
    name: "magma",
    colors: ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Beautiful black-to-yellow sequential map. Ideal for displaying heat maps or astronomy visuals.",
    tags: ["matplotlib", "dark-theme", "astronomy", "scientific"],
  },
  {
    name: "plasma",
    colors: ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "High-energy blue-to-yellow gradient. Great for vibrant visual density mapping.",
    tags: ["matplotlib", "vibrant", "scientific"],
  },
  {
    name: "cividis",
    colors: ["#00204d", "#414d6b", "#707c7c", "#a1ac76", "#d6df54", "#fefe62"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Specifically engineered for the vision-impaired. Exceptional protanopia/deuteranopia balance.",
    tags: ["colorblind-safe", "academic", "perceptual"],
  },
  {
    name: "Blues",
    colors: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Classic single-hue sequential blue scale. Highly professional for corporate charts.",
    tags: ["classic", "corporate", "single-hue"],
  },
  {
    name: "Greens",
    colors: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Nature-oriented single-hue green scale. Clean representation for ecology or forestry metrics.",
    tags: ["classic", "ecology", "single-hue"],
  },
  {
    name: "rocket",
    colors: ["#03051a", "#3b1854", "#7d1d6d", "#c22f67", "#f46843", "#febb68"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Seaborn sequential map. Dark purple-to-peach gradient, highly popular for astronomical plots.",
    tags: ["seaborn", "astronomy", "vibrant"],
  },
  {
    name: "mako",
    colors: ["#0b0405", "#241a31", "#3f3860", "#4d5d85", "#5786a3", "#66afb2", "#a0dfb9"],
    dataType: "sequential",
    isBuiltIn: true,
    description: "Dark teal-to-mint gradient. High legibility and modern tech aesthetic.",
    tags: ["seaborn", "tech", "cool-tone"],
  },

  // DIVERGING
  {
    name: "coolwarm",
    colors: ["#3b4cc0", "#668bf2", "#b0c4de", "#f2c3b0", "#f2765c", "#b40426"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Classic temperature/deviation map. Smooth transitions from cool cyan to warm maroon.",
    tags: ["classic", "scientific", "neutral-mid"],
  },
  {
    name: "RdBu",
    colors: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Red-to-Blue diverging gradient. The staple choice for correlation matrices and political trends.",
    tags: ["matplotlib", "correlation", "classic"],
  },
  {
    name: "PRGn",
    colors: ["#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Purple-to-Green diverging map. Colorblind-safe option to Red-Green transitions.",
    tags: ["colorblind-safe", "academic", "terrain"],
  },
  {
    name: "vlag",
    colors: ["#1e365d", "#3d679b", "#7c9fca", "#d8e4f1", "#f3d3c4", "#d07460", "#8b1e22"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Muted modern diverging scale with blue and red anchors and white mid-point.",
    tags: ["seaborn", "correlation", "modern"],
  },

  // QUALITATIVE
  {
    name: "tab10",
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Tableau classic 10. The gold standard for categorizing up to 10 categorical groups.",
    tags: ["matplotlib", "tableau", "classic", "high-contrast"],
  },
  {
    name: "Set2",
    colors: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Muted pastel-like color palette with distinct hues. Highly recommended for bar charts.",
    tags: ["colorblind-safe", "academic", "soft"],
  },
  {
    name: "Dark2",
    colors: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Saturated, deep categorical palette. Superb for thin line charts and scatter point groups.",
    tags: ["academic", "colorblind-safe", "high-contrast"],
  },
  {
    name: "colorblind",
    colors: ["#0072b2", "#009e73", "#d55e00", "#cc79a7", "#f0e442", "#56b4e9"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Optimized categorical color scheme proposed by Okabe & Ito for maximum accessibility.",
    tags: ["colorblind-safe", "classic", "accessibility"],
  },
  {
    name: "pastel",
    colors: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Soft pastel palette. Best for decorative charts or simple large visual structures.",
    tags: ["classic", "soft", "decorative"],
  },
  {
    name: "vincent",
    colors: ["#0f2537", "#203c56", "#365c8d", "#5681b9", "#f6d55c", "#17252a"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Vincent van Gogh's Starry Night. Deep celestial blues and vibrant yellow stars.",
    tags: ["artist", "vangogh", "starry-night", "blue-yellow"],
  },
  {
    name: "gustav",
    colors: ["#ecc04d", "#c29b46", "#212d2d", "#3d4d42", "#7b9075", "#aebf9e"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Gustav Klimt's decorative gold works. Earthy greens paired with rich ambers.",
    tags: ["artist", "klimt", "gold", "earthy"],
  },
  {
    name: "frida",
    colors: ["#305634", "#df4230", "#f19e38", "#638b97", "#b95175", "#601b34"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Frida Kahlo's self-portraits. Vibrant mexican-folk greens, reds, and deep magentas.",
    tags: ["artist", "kahlo", "vibrant", "floral"],
  },
  {
    name: "pablo",
    colors: ["#1e2930", "#3b4d57", "#637a85", "#96acb5", "#c8d6db", "#a38363"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Pablo Picasso's Guernica. Monochromatic blue-greys and deep charcoal structure.",
    tags: ["artist", "picasso", "monochrome", "cubism"],
  },
  {
    name: "keith",
    colors: ["#e81e25", "#1a225c", "#fae017", "#1a1a1a", "#fdfdfd"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Keith Haring's high-contrast street murals. Bold primary colors outlined in pitch black.",
    tags: ["artist", "haring", "pop-art", "primary"],
  },
  {
    name: "piet",
    colors: ["#e31922", "#214083", "#f9d31d", "#131313", "#fbfbfb"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Piet Mondrian's Neo-Plasticism. Abstract geometric primaries and sharp lines.",
    tags: ["artist", "mondrian", "minimalist", "geometric"],
  },
  {
    name: "katsushika",
    colors: ["#1b2735", "#2c3e50", "#748b97", "#9eb0b7", "#dfdfd0", "#c25a3a"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Katsushika Hokusai's Great Wave. Deep indigo waves, foam whites, and warm clay horizons.",
    tags: ["artist", "hokusai", "ocean", "indigo"],
  },
  {
    name: "hilma",
    colors: ["#dec9c5", "#b4c9c7", "#ebd99f", "#be987f", "#444957", "#e19f85"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Hilma af Klint's abstract spiritual diagrams. Dusty pinks, muted duck-egg blues, and soft gold.",
    tags: ["artist", "afklint", "pastel", "spiritual"],
  },
  {
    name: "georgia",
    colors: ["#9c3427", "#cf5130", "#f48847", "#ffbe7b", "#f9edd7", "#42413b"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Georgia O'Keeffe's floral desert vistas. Warm terracottas, peaches, and organic sands.",
    tags: ["artist", "okeeffe", "desert", "organic"],
  },
  {
    name: "jean_michel",
    colors: ["#e13b30", "#20285b", "#f4cb26", "#3dbbc7", "#1a1a1a", "#ebebeb"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Jean-Michel Basquiat's expressive neo-expressionist street art. Raw primary clash with chalkboard black.",
    tags: ["artist", "basquiat", "raw", "contrast"],
  },

  // LISA R PACKAGE ART PALETTES
  {
    name: "lisa_TheScream",
    colors: ["#1e2d42", "#cfa851", "#8d392f", "#df8437", "#44463a", "#bebebe"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Edvard Munch's The Scream (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "expressionism"],
  },
  {
    name: "lisa_StarryNight",
    colors: ["#1b325f", "#3a5fcd", "#7ca9d9", "#f6e27e", "#f2b134", "#483d8b"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Vincent van Gogh's The Starry Night (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "impressionism"],
  },
  {
    name: "lisa_Guernica",
    colors: ["#1c1c1c", "#545454", "#8c8c8c", "#bebebe", "#e3e3e3", "#fafafa"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Pablo Picasso's Guernica (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "monochrome"],
  },
  {
    name: "lisa_TheKiss",
    colors: ["#bf953f", "#fcf198", "#e5cc5e", "#514324", "#77803b", "#a1622b"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Gustav Klimt's The Kiss (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "gold"],
  },
  {
    name: "lisa_WaterLilies",
    colors: ["#2d4154", "#52758f", "#8ca3a6", "#bcc3c4", "#8f8263", "#a8c0bc"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Claude Monet's Water Lilies (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "ocean"],
  },
  {
    name: "lisa_Sunflowers",
    colors: ["#937324", "#fcd94b", "#faec8e", "#71853d", "#abb279", "#40311f"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Vincent van Gogh's Sunflowers (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "yellow"],
  },
  {
    name: "lisa_TheDream",
    colors: ["#e95d5a", "#ecc258", "#33455b", "#6a8d9a", "#abcbcc", "#ebebe8"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Pablo Picasso's The Dream (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "surrealism"],
  },
  {
    name: "lisa_GirlWithAPearl",
    colors: ["#001a30", "#316d86", "#acbfcc", "#d1a153", "#d95040", "#ebeae6"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Artistic palette inspired by Johannes Vermeer's Girl with a Pearl Earring (extracted from the R Lisa package).",
    tags: ["lisa", "r-package", "portrait"],
  },
  // ART-INSPIRED LTC R PACKAGE PALETTES
  {
    name: "paloma",
    colors: ["#83AF9B", "#C8C8A9", "#f8da8a", "#f7bf95", "#fe8ca1"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Daughter of Francoise Gilot and Pablo Picasso (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "maya",
    colors: ["#3d5a80", "#98c1d9", "#e0fbfc", "#ee6c4d", "#293241"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Daughter of Marie-Therese Walter and Pablo Ruiz Picasso (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "dora",
    colors: ["#52777A", "#542437", "#C02942", "#D95B43", "#ECD078"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "French photographer, painter, and poet (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "ploen",
    colors: ["#3F5671", "#83A1C3", "#CEB5C8", "#FAC898", "#B17776"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "A beautiful village in Northern Germany (ltc palette)",
    tags: ["ltc", "nature"],
  },
  {
    name: "olga",
    colors: ["#c9e3c2", "#8bc8cb", "#eccd80", "#f5ab70", "#9c87a1"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Olga Khokhlova was a Russian ballet dancer (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "mterese",
    colors: ["#f7ddaa", "#fac3ad", "#f897a1", "#9298BA", "#9cbeed"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Marie-Therese Walter was a French model and mother of Maya (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "gaby",
    colors: ["#fceaab", "#f1a890", "#a8c4cc", "#82A0C2", "#85496F"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Gabrielle Depeyre Lespinasse was a French dancer (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "franscoise",
    colors: ["#5980B1", "#b96a8d", "#A55062", "#E05256", "#E9A986"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Francoise Gilot was a significant French painter (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "fernande",
    colors: ["#ff7676", "#F9D662", "#7cab7d", "#75B7D1"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Fernande was a French model and artist (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "sylvie",
    colors: ["#E8B961", "#E88170", "#C6BDE8", "#5DB7C4", "#FD95BC"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Sylvette David is a French artist and model (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "expevo",
    colors: ["#FC4E07", "#E7B800", "#00AFBB", "#8B4769", "#1d457f", "#808080"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "A palette that is often being used by biologists (ltc palette)",
    tags: ["ltc", "science"],
  },
  {
    name: "minou",
    colors: ["#00798c", "#d1495b", "#edae49", "#66a182", "#2e4057", "#8d96a3"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Minou was Picasso's favorite cat (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "kiss",
    colors: ["#FF7C7E", "#FEC300", "#9E3F71", "#31BCBA", "#E20035"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by The Kiss Picasso 1925 (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "hat",
    colors: ["#efb306", "#eb990c", "#e8351e", "#cd023d", "#852f88", "#4e54ac", "#0f8096", "#7db954", "#17a769", "#000000"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Woman in Hat Picasso 1937 (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "reading",
    colors: ["#EFBC68", "#919F89", "#EDBDAE", "#57717C", "#5F97A4", "#CAEAC8", "#95A1AE", "#C8CFD6"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Two Girls Reading Picasso 1934 (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "alger",
    colors: ["#000000", "#1A5B5B", "#ACC8BE", "#F4AB5C", "#D1422F"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Les femmes d'Alger Picasso 1955 (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
  {
    name: "trio1",
    colors: ["#0E7175", "#FD7901", "#C35BCA"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "A discrete color palette to visualize 3 variables (ltc palette)",
    tags: ["ltc", "trio"],
  },
  {
    name: "trio2",
    colors: ["#89973D", "#E8B92F", "#A45E41"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "A discrete color palette to visualize 3 variables (ltc palette)",
    tags: ["ltc", "trio"],
  },
  {
    name: "trio3",
    colors: ["#E69F00", "#56B4E9", "#009E73"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "A discrete color palette to visualize 3 variables (ltc palette)",
    tags: ["ltc", "trio"],
  },
  {
    name: "trio4",
    colors: ["#94475E", "#364C54", "#E5A11F"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "A discrete color palette to visualize 3 variables (ltc palette)",
    tags: ["ltc", "trio"],
  },
  {
    name: "heatmap0",
    colors: ["#001219", "#005F73", "#0A9396", "#94D2BD", "#E9D8A6", "#EE9B00", "#CA6702", "#AE2012", "#9B2226"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "A diverging color palette suitable for heatmaps (ltc palette)",
    tags: ["ltc", "heatmap"],
  },
  {
    name: "pantone23",
    colors: ["#7A92A5", "#1F2C43", "#FFB000", "#842c48", "#46483d"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Soft Chaos was released by Pantone in Summer 23 (ltc palette)",
    tags: ["ltc", "pantone"],
  },
  {
    name: "remains",
    colors: ["#69326E", "#EEEDC0", "#FF6D1F", "#EED455"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by The Remains of the Day by Kazuo Ishiguro (Booker Prize 1989) (ltc palette)",
    tags: ["ltc", "booker-prize", "literature"],
  },
  {
    name: "midnight",
    colors: ["#16232A", "#FF5B04", "#075056", "#E4EEF0"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Midnight's Children by Salman Rushdie (Booker Prize 1981) (ltc palette)",
    tags: ["ltc", "booker-prize", "literature"],
  },
  {
    name: "lincoln",
    colors: ["#EEE9DF", "#C9C1B1", "#2C3B4D", "#FFB162", "#A35139", "#1B2632"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Lincoln in the Bardo by George Saunders (Booker Prize 2017) (ltc palette)",
    tags: ["ltc", "booker-prize", "literature"],
  },
  {
    name: "luminaries",
    colors: ["#FF5B04", "#075056", "#233038", "#FDF6E3", "#F4D47C", "#D3DBDD"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by The Luminaries by Eleanor Catton (Booker Prize 2013) (ltc palette)",
    tags: ["ltc", "booker-prize", "literature"],
  },
  {
    name: "seafarer",
    colors: ["#013D5A", "#FCF3E3", "#BDD3CE", "#708C69", "#E4A25B"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by The Old Man and the Sea theme - maritime literary palette (ltc palette)",
    tags: ["ltc", "literature"],
  },
  {
    name: "shuggie",
    colors: ["#5B5F8D", "#9BB29E", "#DA6B51", "#F1DCBA", "#484149"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Inspired by Shuggie Bain by Douglas Stuart (Booker Prize 2020) (ltc palette)",
    tags: ["ltc", "booker-prize", "literature"],
  },
  {
    name: "heatmap1",
    colors: ["#4d7799", "#7fa4c4", "#c5c8d4", "#d48e95", "#b5515b"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Blue and Red diverging palette 7 - ideal for heatmaps and expression data (ltc palette)",
    tags: ["ltc", "heatmap"],
  },
  {
    name: "heatmap2",
    colors: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Blue and Red diverging palette 8 - classic diverging scheme (ltc palette)",
    tags: ["ltc", "heatmap"],
  },
  {
    name: "heatmap3",
    colors: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
    dataType: "diverging",
    isBuiltIn: true,
    description: "Blue and Red diverging palette 9 - warm-cool diverging palette (ltc palette)",
    tags: ["ltc", "heatmap"],
  },
  {
    name: "casa_natal",
    colors: ["#245E55", "#ED773C", "#808BC5", "#C63F3E", "#EAC119", "#EAA7C7", "#9ED6DF", "#1D1D1B", "#EAE4DA"],
    dataType: "qualitative",
    isBuiltIn: true,
    description: "Casa Natal on the Plaza de la Merced, the birthplace of Picasso (ltc palette)",
    tags: ["ltc", "art", "picasso"],
  },
];

export interface EvaluationResult {
  score: number; // 0 to 100
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  colorblindFriendly: {
    protanopia: boolean;
    deuteranopia: boolean;
    tritanopia: boolean;
  };
  grayscalePrintable: boolean;
  contrastScore: number; // 0 to 100
  cognitiveLoadRating: {
    status: "low" | "medium" | "high";
    reason: string;
  };
  critiques: string[];
}

// Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const sanitized = hex.replace(/^#/, "");
  const r = parseInt(sanitized.slice(0, 2), 16);
  const g = parseInt(sanitized.slice(2, 4), 16);
  const b = parseInt(sanitized.slice(4, 6), 16);
  return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
}

// Get perceived luminance (ITU-R BT.709 formula)
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Simulates colorblindness on single HEX color
export function simulateColorblind(
  hex: string,
  type: "protanopia" | "deuteranopia" | "tritanopia" | "normal" | "achromatopsia" | "protanomaly" | "deuteranomaly" | "tritanomaly"
): string {
  if (type === "normal") return hex;
  const { r, g, b } = hexToRgb(hex);

  let sr = r,
    sg = g,
    sb = b;

  if (type === "protanopia") {
    sr = 0.567 * r + 0.433 * g + 0.0 * b;
    sg = 0.558 * r + 0.442 * g + 0.0 * b;
    sb = 0.0 * r + 0.242 * g + 0.758 * b;
  } else if (type === "deuteranopia") {
    sr = 0.625 * r + 0.375 * g + 0.0 * b;
    sg = 0.7 * r + 0.3 * g + 0.0 * b;
    sb = 0.0 * r + 0.3 * g + 0.7 * b;
  } else if (type === "tritanopia") {
    sr = 0.95 * r + 0.05 * g + 0.0 * b;
    sg = 0.0 * r + 0.433 * g + 0.567 * b;
    sb = 0.0 * r + 0.475 * g + 0.525 * b;
  } else if (type === "achromatopsia") {
    // Monochromacy (grayscale)
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    sr = gray;
    sg = gray;
    sb = gray;
  } else if (type === "protanomaly") {
    // Protanomaly: anomalous trichromacy, blend of normal and protanopia
    sr = 0.6 * r + 0.4 * (0.567 * r + 0.433 * g);
    sg = 0.6 * g + 0.4 * (0.558 * r + 0.442 * g);
    sb = 0.6 * b + 0.4 * (0.242 * g + 0.758 * b);
  } else if (type === "deuteranomaly") {
    // Deuteranomaly: blend of normal and deuteranopia (most common)
    sr = 0.6 * r + 0.4 * (0.625 * r + 0.375 * g);
    sg = 0.6 * g + 0.4 * (0.7 * r + 0.3 * g);
    sb = 0.6 * b + 0.4 * (0.3 * g + 0.7 * b);
  } else if (type === "tritanomaly") {
    // Tritanomaly: blend of normal and tritanopia
    sr = 0.6 * r + 0.4 * (0.95 * r + 0.05 * g);
    sg = 0.6 * g + 0.4 * (0.433 * g + 0.567 * b);
    sb = 0.6 * b + 0.4 * (0.475 * g + 0.525 * b);
  }

  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");

  return `#${toHex(sr)}${toHex(sg)}${toHex(sb)}`;
}

// Evaluate color palette against professional data viz design principles
export function evaluatePalette(colors: string[], dataType: string, plotType: string): EvaluationResult {
  const critiques: string[] = [];
  let score = 85; // base score

  // 1. Contrast Evaluation
  const luminances = colors.map(getLuminance);
  const maxL = Math.max(...luminances);
  const minL = Math.min(...luminances);
  const deltaL = maxL - minL;
  let contrastScore = 80;

  if (dataType === "sequential" || dataType === "diverging") {
    // Sequential and diverging need high variance in luminance to display range
    if (deltaL > 150) {
      contrastScore = 95;
      score += 5;
    } else if (deltaL < 80) {
      contrastScore = 50;
      score -= 15;
      critiques.push("Sequential/Diverging gradient has narrow luminance delta. Data shifts may be hard to see.");
    } else {
      contrastScore = 75;
    }
  } else {
    // Qualitative should avoid extreme light/dark mixes or low-contrast background clashes
    const lightColors = colors.filter((c) => getLuminance(c) > 220);
    const darkColors = colors.filter((c) => getLuminance(c) < 35);

    if (lightColors.length > 0) {
      score -= 5;
      critiques.push(`${lightColors.length} colors are too light and might blend into standard light plot backgrounds.`);
    }
    if (darkColors.length > 1) {
      score -= 5;
      critiques.push("Multiple categorical colors are very dark. They may look identical on screen.");
    }
  }

  // 2. Colorblind Friendly Check
  // Measure euclidean distance of simulated colors to check distinctiveness
  const checkColorblindSafe = (type: "protanopia" | "deuteranopia" | "tritanopia"): boolean => {
    if (dataType === "sequential") return true; // sequential is naturally resilient to colorblindness

    // We only check adjacent and first-order combos for qualitative
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const simI = simulateColorblind(colors[i], type);
        const simJ = simulateColorblind(colors[j], type);

        const rgbI = hexToRgb(simI);
        const rgbJ = hexToRgb(simJ);

        // Euclidean distance in RGB
        const dist = Math.sqrt(Math.pow(rgbI.r - rgbJ.r, 2) + Math.pow(rgbI.g - rgbJ.g, 2) + Math.pow(rgbI.b - rgbJ.b, 2));

        if (dist < 40) {
          return false;
        }
      }
    }
    return true;
  };

  const protanopiaSafe = checkColorblindSafe("protanopia");
  const deuteranopiaSafe = checkColorblindSafe("deuteranopia");
  const tritanopiaSafe = checkColorblindSafe("tritanopia");

  if (!protanopiaSafe) {
    score -= 10;
    critiques.push("Protanopes (red-blind) will struggle to distinguish some categories in this palette.");
  }
  if (!deuteranopiaSafe) {
    score -= 10;
    critiques.push("Deuteranopes (green-blind) will experience low distinction with these color combinations.");
  }
  if (!tritanopiaSafe) {
    score -= 5;
    critiques.push("Tritanopes (blue-blind) will find some colors highly overlapping.");
  }

  // 3. Grayscale Printability
  // Standard Deviation of perceived brightness to determine if printed charts hold value
  const meanL = luminances.reduce((a, b) => a + b, 0) / luminances.length;
  const stdL = Math.sqrt(luminances.map((x) => Math.pow(x - meanL, 2)).reduce((a, b) => a + b, 0) / luminances.length);
  const grayscalePrintable = stdL > 25;
  if (!grayscalePrintable && (dataType === "sequential" || dataType === "diverging")) {
    score -= 8;
    critiques.push("Low grayscale contrast. This chart will lose critical detail when printed in black-and-white.");
  }

  // 4. Cognitive Load & Plot Alignment
  let cognStatus: "low" | "medium" | "high" = "low";
  let cognReason = "The number of colors is well-aligned with visual capacity.";

  if (plotType === "line") {
    if (colors.length > 6) {
      cognStatus = "high";
      cognReason = "Over 6 lines in a single chart overwhelms cognitive capacity (spaghetti chart effect).";
      score -= 12;
      critiques.push("Too many series for a line chart. Use max 6 colors or use dashed styles to distinguish trends.");
    } else if (colors.length > 4) {
      cognStatus = "medium";
      cognReason = "4-6 line series is readable but requires deliberate concentration.";
    }
  } else if (plotType === "bar") {
    if (colors.length > 8) {
      cognStatus = "high";
      cognReason = "Over 8 categories in a bar chart can look overwhelming and messy.";
      score -= 8;
      critiques.push('Consider grouping smaller bar categories into an "Other" segment.');
    }
  } else if (plotType === "heatmap") {
    if (dataType === "qualitative") {
      cognStatus = "high";
      cognReason = "Categorical palettes do not render heatmaps well; require a sequential gradient.";
      score -= 15;
      critiques.push("A qualitative/categorical palette is active. Heatmaps must use sequential or diverging scales.");
    }
  }

  // Final score boundaries
  score = Math.max(10, Math.min(100, score));
  let rating: "Excellent" | "Good" | "Fair" | "Poor" = "Good";
  if (score >= 90) rating = "Excellent";
  else if (score >= 70) rating = "Good";
  else if (score >= 50) rating = "Fair";
  else rating = "Poor";

  return {
    score,
    rating,
    colorblindFriendly: {
      protanopia: protanopiaSafe,
      deuteranopia: deuteranopiaSafe,
      tritanopia: tritanopiaSafe,
    },
    grayscalePrintable,
    contrastScore,
    cognitiveLoadRating: {
      status: cognStatus,
      reason: cognReason,
    },
    critiques,
  };
}

// Generate the Python Matplotlib and Seaborn code representation of this selected visual
export function generatePythonCode(
  paletteName: string,
  colors: string[],
  dataType: string,
  plotType: string,
  numColors: number,
  isReversed: boolean
): string {
  const actualPaletteName = isReversed ? `${paletteName}_r` : paletteName;
  const hexListStr = `[${colors
    .slice(0, numColors)
    .map((c) => `'${c}'`)
    .join(", ")}]`;

  // Matplotlib Colormap setup
  let colormapInit = "";
  let paletteVar = "";
  if (BUILT_IN_PALETTES.some((p) => p.name === paletteName)) {
    paletteVar = `'${actualPaletteName}'`;
  } else {
    // Custom Palette definition in python
    colormapInit = `# Define custom palette hex list\ncustom_colors = ${hexListStr}\n\n# Create matplotlib colormap and seaborn palette\nfrom matplotlib.colors import LinearSegmentedColormap\ncmap_custom = LinearSegmentedColormap.from_list('${paletteName}', custom_colors)\nsns.set_palette(sns.color_palette(custom_colors))\n`;
    paletteVar = dataType === "qualitative" ? "custom_colors" : "cmap_custom";
  }

  const header = `import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Set standard styles
sns.set_theme(style="whitegrid")
`;

  let plotCode = "";

  switch (plotType) {
    case "scatter":
      if (dataType === "qualitative") {
        plotCode = `${colormapInit || `colors = sns.color_palette(${paletteVar}, ${numColors})\n`}
# Simulated Qualitative Scatter Plot
np.random.seed(42)
categories = [f"Group {i}" for i in range(${numColors})]
x = np.random.randn(100)
y = np.random.randn(100)
groups = np.random.choice(categories, 100)

plt.figure(figsize=(8, 6))
sns.scatterplot(x=x, y=y, hue=groups, palette=${BUILT_IN_PALETTES.some((p) => p.name === paletteName) ? `"${actualPaletteName}"` : "colors"}, alpha=0.8, edgecolor="w", s=80)
plt.title("Categorical Scatter Plot (PyPalette Suggestion)", fontsize=14, pad=15)
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
plt.legend(title="Data Groups", bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.show()`;
      } else {
        plotCode = `${colormapInit || ""}
# Simulated Continuous/Sequential Scatter Plot
np.random.seed(42)
x = np.random.randn(200)
y = np.random.randn(200)
intensity = np.sin(x) * np.cos(y) + np.random.normal(0, 0.1, 200)

plt.figure(figsize=(8, 6))
scatter = plt.scatter(x, y, c=intensity, cmap=${BUILT_IN_PALETTES.some((p) => p.name === paletteName) ? `"${actualPaletteName}"` : "cmap_custom"}, s=70, alpha=0.85, edgecolors='none')
cbar = plt.colorbar(scatter)
cbar.set_label('Feature Intensity / Density', rotation=270, labelpad=15)
plt.title("Continuous Scatter Plot (PyPalette Suggestion)", fontsize=14, pad=15)
plt.xlabel("Feature A")
plt.ylabel("Feature B")
plt.tight_layout()
plt.show()`;
      }
      break;

    case "bar":
      plotCode = `${colormapInit || `colors = sns.color_palette(${paletteVar}, ${numColors})\n`}
# Simulated Bar Comparison Chart
categories = [f"Feature {chr(65+i)}" for i in range(${numColors})]
values = [15, 24, 18, 35, 12, 28, 22, 19][: ${numColors}]

plt.figure(figsize=(8, 5))
# Design Principle: Muted areas, balanced lightness
sns.barplot(x=categories, y=values, palette=${BUILT_IN_PALETTES.some((p) => p.name === paletteName) ? `"${actualPaletteName}"` : "colors"}, alpha=0.9)

plt.title("Category Comparison (PyPalette Suggestion)", fontsize=14, pad=15)
plt.ylabel("Normalized Metrics")
plt.xlabel("Sample Groups")
plt.ylim(0, 40)
plt.tight_layout()
plt.show()`;
      break;

    case "line":
      plotCode = `${colormapInit || `colors = sns.color_palette(${paletteVar}, ${numColors})\n`}
# Simulated Line Graph (Multi-Series Trends)
np.random.seed(10)
timesteps = np.linspace(0, 10, 100)

plt.figure(figsize=(8, 5))
for i in range(${numColors}):
  # Standard line chart design principle: combine colors with styles for max contrast
  linestyle = ['-', '--', ':', '-.'][i % 4]
  noise = np.cumsum(np.random.normal(0, 0.2, 100))
  trend = np.sin(timesteps + i * 0.5) + noise
  
  plt.plot(timesteps, trend, 
           color=${BUILT_IN_PALETTES.some((p) => p.name === paletteName) ? `sns.color_palette("${actualPaletteName}", ${numColors})[i]` : "colors[i]"}, 
           linestyle=linestyle, 
           linewidth=2, 
           label=f"Metric Series {i+1}")

plt.title("Temporal Series Analysis", fontsize=14, pad=15)
plt.xlabel("Time Epochs")
plt.ylabel("Aggregated Value")
plt.legend(loc='lower left', frameon=True)
plt.tight_layout()
plt.show()`;
      break;

    case "heatmap":
      plotCode = `${colormapInit || ""}
# Simulated Heatmap Grid Matrix
np.random.seed(1)
# Create a correlation-like matrix
data = np.random.randn(10, 10)
corr = np.corrcoef(data)

plt.figure(figsize=(8, 6))
# Diverging mid-point design principle center=0
sns.heatmap(corr, 
            cmap=${BUILT_IN_PALETTES.some((p) => p.name === paletteName) ? `"${actualPaletteName}"` : "cmap_custom"}, 
            center=0, 
            annot=False, 
            linewidths=.5, 
            cbar_kws={"shrink": .8})

plt.title("Correlation Matrix Grid Layout", fontsize=14, pad=15)
plt.tight_layout()
plt.show()`;
      break;

    case "map":
      plotCode = `${colormapInit || ""}
# Simulated Choropleth Spatial Density Map
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(8, 6))
np.random.seed(7)
grid_values = np.random.rand(5, 5)

# Build map layout squares
cmap = plt.get_cmap(${BUILT_IN_PALETTES.some((p) => p.name === paletteName) ? `"${actualPaletteName}"` : "cmap_custom"})
norm = plt.Normalize(0, 1)

for i in range(5):
  for j in range(5):
    val = grid_values[i, j]
    color = cmap(norm(val))
    # Design principle: thin off-white boundary line to make density clear
    rect = patches.Rectangle((i, j), 1, 1, linewidth=1, edgecolor='#f7f7f7', facecolor=color)
    ax.add_patch(rect)

ax.set_xlim(0, 5)
ax.set_ylim(0, 5)
plt.axis('off')
sm = plt.cm.ScalarMappable(cmap=cmap, norm=norm)
sm.set_array([])
cbar = fig.colorbar(sm, ax=ax, label='Spatial density scale', shrink=0.7)
plt.title("Spatial Area Choropleth Representation", fontsize=14, pad=15)
plt.tight_layout()
plt.show()`;
      break;

    default:
      plotCode = `# Print selected colors\nprint("Selected Palette Colors:", ${hexListStr})`;
  }

  return `${header}\n${plotCode}`;
}

// High-quality fully implementable copy-paste python helper file (pypalette.py)
export function getPythonLibraryTemplate(): string {
  return `"""
PyPalette Studio - A Design-Principle-Driven Color Palette Helper for Python

This module implements optimal palette suggestions according to visual types, data formats,
colorblind requirements, and scientific accessibility conventions.
"""
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.colors import LinearSegmentedColormap
import numpy as np

# Presets matched exactly with Seaborn/Matplotlib conventions and PyPalette Studio
PRESETS = {
    "sequential": {
        "viridis": ["#440154", "#414487", "#2a788e", "#22a884", "#7ad151", "#fde725"],
        "magma": ["#000004", "#3b0f70", "#8c2981", "#de4968", "#fe9f6d", "#fcfdbf"],
        "plasma": ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
        "cividis": ["#00204d", "#414d6b", "#707c7c", "#a1ac76", "#d6df54", "#fefe62"],
        "blues": ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
        "greens": ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
        "rocket": ["#03051a", "#3b1854", "#7d1d6d", "#c22f67", "#f46843", "#febb68"],
        "mako": ["#0b0405", "#241a31", "#3f3860", "#4d5d85", "#5786a3", "#66afb2", "#a0dfb9"]
    },
    "diverging": {
        "coolwarm": ["#3b4cc0", "#668bf2", "#b0c4de", "#f2c3b0", "#f2765c", "#b40426"],
        "rdbu": ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
        "prgn": ["#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"],
        "vlag": ["#1e365d", "#3d679b", "#7c9fca", "#d8e4f1", "#f3d3c4", "#d07460", "#8b1e22"]
    },
    "qualitative": {
        "tab10": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
        "set2": ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
        "dark2": ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"],
        "colorblind": ["#0072b2", "#009e73", "#d55e00", "#cc79a7", "#f0e442", "#56b4e9"],
        "pastel": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec"],
        "vincent": ["#0f2537", "#203c56", "#365c8d", "#5681b9", "#f6d55c", "#17252a"],
        "gustav": ["#ecc04d", "#c29b46", "#212d2d", "#3d4d42", "#7b9075", "#aebf9e"],
        "frida": ["#305634", "#df4230", "#f19e38", "#638b97", "#b95175", "#601b34"],
        "pablo": ["#1e2930", "#3b4d57", "#637a85", "#96acb5", "#c8d6db", "#a38363"],
        "keith": ["#e81e25", "#1a225c", "#fae017", "#1a1a1a", "#fdfdfd"],
        "piet": ["#e31922", "#214083", "#f9d31d", "#131313", "#fbfbfb"],
        "katsushika": ["#1b2735", "#2c3e50", "#748b97", "#9eb0b7", "#dfdfd0", "#c25a3a"],
        "hilma": ["#dec9c5", "#b4c9c7", "#ebd99f", "#be987f", "#444957", "#e19f85"],
        "georgia": ["#9c3427", "#cf5130", "#f48847", "#ffbe7b", "#f9edd7", "#42413b"],
        "jean_michel": ["#e13b30", "#20285b", "#f4cb26", "#3dbbc7", "#1a1a1a", "#ebebeb"]
    }
}

def suggest_palette(data_type, plot_type, n_colors=6, colorblind_safe=False, reverse=False):
    """
    Returns a custom color palette list based on professional data visualization guidelines.
    
    Parameters:
    -----------
    data_type : str
        The mathematical category of the visual: 'sequential', 'diverging', or 'qualitative'.
    plot_type : str
        The physical representation of the plot: 'scatter', 'bar', 'line', 'heatmap', 'map'.
    n_colors : int, optional
        The number of distinct classes desired (default: 6).
    colorblind_safe : bool, optional
        If True, restricts recommendations to colorblind friendly schemes (default: False).
    reverse : bool, optional
        If True, reverses the ordering of colors (default: False).
        
    Returns:
    --------
    colors : list
        List of hex color strings.
    cmap : LinearSegmentedColormap
        Matplotlib compatible colormap instance.
    """
    selected_name = "viridis"
    
    # 1. Selection engine based on data properties and visual types
    if data_type == "sequential":
        if colorblind_safe:
            selected_name = "cividis" if plot_type in ["scatter", "heatmap"] else "viridis"
        else:
            selected_name = "magma" if plot_type == "heatmap" else "viridis"
            if plot_type == "map":
                selected_name = "mako"
                
    elif data_type == "diverging":
        if colorblind_safe:
            selected_name = "prgn"
        else:
            selected_name = "rdbu" if plot_type == "heatmap" else "coolwarm"
            
    elif data_type == "qualitative":
        if colorblind_safe:
            selected_name = "colorblind" if n_colors <= 6 else "set2"
        else:
            if plot_type == "line":
                selected_name = "dark2" # strong, high-contrast thin lines
            elif plot_type == "bar":
                selected_name = "set2" # soft, comfortable area chart weights
            else:
                selected_name = "tab10"
                
    # 2. Extract colors and interpolate if needed
    category = PRESETS.get(data_type, PRESETS["qualitative"])
    base_colors = category.get(selected_name, category[list(category.keys())[0]])
    
    # Reverse if needed
    if reverse:
        base_colors = base_colors[::-1]
        
    # Interpolate colors if n_colors exceeds preset length
    if n_colors != len(base_colors):
        # Continuous interpolation
        cmap = LinearSegmentedColormap.from_list(selected_name, base_colors)
        colors_rgb = [cmap(val) for val in np.linspace(0, 1, n_colors)]
        colors_hex = [f"#{int(c[0]*255):02x}{int(c[1]*255):02x}{int(c[2]*255):02x}" for c in colors_rgb]
    else:
        colors_hex = base_colors[:n_colors]
        
    # Create final matplotlib colormap
    final_cmap = LinearSegmentedColormap.from_list(f"{selected_name}_custom", colors_hex)
    
    # Render advice to stdout
    print(f"[PyPalette Suggestion] Recommended Palette: '{selected_name}'")
    if plot_type == "line" and n_colors > 6:
        print("[WARNING] Spaghetti chart alert! Line series count exceeds 6. Consider reducing series or using markers.")
    if plot_type == "heatmap" and data_type == "qualitative":
        print("[WARNING] Visual mismatch: Heatmaps require continuous sequential or diverging gradients, not qualitative.")
        
    return colors_hex, final_cmap

# Interactive verification example
if __name__ == "__main__":
    print("Suggesting qualitative line plot colors:")
    colors, cmap = suggest_palette(data_type="qualitative", plot_type="line", n_colors=5, colorblind_safe=True)
    print("Suggested Hex list:", colors)
""`;
}
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getHueName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = hexToHsl(hex);

  // Grayscale & Near Grayscale
  if (s < 8) {
    if (l < 15) return "Charcoal";
    if (l > 85) return "Warm Alabaster";
    return "Slate Grey";
  }

  // Muted dark or extremely bright whites
  if (l < 8) return "Obsidian";
  if (l > 94) return "Ice White";

  const isMuted = s < 30;
  const isDark = l < 35;
  const isLight = l > 70;

  let hueName = "";
  if (h >= 345 || h < 15) {
    hueName = "Crimson";
  } else if (h >= 15 && h < 45) {
    hueName = "Amber";
  } else if (h >= 45 && h < 70) {
    hueName = "Ochre";
  } else if (h >= 70 && h < 155) {
    hueName = "Sage Green";
  } else if (h >= 155 && h < 185) {
    hueName = "Teal";
  } else if (h >= 185 && h < 250) {
    hueName = "Cobalt Blue";
  } else if (h >= 250 && h < 285) {
    hueName = "Slate Blue";
  } else if (h >= 285 && h < 345) {
    hueName = "Rose";
  }

  // Add modifiers
  if (isMuted) {
    if (isDark) return `Dusty ${hueName}`;
    if (isLight) return `Pale ${hueName}`;
    return `Muted ${hueName}`;
  } else {
    if (isDark) return `Deep ${hueName}`;
    if (isLight) return `Soft ${hueName}`;
    return hueName;
  }
}
