import { UnsupportedPropertyError } from "../domain/errors";
import { SocrataRepository } from "./repository";
import type { SocrataResponse } from "./socrataClient";

function internalWarning(message: string): SocrataResponse["warnings"][number] {
  return {
    audience: "internal",
    dataset: "parcel_universe",
    message,
  };
}

class MissingAddressClient {
  async fetchAll(datasetKey: string, params: Record<string, string>): Promise<SocrataResponse> {
    const where = params.$where ?? "";
    if (datasetKey === "parcel_universe" && where.includes("pin='03000000000001'")) {
      return {
        rows: [
          {
            pin: "03000000000001",
            class: "203",
            township_name: "Barrington",
            township_code: "10",
            year: "2026",
          },
        ],
        warnings: [internalWarning("parcel pagination warning")],
      };
    }
    if (datasetKey === "res_characteristics" && where.includes("pin='03000000000001'")) {
      return { rows: [], warnings: [] };
    }
    if (datasetKey === "assessed_values" && where.includes("pin='03000000000001'")) {
      return { rows: [], warnings: [] };
    }
    if (
      datasetKey === "res_characteristics" ||
      datasetKey === "assessed_values" ||
      datasetKey === "parcel_sales"
    ) {
      return { rows: [], warnings: [] };
    }
    if (datasetKey === "parcel_universe") {
      return { rows: [], warnings: [] };
    }
    throw new Error(`Unexpected dataset ${datasetKey}`);
  }
}

test("SocrataRepository filters internal Socrata warnings and surfaces missing live fields", async () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const repo = new SocrataRepository(new MissingAddressClient() as never);
  try {
    const subject = await repo.loadSubjectByPin("03-00-000-000-0001");
    const warnings = subject.dataWarnings.join("\n");
    expect(warnings).not.toContain("parcel pagination warning");
    expect(warnings).toContain("Residential characteristics were unavailable");
    expect(warnings).toContain("Current assessed value was unavailable");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("appeal_compass.socrata_internal_warning"),
    );
  } finally {
    logSpy.mockRestore();
  }
});

class EnrichedComparableClient {
  comparableSalesQueries = 0;
  queries: string[] = [];

  async fetchAll(datasetKey: string, params: Record<string, string>): Promise<SocrataResponse> {
    const where = params.$where ?? "";
    this.queries.push(`${datasetKey}:${where}`);
    if (datasetKey === "parcel_universe" && where.includes("pin='03000000000001'")) {
      return {
        rows: [
          {
            pin: "03000000000001",
            class: "203",
            township_name: "Rogers Park",
            township_code: "01",
            nbhd_code: "0101",
            tax_code: "10001",
            lat: "41.9901",
            lon: "-87.6971",
            year: "2026",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "res_characteristics" && where.includes("pin='03000000000001'")) {
      return {
        rows: [
          {
            pin: "03000000000001",
            class: "203",
            township_code: "01",
            char_bldg_sf: "1800",
            char_land_sf: "3750",
            char_yrblt: "1924",
            year: "2026",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "assessed_values" && where.includes("pin='03000000000001'")) {
      return {
        rows: [
          {
            pin: "03000000000001",
            year: "2025",
            mailed_tot: "60000",
            mailed_land: "10000",
            mailed_bldg: "50000",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "parcel_sales" && where.includes("pin='03000000000001'")) {
      return { rows: [], warnings: [] };
    }
    if (datasetKey === "parcel_sales" && where.includes("pin in(")) {
      this.comparableSalesQueries += 1;
      expect(where).toContain("'03000000000002'");
      return {
        rows: [
          {
            pin: "03000000000002",
            sale_date: "2021-01-15T00:00:00.000",
            sale_price: "300000",
          },
          {
            pin: "03000000000002",
            sale_date: "2024-05-02T00:00:00.000",
            sale_price: "425000",
          },
          {
            pin: "03000000000002",
            sale_date: "2025-05-02T00:00:00.000",
            sale_price: "1",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "res_characteristics") {
      return {
        rows: [
          {
            pin: "03000000000002",
            class: "203",
            township_code: "01",
            char_bldg_sf: "1750",
            char_land_sf: "3700",
            char_yrblt: "1922",
            char_type_resd: "1 Story",
            char_ext_wall: "Frame",
            char_cnst_qlty: "Average",
            char_air: "Central A/C",
            year: "2026",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "assessed_values") {
      return {
        rows: [
          {
            pin: "03000000000002",
            year: "2025",
            mailed_tot: "40000",
            mailed_land: "8000",
            mailed_bldg: "32000",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "parcel_universe") {
      return {
        rows: [
          {
            pin: "03000000000002",
            class: "203",
            township_name: "Rogers Park",
            township_code: "01",
            nbhd_code: "0101",
            lat: "41.9902",
            lon: "-87.6972",
            year: "2026",
          },
        ],
        warnings: [],
      };
    }
    throw new Error(`Unexpected query ${datasetKey}: ${where}`);
  }
}

test("SocrataRepository enriches live comparables without address placeholders", async () => {
  const client = new EnrichedComparableClient();
  const repo = new SocrataRepository(client as never);
  const subject = await repo.loadSubjectByPin("03-00-000-000-0001");
  const [comparables] = await repo.loadComparables(subject.publicParcel);
  expect(subject.publicParcel.currentImprovementAv).toBe(50000);
  expect(subject.publicParcel.currentLandAv).toBe(10000);
  expect(subject.publicParcel.assessmentYear).toBe(2025);
  expect(subject.publicParcel.taxCode).toBe("10001");
  expect(comparables).not.toHaveLength(0);
  const comp = comparables[0];
  expect(comp?.address).toBe("");
  expect(subject.dataWarnings.join("\n")).not.toContain("address");
  expect(comp?.neighborhood).toBe("0101");
  expect(comp?.propertyClass).toBe("203");
  expect(comp?.lat).toBe(41.9902);
  expect(comp?.lon).toBe(-87.6972);
  expect(comp?.saleDate).toBe("2024-05-02");
  expect(comp?.salePrice).toBe(425000);
  expect(comp?.assessmentYear).toBe(2025);
  expect(comp?.improvementAv).toBe(32000);
  expect(comp?.landAv).toBe(8000);
  expect(comp?.landSqft).toBe(3700);
  expect(comp?.style).toBe("1 Story|Frame|Average");
  expect(comp?.amenityCount).toBe(1);
  expect(client.comparableSalesQueries).toBe(1);
});

test("corrected class and township change the repository queries used for comparables", async () => {
  const client = new EnrichedComparableClient();
  const repo = new SocrataRepository(client as never);
  const subject = await repo.loadSubjectByPin("03-00-000-000-0001");
  client.queries = [];
  await repo.loadComparables({
    ...subject.publicParcel,
    propertyClass: "204",
    townshipName: "New Trier",
    townshipCode: null,
  });
  expect(client.queries).toContain(
    "parcel_universe:township_name='New Trier' AND class='204' AND year='2026'",
  );
  expect(client.queries.some((query) => query.includes("township_code='01' AND class='204'"))).toBe(
    true,
  );
});

class MulticardClient {
  async fetchAll(datasetKey: string, params: Record<string, string>): Promise<SocrataResponse> {
    const where = params.$where ?? "";
    const subjectPin = "14314140380000";
    const compPin = "14314140390000";
    if (datasetKey === "parcel_universe" && where.includes(`pin='${subjectPin}'`)) {
      return {
        rows: [
          {
            pin: subjectPin,
            class: "211",
            township_name: "West Chicago",
            township_code: "77",
            nbhd_code: "77150",
            year: "2026",
            lat: "41.91",
            lon: "-87.67",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "res_characteristics" && where.includes(`pin='${subjectPin}'`)) {
      return {
        rows: [
          {
            pin: subjectPin,
            card: "1",
            row_id: "subject-1",
            pin_is_multicard: "true",
            pin_num_cards: "2",
            class: "211",
            township_code: "77",
            year: "2026",
            char_bldg_sf: "3390",
            char_land_sf: "3000",
            char_yrblt: "1892",
            char_beds: "3",
            char_fbath: "2",
          },
          {
            pin: subjectPin,
            card: "2",
            row_id: "subject-2",
            pin_is_multicard: "true",
            pin_num_cards: "2",
            class: "203",
            township_code: "77",
            year: "2026",
            char_bldg_sf: "1006",
            char_land_sf: "3000",
            char_yrblt: "1892",
            char_beds: "1",
            char_fbath: "1",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "assessed_values" && where.includes(`pin='${subjectPin}'`)) {
      return {
        rows: [
          {
            pin: subjectPin,
            year: "2024",
            certified_tot: "120000",
            certified_bldg: "95000",
            certified_land: "25000",
          },
          {
            pin: subjectPin,
            year: "2025",
            mailed_tot: "135518",
            mailed_bldg: "109418",
            mailed_land: "26100",
            certified_tot: "135518",
            certified_bldg: "109418",
            certified_land: "26100",
            board_tot: "124432",
            board_bldg: "98332",
            board_land: "26100",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "parcel_sales" && where.includes(`pin='${subjectPin}'`)) {
      return { rows: [], warnings: [] };
    }
    if (datasetKey === "res_characteristics" && where.includes("pin in(")) {
      return {
        rows: [
          {
            pin: compPin,
            card: "1",
            row_id: "comp-1",
            pin_is_multicard: "true",
            pin_num_cards: "2",
            class: "211",
            township_code: "77",
            year: "2026",
            char_bldg_sf: "3000",
            char_land_sf: "3100",
            char_yrblt: "1895",
          },
          {
            pin: compPin,
            card: "2",
            row_id: "comp-2",
            pin_is_multicard: "true",
            pin_num_cards: "2",
            class: "203",
            township_code: "77",
            year: "2026",
            char_bldg_sf: "1100",
            char_land_sf: "3100",
            char_yrblt: "1900",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "res_characteristics") {
      return {
        rows: [
          {
            pin: compPin,
            card: "1",
            row_id: "comp-1",
            pin_is_multicard: "true",
            pin_num_cards: "2",
            class: "211",
            township_code: "77",
            year: "2026",
            char_bldg_sf: "3000",
            char_land_sf: "3100",
            char_yrblt: "1895",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "assessed_values") {
      return {
        rows: [
          {
            pin: compPin,
            year: "2025",
            board_tot: "100000",
            board_bldg: "75000",
            board_land: "25000",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "parcel_universe") {
      return {
        rows: [
          {
            pin: compPin,
            class: "211",
            township_name: "West Chicago",
            township_code: "77",
            nbhd_code: "77150",
            year: "2026",
            lat: "41.911",
            lon: "-87.671",
          },
        ],
        warnings: [],
      };
    }
    if (datasetKey === "parcel_sales") {
      return { rows: [], warnings: [] };
    }
    throw new Error(`Unexpected query ${datasetKey}: ${where}`);
  }
}

test("SocrataRepository aggregates every residential card before calculating parcel metrics", async () => {
  const repo = new SocrataRepository(new MulticardClient() as never);
  const subject = await repo.loadSubjectByPin("14-31-414-038-0000");
  const [comparables] = await repo.loadComparables(subject.publicParcel);

  expect(subject.publicParcel.buildingSqft).toBe(4396);
  expect(subject.publicParcel.landSqft).toBe(3000);
  expect(subject.publicParcel.beds).toBe(4);
  expect(subject.publicParcel.fullBaths).toBe(3);
  expect(subject.publicParcel.isMulticard).toBe(true);
  expect(subject.publicParcel.cardCount).toBe(2);
  expect(subject.publicParcel.cardClasses).toEqual(["203", "211"]);
  expect(subject.publicParcel.characteristicsReconciled).toBe(true);
  expect(subject.propertyCards).toEqual([
    { cardNumber: "1", propertyClass: "211", buildingSqft: 3390, yearBuilt: 1892 },
    { cardNumber: "2", propertyClass: "203", buildingSqft: 1006, yearBuilt: 1892 },
  ]);
  expect(subject.publicParcel.currentAv).toBe(124432);
  expect(subject.publicParcel.currentImprovementAv).toBe(98332);
  expect(subject.publicParcel.assessmentStages).toEqual({
    total: "board",
    improvement: "board",
    land: "board",
  });
  expect(subject.publicParcel.assessmentComponentsReconciled).toBe(true);
  expect(subject.publicParcel.priorFinalAv).toBe(120000);
  expect(comparables).toHaveLength(1);
  expect(comparables[0]?.buildingSqft).toBe(4100);
  expect(comparables[0]?.cardCount).toBe(2);
  expect(subject.dataWarnings.join("\n")).toContain("combined across all cards");
});

class UnsupportedClassClient {
  calls: string[] = [];

  constructor(private readonly propertyClass: string) {}

  async fetchAll(datasetKey: string): Promise<SocrataResponse> {
    this.calls.push(datasetKey);
    if (datasetKey !== "parcel_universe") {
      throw new Error(`Analysis should stop before ${datasetKey}`);
    }
    return {
      rows: [
        {
          pin: "17194110440000",
          class: this.propertyClass,
          township_name: "West Chicago",
          township_code: "77",
          year: "2026",
        },
      ],
      warnings: [],
    };
  }
}

test.each(["597", "318", "591"])(
  "SocrataRepository blocks excluded class %s before characteristics and comparables",
  async (propertyClass) => {
    const client = new UnsupportedClassClient(propertyClass);
    const repo = new SocrataRepository(client as never);
    await expect(repo.loadSubjectByPin("17-19-411-044-0000")).rejects.toBeInstanceOf(
      UnsupportedPropertyError,
    );
    expect(client.calls).toEqual(["parcel_universe"]);
  },
);
