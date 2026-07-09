const EXCLUDED_CLASS_2_CODES = new Set([
  "200",
  "201",
  "213",
  "218",
  "219",
  "224",
  "225",
  "236",
  "239",
  "240",
  "241",
  "288",
  "290",
  "297",
  "298",
]);

const CLASS_LABELS: Record<string, string> = {
  "200": "vacant residential land",
  "201": "residential land with a minor improvement",
  "213": "residential cooperative",
  "218": "residential building with more than six units",
  "219": "residential building with more than six units",
  "224": "non-residential improvement on residential-class land",
  "225": "non-residential improvement on residential-class land",
  "236": "residential land with a non-dwelling improvement",
  "239": "non-residential improvement on residential-class land",
  "240": "non-residential improvement on residential-class land",
  "241": "non-residential improvement on residential-class land",
  "288": "residential property with atypical improvements",
  "290": "residential property with atypical improvements",
  "297": "special residential-class improvement",
  "298": "special residential-class improvement",
  "318": "mixed-use or multi-family property",
  "591": "commercial property",
  "597": "special commercial improvements",
};

export interface PropertyClassDecision {
  supported: boolean;
  propertyClass: string;
  category: string;
}

export function propertyClassDecision(rawPropertyClass: string | null): PropertyClassDecision {
  const propertyClass = String(rawPropertyClass ?? "").trim();
  if (!/^\d{3}$/.test(propertyClass)) {
    return { supported: false, propertyClass, category: "unknown property class" };
  }

  if (!propertyClass.startsWith("2")) {
    const category =
      CLASS_LABELS[propertyClass] ??
      (propertyClass.startsWith("3")
        ? "multi-family property"
        : propertyClass.startsWith("5")
          ? "commercial or industrial property"
          : "property outside the supported residential dwelling classes");
    return { supported: false, propertyClass, category };
  }

  if (EXCLUDED_CLASS_2_CODES.has(propertyClass)) {
    return {
      supported: false,
      propertyClass,
      category: CLASS_LABELS[propertyClass] ?? "unsupported residential-class property",
    };
  }

  return {
    supported: true,
    propertyClass,
    category: propertyClass === "299" ? "residential condominium" : "residential dwelling",
  };
}
