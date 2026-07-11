import { MAX_DISPLAYED_SIMILARITY, similarityBand } from "./similarityBands";

test("similarity bands are exact, non-overlapping, and exclude rows above 0.50", () => {
  expect(similarityBand(0)).toBe("excellent");
  expect(similarityBand(0.1)).toBe("excellent");
  expect(similarityBand(0.100001)).toBe("good");
  expect(similarityBand(0.2)).toBe("good");
  expect(similarityBand(0.200001)).toBe("decent");
  expect(similarityBand(0.35)).toBe("decent");
  expect(similarityBand(0.350001)).toBe("broad");
  expect(similarityBand(MAX_DISPLAYED_SIMILARITY)).toBe("broad");
  expect(similarityBand(0.500001)).toBeNull();
});
